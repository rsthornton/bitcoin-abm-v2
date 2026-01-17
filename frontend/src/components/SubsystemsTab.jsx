/**
 * SubsystemsTab - 4-panel view of Bitcoin subsystems
 *
 * Block 6: Visual panels for Mining, Validating, Development, Protocol
 */

// =============================================================================
// Archetype Colors
// =============================================================================

const ARCHETYPE_COLORS = {
  Economy: '#f7931a',    // Bitcoin orange
  Agent: '#4a90d9',      // Blue
  Governance: '#50c878', // Green
  None: '#666',          // Gray
}

// =============================================================================
// Subsystem Panel Component
// =============================================================================

function SubsystemPanel({ t, subsystem, metrics, isActive }) {
  const color = ARCHETYPE_COLORS[subsystem.archetype] || ARCHETYPE_COLORS.None

  return (
    <div style={{
      background: t.bgSecondary,
      border: `1px solid ${isActive ? color : t.border}`,
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '3px',
            background: color,
          }} />
          <span style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: t.text,
          }}>
            {subsystem.name}
          </span>
        </div>
        <span style={{
          fontSize: '0.6875rem',
          color: t.textDim,
          padding: '2px 6px',
          background: t.bgTertiary,
          borderRadius: '4px',
        }}>
          {subsystem.complexity}
        </span>
      </div>

      {/* Archetype badge */}
      {subsystem.archetype && (
        <div style={{
          fontSize: '0.6875rem',
          color: color,
          marginBottom: '0.75rem',
        }}>
          {subsystem.archetype} · {subsystem.behavior?.decision_style?.replace('_', ' ')}
        </div>
      )}

      {/* Children subsystems */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {subsystem.children?.map(child => (
          <ChildSubsystem key={child.id} t={t} child={child} />
        ))}
      </div>
    </div>
  )
}

function ChildSubsystem({ t, child }) {
  const color = ARCHETYPE_COLORS[child.archetype] || ARCHETYPE_COLORS.None

  return (
    <div style={{
      padding: '0.625rem',
      background: t.bgTertiary,
      borderRadius: '6px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.25rem',
      }}>
        <span style={{
          fontSize: '0.8125rem',
          color: t.text,
          fontWeight: 500,
        }}>
          {child.name}
        </span>
        <span style={{
          fontSize: '0.625rem',
          color: t.textDim,
        }}>
          {child.complexity}
        </span>
      </div>
      <div style={{
        fontSize: '0.6875rem',
        color: t.textMuted,
        lineHeight: 1.4,
      }}>
        {child.description}
      </div>
    </div>
  )
}

// =============================================================================
// Mining Panel - Specialized View
// =============================================================================

