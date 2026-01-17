import { useState, useEffect } from 'react'
import { useSimulation } from './hooks/useSimulation'
import { SubsystemsTab } from './components/SubsystemsTab'
import { NetworkTab } from './components/NetworkTab'
import { AnalysisTab } from './components/AnalysisTab'

/**
 * Bitcoin ABM v2 - Main Application
 *
 * Block 5: WebSocket connection for real-time updates.
 */

// =============================================================================
// Theme Tokens
// =============================================================================

const themes = {
  dark: {
    bg: '#0a0a0a',
    bgSecondary: '#111',
    bgTertiary: '#1a1a1a',
    border: '#222',
    borderHover: '#333',
    text: '#d0d0d0',
    textMuted: '#888',
    textDim: '#555',
    accent: '#f7931a',  // Bitcoin orange
    accentHover: '#ffa500',
    success: '#50c878',
    warning: '#f0ad4e',
    error: '#e05555',
  },
  light: {
    bg: '#fafafa',
    bgSecondary: '#fff',
    bgTertiary: '#f0f0f0',
    border: '#ddd',
    borderHover: '#bbb',
    text: '#1a1a1a',
    textMuted: '#666',
    textDim: '#999',
    accent: '#f7931a',
    accentHover: '#e68a00',
    success: '#2e8b57',
    warning: '#cc8800',
    error: '#cc3333',
  },
}

// =============================================================================
// Components
// =============================================================================

