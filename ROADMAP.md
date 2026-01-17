# Bitcoin ABM v2 Roadmap

## Vision

A research-grade Bitcoin network simulation that bridges educational visualization with publishable results. Ground truth from historical blockchain data, projections validated against reality.

---

## Phase 1: Foundation (Complete)

- [x] Flask + React + Socket.IO architecture
- [x] BERT model integration (subsystem hierarchy, archetypes)
- [x] DSA three-layer visualization (Network tab)
- [x] 6 scenario presets with hypothesis testing
- [x] Real-time charts and export (CSV/JSON)
- [x] Light/dark themes

---

## Phase 2: Historical Ground Truth

**Goal**: Calibrate simulation against real Bitcoin data.

### 2.1 Data Ingestion
- [ ] Connect to blockchain APIs (Mempool.space, Blockstream, Glassnode)
- [ ] Fetch historical metrics: mempool size, fee rates, hashrate, difficulty
- [ ] Store time-series locally (SQLite or JSON cache)
- [ ] Date range selector in UI

### 2.2 Replay Mode
- [ ] "Replay" historical periods (2017 bull run, 2021 fee spike, halvings)
- [ ] Side-by-side: simulation vs actual data
- [ ] Calibration scoring: how well does sim match reality?

### 2.3 Parameter Estimation
- [ ] Fit scenario params to historical epochs
- [ ] Auto-generate scenarios from real events
- [ ] Confidence intervals on projections

---

## Phase 3: Research Features

**Goal**: Make outputs publishable and reproducible.

### 3.1 Mesa Integration
- [ ] Replace placeholder dynamics with full Mesa ABM
- [ ] Port existing `bitcoin_agents.py` (Miner, Validator, Developer)
- [ ] Agent-level inspection in UI

### 3.2 Batch Runs & Parameter Sweeps
- [ ] `/api/batch` endpoint for headless runs
- [ ] Parameter sweep configuration
- [ ] Monte Carlo with seed control
- [ ] Export results to DataFrame/CSV

### 3.3 Reproducibility
- [ ] Seed control for deterministic runs
- [ ] State snapshots (save/load)
- [ ] Run configuration export (JSON)
- [ ] Jupyter notebook integration

---

## Phase 4: Advanced Visualization

**Goal**: Handle larger models and richer interactions.

### 4.1 Depth-2 Drill-down
- [ ] Click subsystem → expand to show children
- [ ] Mining → Hash Production + Block Assembly
- [ ] Development → Research + Implementation + Review

### 4.2 Multi-Scenario Comparison
- [ ] Run 2-3 scenarios simultaneously
- [ ] Split-screen or overlay charts
- [ ] Divergence highlighting

### 4.3 WebGL/Canvas Upgrade
- [ ] Handle 50+ nodes smoothly
- [ ] GPU-accelerated particle flows
- [ ] Force-directed layout option

---

## Phase 5: Ecosystem Integration

**Goal**: Connect to broader tooling.

### 5.1 BERT Tool Integration
- [ ] Import models directly from BERT app
- [ ] Edit bitcoin.json → hot reload simulation
- [ ] Export simulation results back to BERT

### 5.2 Thesis Pipeline Connection
- [ ] Use same network analysis libraries
- [ ] Centrality metrics on flow network
- [ ] Export for igraph/NetworkX

### 5.3 Newsletter/Demo Mode
- [ ] Guided tour overlay
- [ ] Preset "story" sequences
- [ ] Screenshot automation

---

## Hosting Strategy

### Architecture: Single Container
```
┌─────────────────────────────────┐
│  Single Container               │
│  ┌───────────────────────────┐  │
│  │  Flask serves:            │  │
│  │  - /api/* (REST)          │  │
│  │  - /socket.io (WebSocket) │  │
│  │  - /* (React static)      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```
- Build React → `frontend/dist/`
- Flask serves static files + API
- Single port, no CORS issues

### Platform Comparison

| | Railway | Render | Fly.io |
|---|---------|--------|--------|
| **Cold starts** | ❌ None | ⚠️ ~30s after 15min idle | ❌ None |
| **Free tier** | ~500 hrs/mo ($5 credit) | Unlimited (with cold starts) | ~3 small VMs |
| **WebSocket** | ✅ Good | ✅ Works | ✅ Excellent |
| **DX** | ✅ Best | ✅ Simple | ⚠️ More DevOps-y |
| **Paid tier** | $5/mo | $7/mo | $5/mo |

### Recommended: Railway ⭐

**Why Railway wins for this project:**
1. **No cold starts** - Demo links load instantly (crucial for sharing in newsletters/meetings)
2. **Simple DX** - Auto-detects Flask, minimal config
3. **Good WebSocket support** - Real-time simulation works reliably
4. **Free tier sufficient** - ~500 hrs/mo is plenty for a demo/portfolio piece

### Deployment Steps

```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Move build to Flask static
mkdir -p ../backend/static
cp -r dist/* ../backend/static/

# 3. Update server.py to serve static files
# app = Flask(__name__, static_folder='static', static_url_path='')
# Add catch-all route to serve index.html for client-side routing

# 4. Deploy to Railway
cd backend
railway login
railway init
railway up
```

### Future Scaling Path
1. **Now**: Railway free tier (~500 hrs/mo)
2. **More traffic**: Railway paid ($5/mo, always-on)
3. **Heavy WebSocket load**: Migrate to Fly.io (edge locations, better WS scaling)

---

## Quick Wins (Low Effort, High Impact)

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| Mempool.space API | 2 hrs | High | Real mempool data overlay |
| Seed control | 1 hr | Medium | Reproducible runs |
| Shareable URLs | 2 hrs | High | `?scenario=halving&step=100` |
| Fullscreen mode | 30 min | Medium | Better for demos |
| Keyboard shortcuts | 1 hr | Medium | Space=run, R=reset |
| Mobile layout | 2 hrs | Medium | Collapse sidebar |

---

## Backlog (Ideas)

- Lightning Network layer
- Mining pool distribution visualization
- Governance voting simulation
- Fee estimation oracle
- Block space market dynamics
- Ordinals/inscriptions scenario
- Cross-chain comparison (ETH, etc.)

---

## Success Metrics

1. **Educational**: Non-technical users understand Bitcoin dynamics
2. **Research**: Outputs match historical data within 10%
3. **Demo-ready**: Newsletter screenshots look professional
4. **Reproducible**: Any run can be replicated with seed + config
