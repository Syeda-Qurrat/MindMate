// Single source of truth for mood options and mood calculations.
// Shared by the Mood Tracker page and (later) the Dashboard.

export const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😊', score: 5, color: '#64a98a', tint: 'bg-[#e6f4ed] text-[#3f8466]' },
  { key: 'calm', label: 'Calm', emoji: '😌', score: 4, color: '#7fb3d5', tint: 'bg-[#e4f1fa] text-[#3d7ba3]' },
  { key: 'okay', label: 'Okay', emoji: '😐', score: 3, color: '#b6aac9', tint: 'bg-[#f0ecf6] text-[#6f6285]' },
  { key: 'sad', label: 'Sad', emoji: '😔', score: 2, color: '#9878d4', tint: 'bg-[#eee6fc] text-[#7955b5]' },
  { key: 'anxious', label: 'Anxious', emoji: '😟', score: 2, color: '#e9b66b', tint: 'bg-[#fff2df] text-[#a8742a]' },
  { key: 'stressed', label: 'Stressed', emoji: '😣', score: 1, color: '#d97883', tint: 'bg-[#fbe9ec] text-[#b04b5a]' }
]

export const MAX_NOTE_LENGTH = 500

export const getMood = (key) => MOODS.find((mood) => mood.key === key)

// Local-date key such as "2026-11-11" (used to group entries by day).
export const toDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Number of consecutive days with at least one entry, counting back from
// today. If today has no entry yet, a streak ending yesterday still counts.
export const computeStreak = (entries, today = new Date()) => {
  const days = new Set(entries.map((entry) => toDateKey(entry.createdAt)))
  const cursor = new Date(today)

  if (!days.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (days.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// Average mood score per day for the last `days` days (oldest first).
// Days with no entries have `average: null`.
export const dailyAverages = (entries, days, today = new Date()) => {
  const buckets = new Map()

  entries.forEach((entry) => {
    const key = toDateKey(entry.createdAt)
    const bucket = buckets.get(key) || { total: 0, count: 0 }
    bucket.total += entry.score
    bucket.count += 1
    buckets.set(key, bucket)
  })

  const result = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const bucket = buckets.get(toDateKey(date))

    result.push({
      date,
      average: bucket ? bucket.total / bucket.count : null,
      count: bucket ? bucket.count : 0
    })
  }

  return result
}

// Entries recorded within the last `days` days.
export const entriesInRange = (entries, days, today = new Date()) => {
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  return entries.filter((entry) => entry.createdAt >= start)
}

// How many times each mood was recorded.
export const moodCounts = (entries) =>
  MOODS.map((mood) => ({
    ...mood,
    count: entries.filter((entry) => entry.mood === mood.key).length
  }))

export const averageScore = (entries) =>
  entries.length
    ? entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length
    : null