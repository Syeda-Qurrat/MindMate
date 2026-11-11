import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Heart,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Wind,
  BookOpen,
  Clock,
  TrendingUp,
  Flame
} from 'lucide-react'

import DashboardLayout from '../components/layout/DashboardLayout'
import MoodChart from '../components/mood/MoodChart'
import { useAuth } from '../context/AuthContext'
import { addMood, subscribeToMoods } from '../services/moodService'
import { fetchConversations } from '../services/chatService'
import {
  MOODS,
  getMood,
  toDateKey,
  computeStreak,
  entriesInRange,
  averageScore
} from '../utils/moods'
import { timeAgo, greetingForHour } from '../utils/time'

const activities = [
  {
    title: 'Breathing Exercise',
    description: 'Take a moment to slow down and relax.',
    duration: '5 minutes',
    icon: Wind,
    color: 'bg-[#eee6fc]',
    iconColor: 'text-[#9878d4]'
  },
  {
    title: 'Mindful Moments',
    description: 'Give yourself time to be present.',
    duration: '10 minutes',
    icon: Sun,
    color: 'bg-[#fff2df]',
    iconColor: 'text-[#d49a4e]'
  },
  {
    title: 'Reflection Journal',
    description: 'Write down what is on your mind.',
    duration: '5 minutes',
    icon: BookOpen,
    color: 'bg-[#e6f4ed]',
    iconColor: 'text-[#64a98a]'
  }
]

