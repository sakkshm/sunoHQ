import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, MessageSquare, User, Bot, Clock } from 'lucide-react'
import axios from "axios";

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface Conversation {
    id: string
    customerId: string
    customerName?: string
    lastActivity: string
    messages: Message[]
}

export default function ChatHistoryPage() {
    const { botId } = useParams()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (botId) {
            fetchChats()
        }
    }, [botId])

    const fetchChats = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/chats/${botId}`
            )
            setConversations(response.data)
            if (response.data.length > 0) {
                setSelectedChatId(response.data[0].id)
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectedConversation = conversations.find(c => c.id === selectedChatId)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <header className="bg-background border-b border-border/40 p-4 flex items-center gap-4 sticky top-0 z-10 backdrop-blur-md">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Chat History</h1>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar List */}
                <div className="w-80 border-r border-border/40 overflow-y-auto bg-secondary/10">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/20">
                            {conversations.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`w-full text-left p-4 hover:bg-secondary/30 transition-colors ${selectedChatId === chat.id ? 'bg-secondary/50 border-l-4 border-primary' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium truncate block max-w-[120px]">
                                            {chat.customerName || `User ${chat.customerId.slice(-4)}`}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(chat.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {chat.messages.length > 0
                                            ? chat.messages[chat.messages.length - 1].content
                                            : 'No messages'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-secondary/5">
                    {selectedConversation ? (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-full">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">{selectedConversation.customerName || 'Unknown User'}</h2>
                                        <p className="text-xs text-muted-foreground">ID: {selectedConversation.customerId}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Last active: {new Date(selectedConversation.lastActivity).toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedConversation.messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-card border border-border/50 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a conversation to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
