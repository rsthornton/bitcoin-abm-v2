/**
 * NetworkTab - Flow visualization between Bitcoin subsystems
 *
 * Block 7: Implements Deep Systems Analysis (DSA) integrated view
 *
 * Three Layers (from integrated-systems-modeling.html):
 * 1. SKELETON (Network/Graph): Subsystem nodes and topology
 * 2. FLESH (System Dynamics): Flows, stocks, accumulations
 * 3. NERVOUS SYSTEM (ABM): Agent archetypes and decision-making
 */

import { useState, useEffect, useRef } from 'react'

// =============================================================================
// Constants
// =============================================================================

const ARCHETYPE_COLORS = {
  Economy: '#f7931a',    // Bitcoin orange - profit maximizing
  Agent: '#4a90d9',      // Blue - evidence based
  Governance: '#50c878', // Green - consensus seeking
  None: '#888888',       // Gray - rule following
}

// Node positions (relative to container)
const NODE_POSITIONS = {
  Mining: { x: 75, y: 25 },
  Validating: { x: 25, y: 50 },
  Development: { x: 50, y: 85 },
  Protocol: { x: 75, y: 60 },
}

// Flow definitions matching bitcoin.json
const FLOWS = [
  { id: 'F0.3', from: 'Validating', to: 'Mining', label: 'Mempool Txs', type: 'Resource' },
  { id: 'F0.8', from: 'Mining', to: 'Protocol', label: 'Mined Blocks', type: 'Product' },
  { id: 'F0.6', from: 'Development', to: 'Protocol', label: 'Protocol Updates', type: 'Resource' },
  { id: 'F0.2', from: 'Protocol', to: 'Development', label: 'Technical Feedback', type: 'Resource' },
  { id: 'F0.7', from: 'Protocol', to: 'Mining', label: 'Consensus Rules', type: 'Resource' },
  { id: 'F0.9', from: 'Protocol', to: 'Validating', label: 'Chain State', type: 'Resource' },
  { id: 'F0.10', from: 'Validating', to: 'Protocol', label: 'Validation Results', type: 'Resource' },
  { id: 'F0.11', from: 'Mining', to: 'Validating', label: 'Block Announcements', type: 'Product' },
]

// =============================================================================
// SVG Flow Arrow Component
// =============================================================================

