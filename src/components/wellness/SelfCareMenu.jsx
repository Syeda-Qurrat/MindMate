import { useState } from 'react'
import { Check, Shuffle } from 'lucide-react'

import { SELF_CARE_MENU } from '../../data/wellnessContent'

function SelfCareMenu({ onComplete }) {
  const [bucketId, setBucketId] = useState('short')
  const [picked, setPicked] = useState('')
  const [done, setDone] = useState([])

  const bucket = SELF_CARE_MENU.find((item) => item.id === bucketId)

  const pickForMe = () => {
    const ideas = bucket.ideas
    setPicked(ideas[Math.floor(Math.random() * ideas.length)])
  }

  const markDone = (idea) => {
    if (done.includes(idea)) return
    setDone((current) => [...current, idea])
    onComplete?.('selfcare', 0)
  }

  return (
    <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-[#302747]">Self-care menu</h3>
      <p className="text-sm text-[#827991] mt-1">
        Choose how much time you have, then pick something kind to do for yourself.
      </p>

      <div className="flex flex-wrap gap-2 mt-5" role="group" aria-label="Time available">
        {SELF_CARE_MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={bucketId === item.id}
            onClick={() => {
              setBucketId(item.id)
              setPicked('')
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              bucketId === item.id
                ? 'bg-[#9878d4] text-white'
                : 'bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc]'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={pickForMe}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[#d9cdf0] text-[#7955b5] hover:bg-[#f5f0fc] transition"
        >
          <Shuffle size={14} /> Pick one for me
        </button>
      </div>

      {picked && (
        <p role="status" className="mt-5 bg-[#eee6fc] text-[#49366c] rounded-xl p-4 text-sm font-semibold">
          Try this: {picked}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {bucket.ideas.map((idea) => {
          const isDone = done.includes(idea)
          return (
            <li
              key={idea}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                idea === picked ? 'border-[#9878d4] bg-[#faf8ff]' : 'border-[#eee8f5]'
              }`}
            >
              <span className={`text-sm ${isDone ? 'text-[#a49bb0] line-through' : 'text-[#302747]'}`}>{idea}</span>
              <button
                type="button"
                onClick={() => markDone(idea)}
                disabled={isDone}
                className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isDone
                    ? 'bg-[#e6f4ed] text-[#3f8466]'
                    : 'bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc]'
                }`}
              >
                <Check size={14} /> {isDone ? 'Done' : 'I did this'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SelfCareMenu