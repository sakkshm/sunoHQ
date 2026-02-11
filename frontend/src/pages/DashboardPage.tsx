import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'

import { Loader2, Plus, Bot, MessageSquare, TrendingUp, LogOut, Settings } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import axios from "axios";
import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

interface Business {
  id: string
  botUuid: string
  businessName: string
  category: string
  language: string
  status: string
  webhookEnabled: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuthStore()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/business/?user_id=${user?.id}`
      )
      setBusinesses(response.data)
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "tween", ease: "easeOut", duration: 0.3 }
    }
  } as any

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="bg-background border-b border-border/40 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-8" />
            <h1 className="text-base font-semibold tracking-tight">SunoHQ</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium leading-none">{user?.email}</p>
            </div>
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Overview</h2>
              <p className="text-muted-foreground mt-1">Monitor your agents and performance metrics.</p>
            </div>
            <Button asChild className="shadow-none bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/onboarding">
                <Plus className="w-4 h-4 mr-2" />
                New Voice Agent
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Active Agents"
              value={businesses.length.toString()}
              change="+1 this month"
              icon={Bot}
              color="text-primary"
            />
            <StatsCard
              title="Total Conversations"
              value="0"
              change="No traffic yet"
              icon={MessageSquare}
              color="text-blue-500"
            />
            <StatsCard
              title="System Uptime"
              value="100%"
              change="Last 30 days"
              icon={TrendingUp}
              color="text-green-500"
            />
          </motion.div>

          {/* Businesses List */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Deployed Agents</h3>
            </div>

            {businesses.length === 0 ? (
              <div className="border border-dashed border-border/50 rounded-lg p-16 flex flex-col items-center justify-center text-center bg-secondary/5">
                <div className="bg-secondary p-4 rounded-full mb-4">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No agents found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                  You haven't created any voice agents yet. Deploy your first agent to start handling calls.
                </p>
                <Button asChild variant="secondary">
                  <Link to="/onboarding">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {businesses.map((business) => (
                  <div key={business.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-md border border-border/50">
                        <Bot className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-base">{business.businessName}</h3>
                          {business.webhookEnabled && (
                            <Badge variant="outline" className="border-green-800 text-green-500 bg-green-950/30 text-[10px] px-2 py-0 h-5">
                              Active
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-normal">
                            {business.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            UID: <span className="font-mono text-foreground/70">{business.botUuid.substring(0, 8)}</span>
                          </span>
                          <span>•</span>
                          <span>{new Date(business.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="uppercase">{business.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
                      <Button variant="ghost" size="sm" className="flex-1 md:flex-none border border-border/50" asChild>
                        <Link to={`/bot/${business.id}/edit`}>
                          <Settings className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
                        <Link to={`/bot/${business.id}/chats`}>
                          <MessageSquare className="w-3.5 h-3.5 mr-2" />
                          History
                        </Link>
                      </Button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

function StatsCard({ title, value, change, icon: Icon, color }: { title: string, value: string, change: string, icon: any, color: string }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{change}</p>
      </div>
    </div>
  )
}
