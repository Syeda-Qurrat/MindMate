
import { MessageCircle, Plus, X, Clock, Trash2 } from 'lucide-react'

function ChatSidebar({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white
          border-r border-[#eee8f5] flex flex-col
          transition-transform duration-300
          lg:static lg:translate-x-0 lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#eee8f5]">
          <div className="flex items-center gap-2">
            <div className="bg-[#eee6fc] p-2 rounded-xl">
              <MessageCircle size={19} className="text-[#9878d4]" />
            </div>

            <span className="font-bold text-[#302747]">
              Conversations
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-[#827991]"
            aria-label="Close conversations"
          >
            <X size={20} />
          </button>
        </div>

        {/* New chat */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat()
              onClose()
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] text-white rounded-xl py-3 text-sm font-semibold transition"
          >
            <Plus size={18} />
            New Conversation
          </button>
        </div>

        {/* History */}
        <div className="px-4 flex-1 overflow-y-auto">
          <p className="text-xs text-[#a49bb0] uppercase tracking-wider font-semibold px-2 mb-3">
            Recent conversations
          </p>

          {conversations.length === 0 ? (
            <p className="text-sm text-[#a49bb0] px-2 py-4">
              Your conversations will appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-1 rounded-xl transition ${
                    activeId === chat.id
                      ? 'bg-[#eee6fc] text-[#7955b5]'
                      : 'text-[#827991] hover:bg-[#faf8ff]'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelect(chat.id)
                      onClose()
                    }}
                    className="min-w-0 flex-1 text-left flex items-start gap-3 p-3"
                  >
                    <Clock size={17} className="mt-0.5 shrink-0" />

                    <span className="text-sm truncate">
                      {chat.title}
                    </span>
                  </button>

                  <button
                    onClick={() => onDelete(chat.id)}
                    className="shrink-0 p-2 mr-1 rounded-lg text-[#a49bb0] hover:text-red-500 hover:bg-red-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition"
                    aria-label={`Delete ${chat.title}`}
                    title="Delete conversation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#eee8f5]">
          <p className="text-xs text-[#a49bb0] leading-5">
            Your conversations are a space to reflect and express yourself.
          </p>
        </div>
      </aside>
    </>
  )
}

export default ChatSidebar
