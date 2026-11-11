// Friendly relative time such as "just now", "5 minutes ago", "2 days ago".
export const timeAgo = (date, now = new Date()) => {
  const seconds = Math.max(0, Math.floor((now - date) / 1000))

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const greetingForHour = (hour) => {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}