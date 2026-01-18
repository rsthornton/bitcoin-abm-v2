"""
Bitcoin ABM v2 - Flask Server

Block 9: Scenario-aware simulation with preset configurations.
"""

import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from simulation import BitcoinSimulation
from bert_loader import load_bitcoin_bert
from scenarios import get_scenario, list_scenarios
from pathlib import Path

# Production: serve React build from static/
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global simulation instance
sim = BitcoinSimulation()


# =============================================================================
# REST API Endpoints
# =============================================================================

@app.route('/api/status', methods=['GET'])
def status():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "version": "0.9.0",
        "block": 9,
        "message": "Bitcoin ABM v2 backend running",
        "simulation": {
            "step": sim.state.step,
            "running": sim.state.running,
            "scenario": sim.scenario_id
        }
    })


@app.route('/api/scenarios', methods=['GET'])
def scenarios():
    """
    Get available scenarios.

    Returns list of scenario presets with descriptions.
    """
    return jsonify({
        "status": "ok",
        "scenarios": list_scenarios()
    })


@app.route('/api/scenarios/<scenario_id>', methods=['GET'])
def scenario_details(scenario_id):
    """
    Get details for a specific scenario.

    Returns full scenario configuration including parameters and hypothesis.
    """
    scenario = get_scenario(scenario_id)
    return jsonify({
        "status": "ok",
        "scenario": {
            "id": scenario_id,
            **scenario
        }
    })


@app.route('/api/reset', methods=['POST'])
def reset():
    """
    Reset simulation to initial state.

    Body (optional):
        {
            "scenario_id": "baseline",  # Scenario preset to use
            "params": {...}  # Override specific parameters
        }
    """
    data = request.get_json(silent=True) or {}
    scenario_id = data.get("scenario_id", "baseline")

    # Get scenario params and merge with any overrides
    scenario = get_scenario(scenario_id)
    params = {**scenario.get("params", {}), **data.get("params", {})}

    state = sim.reset(params=params, scenario_id=scenario_id)

    # Broadcast reset to all WebSocket clients
    socketio.emit('state_update', state)

    return jsonify({
        "status": "ok",
        "message": f"Simulation reset with scenario: {scenario['name']}",
        "scenario": {
            "id": scenario_id,
            "name": scenario["name"],
            "description": scenario["description"],
            "hypothesis": scenario["hypothesis"],
        },
        "state": state
    })


@app.route('/api/step', methods=['POST'])
def step():
    """
    Advance simulation by one step.

    Body (optional):
        {
            "count": 1  # Number of steps to advance
        }
    """
    data = request.get_json(silent=True) or {}
    count = data.get("count", 1)

    states = []
    for _ in range(min(count, 100)):  # Cap at 100 steps per request
        state = sim.step()
        states.append(state)

    # Broadcast to WebSocket clients
    socketio.emit('state_update', states[-1])

    return jsonify({
        "status": "ok",
        "steps_taken": len(states),
        "state": states[-1],
        "history": states if count > 1 else None
    })


@app.route('/api/state', methods=['GET'])
def get_state():
    """Get current simulation state."""
    return jsonify({
        "status": "ok",
        "state": sim.get_state()
    })


@app.route('/api/history', methods=['GET'])
def get_history():
    """
    Get simulation history.

    Query params:
        last_n: Number of recent states to return (default: all)
    """
    last_n = request.args.get('last_n', type=int)
    return jsonify({
        "status": "ok",
        "count": len(sim.history),
        "history": sim.get_history(last_n)
    })


@app.route('/api/bert-structure', methods=['GET'])
def bert_structure():
    """
    Get BERT model structure with archetype mappings.

    Returns subsystem hierarchy, flows, and behavior configurations.
    """
    # Check multiple locations (local dev vs Docker)
    candidates = [
        Path(__file__).parent.parent / "bitcoin.json",  # Local: backend/../bitcoin.json
        Path(__file__).parent / "bitcoin.json",          # Docker: /app/bitcoin.json
    ]

    bert_path = None
    for candidate in candidates:
        if candidate.exists():
            bert_path = candidate
            break

    if not bert_path:
        return jsonify({
            "status": "error",
            "message": f"bitcoin.json not found in any of: {[str(c) for c in candidates]}"
        }), 404

    try:
        structure = load_bitcoin_bert(str(bert_path))
        return jsonify({
            "status": "ok",
            **structure
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =============================================================================
# WebSocket Events
# =============================================================================

@socketio.on('connect')
def handle_connect():
    """Client connected - send current state."""
    emit('state_update', sim.get_state())
    print(f"Client connected. Step: {sim.state.step}")


@socketio.on('disconnect')
def handle_disconnect():
    """Client disconnected."""
    print("Client disconnected")


@socketio.on('step')
def handle_step(data=None):
    """Step simulation via WebSocket."""
    count = 1
    if data and isinstance(data, dict):
        count = data.get('count', 1)

    for _ in range(min(count, 100)):
        state = sim.step()

    emit('state_update', state, broadcast=True)


@socketio.on('reset')
def handle_reset(data=None):
    """Reset simulation via WebSocket with optional scenario."""
    data = data if isinstance(data, dict) else {}
    scenario_id = data.get("scenario_id", "baseline")

    # Get scenario params and merge with any overrides
    scenario = get_scenario(scenario_id)
    params = {**scenario.get("params", {}), **data.get("params", {})}

    state = sim.reset(params=params, scenario_id=scenario_id)
    emit('state_update', state, broadcast=True)
    emit('scenario_changed', {
        "id": scenario_id,
        "name": scenario["name"],
        "hypothesis": scenario["hypothesis"],
    }, broadcast=True)


# =============================================================================
# Static File Serving (Production)
# =============================================================================

@app.route('/')
def serve_root():
    """Serve React app root."""
    return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(e):
    """Catch-all for client-side routing - serve index.html."""
    # Only serve index.html for non-API routes
    if not request.path.startswith('/api/'):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({"status": "error", "message": "Not found"}), 404


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    socketio.run(app, debug=debug, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
