import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'
import axios from 'axios'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)

        try {
          // Check if user has any existing agents
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/business/?user_id=${session.user.id}`)

          if (response.data && response.data.length > 0) {
            navigate('/dashboard')
          } else {
            navigate('/onboarding')
          }
        } catch (error) {
          console.error('Error checking user agents:', error)
          navigate('/onboarding')
        }
      } else {
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
