/**
 * AnalysisTab - Time-series charts and correlations
 *
 * Block 8: Real-time charts showing simulation dynamics
 *
 * Charts:
 * - Mempool size over time
 * - Fee rate trends
 * - Block production (cumulative)
 * - Hashrate & Difficulty correlation
 */

import { useState, useEffect, useRef } from 'react'

// =============================================================================
// Constants
// =============================================================================

const MAX_HISTORY = 100 // Keep last 100 data points
const CHART_HEIGHT = 120
const CHART_COLORS = {
  mempool: '#f7931a',    // Bitcoin orange
  fee: '#e74c3c',        // Red
  blocks: '#50c878',     // Green
  hashrate: '#4a90d9',   // Blue
  difficulty: '#9b59b6', // Purple
}

// =============================================================================
// Mini Line Chart Component
// =============================================================================

function MiniChart({ t, data, color, label, unit, height = CHART_HEIGHT }) {
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height })

  useEffect(() => {
    if (svgRef.current) {
      setDimensions({
        width: svgRef.current.parentElement.offsetWidth,
        height,
      })
    }
  }, [height])

  if (!data || data.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: t.textDim,
        fontSize: '0.75rem',
      }}>
        No data yet — run simulation
      </div>
    )
  }

  const { width } = dimensions
  const padding = { top: 10, right: 10, bottom: 20, left: 45 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const minVal = Math.min(...data)
  const maxVal = Math.max(...data)
  const range = maxVal - minVal || 1

  // Generate path
  const points = data.map((val, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight
    return `${x},${y}`
  })

  const linePath = `M ${points.join(' L ')}`

  // Area path (for gradient fill)
  const areaPath = `${linePath} L ${padding.left + chartWidth},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`

  // Current value
  const currentVal = data[data.length - 1]

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = padding.top + pct * chartHeight
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={t.border}
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 5}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill={t.textDim}
              >
                {(maxVal - pct * range).toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#gradient-${label})`}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current value dot */}
        <circle
          cx={padding.left + chartWidth}
          cy={padding.top + chartHeight - ((currentVal - minVal) / range) * chartHeight}
          r={4}
          fill={color}
        />

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          fontSize="9"
          fill={t.textDim}
        >
          Last {data.length} steps
        </text>
      </svg>

      {/* Current value overlay */}
      <div style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        background: t.bgSecondary,
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color,
      }}>
        {currentVal.toFixed(1)} {unit}
      </div>
    </div>
  )
}

// =============================================================================
// Chart Card Component
// =============================================================================

function ChartCard({ t, title, children }) {
  return (
    <div style={{
      background: t.bgSecondary,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      padding: '1rem',
    }}>
      <div style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: t.text,
        marginBottom: '0.75rem',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// =============================================================================
// Correlation Chart (Scatter-ish)
// =============================================================================

function CorrelationChart({ t, data1, data2, label1, label2, color1, color2 }) {
  const height = 150

  if (!data1 || !data2 || data1.length < 2) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: t.textDim,
        fontSize: '0.75rem',
      }}>
        Need more data for correlation
      </div>
    )
  }

  // Normalize both series to 0-1 range
  const normalize = (arr) => {
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    const range = max - min || 1
    return arr.map(v => (v - min) / range)
  }

  const norm1 = normalize(data1)
  const norm2 = normalize(data2)

  const padding = { top: 10, right: 10, bottom: 25, left: 10 }
  const chartHeight = height - padding.top - padding.bottom

  return (
    <svg width="100%" height={height}>
      {/* Series 1 */}
      <path
        d={`M ${norm1.map((v, i) => `${padding.left + (i / (norm1.length - 1)) * 280},${padding.top + chartHeight - v * chartHeight}`).join(' L ')}`}
        fill="none"
        stroke={color1}
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Series 2 */}
      <path
        d={`M ${norm2.map((v, i) => `${padding.left + (i / (norm2.length - 1)) * 280},${padding.top + chartHeight - v * chartHeight}`).join(' L ')}`}
        fill="none"
        stroke={color2}
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Legend */}
      <g transform={`translate(${padding.left}, ${height - 10})`}>
        <circle cx={0} cy={0} r={4} fill={color1} />
        <text x={8} y={4} fontSize="9" fill={t.textMuted}>{label1}</text>
        <circle cx={80} cy={0} r={4} fill={color2} />
        <text x={88} y={4} fontSize="9" fill={t.textMuted}>{label2}</text>
      </g>
    </svg>
  )
}