function MiningPanel({ t, subsystem, metrics }) {
  const hashrate = metrics.hashrate || 100
  const blocksMinedRate = metrics.blocks_mined || 0

  return (
    <div style={{
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: ARCHETYPE_COLORS.Economy,
        }} />
        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: t.text,
        }}>
          Mining
        </span>
        <span style={{
          fontSize: '0.6875rem',
          color: ARCHETYPE_COLORS.Economy,
          marginLeft: 'auto',
        }}>
          Economy · profit maximizing
        </span>
      </div>

      {/* Flow diagram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem 0',
        flex: 1,
      }}>
        {/* Block Assembly */}
        <div style={{
          padding: '0.75rem',
          background: t.bgTertiary,
          borderRadius: '6px',
          borderLeft: `3px solid ${ARCHETYPE_COLORS.Economy}`,
          textAlign: 'center',
          minWidth: '100px',
        }}>
          <div style={{ fontSize: '0.75rem', color: t.textMuted }}>Block Assembly</div>
          <div style={{ fontSize: '0.875rem', color: t.text, fontWeight: 500, marginTop: '0.25rem' }}>
            Templates
          </div>
        </div>

        {/* Bidirectional arrows */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <span style={{ fontSize: '0.625rem', color: t.textDim }}>Block Template</span>
          <span style={{ color: ARCHETYPE_COLORS.Economy }}>→</span>
          <span style={{ color: ARCHETYPE_COLORS.Economy }}>←</span>
          <span style={{ fontSize: '0.625rem', color: t.textDim }}>Valid Proof</span>
        </div>

        {/* Hash Production */}
        <div style={{
          padding: '0.75rem',
          background: t.bgTertiary,
          borderRadius: '6px',
          borderLeft: `3px solid ${ARCHETYPE_COLORS.None}`,
          textAlign: 'center',
          minWidth: '100px',
        }}>
          <div style={{ fontSize: '0.75rem', color: t.textMuted }}>Hash Production</div>
          <div style={{ fontSize: '0.875rem', color: t.text, fontWeight: 500, marginTop: '0.25rem' }}>
            {hashrate.toFixed(1)} EH/s
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${t.border}`,
        marginTop: 'auto',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: t.text, fontWeight: 600 }}>{blocksMinedRate}</div>
          <div style={{ fontSize: '0.625rem', color: t.textDim }}>Blocks Mined</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: t.text, fontWeight: 600 }}>{metrics.difficulty?.toFixed(2) || '1.00'}</div>
          <div style={{ fontSize: '0.625rem', color: t.textDim }}>Difficulty</div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Validating Panel - Specialized View
// =============================================================================

function ValidatingPanel({ t, subsystem, metrics }) {
  const mempoolSize = metrics.mempool_size || 0
  const avgFee = metrics.avg_fee || 1

  // Visual mempool fill level (max around 5000 for visual)
  const fillPct = Math.min(100, (mempoolSize / 5000) * 100)

  return (
    <div style={{
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: ARCHETYPE_COLORS.Governance,
        }} />
        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: t.text,
        }}>
          Validating
        </span>
        <span style={{
          fontSize: '0.6875rem',
          color: ARCHETYPE_COLORS.Governance,
          marginLeft: 'auto',
        }}>
          Governance · consensus seeking
        </span>
      </div>

      {/* Mempool visualization */}
      <div style={{
        padding: '0.75rem',
        background: t.bgTertiary,
        borderRadius: '6px',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: t.textMuted }}>Mempool</span>
          <span style={{ fontSize: '0.75rem', color: t.text }}>{mempoolSize} txs</span>
        </div>
        <div style={{
          height: '8px',
          background: t.bg,
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${fillPct}%`,
            height: '100%',
            background: fillPct > 80 ? '#e05555' : fillPct > 50 ? '#f0ad4e' : ARCHETYPE_COLORS.Governance,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Block Processor */}
      <div style={{
        padding: '0.75rem',
        background: t.bgTertiary,
        borderRadius: '6px',
        borderLeft: `3px solid ${ARCHETYPE_COLORS.Governance}`,
        flex: 1,
      }}>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.25rem' }}>
          Block Processor
        </div>
        <div style={{ fontSize: '0.8125rem', color: t.text }}>
          Validating blocks against consensus rules
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${t.border}`,
        marginTop: '0.75rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: t.text, fontWeight: 600 }}>{avgFee.toFixed(1)}</div>
          <div style={{ fontSize: '0.625rem', color: t.textDim }}>Avg Fee (sat/vB)</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: t.text, fontWeight: 600 }}>{metrics.transactions_processed || 0}</div>
          <div style={{ fontSize: '0.625rem', color: t.textDim }}>Txs Processed</div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Development Panel - Specialized View
// =============================================================================

function DevelopmentPanel({ t, subsystem, metrics }) {
  const bipsProposed = metrics.bips_proposed || 0

  return (
    <div style={{
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: ARCHETYPE_COLORS.Agent,
        }} />
        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: t.text,
        }}>
          Development
        </span>
        <span style={{
          fontSize: '0.6875rem',
          color: ARCHETYPE_COLORS.Agent,
          marginLeft: 'auto',
        }}>
          Agent · evidence based
        </span>
      </div>

      {/* BIP Pipeline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: '0.75rem 0',
        flex: 1,
      }}>
        <PipelineStage t={t} label="Research" color={ARCHETYPE_COLORS.Agent} />
        <span style={{ color: t.textDim }}>→</span>
        <PipelineStage t={t} label="Implementation" color={ARCHETYPE_COLORS.Agent} />
        <span style={{ color: t.textDim }}>→</span>
        <PipelineStage t={t} label="Review" color={ARCHETYPE_COLORS.Governance} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${t.border}`,
        marginTop: 'auto',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', color: ARCHETYPE_COLORS.Agent, fontWeight: 600 }}>{bipsProposed}</div>
          <div style={{ fontSize: '0.625rem', color: t.textDim }}>BIPs Proposed</div>
        </div>
      </div>
    </div>
  )
}

