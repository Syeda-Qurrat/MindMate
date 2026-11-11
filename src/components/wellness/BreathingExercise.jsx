import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

import { useStopwatch } from '../../hooks/useStopwatch'
import {
  BREATHING_PATTERNS,
  BREATHING_MINUTES,
  breathingPlan,
  getBreathingState,
  targetScale
} from '../../utils/wellness'

function BreathingExercise({ onComplete }) {
  const [patternId, setPatternId] = useState('calm')
  const [minutes, setMinutes] = useState(2)

  const pattern = BREATHING_PATTERNS.find((item) => item.id === patternId)
  const plan = breathingPlan(pattern, minutes)
  const totalMs = plan.totalSeconds * 1000

  const { elapsedMs, running, start, pause, reset } = useStopwatch({ limitMs: totalMs })

  const started = elapsedMs > 0
  const done = elapsedMs >= totalMs
  const state = getBreathingState(pattern, elapsedMs / 1000)

  // Report a finished session exactly once.
  const reported = useRef(false)
  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true
      onComplete?.('breathing', plan.totalSeconds)
    }
  }, [done, onComplete, plan.totalSeconds])

  const handleReset = () => {
    reported.current = false
    reset()
  }

  const showingPhase = started && !done
  const scale = showingPhase ? targetScale(state.phase.kind) : 0.55
  const isMoving = running && (state.phase.kind === 'in' || state.phase.kind === 'out')
  const transitionSeconds = showingPhase && running ? (isMoving ? state.phase.seconds : 0) : 0.4

  let headline = 'Ready when you are'
  if (done) headline = 'Well done'
  else if (showingPhase && !running) headline = 'Paused'
  else if (showingPhase) headline = state.phase.label

  return (
    <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-[#302747]">Guided breathing</h3>
      <p className="text-sm text-[#827991] mt-1">
        Follow the circle. Breathe in as it grows and out as it shrinks.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-6 items-center">
        {/* Animated guide */}
        <div className="flex flex-col items-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full bg-[#eee6fc] motion-reduce:transition-none"
              style={{
                transform: `scale(${scale})`,
                transition: `transform ${transitionSeconds}s ease-in-out`
              }}
              aria-hidden="true"
            />
            <div className="relative text-center px-4">
              <p className="text-lg font-semibold text-[#49366c]">{headline}</p>
              {showingPhase && running && (
                <p className="text-4xl font-bold text-[#7955b5] mt-1">{state.secondsLeft}</p>
              )}
              {showingPhase && (
                <p className="text-xs text-[#827991] mt-2">
                  Round {Math.min(state.round, plan.rounds)} of {plan.rounds}
                </p>
              )}
              {done && (
                <p className="text-sm text-[#827991] mt-1">
                  {plan.rounds} rounds complete
                </p>
              )}
            </div>
          </div>

          {/* Announces each phase change to screen readers only */}
          <p className="sr-only" aria-live="polite">
            {showingPhase && running ? state.phase.label : done ? 'Session complete' : ''}
          </p>

          <div className="flex gap-3 mt-6">
            {!running ? (
              <button
                type="button"
                onClick={start}
                disabled={done}
                className="flex items-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
              >
                <Play size={16} /> {started ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                className="flex items-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
              >
                <Pause size={16} /> Pause
              </button>
            )}
            {(started || done) && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 bg-[#f5f0fc] hover:bg-[#eee6fc] text-[#7955b5] px-5 py-3 rounded-xl text-sm font-semibold transition"
              >
                <RotateCcw size={16} /> {done ? 'Go again' : 'Stop'}
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          <fieldset disabled={started && !done}>
            <legend className="text-sm font-medium text-[#302747] mb-3">Pattern</legend>
            <div className="space-y-2">
              {BREATHING_PATTERNS.map((item) => (
                <label
                  key={item.id}
                  className={`block p-4 rounded-xl border cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#9878d4] ${
                    patternId === item.id
                      ? 'border-[#9878d4] bg-[#eee6fc]'
                      : 'border-[#eee8f5] bg-[#faf8ff] hover:border-[#c9b5eb]'
                  }`}
                >
                  <input
                    type="radio"
                    name="breathing-pattern"
                    value={item.id}
                    checked={patternId === item.id}
                    onChange={() => {
                      reported.current = false
                      setPatternId(item.id)
                      reset()
                    }}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-[#302747]">{item.name}</span>
                  <span className="block text-xs text-[#827991] mt-1 leading-5">{item.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={started && !done}>
            <legend className="text-sm font-medium text-[#302747] mb-3">Length</legend>
            <div className="flex flex-wrap gap-2">
              {BREATHING_MINUTES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={minutes === value}
                  onClick={() => {
                    reported.current = false
                    setMinutes(value)
                    reset()
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
                    minutes === value
                      ? 'bg-[#9878d4] text-white'
                      : 'bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc]'
                  }`}
                >
                  {value} min
                </button>
              ))}
            </div>
            <p className="text-xs text-[#a49bb0] mt-2">
              About {plan.rounds} rounds. Breathe gently, and stop if you feel dizzy.
            </p>
          </fieldset>
        </div>
      </div>
    </div>
  )
}

export default BreathingExercise