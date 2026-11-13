import { useState, useEffect } from 'react'
import { sendMessageToMindMate, ChatApiError } from '../api/chat'
import {
  Heart,
  Menu,
  ShieldCheck,
  MessageCircleHeart,
  CircleAlert,
  RotateCcw,
  X
} from 'lucide-react'

import DashboardLayout from '../components/layout/DashboardLayout'
import ChatSidebar from '../components/chatbot/ChatSidebar'
import ChatMessage from '../components/chatbot/ChatMessage'
import ChatInput from '../components/chatbot/ChatInput'

import { useAuth } from '../context/AuthContext'

import {
  createConversation,
  fetchConversations,
  saveMessages,
  updateConversationTitle,
  deleteConversation
} from '../services/chatService'

const suggestions = [
  {
    emoji: '😟',
    title: "I'm feeling stressed",
    description: 'I have a lot on my mind.'
  },
  {
    emoji: '📚',
    title: 'Academic pressure',
    description: "I'm struggling with my studies."
  },
  {
    emoji: '💭',
    title: 'I need to talk',
    description: 'I just want someone to listen.'
  },
  {
    emoji: '🌱',
    title: 'Build positive habits',
    description: 'I want to improve my daily routine.'
  }
]

const initialMessage = {
  id: 'welcome',
  sender: 'bot',
  text: "Hey! 💜 Welcome to MindMate. I'm here to listen without judgment. You can share whatever is on your mind. How are you feeling today?"
}

