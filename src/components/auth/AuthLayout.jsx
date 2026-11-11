import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, Sparkles } from 'lucide-react'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col">

      {/* Header */}
      <header className="px-6 md:px-12 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="bg-[#9878d4] p-2 rounded-xl text-white">
            <Heart size={21} />
          </div>
          <span className="text-2xl font-bold text-[#302747]">
            mindmate<span className="text-[#9878d4]">.</span>
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#827991] hover:text-[#7955b5] mb-7"
          >
            <ArrowLeft size={17} />
            Back to home
          </Link>

          <div className="bg-white rounded-3xl border border-[#eee8f5] shadow-sm p-7 sm:p-10">

            <div className="w-14 h-14 rounded-2xl bg-[#eee6fc] flex items-center justify-center mb-6">
              <Sparkles size={26} className="text-[#9878d4]" />
            </div>

            <h1 className="text-3xl font-bold text-[#302747]">
              {title}
            </h1>

            <p className="text-[#827991] mt-2 text-sm leading-6">
              {subtitle}
            </p>

            <div className="mt-8">
              {children}
            </div>

          </div>

          <p className="text-center text-xs text-[#a49bb0] mt-6">
            Your well-being matters. Take it one step at a time. 💜
          </p>

        </div>
      </main>
    </div>
  )
}

export default AuthLayout