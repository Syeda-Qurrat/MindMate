import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-16 py-5 bg-white/80 border-b border-[#eee8f5]">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-[#9878d4] p-2 rounded-xl text-white">
          <Heart size={21} />
        </div>

        <span className="text-2xl font-bold text-[#302747]">
          mindmate<span className="text-[#9878d4]">.</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-[#827991]">
        <a href="#about" className="hover:text-[#9878d4]">About</a>
        <a href="#features" className="hover:text-[#9878d4]">Features</a>
        <a href="#how-it-works" className="hover:text-[#9878d4]">How it works</a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="hidden sm:block text-sm font-medium text-[#5c4b76] hover:text-[#9878d4]"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-[#9878d4] hover:bg-[#7955b5] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

export default Navbar