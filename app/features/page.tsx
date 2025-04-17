import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Calendar,
  BrainCircuit,
  BookOpen,
  Lightbulb,
  Zap,
  Clock,
  BarChart,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 py-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 bg-purple-600 rounded-lg p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold neon-text-purple">EduSphere AI</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/features" className="hover:neon-text-purple transition-all">
              Features
            </Link>
            <Link href="/pricing" className="hover:neon-text-purple transition-all">
              Pricing
            </Link>
            <Link href="/blog" className="hover:neon-text-purple transition-all">
              Blog
            </Link>
            <Link href="/contact" className="hover:neon-text-purple transition-all">
              Contact
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-primary hover:neon-border-purple transition-all">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/80">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 neon-text-purple">Powerful Features</h1>
              <p className="text-xl text-gray-300 mb-8">
                Discover how EduSphere AI transforms your learning experience with cutting-edge AI technology.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="#calendar">
                  <Button variant="outline" className="border-gray-700">
                    <Calendar className="mr-2 h-4 w-4" /> Calendar
                  </Button>
                </Link>
                <Link href="#ai-lab">
                  <Button variant="outline" className="border-gray-700">
                    <BrainCircuit className="mr-2 h-4 w-4" /> AI Lab
                  </Button>
                </Link>
                <Link href="#assignments">
                  <Button variant="outline" className="border-gray-700">
                    <BookOpen className="mr-2 h-4 w-4" /> Assignments
                  </Button>
                </Link>
                <Link href="#flashcards">
                  <Button variant="outline" className="border-gray-700">
                    <Lightbulb className="mr-2 h-4 w-4" /> Flashcards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Integration */}
        <section id="calendar" className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-purple-900/30 text-purple-300 border-purple-700/50">Smart Calendar</Badge>
                <h2 className="text-3xl font-bold mb-6 neon-text-purple">Calendar Integration</h2>
                <p className="text-gray-300 mb-6">
                  Seamlessly import your academic calendar from Google Calendar, Outlook, or iCal. Our AI automatically
                  analyzes your schedule and helps you stay on top of your assignments and deadlines.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Smart Import:</span> Automatically parse assignments, due dates, and
                      classes from your existing calendars
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">AI Analysis:</span> Get AI-powered insights about your schedule,
                      workload, and optimal study times
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Priority Suggestions:</span> AI automatically suggests priority
                      levels for assignments based on deadlines and complexity
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Customizable Views:</span> Switch between day, week, and month views
                      to plan your study schedule effectively
                    </span>
                  </li>
                </ul>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Calendar Integration"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* AI Lab */}
        <section id="ai-lab" className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 glass-card p-6 rounded-lg">
                <img src="/placeholder.svg?height=400&width=600" alt="AI Lab" className="rounded-lg w-full" />
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-blue-900/30 text-blue-300 border-blue-700/50">AI-Powered</Badge>
                <h2 className="text-3xl font-bold mb-6 neon-text-blue">AI Lab</h2>
                <p className="text-gray-300 mb-6">
                  Leverage the power of AI to enhance your learning experience. Our AI Lab provides a suite of tools to
                  help you understand complex concepts, generate study materials, and get instant answers to your
                  questions.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">AI Chat:</span> Ask questions and get detailed explanations on any
                      subject or topic
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Text Summarizer:</span> Quickly summarize long articles, research
                      papers, or textbook chapters
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Study Plan Generator:</span> Create personalized study plans for any
                      subject or topic
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Flashcard Generator:</span> Automatically generate flashcards to
                      help with memorization and quick review
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Assignments */}
        <section id="assignments" className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-green-900/30 text-green-300 border-green-700/50">Task Management</Badge>
                <h2 className="text-3xl font-bold mb-6 neon-text-green">Assignment Management</h2>
                <p className="text-gray-300 mb-6">
                  Stay on top of your assignments with our comprehensive assignment management system. Track progress,
                  set priorities, and get AI-powered suggestions on how to approach each task.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">AI Approach Suggestions:</span> Get personalized suggestions on how
                      to tackle each assignment
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Priority Management:</span> Set and adjust priorities to focus on
                      what matters most
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Progress Tracking:</span> Monitor your progress and completion
                      status for each assignment
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Deadline Reminders:</span> Get smart notifications about upcoming
                      deadlines
                    </span>
                  </li>
                </ul>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Assignment Management"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Flashcards */}
        <section id="flashcards" className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 glass-card p-6 rounded-lg">
                <img src="/placeholder.svg?height=400&width=600" alt="Flashcards" className="rounded-lg w-full" />
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-pink-900/30 text-pink-300 border-pink-700/50">Memory Enhancement</Badge>
                <h2 className="text-3xl font-bold mb-6 neon-text-pink">Flashcards</h2>
                <p className="text-gray-300 mb-6">
                  Boost your memory and retention with our AI-powered flashcard system. Create, study, and master
                  flashcards for any subject with the help of our intelligent algorithms.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">AI Generation:</span> Automatically generate flashcards for any
                      topic with our AI
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Detailed Explanations:</span> Get AI-powered explanations for
                      complex flashcard answers
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Spaced Repetition:</span> Optimize your learning with our spaced
                      repetition algorithm
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Custom Organization:</span> Organize flashcards by subject, topic,
                      or difficulty
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 neon-text-purple">More Powerful Features</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                EduSphere AI is packed with features designed to enhance your learning experience and boost your
                academic performance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <Zap className="h-8 w-8 text-yellow-400 mb-2" />
                  <CardTitle>AI-Powered Resources</CardTitle>
                  <CardDescription>Create and manage study resources with AI assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Generate comprehensive study guides, notes, and resources for any subject with the help of our
                    advanced AI. Save, organize, and access your resources anytime, anywhere.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <Clock className="h-8 w-8 text-blue-400 mb-2" />
                  <CardTitle>Time Management</CardTitle>
                  <CardDescription>Optimize your study schedule for maximum efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Our AI analyzes your schedule, assignments, and study habits to suggest optimal study times and
                    breaks. Improve your productivity and reduce burnout with smart time management.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <BarChart className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle>Progress Analytics</CardTitle>
                  <CardDescription>Track your academic progress with detailed insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Monitor your progress across subjects, assignments, and study sessions with our comprehensive
                    analytics. Identify strengths, weaknesses, and areas for improvement.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <Users className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle>Collaboration Tools</CardTitle>
                  <CardDescription>Study together with peers and share resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Collaborate with classmates on assignments, share study resources, and form study groups. Our
                    platform makes it easy to work together and learn from each other.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <Shield className="h-8 w-8 text-red-400 mb-2" />
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Your data is protected with enterprise-grade security</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    We take your privacy seriously. Your data is encrypted and protected with enterprise-grade security
                    measures. You have full control over your data and how it's used.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-pink-400 mb-2" />
                  <CardTitle>Personalization</CardTitle>
                  <CardDescription>Customize your experience to match your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Tailor EduSphere AI to your unique needs and preferences. Customize themes, notification settings,
                    and AI behavior to create your ideal learning environment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 neon-text-purple">Ready to Transform Your Learning?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of students who are already using EduSphere AI to boost their academic performance and
                make learning more efficient.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/80 w-full sm:w-auto">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-gray-700 w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-2 bg-purple-600 rounded-lg p-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold neon-text-purple">EduSphere AI</h3>
              </div>
              <p className="text-gray-400 mb-4">Revolutionizing student productivity with AI-powered tools.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="hover:text-white">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
