import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { stopPresence } from '../../services/presenceService'
import {
  Heart,
  LayoutDashboard,
  MessageCircle,
  Activity,
  Users,
  Flower2,
  UserRound,
  LogOut,
  X
} from 'lucide-react'

const menuItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Companion', path: '/chatbot', icon: MessageCircle },
  { name: 'Mood Tracker', path: '/mood-tracker', icon: Activity },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Wellness', path: '/wellness', icon: Flower2 },
  { name: 'My Profile', path: '/profile', icon: UserRound }
]

function DashboardSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await stopPresence()
      await signOut(auth)
      onClose?.()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-white border-r border-[#eee8f5]
          flex flex-col transition-transform duration-300
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="bg-[#9878d4] p-2 rounded-xl text-white">
              <Heart size={21} />
            </div>

            <span className="text-xl font-bold text-[#302747]">
              mindmate<span className="text-[#9878d4]">.</span>
            </span>
          </NavLink>

          <button
            onClick={onClose}
            className="md:hidden text-[#827991]"
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 mt-5">
          <p className="text-xs font-semibold text-[#a49bb0] uppercase tracking-wider px-3 mb-4">
            Workspace
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    text-sm font-medium transition
                    ${isActive
                      ? 'bg-[#eee6fc] text-[#7955b5]'
                      : 'text-[#827991] hover:bg-[#faf8ff] hover:text-[#7955b5]'
                    }
                  `}
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="mt-auto p-4">
          <div className="bg-[#f5f0fc] rounded-2xl p-4 mb-4">
            <div className="bg-white w-9 h-9 rounded-xl flex items-center justify-center mb-3">
              <Heart size={18} className="text-[#9878d4]" />
            </div>

            <p className="text-sm font-semibold text-[#302747]">
              Take a little break
            </p>

            <p className="text-xs text-[#827991] mt-1 leading-5">
              Small moments of self-care matter.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#827991] hover:text-red-500 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default DashboardSidebar