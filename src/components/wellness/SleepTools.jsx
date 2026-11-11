import { useState } from 'react'
import { Moon } from 'lucide-react'

import { SLEEP_CHECKLIST } from '../../data/wellnessContent'
import { bedtimeOptions } from '../../utils/wellness'

function SleepTools() {
  const [checked, setChecked] = useState([])
  const [wakeTime, setWakeTime] = useState('07:00')

  const toggle = (item) =>
    setChecked((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]
    )

  const options = bedtimeOptions(wakeTime)
  const progress = Math.round((checked.length / SLEEP_CHECKLIST.length) * 100)

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Bedtime calculator */}
      <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#eee6fc] flex items-center justify-center">
            <Moon size={20} className="text-[#9878d4]" />
          </div>
          <h3 className="text-lg font-bold text-[#302747]">Bedtime planner</h3>
        </div>
        <p className="text-sm text-[#827991] mt-3">
          Sleep comes in cycles of about 90 minutes. Pick when you need to wake up and we will suggest bedtimes that let you finish a cycle.
        </p>

        <label htmlFor="wake-time" className="block text-sm font-medium text-[#302747] mt-5 mb-2">
          I need to wake up at
        </label>
        <input
          id="wake-time"
          type="time"
          value={wakeTime}
          onChange={(event) => setWakeTime(event.target.value)}
          className="px-4 py-3 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm text-[#302747]"
        />

        {options.length > 0 ? (
          <ul className="mt-5 space-y-3" aria-live="polite">
            {options.map((option) => (
              <li
                key={option.cycles}
                className="flex items-center justify-between bg-[#faf8ff] rounded-xl px-4 py-3"
              >
                <span className="font-semibold text-[#49366c]">Fall asleep by {option.time}</span>
                <span className="text-xs text-[#827991]">{option.sleepHours} hours of sleep</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-[#a49bb0]">Choose a wake-up time to see suggestions.</p>
        )}
        <p className="text-xs text-[#a49bb0] mt-4">
          Times include about 15 minutes to drift off. Most adults feel best with 7 to 9 hours.
        </p>
      </div>

      {/* Wind-down checklist */}
      <div className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-[#302747]">Wind-down checklist</h3>
        <p className="text-sm text-[#827991] mt-1">Tick what you have done tonight.</p>

        <div
          className="h-2 rounded-full bg-[#eee6fc] mt-4 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Wind-down progress"
        >
          <div className="h-full bg-[#9878d4] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <ul className="mt-5 space-y-2">
          {SLEEP_CHECKLIST.map((item) => (
            <li key={item}>
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#faf8ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={() => toggle(item)}
                  className="mt-0.5 w-5 h-5 accent-[#9878d4]"
                />
                <span className={`text-sm ${checked.includes(item) ? 'text-[#a49bb0] line-through' : 'text-[#302747]'}`}>
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {checked.length === SLEEP_CHECKLIST.length && (
          <p role="status" className="mt-4 text-sm bg-[#e6f4ed] text-[#3f8466] rounded-xl p-4">
            All set. Sleep well tonight. 🌙
          </p>
        )}
      </div>
    </div>
  )
}

export default SleepTools