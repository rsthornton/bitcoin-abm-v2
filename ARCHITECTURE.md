# Bitcoin ABM v2 Architecture

## Overview

Bitcoin ABM v2 is a real-time simulation of Bitcoin network dynamics, structured to directly mirror a BERT (Bounded Entity Reasoning Toolkit) model. The architecture follows Deep Systems Analysis (DSA) principles, integrating three modeling paradigms.

## DSA Three-Layer Integration

```
┌─────────────────────────────────────────────────────────────┐
│  NERVOUS SYSTEM (Agent-Based Modeling)                      │
│  - Agent archetypes: Economy, Agent, Governance             │
│  - Decision-making behaviors per subsystem                  │
├─────────────────────────────────────────────────────────────┤
│  FLESH (System Dynamics)                                    │
│  - Flows between subsystems (transactions, blocks, BIPs)    │
│  - Stocks and accumulations (mempool, chain state)          │
├─────────────────────────────────────────────────────────────┤
│  SKELETON (Network/Graph)                                   │
│  - 4 subsystems: Mining, Validating, Development, Protocol  │
│  - Topology derived from BERT model structure               │
└─────────────────────────────────────────────────────────────┘
```

## System Topology

```
              Development
             (Agent archetype)
                   │
                   ↓ Protocol Updates
                   │
    ┌──────────────┼──────────────┐
    │              ↓              │
Validating ←── Protocol ───→ Mining
(Governance)    (hub)      (Economy)
    │              │              │
    └──────────────┴──────────────┘
         ↑                    │
    Tx Inputs            Blocks/Heat
   (external)              (outputs)
```

## Directory Structure

```
bitcoin-abm-v2/
├── backend/                    # Python/Flask backend
│   ├── server.py               # Flask + Socket.IO server
│   │                           # - REST API endpoints
│   │                           # - WebSocket event handlers
│   │                           # - CORS configuration
│   │
│   ├── simulation.py           # Core simulation model
│   │                           # - SimulationState dataclass
│   │                           # - BitcoinSimulation class
│   │                           # - Scenario-aware step dynamics
│   │
│   ├── scenarios.py            # Preset configurations
│   │                           # - 6 scenarios with params
│   │                           # - Hypothesis per scenario
│   │
│   ├── bert_loader.py          # BERT model parser
│   │                           # - Archetype → behavior mapping
│   │                           # - Subsystem hierarchy extraction
│   │
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   │                       # - Theme system (light/dark)
│   │   │                       # - Layout components
│   │   │                       # - Export functionality
│   │   │
│   │   ├── hooks/
│   │   │   └── useSimulation.js  # WebSocket hook
│   │   │                         # - Socket.IO connection
│   │   │                         # - State management
│   │   │                         # - Scenario switching
│   │   │
│   │   └── components/
│   │       ├── NetworkTab.jsx    # Flow visualization
│   │       │                     # - SVG node rendering
│   │       │                     # - Curved bidirectional flows
│   │       │                     # - Animated particles
│   │       │
│   │       ├── SubsystemsTab.jsx # 4-panel subsystem view
│   │       │                     # - Mining, Validating panels
│   │       │                     # - Development, Protocol panels
│   │       │
│   │       └── AnalysisTab.jsx   # Time-series charts
│   │                             # - SVG mini-charts
│   │                             # - Correlation view
│   │
│   └── package.json
│
├── bitcoin.json                # BERT model definition
├── PLAN.md                     # Development roadmap
├── ARCHITECTURE.md             # This file
├── CLAUDE.md                   # Claude Code context
└── README.md                   # Quick start guide
```

## Data Flow

### 1. Simulation Step

```
Frontend (useSimulation)
    │
    ├──[WebSocket]──→ Backend (server.py)
    │                     │
    │                     ↓
    │              simulation.step()
    │                     │
    │                     ├── Transaction arrival (Poisson)
    │                     ├── Block mining (probability)
    │                     ├── Fee market dynamics
    │                     ├── Hashrate drift
    │                     ├── Difficulty adjustment
    │                     └── BIP proposals
    │                     │
    │                     ↓
    ←──[state_update]────┘
    │
    ↓
UI Components update
```

### 2. Scenario Change

```
User selects scenario
    │
    ↓
useSimulation.setScenario(id)
    │
    ↓
socket.emit('reset', { scenario_id })
    │
    ↓
Backend: get_scenario(id) → sim.reset(params)
    │
    ↓
socket.emit('state_update') + socket.emit('scenario_changed')
    │
    ↓
UI: hypothesis bar appears, metrics reset
```

## BERT ↔ ABM Correspondence

| BERT Concept | ABM Implementation |
|--------------|-------------------|
| Subsystem | Visual node in Network tab |
| Flow | Animated arrow between nodes |
| Archetype | Color coding + behavior params |
| Complexity | Displayed in node labels |
| Hierarchy | Panel organization in Subsystems tab |

## Scenario Parameters

| Parameter | Effect |
|-----------|--------|
| `tx_rate` | Transaction arrival rate |
| `base_hashrate` | Initial network hashrate |
| `block_reward` | BTC per block (halving effect) |
| `mempool_limit` | Congestion threshold |
| `fee_sensitivity` | Fee response to congestion |
| `hashrate_growth` | Per-step hashrate increase |
| `bip_rate` | Governance proposal frequency |
| `dominant_miner_share` | Centralization level |

## Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Backend | Flask | Simple, Python ecosystem |
| Real-time | Socket.IO | Bidirectional, auto-reconnect |
| Frontend | React + Vite | Fast dev, component model |
| Styling | Inline styles | RSC-inspired, no build step |
| Charts | SVG | No dependencies, full control |
| State | React hooks | Simple, no Redux needed |

## Future Extensions

1. **Mesa Integration**: Replace placeholder dynamics with full Mesa ABM
2. **Batch Runs**: Add `/api/batch` endpoint for parameter sweeps
3. **Persistence**: Save/load simulation state
4. **Hosting**: Deploy to Render (Flask) + Vercel (React)
