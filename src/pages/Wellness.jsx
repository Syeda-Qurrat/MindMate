import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Wind, Brain, Flower2, Moon, BookOpen, Leaf, Activity, Clock } from 'lucide-react'

import DashboardLayout from '../components/layout/DashboardLayout'
import BreathingExercise from '../components/wellness/BreathingExercise'
import GroundingExercise from '../components/wellness/GroundingExercise'
import MindfulMinute from '../components/wellness/MindfulMinute'
import ControlCircle from '../components/wellness/ControlCircle'
import SleepTools from '../components/wellness/SleepTools'
import FocusTimer from '../components/wellness/FocusTimer'
import SelfCareMenu from '../components/wellness/SelfCareMenu'
import TipList from '../components/wellness/TipList'
import HelpCard from '../components/wellness/HelpCard'
import { useAuth } from '../context/AuthContext'
import { logActivity, subscribeToActivities } from '../services/activityService'
import { CATEGORIES } from '../data/wellnessContent'
import { ACTIVITY_LABELS, summarizeActivities } from '../utils/wellness'
import { timeAgo } from '../utils/time'

const ICONS = {
  breathing: Wind,
  stress: Brain,
  mindfulness: Flower2,
  sleep: Moon,
  study: BookOpen,
  selfcare: Leaf
}

const DEFAULT_CATEGORY = 'breathing'

function Wellness() {
  const { currentUser } = useAuth()
  const userId = currentUser?.uid

  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('category')
  const categoryId = CATEGORIES.some((item) => item.id === requested)
    ? requested
    : DEFAULT_CATEGORY
  const category = CATEGORIES.find((item) => item.id === categoryId)

  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [notice, setNotice] = useState(null)

  // Real-time history of completed sessions.
  useEffect(() => {
    if (!userId) return undefined

    return subscribeToActivities(
      userId,
      (list) => {
        setActivities(list)
        setLoadError(false)
        setLoading(false)
      },
      (error) => {
        console.error('Wellness history error:', error)
        setLoadError(true)
        setLoading(false)
      }
    )
  }, [userId])

  const summary = useMemo(() => summarizeActivities(activities), [activities])

  // Called by each tool when a session is completed.
  const handleComplete = useCallback(
    async (type, durationSeconds) => {
      if (!userId) return

      try {
        await logActivity(userId, { type, durationSeconds })
        setNotice({ type: 'success', text: 'Nice work! Your session was saved to your activity.' })
      } catch (error) {
        console.error('Wellness log error:', error)
        setNotice({
          type: 'warning',
          text: "Nice work! We couldn't save this session to your history, but it still counted for you."
        })
      }
    },
    [userId]
  )

  const selectCategory = (id) => {
    setNotice(null)
    setSearchParams({ category: id }, { replace: true })
  }

  // Arrow keys move between tabs.
  const handleTabKeyDown = (event, index) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()

    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = CATEGORIES[(index + step + CATEGORIES.length) % CATEGORIES.length]

    selectCategory(next.id)
    document.getElementById(`tab-${next.id}`)?.focus()
  }

  const favorite = summary.favorite ? ACTIVITY_LABELS[summary.favorite] : null
  const recent = activities.slice(0, 4)

  return (
    <DashboardLayout>
      <section className="mb-8">
        <p className="text-sm text-[#9878d4] font-medium">WELLNESS</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#302747] mt-2">
          Tools to feel a little better
        </h1>
        <p className="text-sm text-[#827991] mt-2 max-w-2xl">
          Short, practical activities for stress, focus, sleep and self-care. Try one now, and your completed sessions are saved so you can see your progress.
        </p>
      </section>

      {/* Activity summary */}
      <section className="bg-white border border-[#eee8f5] rounded-2xl p-6 mb-8" aria-labelledby="activity-heading">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#e6f4ed] flex items-center justify-center">
            <Activity size={20} className="text-[#64a98a]" />
          </div>
          <h2 id="activity-heading" className="text-lg font-bold text-[#302747]">Your wellness activity</h2>
        </div>

        {loading && (
          <div className="h-20 rounded-xl bg-[#f0eaf8] animate-pulse" aria-busy="true" />
        )}

        {!loading && loadError && (
          <p role="alert" className="text-sm bg-[#fff2df] text-[#a8742a] rounded-xl p-4">
            We could not load your activity history. The tools below still work.
          </p>
        )}

        {!loading && !loadError && activities.length === 0 && (
          <p className="text-sm text-[#827991]">
            No sessions yet. Try a breathing exercise or a mindful minute below. Finished sessions will show up here.
          </p>
        )}

        {!loading && !loadError && activities.length > 0 && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 grid grid-cols-3 gap-4">
              <div className="bg-[#faf8ff] rounded-xl p-4">
                <p className="text-2xl font-bold text-[#302747]">{summary.sessionsThisWeek}</p>
                <p className="text-xs text-[#827991] mt-1">Sessions this week</p>
              </div>
              <div className="bg-[#faf8ff] rounded-xl p-4">
                <p className="text-2xl font-bold text-[#302747]">{summary.minutesThisWeek}</p>
                <p className="text-xs text-[#827991] mt-1">Minutes this week</p>
              </div>
              <div className="bg-[#faf8ff] rounded-xl p-4">
                <p className="text-sm font-bold text-[#302747] leading-5">{favorite || '-'}</p>
                <p className="text-xs text-[#827991] mt-1">Most used (30 days)</p>
              </div>
            </div>

            <ul className="lg:col-span-2 space-y-2">
              {recent.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#302747]">{ACTIVITY_LABELS[item.type] || 'Session'}</span>
                  <span className="flex items-center gap-1 text-xs text-[#a49bb0]">
                    <Clock size={12} />
                    {timeAgo(item.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Wellness categories"
        className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1"
      >
        {CATEGORIES.map((item, index) => {
          const Icon = ICONS[item.id]
          const selected = item.id === categoryId

          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectCategory(item.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`flex items-center gap-2 shrink-0 px-4 py-3 rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4] ${
                selected
                  ? 'bg-[#9878d4] text-white'
                  : 'bg-white border border-[#eee8f5] text-[#7955b5] hover:bg-[#f5f0fc]'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}
      </div>

      {notice && (
        <p
          role="status"
          className={`text-sm rounded-xl p-4 mb-6 ${
            notice.type === 'success'
              ? 'bg-[#e6f4ed] text-[#3f8466]'
              : 'bg-[#fff2df] text-[#a8742a]'
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Panel for the selected category */}
      <div
        role="tabpanel"
        id={`panel-${category.id}`}
        aria-labelledby={`tab-${category.id}`}
        className="space-y-6 mb-10"
      >
        <p className="text-sm text-[#5a4d73] leading-6 max-w-3xl">{category.intro}</p>

        {category.id === 'breathing' && <BreathingExercise onComplete={handleComplete} />}
        {category.id === 'stress' && <ControlCircle onComplete={handleComplete} />}
        {category.id === 'mindfulness' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <MindfulMinute onComplete={handleComplete} />
            <GroundingExercise onComplete={handleComplete} />
          </div>
        )}
        {category.id === 'sleep' && <SleepTools />}
        {category.id === 'study' && <FocusTimer onComplete={handleComplete} />}
        {category.id === 'selfcare' && <SelfCareMenu onComplete={handleComplete} />}

        <div>
          <h2 className="text-lg font-bold text-[#302747] mb-4">Helpful tips</h2>
          <TipList tips={category.tips} />
        </div>
      </div>

      <HelpCard />
    </DashboardLayout>
  )
}

export default Wellness