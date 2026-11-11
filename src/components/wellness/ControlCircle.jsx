import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, RotateCcw } from 'lucide-react'

const WHEN_OPTIONS = ['Today', 'Tomorrow', 'This week']

const textareaClass =
  'w-full p-4 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm text-[#302747] resize-none'

// A "what can I control?" worksheet. Nothing typed here is saved.
function ControlCircle({ onComplete }) {
  const [phase, setPhase] = useState('concern') // concern -> control -> detail -> done
  const [concern, setConcern] = useState('')
  const [control, setControl] = useState('')
  const [action, setAction] = useState('')
  const [when, setWhen] = useState(WHEN_OPTIONS[0])
  const [influence, setInfluence] = useState('')
  const [outside, setOutside] = useState('')
  const startedAt = useRef(Date.now())

  const restart = () => {
    startedAt.current = Date.now()
    setPhase('concern')
    setConcern('')
    setControl('')
    setAction('')
    setWhen(WHEN_OPTIONS[0])
    setInfluence('')
    setOutside('')
  }

  const finish = () => {
    setPhase('done')
    onComplete?.('stress', Math.round((Date.now() - startedAt.current) / 1000))
  }

  const detailReady =
    (control === 'yes' && action.trim().length > 0) ||
    (control === 'partly' && influence.trim().length > 0) ||
    control === 'no'

  return (
    <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-[#302747]">What can I control?</h3>
      <p className="text-sm text-[#827991] mt-1">
        Sort a worry into what you can act on and what you cannot. What you type stays on this page and is not saved.
      </p>

      {phase === 'concern' && (
        <div className="mt-6">
          <label htmlFor="concern" className="block text-sm font-medium text-[#302747] mb-2">
            What is stressing you right now?
          </label>
          <textarea
            id="concern"
            rows={3}
            maxLength={300}
            value={concern}
            onChange={(event) => setConcern(event.target.value)}
            placeholder="e.g. I have two assignments due on Friday and I have not started."
            className={textareaClass}
          />
          <button
            type="button"
            onClick={() => setPhase('control')}
            disabled={!concern.trim()}
            className="mt-4 bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            Next
          </button>
        </div>
      )}

      {phase === 'control' && (
        <div className="mt-6">
          <p className="text-sm text-[#827991] bg-[#faf8ff] rounded-xl p-4 break-words">"{concern.trim()}"</p>
          <p id="control-question" className="text-sm font-medium text-[#302747] mt-5 mb-3">
            Is there something you can do about it?
          </p>
          <div role="radiogroup" aria-labelledby="control-question" className="grid sm:grid-cols-3 gap-3">
            {[
              { key: 'yes', label: 'Yes, I can act on it' },
              { key: 'partly', label: 'Partly' },
              { key: 'no', label: "No, it's out of my hands" }
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={control === option.key}
                onClick={() => {
                  setControl(option.key)
                  setPhase('detail')
                }}
                className="p-4 rounded-xl border border-[#eee8f5] bg-[#faf8ff] hover:border-[#9878d4] text-sm font-medium text-[#302747] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'detail' && (
        <div className="mt-6">
          {control === 'yes' && (
            <>
              <label htmlFor="action" className="block text-sm font-medium text-[#302747] mb-2">
                What is the smallest step you could take, in 10 minutes or less?
              </label>
              <input
                id="action"
                type="text"
                maxLength={150}
                value={action}
                onChange={(event) => setAction(event.target.value)}
                placeholder="e.g. Open the assignment and write the outline"
                className="w-full px-4 py-3 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm text-[#302747]"
              />
              <label htmlFor="when" className="block text-sm font-medium text-[#302747] mt-4 mb-2">
                When will you do it?
              </label>
              <select
                id="when"
                value={when}
                onChange={(event) => setWhen(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] text-sm text-[#302747]"
              >
                {WHEN_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </>
          )}

          {control === 'partly' && (
            <>
              <label htmlFor="influence" className="block text-sm font-medium text-[#302747] mb-2">
                Which part can you influence?
              </label>
              <textarea
                id="influence"
                rows={2}
                maxLength={200}
                value={influence}
                onChange={(event) => setInfluence(event.target.value)}
                className={textareaClass}
              />
              <label htmlFor="outside" className="block text-sm font-medium text-[#302747] mt-4 mb-2">
                Which part is outside your control? (optional)
              </label>
              <textarea
                id="outside"
                rows={2}
                maxLength={200}
                value={outside}
                onChange={(event) => setOutside(event.target.value)}
                className={textareaClass}
              />
            </>
          )}

          {control === 'no' && (
            <div className="bg-[#faf8ff] rounded-xl p-5 text-sm text-[#5a4d73] leading-6">
              <p className="font-semibold text-[#302747]">
                You cannot change this, but you can change how you carry it.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Name the feeling: "I feel worried because..."</li>
                <li>Do something that uses your hands or body for 10 minutes.</li>
                <li>Tell someone you trust what is on your mind.</li>
              </ul>
              <div className="flex flex-wrap gap-4 mt-4 font-semibold">
                <Link to="/wellness?category=breathing" className="text-[#7955b5] hover:underline">
                  Try a breathing exercise
                </Link>
                <Link to="/chatbot" className="text-[#7955b5] hover:underline">
                  Talk to the AI companion
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={finish}
              disabled={!detailReady}
              className="bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
            >
              {control === 'yes' ? 'Make my plan' : 'Done'}
            </button>
            <button
              type="button"
              onClick={() => setPhase('control')}
              className="bg-[#f5f0fc] hover:bg-[#eee6fc] text-[#7955b5] px-5 py-3 rounded-xl text-sm font-semibold transition"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="mt-6" role="status">
          <div className="w-12 h-12 rounded-full bg-[#e6f4ed] flex items-center justify-center">
            <Check size={24} className="text-[#64a98a]" />
          </div>

          {control === 'yes' && (
            <div className="mt-4 bg-[#eee6fc] rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7955b5]">Your plan</p>
              <p className="text-[#302747] font-semibold mt-2 break-words">{action.trim()}</p>
              <p className="text-sm text-[#5a4d73] mt-1">{when}</p>
            </div>
          )}

          {control === 'partly' && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="bg-[#e6f4ed] rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3f8466]">I can influence</p>
                <p className="text-sm text-[#302747] mt-2 break-words">{influence.trim()}</p>
              </div>
              <div className="bg-[#f0ecf6] rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6f6285]">Letting go of</p>
                <p className="text-sm text-[#302747] mt-2 break-words">{outside.trim() || 'Nothing added'}</p>
              </div>
            </div>
          )}

          <p className="text-sm text-[#827991] mt-4">
            {control === 'no'
              ? 'Be gentle with yourself. Acceptance is a skill that takes practice.'
              : 'Put your energy into the first part, and let the rest be for now.'}
          </p>

          <button
            type="button"
            onClick={restart}
            className="mt-4 inline-flex items-center gap-2 bg-[#f5f0fc] hover:bg-[#eee6fc] text-[#7955b5] px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            <RotateCcw size={16} /> Start over
          </button>
        </div>
      )}
    </div>
  )
}

export default ControlCircle