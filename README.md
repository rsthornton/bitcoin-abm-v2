# Bitcoin ABM v2

User-friendly simulation showing Bitcoin network dynamics, directly corresponding to the BERT `bitcoin.json` model structure.

## Features

- **Real-time WebSocket Updates**: Live simulation state via Socket.IO
- **BERT Model Integration**: UI structure mirrors the BERT subsystem hierarchy
- **Deep Systems Analysis (DSA)**: Three-layer integration (Network/SD/ABM)
- **6 Scenario Presets**: Baseline, Fee Spike, Halving, Hash War, Fork, 51% Attack
- **Time-Series Charts**: Mempool, fees, hashrate, difficulty analysis
- **Light/Dark Themes**: Toggle between themes
- **CSV/JSON Export**: Download simulation data

## Quick Start

### Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000

## Architecture

```
bitcoin-abm-v2/
├── backend/               # Python/Flask + WebSocket
│   ├── server.py          # API endpoints + Socket.IO
│   ├── simulation.py      # BitcoinSimulation model
│   ├── scenarios.py       # Preset configurations
│   └── bert_loader.py     # BERT model parser
│
├── frontend/              # React/Vite UI
│   └── src/
│       ├── App.jsx        # Main layout + components
│       ├── hooks/         # useSimulation (WebSocket)
│       └── components/    # Tab views (Network, Subsystems, Analysis)
│
├── bitcoin.json           # BERT model definition
└── PLAN.md                # Development roadmap
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Health check |
| `/api/scenarios` | GET | List available scenarios |
| `/api/scenarios/:id` | GET | Get scenario details |
| `/api/reset` | POST | Reset simulation (optional: `scenario_id`) |
| `/api/step` | POST | Advance simulation |
| `/api/state` | GET | Current state |
| `/api/bert-structure` | GET | BERT model structure |

## Scenarios

| Scenario | Description |
|----------|-------------|
| **Baseline** | Normal Bitcoin operation |
| **Fee Spike** | High demand, congested mempool |
| **Halving Event** | Block reward drops 50% |
| **Hash War** | Rapid hashrate increase |
| **Contentious Fork** | Developer disagreement |
| **51% Attack** | Single miner dominance |

## BERT ↔ ABM Mapping

The simulation structure corresponds directly to `bitcoin.json`:

```
Bitcoin (S0)
├── Mining (C0.2)        → Hash Production, Block Assembly
├── Validating (C0.0)    → Mempool, Block Processor
├── Development (C0.1)   → BIP Pipeline (Research → Implementation → Review)
└── Protocol (C0.3)      → Consensus Rules, Network Layer, Chain State
```

### Agent Archetypes

| Archetype | Behavior | Color |
|-----------|----------|-------|
| Economy | Profit-maximizing | Orange |
| Agent | Evidence-based | Blue |
| Governance | Consensus-seeking | Green |

## Development Blocks

- [x] Block 1: Project Scaffold
- [x] Block 2: Backend API Contract
- [x] Block 3: BERT Loader Update
- [x] Block 4: Frontend Shell
- [x] Block 5: WebSocket Connection
- [x] Block 6: Subsystems Tab
- [x] Block 7: Network Tab (DSA Integrated)
- [x] Block 8: Analysis Tab
- [x] Block 9: Scenarios
- [x] Block 10: Polish + Export

## Tech Stack

- **Backend**: Flask, Flask-SocketIO, Flask-CORS
- **Frontend**: React 18, Vite, Socket.IO Client
- **Styling**: Inline styles (RSC-inspired patterns)

## License

MIT
