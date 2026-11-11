import { dailyAverages } from '../../utils/moods'

const WIDTH = 640
const HEIGHT = 230
const PAD = { left: 40, right: 14, top: 14, bottom: 32 }
const LEVEL_EMOJI = { 1: '😣', 2: '😔', 3: '😐', 4: '😌', 5: '😊' }

// Dependency-free SVG line chart of the average mood score per day.
function MoodChart({ entries, days }) {
  const points = dailyAverages(entries, days)
  const plotWidth = WIDTH - PAD.left - PAD.right
  const plotHeight = HEIGHT - PAD.top - PAD.bottom

  const x = (index) =>
    PAD.left + (days === 1 ? plotWidth / 2 : (index * plotWidth) / (days - 1))
  const y = (score) => PAD.top + ((5 - score) / 4) * plotHeight

  // Split into runs of consecutive days so gaps are not joined by a line.
  const runs = []
  let current = []
  points.forEach((point, index) => {
    if (point.average === null) {
      if (current.length) runs.push(current)
      current = []
    } else {
      current.push({ ...point, index })
    }
  })
  if (current.length) runs.push(current)

  const labelEvery = days <= 7 ? 1 : days <= 14 ? 2 : 5
  const recorded = points.filter((point) => point.average !== null)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Mood trend for the last ${days} days. ${recorded.length} days have entries.`}
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <g key={level}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(level)}
            y2={y(level)}
            stroke="#eae4f2"
            strokeDasharray={level === 1 || level === 5 ? '0' : '4 4'}
          />
          <text x={PAD.left - 10} y={y(level) + 5} textAnchor="end" fontSize="15">
            {LEVEL_EMOJI[level]}
          </text>
        </g>
      ))}

      {points.map((point, index) =>
        index % labelEvery === 0 || index === days - 1 ? (
          <text
            key={index}
            x={x(index)}
            y={HEIGHT - 10}
            textAnchor="middle"
            fontSize="11"
            fill="#827991"
          >
            {point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        ) : null
      )}

      {runs.map((run, runIndex) =>
        run.length > 1 ? (
          <polyline
            key={runIndex}
            points={run.map((p) => `${x(p.index)},${y(p.average)}`).join(' ')}
            fill="none"
            stroke="#9878d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null
      )}

      {recorded.map((point) => {
        const index = points.indexOf(point)
        return (
          <circle
            key={index}
            cx={x(index)}
            cy={y(point.average)}
            r="5"
            fill="#ffffff"
            stroke="#7955b5"
            strokeWidth="2.5"
          >
            <title>
              {`${point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: average ${point.average.toFixed(1)} / 5 (${point.count} ${point.count === 1 ? 'entry' : 'entries'})`}
            </title>
          </circle>
        )
      })}
    </svg>
  )
}

export default MoodChart