function Dashboard() {
  const { currentUser } = useAuth()
  const userId = currentUser?.uid
  const firstName = currentUser?.displayName?.trim().split(' ')[0]

  // Mood data (real-time)
  const [entries, setEntries] = useState([])
  const [moodsLoading, setMoodsLoading] = useState(true)
  const [moodsError, setMoodsError] = useState(false)

  // Chatbot activity (one-time read of the user's conversations)
  const [chat, setChat] = useState({ loading: true, error: false, conversations: [] })

  // Quick check-in
  const [selectedMood, setSelectedMood] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (!userId) return undefined

    return subscribeToMoods(
      userId,
      (list) => {
        setEntries(list)
        setMoodsError(false)
        setMoodsLoading(false)
      },
      (error) => {
        console.error('Dashboard mood error:', error)
        setMoodsError(true)
        setMoodsLoading(false)
      }
    )
  }, [userId])

  useEffect(() => {
    if (!userId) return undefined

    let active = true

    fetchConversations(userId)
      .then((conversations) => {
        if (active) setChat({ loading: false, error: false, conversations })
      })
      .catch((error) => {
        console.error('Dashboard chat error:', error)
        if (active) setChat({ loading: false, error: true, conversations: [] })
      })

    return () => {
      active = false
    }
  }, [userId])

  const todayKey = toDateKey(new Date())
  const todaysMood = useMemo(
    () => entries.find((entry) => toDateKey(entry.createdAt) === todayKey),
    [entries, todayKey]
  )
  const streak = useMemo(() => computeStreak(entries), [entries])
  const weekEntries = useMemo(() => entriesInRange(entries, 7), [entries])
  const weekAverage = useMemo(() => averageScore(weekEntries), [weekEntries])
  const recentEntries = entries.slice(0, 3)

  const conversationCount = chat.conversations.length
  const lastConversation = chat.conversations[0]
  const lastChatDate = lastConversation?.updatedAt?.toDate?.()

  const handleMoodSave = async () => {
    if (!selectedMood || saving) return

    const mood = getMood(selectedMood)
    setSaving(true)
    setFeedback(null)

    try {
      await addMood(userId, { mood: selectedMood })
      setSelectedMood('')
      setFeedback({
        type: 'success',
        text: `Your ${mood.label.toLowerCase()} mood has been saved. 💜`
      })
    } catch (error) {
      console.error('Dashboard mood save error:', error)
      setFeedback({
        type: 'error',
        text: 'We could not save your mood. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>

      {/* Welcome Section */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <p className="text-sm text-[#9878d4] font-medium">
              YOUR WELLNESS SPACE
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-[#302747] mt-2">
              {greetingForHour(new Date().getHours())}, {firstName || 'there'}! 💜
            </h1>

            <p className="text-sm md:text-base text-[#827991] mt-2">
              Every small step towards your well-being counts.
            </p>
          </div>

          <div className="text-sm text-[#827991] bg-white border border-[#eee8f5] px-4 py-3 rounded-xl">
            {streak > 0 ? (
              <>
                <Flame size={16} className="inline mr-2 text-[#d49a4e]" />
                {streak}-day check-in streak
              </>
            ) : (
              <>
                <Clock size={16} className="inline mr-2 text-[#9878d4]" />
                Your wellness journey starts today
              </>
            )}
          </div>

        </div>
      </section>

      {/* AI Companion Banner */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8f70ca] to-[#b39ae7] p-6 md:p-9 text-white">

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-sm text-purple-100 mb-4">
              <Sparkles size={17} />
              YOUR AI WELLNESS COMPANION
            </div>

            <h2 className="text-2xl md:text-3xl font-bold">
              Need someone to talk to?
            </h2>

            <p className="text-sm md:text-base text-purple-100 mt-3 leading-7 max-w-lg">
              Share what's on your mind. MindMate is here to listen,
              help you reflect and explore ways to care for yourself.
            </p>

            <Link
              to="/chatbot"
              className="inline-flex items-center gap-2 mt-6 bg-white !text-[#7955b5] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-purple-50 transition"
            >
              Talk to MindMate
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="absolute right-8 bottom-0 opacity-15 hidden sm:block">
            <Heart size={190} strokeWidth={1} />
          </div>

          <div className="absolute right-36 top-8 opacity-20">
            <Sparkles size={35} />
          </div>

        </div>
      </section>

      {/* Overview Cards (live data) */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

        {/* Today's mood */}
        <Link
          to="/mood-tracker"
          className="bg-white border border-[#eee8f5] rounded-2xl p-5 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-[#eee6fc] rounded-xl flex items-center justify-center">
              <Heart size={22} className="text-[#9878d4]" />
            </div>
            <span className="text-xs text-[#a49bb0]">DAILY CHECK-IN</span>
          </div>

          {moodsLoading ? (
            <div className="mt-5 space-y-2" aria-busy="true">
              <div className="h-5 w-24 rounded bg-[#f0eaf8] animate-pulse" />
              <div className="h-4 w-40 rounded bg-[#f0eaf8] animate-pulse" />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#302747] mt-5">
                {moodsError
                  ? 'Unavailable'
                  : todaysMood
                    ? `${getMood(todaysMood.mood)?.emoji ?? ''} ${getMood(todaysMood.mood)?.label ?? 'Recorded'}`
                    : 'Not recorded'}
              </h3>
              <p className="text-sm text-[#827991] mt-1">
                {moodsError
                  ? 'We could not load your mood data.'
                  : todaysMood
                    ? `Last check-in ${timeAgo(todaysMood.createdAt)}.`
                    : 'How are you feeling today?'}
              </p>
            </>
          )}
        </Link>

        {/* Chatbot activity */}
        <Link
          to="/chatbot"
          className="bg-white border border-[#eee8f5] rounded-2xl p-5 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-[#e6f4ed] rounded-xl flex items-center justify-center">
              <MessageCircle size={22} className="text-[#64a98a]" />
            </div>
            <span className="text-xs text-[#a49bb0]">AI COMPANION</span>
          </div>

          {chat.loading ? (
            <div className="mt-5 space-y-2" aria-busy="true">
              <div className="h-5 w-28 rounded bg-[#f0eaf8] animate-pulse" />
              <div className="h-4 w-40 rounded bg-[#f0eaf8] animate-pulse" />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#302747] mt-5">
                {chat.error
                  ? 'Unavailable'
                  : conversationCount === 0
                    ? 'Here for you'
                    : `${conversationCount} ${conversationCount === 1 ? 'conversation' : 'conversations'}`}
              </h3>
              <p className="text-sm text-[#827991] mt-1">
                {chat.error
                  ? 'We could not load your conversations.'
                  : conversationCount === 0
                    ? 'Start a conversation whenever you need support.'
                    : `Last chat ${lastChatDate ? timeAgo(lastChatDate) : 'recently'}.`}
              </p>
            </>
          )}
        </Link>

        {/* Weekly mood */}
        <Link
          to="/mood-tracker"
          className="bg-white border border-[#eee8f5] rounded-2xl p-5 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-[#fff2df] rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-[#d49a4e]" />
            </div>
            <span className="text-xs text-[#a49bb0]">THIS WEEK</span>
          </div>

          {moodsLoading ? (
            <div className="mt-5 space-y-2" aria-busy="true">
              <div className="h-5 w-24 rounded bg-[#f0eaf8] animate-pulse" />
              <div className="h-4 w-40 rounded bg-[#f0eaf8] animate-pulse" />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#302747] mt-5">
                {weekAverage === null ? 'No entries yet' : `${weekAverage.toFixed(1)} / 5 average`}
              </h3>
              <p className="text-sm text-[#827991] mt-1">
                {weekAverage === null
                  ? 'Check in to start seeing your weekly trend.'
                  : `Based on ${weekEntries.length} ${weekEntries.length === 1 ? 'check-in' : 'check-ins'} in the last 7 days.`}
              </p>
            </>
          )}
        </Link>
      </section>

      {/* Quick Mood Check-in (saves to Firestore) */}
      <section className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#eee6fc] flex items-center justify-center">
            <Heart size={21} className="text-[#9878d4]" />
          </div>
          <div>
            <h2 id="quick-mood" className="text-lg font-bold text-[#302747]">
              How are you feeling today?
            </h2>
            <p className="text-xs text-[#827991]">
              Take a moment to check in with yourself.
            </p>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="quick-mood"
          className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-7"
        >
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.key
            return (
              <button
                key={mood.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  setSelectedMood(mood.key)
                  setFeedback(null)
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4] ${
                  isSelected
                    ? 'border-[#9878d4] bg-[#eee6fc] text-[#7955b5]'
                    : 'border-[#eee8f5] bg-[#faf8ff] text-[#827991] hover:border-[#c9b5eb]'
                }`}
              >
                <span className="text-3xl" aria-hidden="true">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <p className="text-xs text-[#a49bb0]">
            Want to add a journal note?{' '}
            <Link to="/mood-tracker" className="text-[#7955b5] font-semibold hover:underline">
              Open the Mood Tracker
            </Link>
          </p>
          <button
            type="button"
            onClick={handleMoodSave}
            disabled={!selectedMood || saving}
            className="bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            {saving ? 'Saving...' : 'Save Mood'}
          </button>
        </div>

        {feedback && (
          <p
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`mt-4 text-sm p-3 rounded-xl ${
              feedback.type === 'error'
                ? 'bg-[#fbe9ec] text-[#b04b5a]'
                : 'bg-[#e6f4ed] text-[#3f8466]'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </section>

      {/* Week at a glance + recent entries */}
      {!moodsLoading && !moodsError && entries.length > 0 && (
        <section className="grid lg:grid-cols-5 gap-5 mb-8">
          <div className="lg:col-span-3 bg-white border border-[#eee8f5] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#302747]">Your week at a glance</h2>
              <Link
                to="/mood-tracker"
                className="text-sm text-[#7955b5] font-semibold flex items-center gap-1"
              >
                Full trends <ArrowRight size={15} />
              </Link>
            </div>
            <MoodChart entries={entries} days={7} />
          </div>

          <div className="lg:col-span-2 bg-white border border-[#eee8f5] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#302747] mb-4">Recent check-ins</h2>
            <ul className="space-y-3">
              {recentEntries.map((entry) => {
                const mood = getMood(entry.mood)
                return (
                  <li key={entry.id} className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${mood?.tint || 'bg-[#f5f0fc]'}`}
                      aria-hidden="true"
                    >
                      {mood?.emoji || '💜'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#302747]">
                        {mood?.label || 'Mood'}
                        <span className="ml-2 text-xs font-normal text-[#a49bb0]">
                          {timeAgo(entry.createdAt)}
                        </span>
                      </p>
                      {entry.note && (
                        <p className="text-xs text-[#827991] mt-0.5 truncate">{entry.note}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Wellness Activities */}
      <section className="mb-8">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#302747]">
              Take a moment for yourself
            </h2>
            <p className="text-sm text-[#827991] mt-1">
              Small activities to support your well-being.
            </p>
          </div>

          <Link
            to="/wellness"
            className="hidden sm:flex items-center gap-1 text-sm text-[#7955b5] font-semibold"
          >
            Explore all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {activities.map((activity) => {
            const Icon = activity.icon

            return (
              <div
                key={activity.title}
                className="bg-white border border-[#eee8f5] rounded-2xl p-5 hover:shadow-md transition"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.color}`}>
                  <Icon size={23} className={activity.iconColor} />
                </div>

                <h3 className="font-bold text-[#302747] mt-4">
                  {activity.title}
                </h3>

                <p className="text-sm text-[#827991] mt-2 leading-6">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-[#a49bb0]">
                    <Clock size={13} className="inline mr-1" />
                    {activity.duration}
                  </span>

                  <Link
                    to="/wellness"
                    className="text-sm font-semibold text-[#7955b5] flex items-center gap-1"
                  >
                    Explore <ArrowRight size={15} />
                  </Link>
                </div>

              </div>
            )
          })}

        </div>
      </section>

      {/* Gentle Reminder */}
      <section className="bg-[#eee6fc] rounded-2xl p-6 flex items-start gap-4">
        <div className="bg-white p-3 rounded-xl">
          <Moon size={22} className="text-[#9878d4]" />
        </div>

        <div>
          <h3 className="font-bold text-[#49366c]">
            A gentle reminder
          </h3>

          <p className="text-sm text-[#7955b5] mt-1 leading-6">
            You don't have to figure everything out today.
            Give yourself permission to rest, grow and take things at your own pace.
          </p>
        </div>
      </section>

    </DashboardLayout>
  )
}

export default Dashboard