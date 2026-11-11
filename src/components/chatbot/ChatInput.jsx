import { useState } from 'react'
import { Send, Smile } from 'lucide-react'

function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!input.trim() || disabled) return

    onSend(input.trim())
    setInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 bg-white border border-[#eae4f2] rounded-2xl p-2 shadow-sm"
    >
      <Smile size={21} className="text-[#a49bb0] ml-2 shrink-0" />

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Share what's on your mind..."
        disabled={disabled}
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#493b60] placeholder:text-[#b0a7bb] py-3"
      />

      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 text-white p-3 rounded-xl transition shrink-0"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  )
}

export default ChatInput