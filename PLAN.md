# Plan: Bitcoin ABM v2

## Goal
Create a user-friendly simulation that lets people engage with Bitcoin dynamics, directly corresponding to the structure of `bitcoin.json` (the 10-subsystem BERT model).

**Balance**: Educational clarity (BERT structure visible) + research-ready realism (publishable results).

## Development Philosophy

**Block-by-block with human checkpoints.** Each block is:
- Small enough to review thoroughly
- Substantial enough to be testable
- Ends with a visible, working artifact

No "rocket ship" development. Human oversight at every stage.

---

## Architecture: Flask + Modern JSX

**Same repo, separation of concerns:**
```
bitcoin-abm-v2/
├── backend/                 # Python (Mesa simulation)
│   ├── bitcoin_model.py     # Mesa model (from v1)
│   ├── bitcoin_agents.py    # Miner, Validator, Developer (from v1)
│   ├── bert_loader.py       # UPDATED for new archetype schema
│   └── server.py            # Flask + WebSocket API
│
├── frontend/                # React/JSX (RSC-inspired)
│   ├── src/
│   │   ├── App.jsx          # Layout shell
│   │   ├── components/      # Sidebar, Tabs, Charts
│   │   └── hooks/           # useSimulation (WebSocket)
│   └── package.json
│
├── bitcoin.json             # BERT model (shared reference)
├── PLAN.md                  # This file
└── README.md
```

**Why this approach:**
- Keeps working Mesa logic (Poisson blocks, difficulty, agents)
- Modern UI without reimplementing simulation in JS
- Each layer testable independently
- Mesa model still usable for batch runs, Jupyter, CLI

---

## Synthesis from Three Projects

### From Georgist (Polish)
- Scenario system as declarative presets
- Mesa DataCollector for automatic metrics
- Clean dataclass agents
- Test culture (26 tests)

### From Bitcoin-ABM v1 (Existing)
- 3 cognitive agent types (keep)
- Poisson block arrival (keep)
- Difficulty adjustment (keep)
- BERT loader (update for new schema)

### From RSC-Endowment (Design)
- Sidebar dashboard pattern (280px)
- Tab navigation
- Theme system (light/dark)
- Inline styles, SVG mini-charts
- Auto-generated insights

---

## BERT ↔ ABM Mapping

### bitcoin.json Structure (10 subsystems)
```
Bitcoin (S0) — Evolveable
├── Validating (C0.0) — Simple, Governance
│   ├── Mempool (C0.0.0) — Simple
│   └── Block Processor (C0.0.1) — Simple, Governance
├── Development (C0.1) — Evolveable, Agent
│   ├── Protocol Research (C0.1.0) — Evolveable, Agent
│   ├── Code Implementation (C0.1.1) — Evolveable, Agent
│   └── Review & Governance (C0.1.2) — Evolveable, Governance
├── Mining (C0.2) — Adaptable, Economy
│   ├── Hash Production (C0.2.0) — Simple
│   └── Block Assembly (C0.2.1) — Adaptable, Economy
└── Protocol (C0.3) — Evolveable, Governance
    ├── Consensus Rules (C0.3.0) — Evolveable, Governance
    ├── Network Layer (C0.3.1) — Simple
    └── Chain State (C0.3.2) — Simple
```

### Archetype → Behavior Mapping
| Archetype | Complexity | ABM Behavior |
|-----------|------------|--------------|
| — (none) | Simple | Fixed rules, no adaptation |
| Economy | Adaptable | Optimizes for profit, responds to incentives |
| Agent | Evolveable | Goal-directed, accumulates evidence, proposes changes |
| Governance | Evolveable | Enforces rules, votes on changes, consensus-seeking |

### Flows to Simulate
1. **Block Template** (Block Assembly → Hash Production)
2. **Valid Proof** (Hash Production → Block Assembly)
3. **Mempool Transactions** (Validating → Mining)
4. **Mined Blocks** (Mining → Protocol)
5. **Protocol Updates** (Development → Protocol)
6. **Technical Feedback** (Protocol → Development)

---

