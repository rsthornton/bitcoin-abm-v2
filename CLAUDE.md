# Bitcoin ABM v2 - Claude Code Context

## Project Purpose

Real-time Bitcoin network simulation that directly mirrors the BERT `bitcoin.json` model structure. Built for educational visualization and research-ready dynamics.

## Quick Commands

```bash
# Start backend
cd backend && source venv/bin/activate && python server.py

# Start frontend
cd frontend && npm run dev

# Access
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/server.py` | Flask + Socket.IO API server |
| `backend/simulation.py` | Core simulation logic |
| `backend/scenarios.py` | 6 preset configurations |
| `frontend/src/App.jsx` | Main React app (all components) |
| `frontend/src/hooks/useSimulation.js` | WebSocket state management |
| `frontend/src/components/NetworkTab.jsx` | SVG flow visualization |
| `bitcoin.json` | BERT model definition |

## Architecture Patterns

### Backend (Flask)
- REST endpoints: `/api/status`, `/api/scenarios`, `/api/reset`, `/api/step`
- WebSocket events: `connect`, `step`, `reset`, `state_update`, `scenario_changed`
- Simulation uses dataclass for state, scenario params drive dynamics

### Frontend (React)
- **Inline styles** - no CSS files, RSC-inspired pattern
- **Theme tokens** - `themes.dark` / `themes.light` objects
- **Single file components** - most components in App.jsx
- **useSimulation hook** - manages Socket.IO connection and state

### Network Tab Layout
```
         Development (top)
              │
Validating ← Protocol → Mining
  (left)    (center)   (right)
```
- Matches BERT model topology
- Bidirectional flows use curved bezier paths
- Animated particles show active flows

## Common Tasks

### Add a new scenario
1. Edit `backend/scenarios.py`
2. Add entry to `SCENARIOS` dict with name, description, hypothesis, params
3. Frontend will auto-populate dropdown

### Modify simulation dynamics
1. Edit `backend/simulation.py` → `BitcoinSimulation.step()`
2. Access scenario params via `self.params`
3. Update state attributes directly

### Add a new metric
1. Add field to `SimulationState` dataclass
2. Include in `to_dict()` method
3. Update frontend `useSimulation` initial state
4. Display in Sidebar or relevant tab

### Adjust Network tab layout
1. Edit `NODE_POSITIONS` in `NetworkTab.jsx`
2. Positions are percentages (x: 0-100, y: 0-100)
3. Flows auto-calculate paths between nodes

## BERT Model Mapping

The UI structure mirrors `bitcoin.json`:

| BERT | UI |
|------|-----|
| S0 (Bitcoin) | Whole app |
| C0.0 (Validating) | Left node, Validating panel |
| C0.1 (Development) | Top node, Development panel |
| C0.2 (Mining) | Right node, Mining panel |
| C0.3 (Protocol) | Center node, Protocol panel |
| Flows (F0.x) | Animated arrows in Network tab |
| Archetypes | Node colors (Economy=orange, Agent=blue, Governance=green) |

## Dependencies

### Backend
- Flask, Flask-CORS, Flask-SocketIO
- python-socketio, eventlet (optional)

### Frontend
- React 18, Vite
- socket.io-client

## Debugging

### Backend not responding
```bash
pkill -f "python server.py"
cd backend && source venv/bin/activate && python server.py
```

### WebSocket not connecting
- Check CORS: `socketio = SocketIO(app, cors_allowed_origins="*")`
- Check frontend SOCKET_URL matches backend port

### Flows not animating
- Ensure simulation is running (click ▶ Run)
- Check `isSimRunning` prop passed to FlowArrow

## Code Style

- **No external CSS** - all styles inline
- **Monospace font** - SF Mono / IBM Plex Mono
- **Theme tokens** - access via `t.bg`, `t.text`, `t.accent`, etc.
- **Component per function** - functional components, no classes
- **Props destructuring** - `function Component({ t, metrics, ... })`