// =============================================================================
// Stats Summary
// =============================================================================

function StatsSummary({ t, history }) {
  if (!history || history.length === 0) {
    return null
  }

  const latest = history[history.length - 1]
  const first = history[0]

  // Calculate trends
  const mempoolTrend = latest.mempool - first.mempool
  const feeTrend = latest.fee - first.fee
  const hashrateTrend = ((latest.hashrate - first.hashrate) / first.hashrate * 100)

  const TrendIndicator = ({ value, unit = '' }) => {
    const isPositive = value > 0
    const color = isPositive ? '#50c878' : '#e74c3c'
    return (
      <span style={{ color, fontSize: '0.75rem' }}>
        {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(1)}{unit}
      </span>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '1rem',
    }}>
      <StatBox t={t} label="Mempool Trend" value={<TrendIndicator value={mempoolTrend} unit=" txs" />} />
      <StatBox t={t} label="Fee Trend" value={<TrendIndicator value={feeTrend} unit=" sat/vB" />} />
      <StatBox t={t} label="Hashrate Change" value={<TrendIndicator value={hashrateTrend} unit="%" />} />
      <StatBox t={t} label="Data Points" value={<span style={{ color: t.text }}>{history.length}</span>} />
    </div>
  )
}

function StatBox({ t, label, value }) {
  return (
    <div style={{
      background: t.bgTertiary,
      padding: '0.75rem',
      borderRadius: '6px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.6875rem', color: t.textDim, marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 600 }}>
        {value}
      </div>
    </div>
  )
}

// =============================================================================
// Main Export
// =============================================================================

export function AnalysisTab({ t, metrics, simState }) {
  const [history, setHistory] = useState([])

  // Track metrics history
  useEffect(() => {
    if (simState.step > 0) {
      setHistory(prev => {
        const newEntry = {
          step: simState.step,
          mempool: metrics.mempool_size,
          fee: metrics.avg_fee,
          blocks: metrics.blocks_mined,
          hashrate: metrics.hashrate,
          difficulty: metrics.difficulty,
        }

        const updated = [...prev, newEntry]
        // Keep only last MAX_HISTORY entries
        if (updated.length > MAX_HISTORY) {
          return updated.slice(-MAX_HISTORY)
        }
        return updated
      })
    }
  }, [simState.step, metrics])

  // Reset history when simulation resets
  useEffect(() => {
    if (simState.step === 0) {
      setHistory([])
    }
  }, [simState.step])

  // Extract arrays for charts
  const mempoolData = history.map(h => h.mempool)
  const feeData = history.map(h => h.fee)
  const blocksData = history.map(h => h.blocks)
  const hashrateData = history.map(h => h.hashrate)
  const difficultyData = history.map(h => h.difficulty)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%',
    }}>
      {/* Stats Summary */}
      <StatsSummary t={t} history={history} />

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        flex: 1,
      }}>
        <ChartCard t={t} title="Mempool Size">
          <MiniChart
            t={t}
            data={mempoolData}
            color={CHART_COLORS.mempool}
            label="mempool"
            unit="txs"
          />
        </ChartCard>

        <ChartCard t={t} title="Average Fee Rate">
          <MiniChart
            t={t}
            data={feeData}
            color={CHART_COLORS.fee}
            label="fee"
            unit="sat/vB"
          />
        </ChartCard>

        <ChartCard t={t} title="Blocks Mined (Cumulative)">
          <MiniChart
            t={t}
            data={blocksData}
            color={CHART_COLORS.blocks}
            label="blocks"
            unit="blocks"
          />
        </ChartCard>

        <ChartCard t={t} title="Hashrate">
          <MiniChart
            t={t}
            data={hashrateData}
            color={CHART_COLORS.hashrate}
            label="hashrate"
            unit="EH/s"
          />
        </ChartCard>
      </div>

      {/* Correlation Chart */}
      <ChartCard t={t} title="Hashrate vs Difficulty Correlation">
        <CorrelationChart
          t={t}
          data1={hashrateData}
          data2={difficultyData}
          label1="Hashrate"
          label2="Difficulty"
          color1={CHART_COLORS.hashrate}
          color2={CHART_COLORS.difficulty}
        />
      </ChartCard>

      {/* Instructions */}
      <div style={{
        fontSize: '0.75rem',
        color: t.textDim,
        textAlign: 'center',
        padding: '0.5rem',
      }}>
        Run simulation to collect data · Charts show last {MAX_HISTORY} steps · Reset clears history
      </div>
    </div>
  )
}
