import { useEffect, useMemo, useState } from 'react'
import { Search, Users, Circle, Heart } from 'lucide-react'

import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToStudents,
  subscribeToPresence
} from '../services/communityService'

function Community() {
  const { currentUser } = useAuth()
  const [students, setStudents] = useState([])
  const [presence, setPresence] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [presenceError, setPresenceError] = useState(false)

  useEffect(() => {
    const unsubscribeStudents = subscribeToStudents(
      (data) => {
        setStudents(data)
        setLoading(false)
      },
      () => {
        setError('Unable to load student profiles.')
        setLoading(false)
      }
    )

    const unsubscribePresence = subscribeToPresence(
      setPresence,
      () => setPresenceError(true)
    )

    return () => {
      unsubscribeStudents()
      unsubscribePresence()
    }
  }, [])

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) =>
        (student.displayName || 'MindMate Student')
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
      .sort((a, b) => {
        const aOnline = presence[a.uid] ? 1 : 0
        const bOnline = presence[b.uid] ? 1 : 0
        if (bOnline !== aOnline) return bOnline - aOnline
        return (a.displayName || '').localeCompare(b.displayName || '')
      })
  }, [students, presence, search])

  const onlineCount = students.filter(
    (student) => presence[student.uid]
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* Heading */}
        <div>
          <div className="flex items-center gap-2 text-[#9878d4] mb-2">
            <Heart size={19} />
            <span className="text-sm font-semibold">
              MindMate Community
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#302747]">
            You're not alone.
          </h1>

          <p className="text-sm text-[#827991] mt-2">
            Connect with other students and grow together.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 gap-4">

          <div className="bg-white border border-[#eee8f5] rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#eee6fc] flex items-center justify-center">
                <Users size={21} className="text-[#9878d4]" />
              </div>

              <div>
                <p className="text-2xl font-bold text-[#302747]">
                  {students.length}
                </p>
                <p className="text-xs text-[#827991]">
                  Community members
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#eee8f5] rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#eaf7ef] flex items-center justify-center">
                <Circle size={18} className="fill-[#64a98a] text-[#64a98a]" />
              </div>

              <div>
                <p className="text-2xl font-bold text-[#302747]">
                  {onlineCount}
                </p>
                <p className="text-xs text-[#827991]">
                  Students online
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Search */}
        <div>
          <h2 className="text-lg font-bold text-[#302747] mb-4">
            Discover students
          </h2>

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49bb0]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name..."
              className="w-full bg-white border border-[#eee8f5] rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc]"
            />
          </div>
        </div>

        {/* Student list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#302747]">
              Community members
            </h2>

            <span className="text-xs text-[#827991]">
              {filteredStudents.length} students
            </span>
          </div>

          {presenceError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3 mb-4">
              Live online status is unavailable right now. Members are still shown.
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl p-10 text-center">
              <p className="text-sm text-[#827991]">
                Loading community members...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white border border-[#eee8f5] rounded-2xl p-10 text-center">
              <Users
                size={32}
                className="text-[#9878d4] mx-auto mb-3"
              />

              <p className="font-semibold text-[#302747]">
                No students found
              </p>

              <p className="text-sm text-[#827991] mt-2">
                Try searching with another name.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

              {filteredStudents.map((student) => {
                const name = student.displayName || 'MindMate Student'
                const isOnline = !!presence[student.uid]
                const isYou = student.uid === currentUser?.uid

                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <div
                    key={student.uid}
                    className="bg-white border border-[#eee8f5] rounded-2xl p-5 hover:border-[#c8b5e9] hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">

                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#eee6fc] flex items-center justify-center text-[#7955b5] font-bold">
                          {initials}
                        </div>

                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isOnline
                              ? 'bg-[#64a98a]'
                              : 'bg-[#b8b1c2]'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#302747] truncate">
                          {name}
                          {isYou && (
                            <span className="ml-2 text-[10px] font-semibold text-[#7955b5] bg-[#eee6fc] px-1.5 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </h3>

                        <p className={`text-xs mt-1 ${
                          isOnline
                            ? 'text-[#64a98a]'
                            : 'text-[#a49bb0]'
                        }`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>

                    </div>
                  </div>
                )
              })}

            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Community