function FlowArrow({ t, from, to, label, type, isActive, containerSize }) {
  const fromPos = NODE_POSITIONS[from]
  const toPos = NODE_POSITIONS[to]

  if (!fromPos || !toPos || !containerSize.width) return null

  // Convert percentage to pixels
  const x1 = (fromPos.x / 100) * containerSize.width
  const y1 = (fromPos.y / 100) * containerSize.height
  const x2 = (toPos.x / 100) * containerSize.width
  const y2 = (toPos.y / 100) * containerSize.height

  // Calculate midpoint for label
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  // Calculate angle for arrow
  const angle = Math.atan2(y2 - y1, x2 - x1)

  // Shorten line to not overlap nodes (node radius ~40px)
  const nodeRadius = 45
  const dx = Math.cos(angle) * nodeRadius
  const dy = Math.sin(angle) * nodeRadius

  const startX = x1 + dx
  const startY = y1 + dy
  const endX = x2 - dx
  const endY = y2 - dy

  // Flow type colors
  const flowColor = type === 'Product' ? '#50c878' : '#888'

  return (
    <g style={{ opacity: isActive ? 1 : 0.4 }}>
      {/* Line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={flowColor}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={type === 'Resource' ? '4,4' : 'none'}
        markerEnd="url(#arrowhead)"
      />

      {/* Animated particle when active */}
      {isActive && (
        <circle r="4" fill={flowColor}>
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M${startX},${startY} L${endX},${endY}`}
          />
        </circle>
      )}

      {/* Label background */}
      <rect
        x={midX - 45}
        y={midY - 8}
        width={90}
        height={16}
        fill={t.bgSecondary}
        rx={4}
        style={{ opacity: 0.9 }}
      />

      {/* Label text */}
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        fontSize="10"
        fill={t.textMuted}
      >
        {label}
      </text>
    </g>
  )
}

// =============================================================================
// Subsystem Node Component
// =============================================================================

function SubsystemNode({ t, name, archetype, complexity, position, isActive, onClick, containerSize }) {
  if (!containerSize.width) return null

  const x = (position.x / 100) * containerSize.width
  const y = (position.y / 100) * containerSize.height
  const color = ARCHETYPE_COLORS[archetype] || ARCHETYPE_COLORS.None

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* Outer glow when active */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={50}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.3}
        >
          <animate
            attributeName="r"
            values="45;55;45"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main circle */}
      <circle
        cx={x}
        cy={y}
        r={40}
        fill={t.bgSecondary}
        stroke={color}
        strokeWidth={3}
      />

      {/* Inner archetype indicator */}
      <circle
        cx={x}
        cy={y}
        r={8}
        fill={color}
      />

      {/* Name */}
      <text
        x={x}
        y={y + 22}
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill={t.text}
      >
        {name}
      </text>

      {/* Complexity badge */}
      <text
        x={x}
        y={y + 35}
        textAnchor="middle"
        fontSize="9"
        fill={t.textDim}
      >
        {complexity}
      </text>
    </g>
  )
}

// =============================================================================
// DSA Legend Component
// =============================================================================

function DSALegend({ t }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '0.75rem',
      fontSize: '0.6875rem',
    }}>
      <div style={{ fontWeight: 600, color: t.text, marginBottom: '0.5rem' }}>
        Deep Systems Analysis Layers
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <LegendRow color="#888" label="Skeleton" desc="Network topology" />
        <LegendRow color="#50c878" label="Flesh" desc="Flows & stocks" solid />
        <LegendRow color="#f7931a" label="Nervous System" desc="Agent archetypes" />
      </div>

      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: `1px solid ${t.border}`,
      }}>
        <div style={{ color: t.textDim, marginBottom: '0.25rem' }}>Archetypes:</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ArchetypeBadge color={ARCHETYPE_COLORS.Economy} label="Economy" />
          <ArchetypeBadge color={ARCHETYPE_COLORS.Agent} label="Agent" />
          <ArchetypeBadge color={ARCHETYPE_COLORS.Governance} label="Governance" />
        </div>
      </div>
    </div>
  )
}

function LegendRow({ color, label, desc, solid }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '20px',
        height: '2px',
        background: color,
        borderStyle: solid ? 'solid' : 'dashed',
      }} />
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color: '#666' }}>— {desc}</span>
    </div>
  )
}

function ArchetypeBadge({ color, label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '2px',
        background: color,
      }} />
      <span style={{ color: '#888' }}>{label}</span>
    </div>
  )
}

// =============================================================================
// Flow Stats Panel
// =============================================================================

function FlowStats({ t, metrics, selectedNode }) {
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '0.75rem',
      minWidth: '160px',
    }}>
      <div style={{
        fontSize: '0.6875rem',
        color: t.textDim,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
      }}>
        Flow Metrics
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <StatRow t={t} label="Txs/step" value={Math.round(metrics.transactions_processed / Math.max(1, metrics.step || 1) * 10) / 10} />
        <StatRow t={t} label="Blocks/step" value={(metrics.blocks_mined / Math.max(1, metrics.step || 1)).toFixed(2)} />
        <StatRow t={t} label="Active flows" value={FLOWS.length} />
      </div>

      {selectedNode && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: `1px solid ${t.border}`,
        }}>
          <div style={{ fontSize: '0.75rem', color: t.text, fontWeight: 500 }}>
            {selectedNode}
          </div>
          <div style={{ fontSize: '0.6875rem', color: t.textMuted }}>
            {FLOWS.filter(f => f.from === selectedNode).length} outgoing · {FLOWS.filter(f => f.to === selectedNode).length} incoming
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({ t, label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
    }}>
      <span style={{ color: t.textMuted }}>{label}</span>
      <span style={{ color: t.text, fontWeight: 500 }}>{value}</span>
    </div>
  )
}

// =============================================================================
// Main Export
// =============================================================================

export function NetworkTab({ t, metrics, bertStructure, simState }) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [selectedNode, setSelectedNode] = useState(null)

  // Measure container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

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

  // Get subsystem data
  const getSubsystem = (name) => bertStructure.subsystems.find(s => s.name === name)

  const isSimRunning = simState?.running || false

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '500px',
        background: t.bg,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <svg
        width={containerSize.width}
        height={containerSize.height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
          </marker>
        </defs>

        {/* Render flows first (behind nodes) */}
        {FLOWS.map(flow => (
          <FlowArrow
            key={flow.id}
            t={t}
            from={flow.from}
            to={flow.to}
            label={flow.label}
            type={flow.type}
            isActive={isSimRunning && (!selectedNode || flow.from === selectedNode || flow.to === selectedNode)}
            containerSize={containerSize}
          />
        ))}

        {/* Render nodes */}
        {['Mining', 'Validating', 'Development', 'Protocol'].map(name => {
          const sub = getSubsystem(name)
          if (!sub) return null

          return (
            <SubsystemNode
              key={name}
              t={t}
              name={name}
              archetype={sub.archetype}
              complexity={sub.complexity}
              position={NODE_POSITIONS[name]}
              isActive={isSimRunning}
              onClick={() => setSelectedNode(selectedNode === name ? null : name)}
              containerSize={containerSize}
            />
          )
        })}
      </svg>

      {/* DSA Legend */}
      <DSALegend t={t} />

      {/* Flow Stats */}
      <FlowStats t={t} metrics={metrics} selectedNode={selectedNode} />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        fontSize: '0.75rem',
        color: t.textDim,
      }}>
        Click nodes to filter flows · Run simulation for animation
      </div>
    </div>
  )
}
