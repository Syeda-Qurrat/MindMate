import { useState } from 'react'
import { Menu, Bell, Heart } from 'lucide-react'
import DashboardSidebar from './DashboardSidebar'

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#faf8ff]">

      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="md:ml-64 min-h-screen">

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#eee8f5] px-5 md:px-8 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-[#f5f0fc]"
                aria-label="Open navigation"
              >
                <Menu size={22} className="text-[#302747]" />
              </button>

              <div>
                <p className="text-xs text-[#a49bb0]">
                  Your personal space
                </p>
                <h2 className="text-sm font-semibold text-[#302747]">
                  MindMate Dashboard
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-2.5 rounded-xl bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc]"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </button>

              <div className="w-10 h-10 rounded-full bg-[#e9ddfc] flex items-center justify-center">
                <Heart size={19} className="text-[#7955b5]" />
              </div>
            </div>

          </div>
        </header>

        <main className="p-5 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>

      </div>
    </div>
  )
}

export default DashboardLayout