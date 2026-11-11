
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase'

// Get the conversations collection for a particular user
const getUserConversations = (userId) => {
  return collection(db, 'users', userId, 'conversations')
}

// Create a new conversation
export const createConversation = async (userId, title = 'New conversation') => {
  const conversation = await addDoc(getUserConversations(userId), {
    title,
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return conversation.id
}

// Fetch all conversations
export const fetchConversations = async (userId) => {
  const conversationsQuery = query(
    getUserConversations(userId),
    orderBy('updatedAt', 'desc')
  )

  const snapshot = await getDocs(conversationsQuery)

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }))
}

// Fetch one conversation
export const fetchConversation = async (userId, conversationId) => {
  const conversationRef = doc(
    db,
    'users',
    userId,
    'conversations',
    conversationId
  )

  const snapshot = await getDoc(conversationRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  }
}

// Save messages in a conversation
export const saveMessages = async (userId, conversationId, messages) => {
  const conversationRef = doc(
    db,
    'users',
    userId,
    'conversations',
    conversationId
  )

  await updateDoc(conversationRef, {
    messages,
    updatedAt: serverTimestamp()
  })
}

// Update conversation title
export const updateConversationTitle = async (
  userId,
  conversationId,
  title
) => {
  const conversationRef = doc(
    db,
    'users',
    userId,
    'conversations',
    conversationId
  )

  await updateDoc(conversationRef, {
    title,
    updatedAt: serverTimestamp()
  })
}

// Delete a conversation
export const deleteConversation = async (userId, conversationId) => {
  const conversationRef = doc(
    db,
    'users',
    userId,
    'conversations',
    conversationId
  )

  await deleteDoc(conversationRef)
}
