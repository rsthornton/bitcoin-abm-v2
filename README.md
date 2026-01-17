# Bitcoin ABM v2

User-friendly simulation showing Bitcoin network dynamics, directly corresponding to the BERT `bitcoin.json` model structure.

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
├── backend/           # Python/Flask + Mesa simulation
│   ├── server.py      # API endpoints
│   └── ...
├── frontend/          # React/Vite UI
│   └── src/
│       └── App.jsx    # Main component
├── bitcoin.json       # BERT model (added in Block 3)
└── PLAN.md            # Development roadmap
```

## Development Blocks

See `PLAN.md` for the full block-by-block development plan.

- [x] Block 1: Project Scaffold
- [x] Block 2: Backend API Contract
- [x] Block 3: BERT Loader Update
- [x] Block 4: Frontend Shell
- [x] Block 5: WebSocket Connection
- [x] Block 6: Subsystems Tab
- [x] Block 7: Network Tab (DSA Integrated)
- [x] Block 8: Analysis Tab
- [x] Block 9: Scenarios
- [ ] Block 10: Polish + Export
