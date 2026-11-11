// Wellness logic: breathing patterns, timing helpers, sleep calculator and
// activity summaries. No Firebase or React imports, so it is easy to test.

export const BREATHING_PATTERNS = [
  {
    id: 'calm',
    name: 'Calm breathing',
    description: 'In for 4, out for 6. A gentle start and a quick way to settle.',
    phases: [
      { kind: 'in', label: 'Breathe in', seconds: 4 },
      { kind: 'out', label: 'Breathe out', seconds: 6 }
    ]
  },
  {
    id: 'box',
    name: 'Box breathing',
    description: 'Equal 4-second steps. Helps you focus before an exam or presentation.',
    phases: [
      { kind: 'in', label: 'Breathe in', seconds: 4 },
      { kind: 'hold-full', label: 'Hold', seconds: 4 },
      { kind: 'out', label: 'Breathe out', seconds: 4 },
      { kind: 'hold-empty', label: 'Hold', seconds: 4 }
    ]
  },
  {
    id: 'relax',
    name: '4-7-8 breathing',
    description: 'A longer exhale for winding down. If you feel light-headed, switch to Calm breathing.',
    phases: [
      { kind: 'in', label: 'Breathe in', seconds: 4 },
      { kind: 'hold-full', label: 'Hold', seconds: 7 },
      { kind: 'out', label: 'Breathe out', seconds: 8 }
    ]
  }
]

export const BREATHING_MINUTES = [1, 2, 3, 5]

export const patternCycleSeconds = (pattern) =>
  pattern.phases.reduce((total, phase) => total + phase.seconds, 0)

// Whole number of rounds closest to the chosen duration (at least one).
export const breathingPlan = (pattern, minutes) => {
  const cycle = patternCycleSeconds(pattern)
  const rounds = Math.max(1, Math.round((minutes * 60) / cycle))

  return { rounds, totalSeconds: rounds * cycle }
}

// Which phase of the pattern we are in after `elapsedSeconds`.
export const getBreathingState = (pattern, elapsedSeconds) => {
  const cycleSeconds = patternCycleSeconds(pattern)
  const cycleIndex = Math.floor(elapsedSeconds / cycleSeconds)
  let t = elapsedSeconds - cycleIndex * cycleSeconds

  for (let i = 0; i < pattern.phases.length; i += 1) {
    const phase = pattern.phases[i]

    if (t < phase.seconds) {
      return {
        phase,
        phaseIndex: i,
        secondsLeft: Math.max(1, Math.ceil(phase.seconds - t)),
        round: cycleIndex + 1
      }
    }

    t -= phase.seconds
  }

  const last = pattern.phases[pattern.phases.length - 1]
  return { phase: last, phaseIndex: pattern.phases.length - 1, secondsLeft: 1, round: cycleIndex + 1 }
}

// The circle is big when lungs are full and small when empty.
export const targetScale = (kind) =>
  kind === 'in' || kind === 'hold-full' ? 1 : 0.55

// 125 -> "2:05"
export const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = String(safe % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

// ----- Sleep calculator -----
// Sleep runs in cycles of about 90 minutes; allow ~15 minutes to fall asleep.
export const bedtimeOptions = (wakeTime, fallAsleepMinutes = 15) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(wakeTime || '')
  if (!match) return []

  const wakeMinutes = Number(match[1]) * 60 + Number(match[2])
  if (Number(match[1]) > 23 || Number(match[2]) > 59) return []

  return [6, 5, 4].map((cycles) => {
    const total = (((wakeMinutes - cycles * 90 - fallAsleepMinutes) % 1440) + 1440) % 1440
    const hours24 = Math.floor(total / 60)
    const minutes = String(total % 60).padStart(2, '0')
    const suffix = hours24 >= 12 ? 'PM' : 'AM'
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

    return { cycles, sleepHours: cycles * 1.5, time: `${hours12}:${minutes} ${suffix}` }
  })
}

// ----- Activity history -----
export const ACTIVITY_LABELS = {
  breathing: 'Breathing exercise',
  grounding: '5-4-3-2-1 grounding',
  mindful: 'Mindful minute',
  focus: 'Focus session',
  stress: 'Stress check',
  selfcare: 'Self-care'
}

export const MAX_ACTIVITY_SECONDS = 7200

// Sessions and minutes in the last 7 days, and the most-used tool in the
// last 30 days.
export const summarizeActivities = (activities, now = new Date()) => {
  const startOf = (days) => {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (days - 1))
    return date
  }

  const week = activities.filter((item) => item.createdAt >= startOf(7))
  const month = activities.filter((item) => item.createdAt >= startOf(30))

  const counts = {}
  month.forEach((item) => {
    counts[item.type] = (counts[item.type] || 0) + 1
  })

  const favorite =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    sessionsThisWeek: week.length,
    minutesThisWeek: Math.round(
      week.reduce((sum, item) => sum + (item.durationSeconds || 0), 0) / 60
    ),
    favorite
  }
}