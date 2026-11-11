import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

import { useStopwatch } from '../../hooks/useStopwatch'
import { MINDFUL_PROMPTS } from '../../data/wellnessContent'
import { formatClock } from '../../utils/wellness'

const DURATIONS = [1, 3, 5]
const PROMPT_EVERY_SECONDS = 20

function MindfulMinute({ onComplete }) {
  const [minutes, setMinutes] = useState(1)
  const totalSeconds = minutes * 60

  const { elapsedMs, running, start, pause, reset } = useStopwatch({
    limitMs: totalSeconds * 1000
  })

  const elapsedSeconds = elapsedMs / 1000
  const started = elapsedMs > 0
  const done = elapsedMs >= totalSeconds * 1000

  const promptIndex = Math.floor(elapsedSeconds / PROMPT_EVERY_SECONDS) % MINDFUL_PROMPTS.length

  const reported = useRef(false)
  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true
      onComplete?.('mindful', totalSeconds)
    }
  }, [done, onComplete, totalSeconds])

  const handleReset = () => {
    reported.current = false
    reset()
  }

  let message = 'Press start, get comfortable, and follow the prompts. You can keep your eyes open or closed.'
  if (done) message = 'Gently bring your attention back to the room. Well done for taking this time.'
  else if (started) message = MINDFUL_PROMPTS[promptIndex]

  return (
    <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-[#302747]">Mindful minute</h3>
      <p className="text-sm text-[#827991] mt-1">
        A short guided pause to notice your breath and your body.
      </p>

      <div className="flex gap-2 mt-5" role="group" aria-label="Length">
        {DURATIONS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={minutes === value}
            disabled={started && !done}
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

      <div className="mt-6 bg-[#faf8ff] rounded-2xl p-6 text-center">
        <p className="text-4xl font-bold text-[#7955b5]">
          {formatClock(totalSeconds - elapsedSeconds)}
        </p>
        <p className="text-sm text-[#5a4d73] mt-3 leading-6 min-h-[3rem]" aria-live="polite">
          {message}
        </p>
        <div
          className="h-2 rounded-full bg-[#eee6fc] mt-4 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((elapsedMs / (totalSeconds * 1000)) * 100)}
          aria-label="Session progress"
        >
          <div
            className="h-full bg-[#9878d4] transition-all"
            style={{ width: `${Math.min(100, (elapsedMs / (totalSeconds * 1000)) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
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
  )
}

export default MindfulMinute