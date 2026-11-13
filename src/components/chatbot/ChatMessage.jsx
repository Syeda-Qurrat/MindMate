import { Heart, UserRound, Phone } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { HELP_RESOURCES } from '../../data/wellnessContent'

function ChatMessage({ message }) {
  const isUser = message.sender === 'user'
  const isCrisis = !isUser && message.crisis === true

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>

      {/* Avatar */}
      <div
        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-[#e9ddfc] text-[#7955b5]'
            : 'bg-[#eee6fc] text-[#9878d4]'
        }`}
      >
        {isUser ? <UserRound size={18} /> : <Heart size={18} />}
      </div>

      {/* Message */}
      <div className={`max-w-[80%] sm:max-w-[70%] min-w-0 ${isUser ? 'text-right' : ''}`}>
        <p className="text-xs text-[#a49bb0] mb-2">
          {isUser ? 'You' : 'MindMate AI'}
        </p>

        <div
          className={`inline-block max-w-full min-w-0 text-left px-4 py-3 rounded-2xl text-sm leading-7 ${
            isUser
              ? 'bg-[#9878d4] text-white rounded-tr-sm'
              : isCrisis
                ? 'bg-[#fff7f8] border-2 border-[#d97883] text-[#493b60] rounded-tl-sm'
                : 'bg-white border border-[#eee8f5] text-[#493b60] rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">
              {message.text}
            </div>
          ) : (
            <div className="break-words [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:font-bold [&_h3]:mb-2 [&_table]:w-full [&_table]:text-xs [&_th]:bg-[#f5f0fc] [&_th]:p-2 [&_td]:p-2 [&_td]:border [&_td]:border-[#eee8f5] [&_th]:border [&_th]:border-[#eee8f5] [&_blockquote]:border-l-4 [&_blockquote]:border-[#9878d4] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-3 [&_a]:text-[#7955b5] [&_a]:underline [&_code]:bg-[#f5f0fc] [&_code]:px-1 [&_code]:rounded">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table>{children}</table>
                    </div>
                  )
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {isCrisis && (
          <div className="mt-3 flex flex-wrap gap-2">
            {HELP_RESOURCES.contacts.map((contact) => (
              <a
                key={contact.name}
                href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                aria-label={`Call ${contact.name} on ${contact.phone}`}
                className="inline-flex items-center gap-2 bg-[#d97883] hover:bg-[#c4626e] text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                <Phone size={14} />
                {contact.name.replace(/\s*\(.*\)/, '')} {contact.phone}
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ChatMessage