import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

import { useStopwatch } from '../../hooks/useStopwatch'
import { formatClock } from '../../utils/wellness'

const PRESETS = [
  { id: '25-5', focus: 25, rest: 5 },
  { id: '50-10', focus: 50, rest: 10 }
]

function FocusTimer({ onComplete }) {
  const [presetId, setPresetId] = useState('25-5')
  const [mode, setMode] = useState('focus')
  const [sessions, setSessions] = useState(0)

  const preset = PRESETS.find((item) => item.id === presetId)
  const minutes = mode === 'focus' ? preset.focus : preset.rest
  const totalMs = minutes * 60 * 1000

  const { elapsedMs, running, start, pause, reset } = useStopwatch({ limitMs: totalMs })

  const started = elapsedMs > 0
  const done = elapsedMs >= totalMs
  const remainingSeconds = (totalMs - elapsedMs) / 1000

  // When a focus block finishes, count it and log it once.
  const reported = useRef(false)
  useEffect(() => {
    if (done && mode === 'focus' && !reported.current) {
      reported.current = true
      onComplete?.('focus', preset.focus * 60)
    }
  }, [done, mode, onComplete, preset.focus])

  const switchMode = (next) => {
    reported.current = false
    setMode(next)
    reset()
    // Start the next block straight away so one tap moves you along.
    start()
  }

  const handleNextBlock = () => {
    if (mode === 'focus') {
      setSessions((count) => count + 1)
      switchMode('rest')
    } else {
      switchMode('focus')
    }
  }

  const handleReset = () => {
    reported.current = false
    reset()
  }

  const choosePreset = (id) => {
    reported.current = false
    setPresetId(id)
    setMode('focus')
    reset()
  }

  return (
    <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-[#302747]">Focus and break timer</h3>
      <p className="text-sm text-[#827991] mt-1">
        Work in a focused block, then take a real break. Short breaks help you stay sharp for longer.
      </p>

      <div className="flex gap-2 mt-5" role="group" aria-label="Timer preset">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={presetId === item.id}
            disabled={started && !done}
            onClick={() => choosePreset(item.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
              presetId === item.id
                ? 'bg-[#9878d4] text-white'
                : 'bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc]'
            }`}
          >
            {item.focus} min focus / {item.rest} min break
          </button>
        ))}
      </div>

      <div className="mt-6 bg-[#faf8ff] rounded-2xl p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#a49bb0]">
          {mode === 'focus' ? 'Focus' : 'Break'}
        </p>
        <p className="text-5xl font-bold text-[#7955b5] mt-2" aria-label={`${formatClock(remainingSeconds)} remaining`}>
          {formatClock(remainingSeconds)}
        </p>
        <p className="text-sm text-[#5a4d73] mt-3 min-h-[1.5rem]" aria-live="polite">
          {done
            ? mode === 'focus'
              ? `Focus block complete. Time for a ${preset.rest}-minute break: stretch, drink water, look away from screens.`
              : 'Break over. Ready for another focus block?'
            : started
              ? mode === 'focus'
                ? 'Stay with one task. Put your phone out of reach.'
                : 'Step away from your desk. Move, breathe, hydrate.'
              : 'Pick one task, start the timer, and give it your full attention.'}
        </p>
        <p className="text-xs text-[#a49bb0] mt-3">
          Focus blocks finished this visit: {sessions + (done && mode === 'focus' ? 1 : 0)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        {done ? (
          <button
            type="button"
            onClick={handleNextBlock}
            className="flex items-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            <Play size={16} /> {mode === 'focus' ? 'Start break' : 'Start next focus block'}
          </button>
        ) : !running ? (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            <Play size={16} /> {started ? 'Resume' : mode === 'focus' ? 'Start focus' : 'Start break'}
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
        {started && !done && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 bg-[#f5f0fc] hover:bg-[#eee6fc] text-[#7955b5] px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            <RotateCcw size={16} /> Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default FocusTimer