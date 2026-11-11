
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#eee6fc] border-t-[#9878d4] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#827991] mt-4">
            Loading MindMate...
          </p>
        </div>
      </div>
    )
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