function Chatbot() {
  const { currentUser, loading: authLoading } = useAuth()

  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [chatError, setChatError] = useState(null)

  const activeChat = conversations.find(
    (chat) => chat.id === activeId
  )

  const messages = activeChat?.messages || []

  // Load conversations from Firestore
  useEffect(() => {
    if (authLoading || !currentUser) return

    let cancelled = false

    const loadConversations = async () => {
      try {
        setLoadingChats(true)

        const savedConversations = await fetchConversations(
          currentUser.uid
        )

        if (cancelled) return

        if (savedConversations.length > 0) {
          setConversations(savedConversations)
          setActiveId(savedConversations[0].id)
        } else {
          const newId = await createConversation(currentUser.uid)

          const welcomeMessages = [
            {
              ...initialMessage,
              id: `${Date.now()}`
            }
          ]

          await saveMessages(
            currentUser.uid,
            newId,
            welcomeMessages
          )

          if (cancelled) return

          setConversations([{
            id: newId,
            title: 'New conversation',
            messages: welcomeMessages
          }])

          setActiveId(newId)
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        if (!cancelled) {
          setLoadingChats(false)
        }
      }
    }

    loadConversations()

    return () => {
      cancelled = true
    }
  }, [currentUser, authLoading])

  // Update local state and save messages to Firestore
  const updateChatMessages = async (
    conversationId,
    newMessages
  ) => {
    setConversations((previous) =>
      previous.map((chat) =>
        chat.id === conversationId
          ? { ...chat, messages: newMessages }
          : chat
      )
    )

    await saveMessages(
      currentUser.uid,
      conversationId,
      newMessages
    )
  }

  // Create a new conversation
  const createNewChat = async () => {
    try {
      const newId = await createConversation(currentUser.uid)

      const welcomeMessages = [
        {
          ...initialMessage,
          id: `${Date.now()}`
        }
      ]

      await saveMessages(
        currentUser.uid,
        newId,
        welcomeMessages
      )

      const newChat = {
        id: newId,
        title: 'New conversation',
        messages: welcomeMessages
      }

      setConversations((previous) => [
        newChat,
        ...previous
      ])

      setActiveId(newId)
      setIsTyping(false)
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  // Delete a conversation
  const handleDeleteConversation = async (conversationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      await deleteConversation(
        currentUser.uid,
        conversationId
      )

      const remainingConversations = conversations.filter(
        (chat) => chat.id !== conversationId
      )

      setConversations(remainingConversations)

      if (activeId === conversationId) {
        if (remainingConversations.length > 0) {
          setActiveId(remainingConversations[0].id)
        } else {
          setActiveId(null)
          await createNewChat()
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      alert('Unable to delete this conversation. Please try again.')
    }
  }

  // Ask the AI backend for a reply to `history` (it ends with a user message).
  // Errors are shown in a banner and are NOT saved into the conversation.
  const requestReply = async (conversationId, history) => {
    setIsTyping(true)
    setChatError(null)

    let botMessage

    try {
      // Send only the most recent messages to the AI backend
      const apiMessages = history
        .slice(-12)
        .map((message) => ({
          role: message.sender === 'bot' ? 'assistant' : 'user',
          content: message.text
        }))

      const { reply, crisis } = await sendMessageToMindMate(apiMessages)

      botMessage = {
        id: `${Date.now() + 1}`,
        sender: 'bot',
        text: reply,
        ...(crisis ? { crisis: true } : {})
      }
    } catch (error) {
      console.error('MindMate Error:', error)

      setChatError({
        conversationId,
        text:
          error instanceof ChatApiError
            ? error.message
            : "I'm having trouble connecting right now. Please try again in a moment. 💜"
      })
      setIsTyping(false)
      return
    }

    try {
      await updateChatMessages(conversationId, [...history, botMessage])
    } catch (saveError) {
      console.error('Error saving reply:', saveError)

      setChatError({
        conversationId,
        text: "MindMate replied, but the reply couldn't be saved to your history.",
        canRetry: false
      })
    } finally {
      setIsTyping(false)
    }
  }

  // Send a message
  const handleSend = async (text) => {
    if (isTyping || !activeChat || !text.trim()) return

    const conversationId = activeChat.id

    const userMessage = {
      id: `${Date.now()}`,
      sender: 'user',
      text: text.trim()
    }

    const updatedMessages = [...messages, userMessage]

    const isFirstMessage = messages.length === 1

    const newTitle = isFirstMessage
      ? text.trim().slice(0, 28)
      : activeChat.title

    setIsTyping(true)
    setChatError(null)

    try {
      // Save the user's message
      await updateChatMessages(conversationId, updatedMessages)

      // Update title for the first user message
      if (isFirstMessage) {
        await updateConversationTitle(
          currentUser.uid,
          conversationId,
          newTitle
        )

        setConversations((previous) =>
          previous.map((chat) =>
            chat.id === conversationId
              ? { ...chat, title: newTitle }
              : chat
          )
        )
      }
    } catch (error) {
      console.error('Error saving message:', error)

      setChatError({
        conversationId,
        text: "Your message couldn't be saved. Please check your connection and try again."
      })
      setIsTyping(false)
      return
    }

    await requestReply(conversationId, updatedMessages)
  }

  // Re-ask for a reply to the last user message after an error
  const handleRetry = () => {
    if (isTyping || !activeChat) return

    if (messages[messages.length - 1]?.sender !== 'user') {
      setChatError(null)
      return
    }

    requestReply(activeChat.id, messages)
  }

  const handleSuggestion = (text) => {
    handleSend(text)
  }

  return (
    <DashboardLayout>
      <div className="bg-white border border-[#eee8f5] rounded-2xl overflow-hidden min-h-[calc(100vh-150px)] flex flex-col lg:flex-row">

        {/* Conversation sidebar */}
        <ChatSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id)
            setIsTyping(false)
          }}
          onNewChat={createNewChat}
          onDelete={handleDeleteConversation}
        />

        {/* Chat area */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Chat header */}
          <div className="px-4 md:px-6 py-4 border-b border-[#eee8f5] flex items-center justify-between">

            <div className="flex items-center gap-3">

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#f5f0fc]"
                aria-label="Open conversation history"
              >
                <Menu size={21} className="text-[#7955b5]" />
              </button>

              <div className="w-11 h-11 rounded-xl bg-[#eee6fc] flex items-center justify-center">
                <Heart size={23} className="text-[#9878d4]" />
              </div>

              <div>
                <h2 className="font-bold text-[#302747]">
                  MindMate AI
                </h2>

                <p className="text-xs text-[#64a98a] mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#64a98a] mr-1" />
                  Your wellness companion
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#827991]">
              <ShieldCheck size={17} className="text-[#9878d4]" />
              A supportive space
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-7">

            {loadingChats ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-sm text-[#9878d4]">
                  Loading your conversations...
                </p>
              </div>
            ) : (
              <>
                {messages.length === 1 && (
                  <div className="max-w-xl mx-auto py-5 md:py-10">

                    <div className="w-16 h-16 rounded-2xl bg-[#eee6fc] flex items-center justify-center mx-auto mb-5">
                      <MessageCircleHeart
                        size={32}
                        className="text-[#9878d4]"
                      />
                    </div>

                    <h1 className="text-2xl font-bold text-center text-[#302747]">
                      You're in a safe space.
                    </h1>

                    <p className="text-sm text-[#827991] text-center mt-3 leading-6">
                      Sometimes talking about what's on your mind
                      can make things feel a little lighter.
                      Where would you like to begin?
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3 mt-8">
                      {suggestions.map((item) => (
                        <button
                          key={item.title}
                          onClick={() => handleSuggestion(item.title)}
                          className="text-left p-4 rounded-2xl border border-[#eee8f5] bg-[#faf8ff] hover:border-[#9878d4] hover:bg-[#f3edff] transition"
                        >
                          <span className="text-2xl">
                            {item.emoji}
                          </span>

                          <h3 className="font-semibold text-sm text-[#302747] mt-3">
                            {item.title}
                          </h3>

                          <p className="text-xs text-[#827991] mt-1">
                            {item.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="max-w-3xl mx-auto">

                  {messages.length > 1 && (
                    <div className="text-center mb-7">
                      <span className="text-xs text-[#a49bb0] bg-[#faf8ff] px-4 py-2 rounded-full">
                        Conversation started
                      </span>
                    </div>
                  )}

                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                    />
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-[#eee6fc] flex items-center justify-center">
                        <Heart size={18} className="text-[#9878d4]" />
                      </div>

                      <div className="bg-[#faf8ff] rounded-2xl px-5 py-4 text-sm text-[#9878d4]">
                        MindMate is thinking...
                      </div>
                    </div>
                  )}

                  {chatError && chatError.conversationId === activeId && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 bg-[#fbe9ec] text-[#b04b5a] rounded-2xl p-4 mb-6 text-sm"
                    >
                      <CircleAlert size={18} className="shrink-0 mt-0.5" />

                      <div className="flex-1 min-w-0">
                        <p>{chatError.text}</p>

                        {chatError.canRetry !== false && (
                          <button
                            type="button"
                            onClick={handleRetry}
                            disabled={isTyping}
                            className="mt-2 inline-flex items-center gap-1 font-semibold underline disabled:opacity-50"
                          >
                            <RotateCcw size={14} /> Try again
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setChatError(null)}
                        aria-label="Dismiss error"
                        className="shrink-0 p-1 rounded-lg hover:bg-[#f6d5da]"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#eee8f5] p-4 md:p-6 bg-[#fdfcff]">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSend}
                disabled={isTyping || loadingChats || !activeChat}
              />

              <p className="text-center text-[11px] text-[#a49bb0] mt-3">
                MindMate offers supportive conversations, not professional medical care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Chatbot