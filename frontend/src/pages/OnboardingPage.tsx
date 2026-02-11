import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowRight, Sparkles, Building2, Clock, Bot, CheckCircle2, XCircle, Loader2 as LoaderIcon, FileText, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios, { AxiosError } from 'axios'


const CATEGORIES = [
  'Restaurant',
  'Salon/Spa',
  'Clinic/Hospital',
  'Retail Store',
  'Service Provider',
  'Other',
]


const LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'or-IN', name: 'Odia' },
  { code: 'en-IN', name: 'English' },
]


const VOICE_SPEAKERS = [
  { id: 'shubh', name: 'Shubh', description: 'Male, professional and clear' },
  { id: 'ritu', name: 'Ritu', description: 'Female, warm and articulate' },
]


interface ValidationState {
  isValid: boolean
  isValidating: boolean
  message: string
}


export default function OnboardingPage() {
  const { botId } = useParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()

  // State for token editing confirmation
  const [isTokenEditable, setIsTokenEditable] = useState(false)

  // State for knowledge base documents
  const [documents, setDocuments] = useState<{ id: string; text: string }[]>([])
  const [newDocText, setNewDocText] = useState('')
  const [docsLoading, setDocsLoading] = useState(false)


  const [formData, setFormData] = useState({
    botToken: '',
    businessName: '',
    category: '',
    description: '',
    location: '',
    phone: '',
    email: user?.email || '',
    weekdayHours: '09:00-21:00',
    weekendHours: '10:00-18:00',
    language: 'hi-IN',
    voiceSpeaker: 'shubh',
    botPersona: 'friendly and helpful customer service agent',
  })


  const [botTokenValidation, setBotTokenValidation] = useState<ValidationState>({
    isValid: false,
    isValidating: false,
    message: '',
  })


  const [phoneValidation, setPhoneValidation] = useState<ValidationState>({
    isValid: false,
    isValidating: false,
    message: '',
  })


  const [emailValidation, setEmailValidation] = useState<ValidationState>({
    isValid: true,
    isValidating: false,
    message: '',
  })


  const totalSteps = 5
  const progress = (step / totalSteps) * 100


  // Validate Bot Token Format
  const validateBotTokenFormat = (token: string): boolean => {
    if (!token) return false
    const botTokenRegex = /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/
    return botTokenRegex.test(token)
  }


  // Validate Bot Token with Telegram API
  const validateBotTokenWithAPI = async (token: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${token}/getMe`,
        { timeout: 10000 }
      )
      return response.data.ok === true
    } catch (error) {
      return false
    }
  }


  // Validate Indian Phone Number
  const validateIndianPhone = (phone: string): boolean => {
    if (!phone) return false
    // Remove spaces and hyphens for validation
    const cleanPhone = phone.replace(/[\s-]/g, '')
    // Indian phone number regex: optional +91/91/0, then [6-9] followed by 9 digits
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/
    return phoneRegex.test(cleanPhone)
  }


  // Validate Email
  const validateEmail = (email: string): boolean => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }


  // Validate Operating Hours Format
  const validateHoursFormat = (hours: string): boolean => {
    if (!hours) return false
    if (hours.toLowerCase() === 'closed') return true
    // Format: HH:MM-HH:MM
    const hoursRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    return hoursRegex.test(hours)
  }


  // Effect to load data for edit mode
  useEffect(() => {
    if (!botId) return

    const fetchBusiness = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/business/${botId}`)
        const data = response.data

        setFormData({
          botToken: data.botToken,
          businessName: data.businessName,
          category: data.category,
          description: data.description || '',
          location: data.location || '',
          phone: data.phone || '',
          email: data.email || '',
          weekdayHours: data.operatingHours?.weekday || '09:00-21:00',
          weekendHours: data.operatingHours?.weekend || '10:00-18:00',
          language: data.language,
          voiceSpeaker: data.voiceSpeaker,
          botPersona: data.botPersona || '',
        })

        // Reset editing state
        setIsTokenEditable(false)

        // Mark validations as true for existing data

        // Mark validations as true for existing data
        setBotTokenValidation({ isValid: true, isValidating: false, message: 'Token already verified' })
        setPhoneValidation({ isValid: true, isValidating: false, message: '' })
        setEmailValidation({ isValid: true, isValidating: false, message: '' })

        // Fetch existing documents for this business
        try {
          const docsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/documents/${botId}`)
          setDocuments(docsResponse.data || [])
        } catch {
          // Docs fetch may fail if no collection exists yet — that's ok
          setDocuments([])
        }

        // Skip to step 2 directly
        setStep(2)
      } catch (error) {
        toast({
          title: 'Error loading agent',
          description: 'Could not fetch agent details',
          variant: 'destructive',
        })
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchBusiness()
  }, [botId])

  // Effect to validate bot token
  useEffect(() => {
    // Skip validation in edit mode if token is unchanged (not editable)
    if (botId && !isTokenEditable) return

    const validateToken = async () => {
      const token = formData.botToken.trim()


      if (!token) {
        setBotTokenValidation({
          isValid: false,
          isValidating: false,
          message: '',
        })
        return
      }


      // First check format
      if (!validateBotTokenFormat(token)) {
        setBotTokenValidation({
          isValid: false,
          isValidating: false,
          message: 'Invalid token format. Expected: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
        })
        return
      }


      // Then validate with API
      setBotTokenValidation({
        isValid: false,
        isValidating: true,
        message: 'Verifying token with Telegram...',
      })


      const isValid = await validateBotTokenWithAPI(token)


      setBotTokenValidation({
        isValid: isValid,
        isValidating: false,
        message: isValid ? 'Token verified successfully!' : 'Invalid token. Please check your token or generate a new one from @BotFather.',
      })
    }


    const debounceTimer = setTimeout(() => {
      validateToken()
    }, 800)


    return () => clearTimeout(debounceTimer)
  }, [formData.botToken])


  // Effect to validate phone number
  useEffect(() => {
    const phone = formData.phone.trim()


    if (!phone) {
      setPhoneValidation({
        isValid: false,
        isValidating: false,
        message: '',
      })
      return
    }


    const isValid = validateIndianPhone(phone)


    setPhoneValidation({
      isValid: isValid,
      isValidating: false,
      message: isValid ? 'Valid phone number' : 'Invalid format. Use: +919876543210 or 9876543210',
    })
  }, [formData.phone])


  // Effect to validate email
  useEffect(() => {
    const email = formData.email.trim()


    if (!email) {
      setEmailValidation({
        isValid: false,
        isValidating: false,
        message: '',
      })
      return
    }


    const isValid = validateEmail(email)


    setEmailValidation({
      isValid: isValid,
      isValidating: false,
      message: isValid ? 'Valid email' : 'Invalid email format',
    })
  }, [formData.email])


  const handleNext = () => {
    // Step 1: Bot Token Validation
    if (step === 1) {
      if (!formData.botToken) {
        toast({
          title: 'Bot token required',
          description: 'Please enter your Telegram bot token',
          variant: 'destructive',
        })
        return
      }


      if (!validateBotTokenFormat(formData.botToken)) {
        toast({
          title: 'Invalid token format',
          description: 'Bot token must be in format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
          variant: 'destructive',
        })
        return
      }


      if (botTokenValidation.isValidating) {
        toast({
          title: 'Validation in progress',
          description: 'Please wait while we verify your bot token',
          variant: 'default',
        })
        return
      }


      if (!botTokenValidation.isValid) {
        toast({
          title: 'Invalid bot token',
          description: 'The bot token could not be verified with Telegram. Please check and try again.',
          variant: 'destructive',
        })
        return
      }
    }


    // Step 2: Business Details Validation
    if (step === 2) {
      if (!formData.businessName || !formData.category) {
        toast({
          title: 'Business details required',
          description: 'Please fill in business name and category',
          variant: 'destructive',
        })
        return
      }


      if (formData.businessName.length < 2) {
        toast({
          title: 'Invalid business name',
          description: 'Business name must be at least 2 characters',
          variant: 'destructive',
        })
        return
      }


      if (formData.phone && !phoneValidation.isValid) {
        toast({
          title: 'Invalid phone number',
          description: 'Please enter a valid Indian phone number',
          variant: 'destructive',
        })
        return
      }


      if (formData.email && !emailValidation.isValid) {
        toast({
          title: 'Invalid email',
          description: 'Please enter a valid email address',
          variant: 'destructive',
        })
        return
      }


      if (formData.location && formData.location.length < 2) {
        toast({
          title: 'Invalid location',
          description: 'Location must be at least 2 characters',
          variant: 'destructive',
        })
        return
      }
    }


    // Step 3: Operating Hours Validation
    if (step === 3) {
      if (!validateHoursFormat(formData.weekdayHours)) {
        toast({
          title: 'Invalid weekday hours',
          description: 'Use format HH:MM-HH:MM (e.g., 09:00-18:00) or "Closed"',
          variant: 'destructive',
        })
        return
      }


      if (!validateHoursFormat(formData.weekendHours)) {
        toast({
          title: 'Invalid weekend hours',
          description: 'Use format HH:MM-HH:MM (e.g., 10:00-16:00) or "Closed"',
          variant: 'destructive',
        })
        return
      }
    }


    if (step < totalSteps) {
      setStep(step + 1)
    }
  }


  const handleBack = () => {
    if (step === 1) {
      navigate(-1)
    } else {
      setStep(step - 1)
    }
  }


  const handleSubmit = async () => {
    // Final validation before submit
    if (!botTokenValidation.isValid) {
      toast({
        title: 'Invalid bot token',
        description: 'Please provide a valid bot token before submitting',
        variant: 'destructive',
      })
      return
    }


    if (formData.phone && !phoneValidation.isValid) {
      toast({
        title: 'Invalid phone number',
        description: 'Please provide a valid Indian phone number',
        variant: 'destructive',
      })
      return
    }


    if (!formData.language) {
      toast({
        title: 'Language required',
        description: 'Please select a language for your agent',
        variant: 'destructive',
      })
      return
    }


    if (!formData.botPersona || formData.botPersona.length < 10) {
      toast({
        title: 'Bot persona required',
        description: 'Please provide a more detailed bot persona (at least 10 characters)',
        variant: 'destructive',
      })
      return
    }


    setLoading(true)

    try {
      if (botId) {
        // Update existing business
        const payload = {
          business_name: formData.businessName.trim(),
          category: formData.category,
          description: formData.description.trim(),
          language: formData.language,
          voice_speaker: formData.voiceSpeaker,
          bot_persona: formData.botPersona.trim(),
          operating_hours: {
            weekday: formData.weekdayHours.trim(),
            weekend: formData.weekendHours.trim(),
          },
          location: formData.location.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          webhook_enabled: true // Keep webhook enabled on update
        }

        await axios.put(`${import.meta.env.VITE_API_URL}/api/business/${botId}`, payload)

        toast({
          title: 'Agent Updated',
          description: 'Your changes have been saved.',
        })
      } else {
        // Create new business
        const payload = {
          user_id: user?.id,
          bot_token: formData.botToken.trim(),
          business_name: formData.businessName.trim(),
          category: formData.category,
          description: formData.description.trim(),
          language: formData.language,
          voice_speaker: formData.voiceSpeaker,
          bot_persona: formData.botPersona.trim(),
          operating_hours: {
            weekday: formData.weekdayHours.trim(),
            weekend: formData.weekendHours.trim(),
          },
          location: formData.location.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/business/`, payload)
        const newBotId = response.data.id

        // Upload draft documents if any
        if (documents.length > 0) {
          try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/add_documents`,
              documents.map(d => ({ business_id: newBotId, text: d.text }))
            )
          } catch (docError) {
            console.error('Failed to upload draft documents:', docError)
            // We don't block success, just log it. User can add them later.
          }
        }

        toast({
          title: 'Setup Complete',
          description: 'Your voice agent is now active.',
        })
      }

      navigate('/dashboard')
    } catch (error) {
      const err = error as AxiosError<{ detail?: string }>
      toast({
        title: botId ? 'Update Failed' : 'Setup Failed',
        description: err.response?.data?.detail ?? (botId ? 'Could not update agent' : 'Could not create business agent'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }


  const stepVariants = {
    hidden: { x: 10, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'tween', duration: 0.3 } },
    exit: { x: -10, opacity: 0, transition: { duration: 0.2 } },
  } as any


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="mb-4">
            <Logo className="h-12" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{botId ? 'Edit Your Agent' : 'Configure Your Agent'}</h1>
          <p className="text-muted-foreground text-sm">
            Step {step} of {totalSteps}
          </p>
        </div>


        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto mb-8">
          <Progress value={progress} className="h-1" />
        </div>


        {/* Main Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm md:p-2">
          <CardHeader className="md:px-8 md:pt-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="text-xl font-medium flex items-center gap-2">
                      {step === 1 && 'Connect Telegram'}
                      {step === 2 && 'Business Profile'}
                      {step === 3 && 'Operating Hours'}
                      {step === 4 && 'Agent Persona'}
                      {step === 5 && 'Knowledge Base'}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm">
                      {step === 1 && 'Link your Telegram bot to enable voice capabilities'}
                      {step === 2 && 'Basic information about your business entity'}
                      {step === 3 && 'Define when your agent should be active'}
                      {step === 4 && 'Customize the personality and language'}
                      {step === 5 && 'Add FAQs and documents for your agent'}
                    </CardDescription>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 border border-border">
                {step === 1 && <Sparkles className="h-5 w-5 text-muted-foreground" />}
                {step === 2 && <Building2 className="h-5 w-5 text-muted-foreground" />}
                {step === 3 && <Clock className="h-5 w-5 text-muted-foreground" />}
                {step === 4 && <Bot className="h-5 w-5 text-muted-foreground" />}
                {step === 5 && <FileText className="h-5 w-5 text-muted-foreground" />}
              </div>
            </div>
          </CardHeader>


          <CardContent className="md:px-8 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="bg-secondary/30 p-4 rounded-md border border-border/50">
                      <h3 className="font-medium text-sm flex items-center gap-2 mb-2 text-foreground">
                        Quick Setup Guide
                      </h3>
                      <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                        <li>
                          Open Telegram and start chat with{' '}
                          <strong className="text-foreground">@BotFather</strong>
                        </li>
                        <li>
                          Send the command{' '}
                          <code className="bg-secondary px-1 py-0.5 rounded text-xs">/newbot</code>
                        </li>
                        <li>Copy the API Token and paste it below</li>
                      </ol>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="botToken">Telegram Bot Token *</Label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="botToken"
                            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                            value={formData.botToken}
                            onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                            className={`font-mono text-sm bg-background/50 pr-10 ${formData.botToken &&
                              !botTokenValidation.isValidating &&
                              (botTokenValidation.isValid
                                ? 'border-green-500 focus-visible:ring-green-500'
                                : 'border-red-500 focus-visible:ring-red-500')
                              }`}
                            autoComplete="off"
                            disabled={!!botId && !isTokenEditable}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {botTokenValidation.isValidating && (
                              <LoaderIcon className="w-4 h-4 animate-spin text-muted-foreground" />
                            )}
                            {!botTokenValidation.isValidating && formData.botToken && (
                              <>
                                {botTokenValidation.isValid ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {botId && !isTokenEditable && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm("Changing the bot token will require re-linking your Telegram bot and may interrupt current service. Are you sure?")) {
                                setIsTokenEditable(true)
                                setFormData(prev => ({ ...prev, botToken: '' }))
                              }
                            }}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                      {botTokenValidation.message && (
                        <p
                          className={`text-xs ${botTokenValidation.isValid ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          {botTokenValidation.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Token format: 8-10 digits, colon, then 35 alphanumeric characters
                      </p>
                    </div>
                  </div>
                )}


                {step === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="Acme Corp"
                          value={formData.businessName}
                          onChange={(e) =>
                            setFormData({ ...formData, businessName: e.target.value })
                          }
                          className="bg-background/50"
                          maxLength={100}
                        />
                        {formData.businessName && formData.businessName.length < 2 && (
                          <p className="text-xs text-red-600">Minimum 2 characters required</p>
                        )}
                      </div>


                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="description">Short Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Briefly describe what your business does..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="bg-background/50 resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.description.length}/500 characters
                      </p>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location (City)</Label>
                        <Input
                          id="location"
                          placeholder="Mumbai"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="bg-background/50"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            placeholder="+919876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`bg-background/50 pr-10 ${formData.phone &&
                              (phoneValidation.isValid
                                ? 'border-green-500 focus-visible:ring-green-500'
                                : 'border-red-500 focus-visible:ring-red-500')
                              }`}
                            maxLength={15}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {formData.phone && (
                              <>
                                {phoneValidation.isValid ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {phoneValidation.message && (
                          <p
                            className={`text-xs ${phoneValidation.isValid ? 'text-green-600' : 'text-red-600'
                              }`}
                          >
                            {phoneValidation.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Indian format: +919876543210 (starts with 6-9)
                        </p>
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="business@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`bg-background/50 pr-10 ${formData.email &&
                            (emailValidation.isValid
                              ? 'border-green-500 focus-visible:ring-green-500'
                              : 'border-red-500 focus-visible:ring-red-500')
                            }`}
                          maxLength={100}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {formData.email && (
                            <>
                              {emailValidation.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {emailValidation.message && !emailValidation.isValid && (
                        <p className="text-xs text-red-600">{emailValidation.message}</p>
                      )}
                    </div>
                  </div>
                )}


                {step === 3 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="weekdayHours">Weekdays (Mon-Fri) *</Label>
                        <Input
                          id="weekdayHours"
                          placeholder="09:00-18:00"
                          value={formData.weekdayHours}
                          onChange={(e) =>
                            setFormData({ ...formData, weekdayHours: e.target.value })
                          }
                          className={`bg-background/50 ${formData.weekdayHours &&
                            !validateHoursFormat(formData.weekdayHours) &&
                            'border-red-500'
                            }`}
                        />
                        {formData.weekdayHours && !validateHoursFormat(formData.weekdayHours) && (
                          <p className="text-xs text-red-600">
                            Invalid format. Use HH:MM-HH:MM or "Closed"
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weekendHours">Weekends (Sat-Sun) *</Label>
                        <Input
                          id="weekendHours"
                          placeholder="10:00-16:00 or Closed"
                          value={formData.weekendHours}
                          onChange={(e) =>
                            setFormData({ ...formData, weekendHours: e.target.value })
                          }
                          className={`bg-background/50 ${formData.weekendHours &&
                            !validateHoursFormat(formData.weekendHours) &&
                            'border-red-500'
                            }`}
                        />
                        {formData.weekendHours && !validateHoursFormat(formData.weekendHours) && (
                          <p className="text-xs text-red-600">
                            Invalid format. Use HH:MM-HH:MM or "Closed"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-md border border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <strong>Format:</strong> Use 24-hour format (HH:MM-HH:MM). Examples: "09:00-18:00",
                        "10:30-22:00". Set to "Closed" if not applicable.
                      </p>
                    </div>
                  </div>
                )}


                {step === 4 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="language">Primary Agent Language *</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="voiceSpeaker">Voice Speaker *</Label>
                        <Select
                          value={formData.voiceSpeaker}
                          onValueChange={(value) => setFormData({ ...formData, voiceSpeaker: value })}
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VOICE_SPEAKERS.map((speaker) => (
                              <SelectItem key={speaker.id} value={speaker.id}>
                                {speaker.name} — {speaker.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose the voice for your agent's responses
                        </p>
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="botPersona">System Prompt / Persona *</Label>
                      <Textarea
                        id="botPersona"
                        placeholder="You are a helpful assistant for..."
                        value={formData.botPersona}
                        onChange={(e) => setFormData({ ...formData, botPersona: e.target.value })}
                        rows={5}
                        className="bg-background/50"
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          Define the agent's tone, style, and constraints
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.botPersona.length}/1000
                        </p>
                      </div>
                      {formData.botPersona && formData.botPersona.length < 10 && (
                        <p className="text-xs text-red-600">
                          Please provide at least 10 characters
                        </p>
                      )}
                    </div>
                  </div>
                )}


                {step === 5 && (
                  <div className="space-y-5">
                    <div className="bg-secondary/30 p-3 rounded-md border border-border/50 mb-4">
                      <p className="text-xs text-muted-foreground">
                        <strong>Knowledge Base:</strong> Add FAQs and information that your agent can use to answer customer queries.
                        Each entry will be stored as a searchable document.
                      </p>
                    </div>

                    {/* Existing Documents */}
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <Label>Existing Documents ({documents.length})</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-start gap-2 bg-background/50 border border-border/50 rounded-md p-3"
                            >
                              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm flex-1 break-words">{doc.text}</p>
                              <button
                                type="button"
                                onClick={async () => {
                                  // Remove doc from list (Note: Qdrant delete requires separate endpoint)
                                  setDocuments(documents.filter((d) => d.id !== doc.id))
                                }}
                                className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {documents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents yet. Add some knowledge below.</p>
                      </div>
                    )}

                    {/* Add New Document */}
                    <div className="space-y-2">
                      <Label>Add New Entry</Label>
                      <Textarea
                        placeholder="e.g. Our salon offers haircuts starting at ₹200, hair coloring from ₹500..."
                        value={newDocText}
                        onChange={(e) => setNewDocText(e.target.value)}
                        rows={3}
                        className="bg-background/50"
                        maxLength={2000}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {newDocText.length}/2000
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!newDocText.trim() || docsLoading}
                          onClick={async () => {
                            if (!newDocText.trim()) return

                            // If no botId (Create Mode), add to local state
                            if (!botId) {
                              const newDoc = { id: Date.now().toString(), text: newDocText.trim() }
                              setDocuments([...documents, newDoc])
                              setNewDocText('')
                              toast({
                                title: 'Added to draft',
                                description: 'Document will be saved when you launch the agent.',
                              })
                              return
                            }

                            setDocsLoading(true)
                            try {
                              await axios.post(`${import.meta.env.VITE_API_URL}/api/add_documents`, [
                                { business_id: botId, text: newDocText.trim() }
                              ])
                              // Refresh documents list
                              const docsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/documents/${botId}`)
                              setDocuments(docsResponse.data || [])
                              setNewDocText('')
                              toast({
                                title: 'Document added',
                                description: 'Knowledge base entry saved successfully.',
                              })
                            } catch {
                              toast({
                                title: 'Error',
                                description: 'Failed to add document. Please try again.',
                                variant: 'destructive',
                              })
                            } finally {
                              setDocsLoading(false)
                            }
                          }}
                        >
                          {docsLoading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                          Add Entry
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>


            {/* Actions */}
            <div className="flex justify-between pt-8 border-t border-border/40 mt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>


              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    loading ||
                    (step === 1 &&
                      (botTokenValidation.isValidating || !botTokenValidation.isValid))
                  }
                  className="px-8 transition-all active:scale-95"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Agent'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
