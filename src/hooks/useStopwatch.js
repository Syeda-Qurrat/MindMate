import { useCallback, useEffect, useRef, useState } from 'react'

// A pausable stopwatch that measures real elapsed time (not tick counts), so
// it stays accurate even when the browser throttles timers in a background
// tab. When `limitMs` is reached it stops itself.
export function useStopwatch({ limitMs = Infinity, tickMs = 200 } = {}) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(false)

  const elapsedRef = useRef(0)
  const limitRef = useRef(limitMs)

  useEffect(() => {
    limitRef.current = limitMs
  }, [limitMs])

  useEffect(() => {
    if (!running) return undefined

    let last = Date.now()

    const id = setInterval(() => {
      const now = Date.now()
      elapsedRef.current = Math.min(
        limitRef.current,
        elapsedRef.current + (now - last)
      )
      last = now

      setElapsedMs(elapsedRef.current)

      if (elapsedRef.current >= limitRef.current) {
        setRunning(false)
      }
    }, tickMs)

    return () => clearInterval(id)
  }, [running, tickMs])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    elapsedRef.current = 0
    setElapsedMs(0)
  }, [])

  return { elapsedMs, running, start, pause, reset }
}