function Header({ theme, t, onThemeToggle, simState, onRun, onStop, onStep, onReset, scenarios, currentScenario, onScenarioChange }) {
  return (
    <header style={{
      height: '56px',
      background: t.bgSecondary,
      borderBottom: `1px solid ${t.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: t.accent,
          margin: 0,
        }}>
          Bitcoin ABM
        </h1>
        <span style={{
          fontSize: '0.75rem',
          color: t.textDim,
          padding: '2px 8px',
          background: t.bgTertiary,
          borderRadius: '4px',
        }}>
          v2
        </span>

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <select
            value={currentScenario.id}
            onChange={(e) => onScenarioChange(e.target.value)}
            style={{
              background: t.bgTertiary,
              border: `1px solid ${t.border}`,
              borderRadius: '6px',
              padding: '6px 10px',
              color: t.text,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              outline: 'none',
            }}
            title={currentScenario.hypothesis || 'Select a scenario'}
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Simulation Controls */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '4px',
          background: t.bgTertiary,
          borderRadius: '6px',
        }}>
          <ControlButton t={t} onClick={onReset} title="Reset">
            ↺
          </ControlButton>
          <ControlButton t={t} onClick={onStep} title="Step">
            →
          </ControlButton>
          <ControlButton
            t={t}
            onClick={simState.running ? onStop : onRun}
            active={simState.running}
            title={simState.running ? 'Stop' : 'Run'}
          >
            {simState.running ? '◼' : '▶'}
          </ControlButton>
        </div>

        {/* Step Counter */}
        <span style={{
          fontSize: '0.75rem',
          color: t.textMuted,
          minWidth: '80px',
        }}>
          Step: {simState.step}
        </span>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          style={{
            background: 'none',
            border: `1px solid ${t.border}`,
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
            color: t.textMuted,
            fontSize: '0.875rem',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  )
}

function ControlButton({ t, onClick, active, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '32px',
        height: '32px',
        border: 'none',
        borderRadius: '4px',
        background: active ? t.accent : 'transparent',
        color: active ? '#fff' : t.textMuted,
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function Sidebar({ t, metrics, bertStructure, simState, currentScenario }) {
  // Export handlers
  const exportJSON = () => {
    const data = {
      exported_at: new Date().toISOString(),
      scenario: currentScenario,
      state: {
        step: simState.step,
        metrics: metrics,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bitcoin-abm-${currentScenario?.id || 'baseline'}-step${simState.step}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ['step', 'block_height', 'hashrate', 'difficulty', 'mempool_size', 'avg_fee', 'blocks_mined', 'transactions_processed', 'bips_proposed']
    const row = [
      simState.step,
      metrics.block_height,
      metrics.hashrate.toFixed(2),
      metrics.difficulty.toFixed(4),
      metrics.mempool_size,
      metrics.avg_fee.toFixed(2),
      metrics.blocks_mined,
      metrics.transactions_processed,
      metrics.bips_proposed,
    ]
    const csv = `${headers.join(',')}\n${row.join(',')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bitcoin-abm-${currentScenario?.id || 'baseline'}-step${simState.step}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside style={{
      width: '280px',
      flexShrink: 0,
      background: t.bgSecondary,
      borderRight: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
    }}>
      {/* Metrics Section */}
      <div style={{ padding: '1rem', borderBottom: `1px solid ${t.border}` }}>
        <SectionLabel t={t}>Core Metrics</SectionLabel>
        <MetricRow t={t} label="Block Height" value={metrics.block_height} />
        <MetricRow t={t} label="Hashrate" value={`${metrics.hashrate.toFixed(1)} EH/s`} />
        <MetricRow t={t} label="Difficulty" value={metrics.difficulty.toFixed(4)} />
        <MetricRow t={t} label="Mempool" value={`${metrics.mempool_size} txs`} />
        <MetricRow t={t} label="Avg Fee" value={`${metrics.avg_fee.toFixed(1)} sat/vB`} />
      </div>

      {/* Activity Section */}
      <div style={{ padding: '1rem', borderBottom: `1px solid ${t.border}` }}>
        <SectionLabel t={t}>Activity</SectionLabel>
        <MetricRow t={t} label="Blocks Mined" value={metrics.blocks_mined} />
        <MetricRow t={t} label="Txs Processed" value={metrics.transactions_processed} />
        <MetricRow t={t} label="BIPs Proposed" value={metrics.bips_proposed} />
      </div>

      {/* BERT Structure Preview */}
      {bertStructure && (
        <div style={{ padding: '1rem', borderBottom: `1px solid ${t.border}`, flex: 1 }}>
          <SectionLabel t={t}>BERT Model</SectionLabel>
          <div style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.5rem' }}>
            {bertStructure.stats.total_subsystems} subsystems · {bertStructure.stats.total_flows} flows
          </div>
          {bertStructure.subsystems.slice(0, 4).map(sub => (
            <SubsystemChip key={sub.id} t={t} subsystem={sub} />
          ))}
        </div>
      )}

      {/* Export Section */}
      <div style={{ padding: '1rem' }}>
        <SectionLabel t={t}>Export</SectionLabel>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExportButton t={t} onClick={exportJSON} label="JSON" />
          <ExportButton t={t} onClick={exportCSV} label="CSV" />
        </div>
      </div>
    </aside>
  )
}

function ExportButton({ t, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '0.5rem',
        background: t.bgTertiary,
        border: `1px solid ${t.border}`,
        borderRadius: '4px',
        color: t.textMuted,
        fontSize: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseOver={(e) => e.target.style.borderColor = t.borderHover}
      onMouseOut={(e) => e.target.style.borderColor = t.border}
    >
      {label}
    </button>
  )
}

function SectionLabel({ t, children }) {
  return (
    <div style={{
      fontSize: '0.6875rem',
      color: t.textDim,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '0.75rem',
    }}>
      {children}
    </div>
  )
}

function MetricRow({ t, label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.375rem 0',
    }}>
      <span style={{ fontSize: '0.8125rem', color: t.textMuted }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: t.text, fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function SubsystemChip({ t, subsystem }) {
  const archetypeColors = {
    Economy: '#f7931a',
    Agent: '#4a90d9',
    Governance: '#50c878',
  }
  const color = archetypeColors[subsystem.archetype] || t.textDim

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.375rem 0',
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '2px',
        background: color,
      }} />
      <span style={{ fontSize: '0.8125rem', color: t.text }}>{subsystem.name}</span>
      <span style={{
        fontSize: '0.6875rem',
        color: t.textDim,
        marginLeft: 'auto',
      }}>
        {subsystem.complexity}
      </span>
    </div>
  )
}

function TabBar({ t, activeTab, onTabChange }) {
  const tabs = ['Network', 'Subsystems', 'Analysis', 'About']

  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      padding: '0 1rem',
      borderBottom: `1px solid ${t.border}`,
      background: t.bgSecondary,
    }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${t.accent}` : '2px solid transparent',
            color: activeTab === tab ? t.text : t.textMuted,
            fontSize: '0.8125rem',
            fontWeight: activeTab === tab ? 500 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function MainContent({ t, activeTab, metrics, bertStructure, simState }) {
  return (
    <div style={{
      flex: 1,
      padding: '1.5rem',
      overflow: 'auto',
    }}>
      {activeTab === 'Network' && (
        <NetworkTab t={t} metrics={metrics} bertStructure={bertStructure} simState={simState} />
      )}
      {activeTab === 'Subsystems' && (
        <SubsystemsTab t={t} metrics={metrics} bertStructure={bertStructure} />
      )}
      {activeTab === 'Analysis' && (
        <AnalysisTab t={t} metrics={metrics} simState={simState} />
      )}
      {activeTab === 'About' && (
        <AboutTab t={t} bertStructure={bertStructure} />
      )}
    </div>
  )
}

function PlaceholderTab({ t, title, description }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '300px',
    }}>
      <div style={{
        fontSize: '1.25rem',
        color: t.textMuted,
        marginBottom: '0.5rem',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: t.textDim,
      }}>
        {description}
      </div>
    </div>
  )
}

function AboutTab({ t, bertStructure }) {
  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={{ fontSize: '1.25rem', color: t.text, marginBottom: '0.5rem' }}>
        Bitcoin ABM v2
      </h2>
      <p style={{ fontSize: '0.875rem', color: t.textMuted, lineHeight: 1.6, marginBottom: '1.5rem' }}>
        A user-friendly simulation showing Bitcoin network dynamics, directly corresponding to the BERT (Bounded Entity Reasoning Toolkit) model structure.
      </p>

      {/* Deep Systems Analysis */}
      <h3 style={{ fontSize: '1rem', color: t.text, marginBottom: '0.75rem' }}>
        Deep Systems Analysis (DSA)
      </h3>
      <p style={{ fontSize: '0.8125rem', color: t.textMuted, lineHeight: 1.6, marginBottom: '1rem' }}>
        This simulation integrates three modeling paradigms following the DSA framework:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <DSACard t={t} layer="Skeleton" desc="Network topology" color="#888" />
        <DSACard t={t} layer="Flesh" desc="Flows & stocks" color="#50c878" />
        <DSACard t={t} layer="Nervous System" desc="Agent archetypes" color="#f7931a" />
      </div>

      {/* Archetypes */}
      {bertStructure && (
        <>
          <h3 style={{ fontSize: '1rem', color: t.text, marginBottom: '0.75rem' }}>
            Agent Archetypes
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {Object.entries(bertStructure.archetype_legend).map(([name, config]) => (
              <div key={name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: t.bgTertiary,
                borderRadius: '6px',
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: config.color,
                }} />
                <span style={{ fontSize: '0.8125rem', color: t.text }}>{name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Scenarios */}
      <h3 style={{ fontSize: '1rem', color: t.text, marginBottom: '0.75rem' }}>
        Scenario Presets
      </h3>
      <div style={{ fontSize: '0.8125rem', color: t.textMuted, lineHeight: 1.6, marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <ScenarioInfo t={t} name="Baseline" desc="Normal operation" />
          <ScenarioInfo t={t} name="Fee Spike" desc="Congested mempool" />
          <ScenarioInfo t={t} name="Halving Event" desc="50% reward drop" />
          <ScenarioInfo t={t} name="Hash War" desc="Rapid hashrate growth" />
          <ScenarioInfo t={t} name="Contentious Fork" desc="Governance crisis" />
          <ScenarioInfo t={t} name="51% Attack" desc="Centralization threat" />
        </div>
      </div>

      {/* Model Stats */}
      {bertStructure && (
        <>
          <h3 style={{ fontSize: '1rem', color: t.text, marginBottom: '0.75rem' }}>
            BERT Model Stats
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <StatCard t={t} label="Subsystems" value={bertStructure.stats.total_subsystems} />
            <StatCard t={t} label="Flows" value={bertStructure.stats.total_flows} />
            <StatCard t={t} label="Depth" value={bertStructure.stats.depth} />
          </div>
        </>
      )}

      {/* Instructions */}
      <h3 style={{ fontSize: '1rem', color: t.text, marginBottom: '0.75rem' }}>
        How to Use
      </h3>
      <ol style={{ fontSize: '0.8125rem', color: t.textMuted, lineHeight: 1.8, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
        <li>Select a <strong>scenario</strong> from the dropdown in the header</li>
        <li>Press <strong>▶ Run</strong> to start continuous simulation</li>
        <li>Watch the <strong>Network</strong> tab for flow animations</li>
        <li>Explore <strong>Subsystems</strong> for detailed component views</li>
        <li>Check <strong>Analysis</strong> for time-series charts</li>
        <li><strong>Export</strong> data as JSON or CSV from the sidebar</li>
      </ol>

      {/* Footer */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: t.bgTertiary,
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: t.textDim,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>Block 10: Complete ✓</span>
        <a
          href="https://github.com/halcyonic/bitcoin-abm-v2"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: t.accent, textDecoration: 'none' }}
        >
          View Source →
        </a>
      </div>
    </div>
  )
}

function DSACard({ t, layer, desc, color }) {
  return (
    <div style={{
      padding: '0.75rem',
      background: t.bgTertiary,
      borderRadius: '6px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: t.text, marginBottom: '0.25rem' }}>
        {layer}
      </div>
      <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{desc}</div>
    </div>
  )
}

function ScenarioInfo({ t, name, desc }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
      <span style={{ color: t.text }}>{name}</span>
      <span style={{ color: t.textDim }}>{desc}</span>
    </div>
  )
}

function StatCard({ t, label, value }) {
  return (
    <div style={{
      padding: '0.75rem',
      background: t.bgTertiary,
      borderRadius: '6px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: t.accent }}>{value}</div>
      <div style={{ fontSize: '0.6875rem', color: t.textDim, textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// =============================================================================
// Main App
// =============================================================================

export default function App() {
  const [theme, setTheme] = useState('light')
  const [activeTab, setActiveTab] = useState('Network')
  const [bertStructure, setBertStructure] = useState(null)

  // WebSocket-powered simulation state
  const {
    connected,
    simState,
    metrics,
    error,
    step: handleStep,
    reset: handleReset,
    run: handleRun,
    stop: handleStop,
    clearError,
    scenarios,
    currentScenario,
    setScenario,
  } = useSimulation()

  const t = themes[theme]

  // Fetch BERT structure on mount
  useEffect(() => {
    fetch('/api/bert-structure')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setBertStructure(data)
        }
      })
      .catch(err => console.error('Failed to load BERT structure:', err))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      color: t.text,
      fontFamily: "'SF Mono', 'IBM Plex Mono', 'Menlo', monospace",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header
        theme={theme}
        t={t}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        simState={simState}
        onRun={handleRun}
        onStop={handleStop}
        onStep={handleStep}
        onReset={handleReset}
        scenarios={scenarios}
        currentScenario={currentScenario}
        onScenarioChange={setScenario}
      />

      {/* Scenario Hypothesis Bar */}
      {currentScenario.id !== 'baseline' && currentScenario.hypothesis && (
        <div style={{
          background: t.bgTertiary,
          borderBottom: `1px solid ${t.border}`,
          padding: '0.5rem 1.5rem',
          fontSize: '0.75rem',
          color: t.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontWeight: 600, color: t.accent }}>{currentScenario.name}:</span>
          <span>{currentScenario.hypothesis}</span>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar t={t} metrics={metrics} bertStructure={bertStructure} simState={simState} currentScenario={currentScenario} />

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <TabBar t={t} activeTab={activeTab} onTabChange={setActiveTab} />
          <MainContent
            t={t}
            activeTab={activeTab}
            metrics={metrics}
            bertStructure={bertStructure}
            simState={simState}
          />
        </main>
      </div>

      {/* Connection status */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: t.textDim,
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: connected ? t.success : t.error,
        }} />
        {connected ? 'WebSocket' : 'Disconnected'}
      </div>

      {error && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: t.error,
          color: '#fff',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          fontSize: '0.8125rem',
        }}>
          {error}
          <button
            onClick={clearError}
            style={{
              marginLeft: '1rem',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
