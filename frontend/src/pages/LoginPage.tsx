import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Mic, Bot, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  } as any

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans">
      {/* Left side - Hero */}
      <motion.div
        className="flex-1 bg-background relative overflow-hidden flex flex-col justify-center p-8 lg:p-16 border-r border-border/40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] -z-10" />

        <div className="max-w-xl mx-auto space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Logo className="h-8" />
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              SunoHQ
            </h1>
          </motion.div>

          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Enterprise Voice AI <br />
              <span className="text-muted-foreground">Infrastructure</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Deploy intelligent voice agents in regional languages.
              Enterprise-grade reliability for 24/7 customer engagement.
            </p>
          </div>

          <div className="grid gap-5 pt-4">
            {[
              { icon: Bot, title: "Telegram Integration", desc: "Seamless bot token connectivity" },
              { icon: MessageSquare, title: "Regional Languages", desc: "Native Hindi, Tamil & Telugu support" },
              { icon: Mic, title: "Unified Interface", desc: "Handle voice and text chats in one place" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-start space-x-4 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
              >
                <div className="mt-1 bg-secondary/50 border border-border p-2 rounded-md group-hover:bg-secondary group-hover:border-primary/20 transition-all duration-300">
                  <feature.icon className="w-4 h-4 text-primary/80 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right side - Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-background/50 backdrop-blur-3xl">
        <motion.div
          className="w-full max-w-[400px] space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="border-border/60 shadow-none bg-card/40 backdrop-blur-md">
              <CardHeader className="space-y-2 text-center pb-8 pt-10">
                <CardTitle className="text-2xl font-semibold tracking-tight">Welcome Back</CardTitle>
                <CardDescription className="text-sm">
                  Sign in to manage your voice agents
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pb-10">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-11 text-sm font-medium transition-all hover:bg-secondary/80 bg-background border border-input shadow-sm hover:text-foreground"
                  variant="ghost"
                >
                  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Secured by Enterprise SSO
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.p variants={itemVariants} className="text-xs text-center text-muted-foreground px-8">
            By continuing, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
