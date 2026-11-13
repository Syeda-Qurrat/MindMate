import { auth } from '../services/firebase'

// Set VITE_API_URL in .env when the backend is not on this address.
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 45000

// An error whose message is safe and friendly to show to the student.
export class ChatApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ChatApiError'
    this.status = status
  }
}

const postChat = async (messages, token) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The backend checks this Firebase ID token to confirm who is asking.
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal
    })
  } finally {
    clearTimeout(timer)
  }
}

const readErrorMessage = async (response) => {
  try {
    const data = await response.json()

    if (typeof data.detail === 'string' && data.detail) {
      return data.detail
    }
  } catch {
    // The body was not JSON; fall through to the generic messages.
  }

  if (response.status === 422) {
    return "That message couldn't be sent. Try making it shorter."
  }

  if (response.status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  return 'MindMate is having trouble right now. Please try again.'
}

// Sends the recent conversation to the backend and returns
// { reply, crisis }. Throws ChatApiError with a friendly message.
export const sendMessageToMindMate = async (messages) => {
  const user = auth.currentUser

  if (!user) {
    throw new ChatApiError('Please log in again to chat with MindMate.', 401)
  }

  let response

  try {
    response = await postChat(messages, await user.getIdToken())

    // The cached token may have just expired, so retry once with a fresh one.
    if (response.status === 401) {
      response = await postChat(messages, await user.getIdToken(true))
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ChatApiError(
        'MindMate took too long to respond. Please try again.'
      )
    }

    throw new ChatApiError(
      "Can't reach the MindMate server. Check your connection, and make sure the backend is running."
    )
  }

  if (!response.ok) {
    throw new ChatApiError(await readErrorMessage(response), response.status)
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!data || typeof data.reply !== 'string' || !data.reply) {
    throw new ChatApiError(
      'MindMate sent a reply we could not read. Please try again.',
      response.status
    )
  }

  return { reply: data.reply, crisis: data.crisis === true }
}