## Proposed UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Scenario | Speed | RUN/STOP/STEP | Theme Toggle     │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │              MAIN CONTENT                    │
│   (280px)    │                                              │
│              │  ┌─────────────────────────────────────────┐ │
│ Price/BTC    │  │ Tabs: Network | Subsystems | Analysis   │ │
│ Key Metrics  │  │       | About | Compare                 │ │
│ • Hashrate   │  ├─────────────────────────────────────────┤ │
│ • Difficulty │  │                                         │ │
│ • Mempool    │  │  [Tab Content Area]                     │ │
│ • Block Rate │  │                                         │ │
│ • Fee Market │  │  Network: Animated flow diagram         │ │
│              │  │  Subsystems: 4 panels (Mining,          │ │
│ Insights     │  │    Validating, Development, Protocol)   │ │
│ (auto-gen)   │  │  Analysis: Charts, correlations         │ │
│              │  │                                         │ │
│ Mini Charts  │  │                                         │ │
│              │  │                                         │ │
│ Export       │  │                                         │ │
└──────────────┴──────────────────────────────────────────────┘
```

---

## Scenarios

| Scenario | Description | Key Parameters |
|----------|-------------|----------------|
| **Baseline** | Normal Bitcoin operation | Default all |
| **Fee Spike** | High demand, congested mempool | tx_rate: 15, mempool_limit: 50 |
| **Halving Event** | Block reward drops 50% | block_reward: 3.125 |
| **Hash War** | Rapid hashrate increase | miner_count: 20, hash_growth: 0.1 |
| **Contentious Fork** | Developer disagreement | dev_consensus_threshold: 0.9 |
| **51% Attack** | Single miner dominance | top_miner_share: 0.51 |

---

## Development Blocks (Human Checkpoints)

Each block ends with **"checkpoint"** — you review, we discuss, then proceed.

---

### Block 1: Project Scaffold ← CURRENT
**Build**: Directory structure, package.json, Flask shell, basic "hello world" endpoint
**Checkpoint**: `curl localhost:5000/api/status` returns `{"status": "ok"}`
**You verify**: Project runs, structure makes sense

---

### Block 2: Backend API Contract
**Build**: Flask endpoints for simulation control
- `POST /api/reset` — Initialize model with params
- `POST /api/step` — Advance one step, return state
- `GET /api/state` — Current model state (metrics, agents, blocks)
- WebSocket `/ws` — Real-time state push

**Checkpoint**: Can step simulation via curl, see state JSON
**You verify**: API shape feels right for what frontend needs

---

### Block 3: BERT Loader Update
**Build**: Update `bert_loader.py` to handle new archetype schema
- Map archetype (Economy/Agent/Governance) → cognitive params
- Load bitcoin.json subsystem hierarchy
- Expose via `/api/bert-structure` endpoint

**Checkpoint**: API returns bitcoin.json structure with archetype mappings
**You verify**: Mappings make sense, subsystem hierarchy correct

---

### Block 4: Frontend Shell
**Build**: React app with RSC-inspired layout
- Sidebar (280px): placeholder metrics
- Header: RUN/STOP/STEP buttons
- Main area: Tab structure (Network | Subsystems | Analysis)
- Theme toggle (light/dark)

**Checkpoint**: UI renders, buttons exist (don't do anything yet)
**You verify**: Layout feels right, no functionality yet

---

### Block 5: WebSocket Connection
**Build**: `useSimulation` hook connecting frontend to backend
- Connect to WebSocket
- RUN/STOP/STEP buttons trigger API calls
- State updates flow to UI
- Sidebar shows live metrics (hashrate, difficulty, mempool, blocks)

**Checkpoint**: Click STEP, see metrics update in sidebar
**You verify**: Real-time connection works, metrics display correctly

---

### Block 6: Subsystems Tab (4 Panels)
**Build**: Visual panels for each Level-1 subsystem
- Mining panel: Hash Production ↔ Block Assembly
- Validating panel: Mempool + Block Processor
- Development panel: Research → Implementation → Review pipeline
- Protocol panel: Consensus Rules, Network Layer, Chain State

**Checkpoint**: Panels show subsystem internals updating each step
**You verify**: BERT structure clearly visible, correspondence to bitcoin.json obvious

---

### Block 7: Network Tab (Flow Visualization)
**Build**: Animated diagram showing flows between subsystems
- 4 nodes (Mining, Validating, Development, Protocol)
- Animated edges for active flows (transactions, blocks, BIPs)
- Click node → highlight in Subsystems tab

**Checkpoint**: Can watch "transaction" flow from Validating → Mining → Protocol
**You verify**: Flows match bitcoin.json definitions

---

### Block 8: Analysis Tab (Charts)
**Build**: Time-series charts
- Mempool size over time
- Fee rate trends
- Block production rate
- Difficulty adjustments

**Checkpoint**: Charts update in real-time during simulation
**You verify**: Data looks realistic, charts readable

---

### Block 9: Scenarios
**Build**: Preset configurations (Georgist-style)
- Baseline, Fee Spike, Halving, Hash War, Contentious Fork, 51% Attack
- Dropdown selector in header
- Each scenario has description + hypothesis

**Checkpoint**: Select scenario, see parameters change, run simulation
**You verify**: Scenarios produce meaningfully different dynamics

---

### Block 10: Polish + Export
**Build**: Final touches
- CSV/JSON export buttons
- About tab with documentation
- Mobile-responsive tweaks
- README update

**Checkpoint**: Full working simulation ready for demo
**You verify**: Ready for newsletter screenshots

---

## Estimated Effort

| Block | Effort | Cumulative |
|-------|--------|------------|
| 1. Scaffold | 30 min | 30 min |
| 2. API Contract | 1 hr | 1.5 hr |
| 3. BERT Loader | 1 hr | 2.5 hr |
| 4. Frontend Shell | 1 hr | 3.5 hr |
| 5. WebSocket | 1 hr | 4.5 hr |
| 6. Subsystems Tab | 2 hr | 6.5 hr |
| 7. Network Tab | 2 hr | 8.5 hr |
| 8. Analysis Tab | 1 hr | 9.5 hr |
| 9. Scenarios | 1 hr | 10.5 hr |
| 10. Polish | 1 hr | 11.5 hr |

~12 hours total, spread across multiple sessions with checkpoints.

---

## Reference Files

- **Georgist patterns**: `halcyonic-projects/archive/georgist-network-economy/georgist/core/`
- **Bitcoin-ABM v1**: `halcyonic-projects/2026/bitcoin-abm/`
- **RSC JSX patterns**: `halcyonic-projects/clients/rsc-endowment-abm/rsc_staking_abm_v7.jsx`
- **BERT model**: `halcyonic-projects/active/bert/assets/models/examples/bitcoin.json`

---

## Final Verification Criteria

1. **Realistic dynamics**: Poisson blocks, fee market, difficulty adjustment
2. **BERT correspondence**: UI structure mirrors bitcoin.json (obvious to viewer)
3. **Scenarios work**: Different presets produce meaningfully different behavior
4. **Export functional**: CSV/JSON download works
5. **Newsletter ready**: Clean screenshots showing BERT ↔ simulation correspondence
