import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  TrendingUp,
  Heart,
  Pencil,
  Trash2,
  Check,
  X,
  MessageCircle,
  Flower2,
  NotebookPen
} from 'lucide-react'

import DashboardLayout from '../components/layout/DashboardLayout'
import MoodChart from '../components/mood/MoodChart'
import { useAuth } from '../context/AuthContext'
import {
  addMood,
  subscribeToMoods,
  updateMoodNote,
  deleteMood
} from '../services/moodService'
import {
  MOODS,
  MAX_NOTE_LENGTH,
  getMood,
  toDateKey,
  computeStreak,
  entriesInRange,
  moodCounts,
  averageScore
} from '../utils/moods'

const RANGES = [7, 14, 30]
const PAGE_SIZE = 10

const dayLabel = (date) => {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (toDateKey(date) === toDateKey(today)) return 'Today'
  if (toDateKey(date) === toDateKey(yesterday)) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

function MoodTracker() {
  const { currentUser } = useAuth()
  const userId = currentUser?.uid

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [selectedMood, setSelectedMood] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [range, setRange] = useState(14)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [editingId, setEditingId] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [busyId, setBusyId] = useState(null)

  // Real-time subscription to this user's own mood entries.
  useEffect(() => {
    if (!userId) return undefined

    const unsubscribe = subscribeToMoods(
      userId,
      (list) => {
        setEntries(list)
        setLoadError('')
        setLoading(false)
      },
      (error) => {
        console.error('Mood loading error:', error)
        setLoadError('We could not load your mood history. Please refresh and try again.')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  const rangeEntries = useMemo(() => entriesInRange(entries, range), [entries, range])
  const streak = useMemo(() => computeStreak(entries), [entries])
  const average = useMemo(() => averageScore(rangeEntries), [rangeEntries])
  const counts = useMemo(() => moodCounts(rangeEntries), [rangeEntries])
  const maxCount = Math.max(1, ...counts.map((item) => item.count))
  const topMood = [...counts].sort((a, b) => b.count - a.count)[0]

  const grouped = useMemo(() => {
    const groups = []
    entries.slice(0, visibleCount).forEach((entry) => {
      const key = toDateKey(entry.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.key === key) {
        last.items.push(entry)
      } else {
        groups.push({ key, date: entry.createdAt, items: [entry] })
      }
    })
    return groups
  }, [entries, visibleCount])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!selectedMood || saving) return

    const mood = getMood(selectedMood)
    setSaving(true)
    setFeedback(null)

    try {
      await addMood(userId, { mood: selectedMood, note })
      setSelectedMood('')
      setNote('')
      setFeedback({
        type: 'success',
        text: `Your ${mood.label.toLowerCase()} mood has been saved. Thank you for checking in.`,
        support: mood.score <= 2
      })
    } catch (error) {
      console.error('Mood save error:', error)
      setFeedback({
        type: 'error',
        text: 'We could not save your mood. Please check your connection and try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setEditNote(entry.note)
  }

  const saveEdit = async (entry) => {
    setBusyId(entry.id)
    try {
      await updateMoodNote(userId, entry.id, editNote)
      setEditingId(null)
    } catch (error) {
      console.error('Mood update error:', error)
      setFeedback({ type: 'error', text: 'Could not update that entry. Please try again.' })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm('Delete this mood entry? This cannot be undone.')) return

    setBusyId(entry.id)
    try {
      await deleteMood(userId, entry.id)
    } catch (error) {
      console.error('Mood delete error:', error)
      setFeedback({ type: 'error', text: 'Could not delete that entry. Please try again.' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <section className="mb-8">
        <p className="text-sm text-[#9878d4] font-medium">MOOD TRACKER</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#302747] mt-2">
          How are you feeling?
        </h1>
        <p className="text-sm text-[#827991] mt-2 max-w-xl">
          Check in with yourself, add a few words if you like, and watch how your mood changes over time.
          Only you can see these entries.
        </p>
      </section>

      {/* Check-in form */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#eee6fc] flex items-center justify-center">
            <Heart size={21} className="text-[#9878d4]" />
          </div>
          <h2 id="mood-question" className="text-lg font-bold text-[#302747]">
            Right now I feel...
          </h2>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="mood-question"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.key
            return (
              <button
                key={mood.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedMood(mood.key)}
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

        <div className="mt-6">
          <label
            htmlFor="mood-note"
            className="flex items-center gap-2 text-sm font-medium text-[#302747] mb-2"
          >
            <NotebookPen size={16} className="text-[#9878d4]" />
            Journal (optional)
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={MAX_NOTE_LENGTH}
            rows={3}
            placeholder="What's on your mind? What happened today?"
            className="w-full p-4 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm text-[#302747] resize-none"
          />
          <p className="text-xs text-[#a49bb0] text-right mt-1">
            {note.length}/{MAX_NOTE_LENGTH}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <p className="text-xs text-[#a49bb0]">There's no right or wrong way to feel.</p>
          <button
            type="submit"
            disabled={!selectedMood || saving}
            className="bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            {saving ? 'Saving...' : 'Save mood'}
          </button>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`mt-5 text-sm rounded-xl p-4 ${
              feedback.type === 'error'
                ? 'bg-[#fbe9ec] text-[#b04b5a]'
                : 'bg-[#e6f4ed] text-[#3f8466]'
            }`}
          >
            <p>{feedback.text}</p>
            {feedback.support && (
              <p className="mt-2 text-[#5a4d73]">
                Tough days happen. If you'd like some company, you can{' '}
                <Link to="/chatbot" className="font-semibold text-[#7955b5] underline">
                  talk to the AI companion
                </Link>{' '}
                or try a calming activity in{' '}
                <Link to="/wellness" className="font-semibold text-[#7955b5] underline">
                  Wellness
                </Link>
                . If you ever feel unsafe, please reach out to a trusted person or your local emergency number.
              </p>
            )}
          </div>
        )}
      </form>

      {loadError && (
        <div role="alert" className="bg-[#fbe9ec] text-[#b04b5a] text-sm rounded-xl p-4 mb-8">
          {loadError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !loadError && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading your mood history">
          <div className="h-28 rounded-2xl bg-[#f0eaf8] animate-pulse" />
          <div className="h-64 rounded-2xl bg-[#f0eaf8] animate-pulse" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadError && entries.length === 0 && (
        <div className="bg-white border border-dashed border-[#d9cdf0] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eee6fc] flex items-center justify-center">
            <TrendingUp size={26} className="text-[#9878d4]" />
          </div>
          <h2 className="font-bold text-[#302747] mt-4">No mood entries yet</h2>
          <p className="text-sm text-[#827991] mt-2">
            Save your first check-in above and your trends will appear here.
          </p>
        </div>
      )}

      {!loading && !loadError && entries.length > 0 && (
        <>
          {/* Summary cards */}
          <section className="grid sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-[#eee8f5] rounded-2xl p-5">
              <div className="w-11 h-11 bg-[#fff2df] rounded-xl flex items-center justify-center">
                <Flame size={22} className="text-[#d49a4e]" />
              </div>
              <p className="text-2xl font-bold text-[#302747] mt-4">
                {streak} {streak === 1 ? 'day' : 'days'}
              </p>
              <p className="text-sm text-[#827991]">Check-in streak</p>
            </div>

            <div className="bg-white border border-[#eee8f5] rounded-2xl p-5">
              <div className="w-11 h-11 bg-[#eee6fc] rounded-xl flex items-center justify-center">
                <TrendingUp size={22} className="text-[#9878d4]" />
              </div>
              <p className="text-2xl font-bold text-[#302747] mt-4">
                {average === null ? '-' : `${average.toFixed(1)} / 5`}
              </p>
              <p className="text-sm text-[#827991]">Average mood, last {range} days</p>
            </div>

            <div className="bg-white border border-[#eee8f5] rounded-2xl p-5">
              <div className="w-11 h-11 bg-[#e6f4ed] rounded-xl flex items-center justify-center text-xl">
                {topMood && topMood.count > 0 ? topMood.emoji : '💜'}
              </div>
              <p className="text-2xl font-bold text-[#302747] mt-4">
                {topMood && topMood.count > 0 ? topMood.label : '-'}
              </p>
              <p className="text-sm text-[#827991]">Most frequent mood, last {range} days</p>
            </div>
          </section>

          {/* Trend chart */}
          <section className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#302747]">Your mood trend</h2>
                <p className="text-xs text-[#827991] mt-1">
                  Daily average. Higher is a better day.
                </p>
              </div>
              <div role="group" aria-label="Chart time range" className="flex gap-2">
                {RANGES.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRange(days)}
                    aria-pressed={range === days}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4] ${
                      range === days
                        ? 'bg-[#9878d4] text-white'
                        : 'bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc]'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>

            <MoodChart entries={entries} days={range} />

            {/* Mood breakdown */}
            <div className="mt-8 pt-6 border-t border-[#eee8f5]">
              <h3 className="text-sm font-semibold text-[#302747] mb-4">
                Mood breakdown, last {range} days
              </h3>
              <ul className="space-y-3">
                {counts.map((item) => (
                  <li key={item.key} className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-[#827991] flex items-center gap-2">
                      <span aria-hidden="true">{item.emoji}</span>
                      {item.label}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#f5f0fc] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-[#302747] font-medium">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* History */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#302747] mb-4">Your history</h2>

            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.key}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a49bb0] mb-3">
                    {dayLabel(group.date)}
                  </h3>
                  <ul className="space-y-3">
                    {group.items.map((entry) => {
                      const mood = getMood(entry.mood)
                      const isEditing = editingId === entry.id
                      const isBusy = busyId === entry.id

                      return (
                        <li
                          key={entry.id}
                          className="bg-white border border-[#eee8f5] rounded-2xl p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${mood?.tint || 'bg-[#f5f0fc]'}`}
                              aria-hidden="true"
                            >
                              {mood?.emoji || '💜'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-[#302747]">
                                  {mood?.label || 'Mood'}
                                  <span className="ml-2 text-xs font-normal text-[#a49bb0]">
                                    {entry.createdAt.toLocaleTimeString(undefined, {
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </p>

                                {!isEditing && (
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => startEdit(entry)}
                                      disabled={isBusy}
                                      aria-label="Edit note"
                                      className="p-2 rounded-lg text-[#827991] hover:bg-[#f5f0fc] hover:text-[#7955b5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4]"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(entry)}
                                      disabled={isBusy}
                                      aria-label="Delete entry"
                                      className="p-2 rounded-lg text-[#827991] hover:bg-[#fbe9ec] hover:text-[#b04b5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9878d4]"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="mt-3">
                                  <label htmlFor={`edit-${entry.id}`} className="sr-only">
                                    Edit journal note
                                  </label>
                                  <textarea
                                    id={`edit-${entry.id}`}
                                    value={editNote}
                                    onChange={(event) => setEditNote(event.target.value)}
                                    maxLength={MAX_NOTE_LENGTH}
                                    rows={3}
                                    className="w-full p-3 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm text-[#302747] resize-none"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => saveEdit(entry)}
                                      disabled={isBusy}
                                      className="flex items-center gap-1 bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                                    >
                                      <Check size={14} /> {isBusy ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingId(null)}
                                      className="flex items-center gap-1 bg-[#f5f0fc] text-[#7955b5] px-4 py-2 rounded-lg text-xs font-semibold"
                                    >
                                      <X size={14} /> Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                entry.note && (
                                  <p className="text-sm text-[#5a4d73] mt-2 leading-6 whitespace-pre-wrap break-words">
                                    {entry.note}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {visibleCount < entries.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="mt-6 w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc] text-sm font-semibold transition"
              >
                Show more
              </button>
            )}
          </section>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              to="/chatbot"
              className="flex items-center gap-2 text-[#7955b5] font-semibold hover:underline"
            >
              <MessageCircle size={16} /> Talk it through with MindMate
            </Link>
            <Link
              to="/wellness"
              className="flex items-center gap-2 text-[#7955b5] font-semibold hover:underline"
            >
              <Flower2 size={16} /> Try a wellness activity
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}

export default MoodTracker