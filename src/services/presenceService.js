import {
  ref,
  push,
  onValue,
  onDisconnect,
  get,
  set,
  remove,
  update,
  serverTimestamp
} from 'firebase/database'

import { realtimeDb } from './firebase'

let activeCleanup = null

// A tab refreshes its own lastSeen this often. Other users treat a
// connection as dead if lastSeen is older than ~2 minutes, so ghost
// entries (crash, sleep, missed onDisconnect) expire by themselves.
const HEARTBEAT_MS = 30000

// Entries from other sessions of the same user that stopped sending
// heartbeats long ago are leftovers (old code, crashes) and get deleted.
const GHOST_AFTER_MS = 10 * 60 * 1000

const pruneGhosts = async (connectionsRef, ownKey) => {
  try {
    const snapshot = await get(connectionsRef)

    snapshot.forEach((child) => {
      if (child.key === ownKey) return

      const lastSeen = child.val()?.lastSeen

      if (
        typeof lastSeen !== 'number' ||
        Date.now() - lastSeen > GHOST_AFTER_MS
      ) {
        remove(child.ref).catch(() => {})
      }
    })
  } catch (error) {
    console.error('Presence ghost cleanup error:', error)
  }
}

export const setupPresence = (userId) => {
  const connectedRef = ref(realtimeDb, '.info/connected')

  const connectionsRef = ref(
    realtimeDb,
    `status/${userId}/connections`
  )

  let connectionRef = null
  let disconnectHandler = null
  let heartbeat = null

  const stopHeartbeat = () => {
    if (heartbeat) clearInterval(heartbeat)
    heartbeat = null
  }
  let disposed = false
  let connected = false
  let creating = false
  let generation = 0

  const unsubscribe = onValue(connectedRef, async (snapshot) => {
    connected = snapshot.val() === true

    if (!connected) {
      generation++
      connectionRef = null
      disconnectHandler = null
      stopHeartbeat()
      creating = false
      return
    }

    if (disposed || creating || connectionRef) return

    creating = true
    const attempt = ++generation
    const newConnectionRef = push(connectionsRef)

    try {
      const handler = onDisconnect(newConnectionRef)
      await handler.remove()

      if (disposed || !connected || attempt !== generation) {
        await handler.cancel()
        await remove(newConnectionRef)
        return
      }

      connectionRef = newConnectionRef
      disconnectHandler = handler

      await set(newConnectionRef, {
        connectedAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      })

      stopHeartbeat()
      heartbeat = setInterval(() => {
        if (connectionRef) {
          update(connectionRef, { lastSeen: serverTimestamp() }).catch(() => {})
        }
      }, HEARTBEAT_MS)

      console.log('Presence connected:', newConnectionRef.key)
      pruneGhosts(connectionsRef, newConnectionRef.key)

    } catch (error) {
      console.error('Presence setup error:', error)
      connectionRef = null

    } finally {
      creating = false
    }
  })

  // Explicitly remove the connection on logout/unmount.
  // allSessions: true is used on logout. Firebase shares one login across
  // all tabs of a browser, so every tab is signed out together and the
  // other tabs can no longer delete their own entries.
  const cleanup = async ({ allSessions = false } = {}) => {
    if (disposed) return
    disposed = true
    generation++
    stopHeartbeat()
    unsubscribe()

    const currentConnection = connectionRef
    const currentHandler = disconnectHandler
    connectionRef = null
    disconnectHandler = null

    try {
      await currentHandler?.cancel()

      if (allSessions) {
        await remove(connectionsRef)
        console.log('Presence: all sessions removed on logout')
      } else if (currentConnection) {
        await remove(currentConnection)
        console.log('Presence connection removed:', currentConnection.key)
      }
    } catch (error) {
      console.error('Presence cleanup error:', error)
    }
  }
  activeCleanup = cleanup
  return cleanup
}

// Call this BEFORE signOut(): once signed out, the database rules
// reject the write that marks the user offline.
export const stopPresence = async () => {
  const cleanup = activeCleanup
  activeCleanup = null
  if (cleanup) await cleanup({ allSessions: true })
}