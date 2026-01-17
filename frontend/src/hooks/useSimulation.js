/**
 * useSimulation - WebSocket hook for real-time simulation state
 *
 * Block 5: Replaces REST polling with Socket.IO connection
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

export function useSimulation() {
  const [connected, setConnected] = useState(false)
  const [simState, setSimState] = useState({
    step: 0,
    running: false,
  })
  const [metrics, setMetrics] = useState({
    block_height: 0,
    hashrate: 100.0,
    difficulty: 1.0,
    mempool_size: 0,
    avg_fee: 1.0,
    blocks_mined: 0,
    transactions_processed: 0,
    bips_proposed: 0,
  })
  const [error, setError] = useState(null)

  const socketRef = useRef(null)
  const runningRef = useRef(false)
  const intervalRef = useRef(null)

  // Update state from server response
  const updateFromState = useCallback((state) => {
    if (!state) return

    setSimState(prev => ({
      ...prev,
      step: state.step ?? prev.step,
    }))

    if (state.metrics) {
      setMetrics(prev => ({
        ...prev,
        ...state.metrics,
        ...(state.activity || {}),
      }))
    }
  }, [])

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err.message)
      setError('Connection failed - is backend running?')
      setConnected(false)
    })

    socket.on('state_update', (state) => {
      updateFromState(state)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [updateFromState])

  // Step simulation (single step)
  const step = useCallback(async () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('step', { count: 1 })
    } else {
      // Fallback to REST
      try {
        const res = await fetch('/api/step', { method: 'POST' })
        const data = await res.json()
        if (data.status === 'ok') {
          updateFromState(data.state)
        }
      } catch (err) {
        setError(err.message)
      }
    }
  }, [updateFromState])

  // Reset simulation
  const reset = useCallback(async (params = {}) => {
    // Stop if running
    if (runningRef.current) {
      runningRef.current = false
      setSimState(prev => ({ ...prev, running: false }))
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('reset', params)
    } else {
      // Fallback to REST
      try {
        const res = await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })
        const data = await res.json()
        if (data.status === 'ok') {
          updateFromState(data.state)
        }
      } catch (err) {
        setError(err.message)
      }
    }
  }, [updateFromState])

  // Run simulation (continuous stepping)
  const run = useCallback(() => {
    if (runningRef.current) return

    runningRef.current = true
    setSimState(prev => ({ ...prev, running: true }))

    // Step every 150ms for smooth updates
    intervalRef.current = setInterval(() => {
      if (runningRef.current) {
        step()
      }
    }, 150)
  }, [step])

  // Stop simulation
  const stop = useCallback(() => {
    runningRef.current = false
    setSimState(prev => ({ ...prev, running: false }))

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timeout)
    }
  }, [error])

  return {
    connected,
    simState,
    metrics,
    error,
    step,
    reset,
    run,
    stop,
    clearError: () => setError(null),
  }
}