function PipelineStage({ t, label, color }) {
  return (
    <div style={{
      padding: '0.5rem 0.75rem',
      background: t.bgTertiary,
      borderRadius: '6px',
      borderTop: `2px solid ${color}`,
      textAlign: 'center',
      flex: 1,
    }}>
      <div style={{ fontSize: '0.6875rem', color: t.textMuted }}>{label}</div>
    </div>
  )
}

// =============================================================================
// Protocol Panel - Specialized View
// =============================================================================

function ProtocolPanel({ t, subsystem, metrics }) {
  const blockHeight = metrics.block_height || 0

  return (
    <div style={{
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: ARCHETYPE_COLORS.Governance,
        }} />
        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: t.text,
        }}>
          Protocol
        </span>
        <span style={{
          fontSize: '0.6875rem',
          color: ARCHETYPE_COLORS.Governance,
          marginLeft: 'auto',
        }}>
          Governance · consensus seeking
        </span>
      </div>

      {/* Subsystem cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
      }}>
        <ProtocolSubsystem t={t} name="Consensus Rules" desc="Difficulty, block size, halving" color={ARCHETYPE_COLORS.Governance} />
        <ProtocolSubsystem t={t} name="Network Layer" desc="P2P gossip protocol" color={ARCHETYPE_COLORS.None} />
        <ProtocolSubsystem t={t} name="Chain State" desc="UTXO set, block index" color={ARCHETYPE_COLORS.None} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${t.border}`,
        marginTop: '0.75rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', color: t.text, fontWeight: 600 }}>{blockHeight}</div>
          <div style={{ fontSize: '0.625rem', color: t.textDim }}>Block Height</div>
        </div>
      </div>
    </div>
  )
}

function ProtocolSubsystem({ t, name, desc, color }) {
  return (
    <div style={{
      padding: '0.5rem 0.75rem',
      background: t.bgTertiary,
      borderRadius: '6px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.75rem', color: t.text, fontWeight: 500 }}>{name}</div>
      <div style={{ fontSize: '0.625rem', color: t.textMuted }}>{desc}</div>
    </div>
  )
}

// =============================================================================
// Main Export
// =============================================================================

export function SubsystemsTab({ t, metrics, bertStructure }) {
  if (!bertStructure) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: t.textMuted,
      }}>
        Loading BERT structure...
      </div>
    )
  }

  // Find specific subsystems
  const mining = bertStructure.subsystems.find(s => s.name === 'Mining')
  const validating = bertStructure.subsystems.find(s => s.name === 'Validating')
  const development = bertStructure.subsystems.find(s => s.name === 'Development')
  const protocol = bertStructure.subsystems.find(s => s.name === 'Protocol')

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      height: '100%',
      minHeight: '500px',
    }}>
      {mining && <MiningPanel t={t} subsystem={mining} metrics={metrics} />}
      {validating && <ValidatingPanel t={t} subsystem={validating} metrics={metrics} />}
      {development && <DevelopmentPanel t={t} subsystem={development} metrics={metrics} />}
      {protocol && <ProtocolPanel t={t} subsystem={protocol} metrics={metrics} />}
    </div>
  )
}
