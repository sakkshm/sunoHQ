import { useState } from "react" // Added React and useState
import { TopographyBackground } from "@/components/ui/TopographyBackground"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    Zap,
    BarChart3,
    Globe,
    Headphones,
} from "lucide-react"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

// 1. Data Structure for the Features
const FEATURES = [
    {
        id: "01",
        title: "Multilingual Voice AI",
        description: "Break language barriers with agents that speak Hindi, Tamil, and 9+ Indian dialects with natural inflection.",
        icon: Headphones,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        id: "02",
        title: "No-Code Persona Builder",
        description: "Design your agent's personality and knowledge base in minutes. No API keys, no code, just results.",
        icon: Zap,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10"
    },
    {
        id: "03",
        title: "Omnichannel Sync",
        description: "Start on Telegram today. Scale to WhatsApp and Direct Calls with a single toggle as your business grows.",
        icon: Globe,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        id: "04",
        title: "Sentiment Analytics",
        description: "Don't just read logs. Understand customer frustration or delight through AI-powered sentiment tracking.",
        icon: BarChart3,
        color: "text-green-400",
        bg: "bg-green-500/10"
    }
];

export default function LandingPage() {
    const navigate = useNavigate()

    // 2. Added the missing state hooks here
    const [activeFeature, setActiveFeature] = useState(0)

    return (
        <TopographyBackground
            lineColor="rgba(255, 255, 255, 0.15)"
            backgroundColor="#020817"
            lineCount={30}
            speed={0.3}
        >
            <div className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden pt-20">

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/10 bg-[#0a0a0f]/50">
                    <div className="text-2xl font-bold text-white tracking-tighter">SunoHQ</div>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:text-white hover:bg-white/10"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
                            onClick={() => navigate('/login')}
                        >
                            Get Started
                        </Button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 pt-16 text-center text-white">
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />

                    <h1 className="mb-6 text-5xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        SunoHQ
                    </h1>
                    <p className="max-w-[800px] text-lg text-gray-400 sm:text-xl md:text-2xl leading-relaxed mb-10">
                        The no-code platform for small businesses to build AI voice agents. Automate customer support on Telegram today — WhatsApp and Calls coming soon.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row mb-16">
                        <Button
                            size="lg"
                            onClick={() => navigate('/login')}
                            className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
                        >
                            Start for Free
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
                        >
                            Learn More
                        </Button>
                    </div>
                </section>

                {/* --- UNIQUE FEATURES SECTION --- */}
                <section className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* Left Side: Sticky Info */}
                        <div className="lg:sticky lg:top-40 space-y-8">
                            <div>
                                <h2 className="text-sm font-bold tracking-widest text-purple-500 uppercase mb-4">
                                    Capabilities
                                </h2>
                                <h3 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                                    The future of <br />
                                    <span className="text-white/40">customer connection.</span>
                                </h3>
                            </div>

                            <div className="flex flex-col gap-2">
                                {FEATURES.map((f, idx) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setActiveFeature(idx)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border-l-2 text-left",
                                            activeFeature === idx
                                                ? "bg-white/10 border-purple-500 translate-x-2"
                                                : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <span className="text-xs font-mono opacity-50">{f.id}</span>
                                        <span className="font-semibold text-white">{f.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Interactive Display */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                            <div className="relative bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center">
                                {/* Decorative Voice Wave Animation */}
                                <div className="flex gap-1 mb-8 items-end h-12">
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-purple-500/40 rounded-full animate-pulse"
                                            style={{
                                                height: `${20 + Math.random() * 80}%`,
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className={cn("mb-6 p-4 rounded-2xl w-fit", FEATURES[activeFeature].bg)}>
                                    {/* We assign the component to a capitalized variable name (Icon) 
                                    so React treats it as a component rather than a string.
                                    */}
                                    {(() => {
                                        const Icon = FEATURES[activeFeature].icon;
                                        return <Icon className={cn("w-8 h-8", FEATURES[activeFeature].color)} />;
                                    })()}
                                </div>

                                <h4 className="text-3xl font-bold text-white mb-4 transition-all duration-500">
                                    {FEATURES[activeFeature].title}
                                </h4>
                                <p className="text-gray-400 text-xl leading-relaxed">
                                    {FEATURES[activeFeature].description}
                                </p>

                                <div className="mt-10 pt-10 border-t border-white/5">
                                    <Button variant="link" className="text-purple-400 p-0 h-auto text-lg hover:text-purple-300">
                                        Explore documentation →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 px-4 max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4 sm:text-5xl">Frequently Asked Questions</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <FaqItem
                            value="item-1"
                            question="Do I need coding skills to use SunoHQ?"
                            answer="Not at all! Our platform is designed for non-technical users. You can set up your AI agent in minutes using our simple dashboard."
                        />
                        <FaqItem
                            value="item-2"
                            question="Which platforms do you support?"
                            answer="Currently, we support Telegram for text and voice interactions. We are actively working on WhatsApp and phone call integrations, which will be available soon."
                        />
                        <FaqItem
                            value="item-3"
                            question="Can the agent speak Indian languages?"
                            answer="Yes! Our agents are optimized for Indian languages including Hindi, Tamil, Telugu, and more, ensuring natural conversations with your customers."
                        />
                        <FaqItem
                            value="item-4"
                            question="Is there a free trial?"
                            answer="Yes, you can start building and testing your agent for free. Upgrade only when you're ready to scale your customer interactions."
                        />
                    </Accordion>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 py-12 px-4 bg-black/40 backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">SunoHQ</span>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                        </div>
                        <div className="text-sm text-gray-500">
                            © {new Date().getFullYear()} SunoHQ. All rights reserved.
                        </div>
                    </div>
                </footer>

            </div>
        </TopographyBackground>
    )
}

function FaqItem({ value, question, answer }: { value: string, question: string, answer: string }) {
    return (
        <AccordionItem value={value} className="border border-white/10 rounded-lg px-4 bg-white/5 data-[state=open]:bg-white/10 transition-all">
            <AccordionTrigger className="text-white hover:no-underline text-lg font-medium text-left">
                {question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 text-base leading-relaxed pb-4">
                {answer}
            </AccordionContent>
        </AccordionItem>
    )
}