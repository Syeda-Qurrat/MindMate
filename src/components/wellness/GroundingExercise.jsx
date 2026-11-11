import { useRef, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'

import { GROUNDING_STEPS } from '../../data/wellnessContent'

// Tapping the next empty circle marks it; tapping the last marked circle
// undoes it. Other taps do nothing, so the count can never jump.
const toggleNoticed = (noticed, index) => {
  if (index === noticed) return noticed + 1
  if (index === noticed - 1) return noticed - 1
  return noticed
}

function GroundingExercise({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [noticed, setNoticed] = useState(0)
  const [finished, setFinished] = useState(false)
  const startedAt = useRef(Date.now())

  const step = GROUNDING_STEPS[stepIndex]
  const stepDone = noticed >= step.count
  const isLast = stepIndex === GROUNDING_STEPS.length - 1

  const handleNext = () => {
    if (!stepDone) return

    if (isLast) {
      setFinished(true)
      onComplete?.('grounding', Math.round((Date.now() - startedAt.current) / 1000))
    } else {
      setStepIndex((index) => index + 1)
      setNoticed(0)
    }
  }

  const handleRestart = () => {
    startedAt.current = Date.now()
    setStepIndex(0)
    setNoticed(0)
    setFinished(false)
  }

  return (
    <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-[#302747]">5-4-3-2-1 grounding</h3>
      <p className="text-sm text-[#827991] mt-1">
        A quick way to come back to the present when your thoughts are racing or you feel anxious.
      </p>

      {finished ? (
        <div className="mt-6 text-center py-6" role="status">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#e6f4ed] flex items-center justify-center">
            <Check size={26} className="text-[#64a98a]" />
          </div>
          <p className="font-semibold text-[#302747] mt-4">You are here, and you are okay.</p>
          <p className="text-sm text-[#827991] mt-1">Take one slow breath before you carry on with your day.</p>
          <button
            type="button"
            onClick={handleRestart}
            className="mt-5 inline-flex items-center gap-2 bg-[#f5f0fc] hover:bg-[#eee6fc] text-[#7955b5] px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            <RotateCcw size={16} /> Do it again
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-xs font-semibold text-[#a49bb0] uppercase tracking-wide">
            Step {stepIndex + 1} of {GROUNDING_STEPS.length}
          </p>
          <p className="text-xl font-bold text-[#302747] mt-2" aria-live="polite">{step.prompt}</p>
          <p className="text-sm text-[#827991] mt-1">{step.hint}</p>

          <div className="flex flex-wrap gap-3 mt-5" role="group" aria-label={`Tap each time you notice something. ${noticed} of ${step.count} noticed.`}>
            {Array.from({ length: step.count }, (_, i) => {
              const marked = i < noticed
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={marked}
                  aria-label={`Noticed ${i + 1}`}
                  onClick={() => setNoticed(toggleNoticed(noticed, i))}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4] ${
                    marked
                      ? 'bg-[#9878d4] border-[#9878d4] text-white'
                      : 'bg-[#faf8ff] border-[#d9cdf0] text-[#9878d4] hover:border-[#9878d4]'
                  }`}
                >
                  {marked ? <Check size={20} /> : i + 1}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-[#a49bb0] mt-2">Tap a circle each time you notice one.</p>

          <button
            type="button"
            onClick={handleNext}
            disabled={!stepDone}
            className="mt-6 bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}

export default GroundingExercise