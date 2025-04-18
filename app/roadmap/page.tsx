import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 py-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 bg-purple-600 rounded-lg p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold neon-text-purple">
              EduSphere AI
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/features"
              className="hover:neon-text-purple transition-all"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:neon-text-purple transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hover:neon-text-purple transition-all"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="hover:neon-text-purple transition-all"
            >
              Contact
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-primary hover:neon-border-purple transition-all"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/80">
                Sign Up
              </Button>
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
              <h1 className="text-5xl font-bold mb-6 neon-text-purple">
                Product Roadmap
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Explore our vision for the future of EduSphere AI and see what
                exciting features are coming next.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Current Quarter */}
              <div className="mb-16">
                <div className="flex items-center mb-6">
                  <Badge className="bg-green-600 text-white">
                    Current Quarter
                  </Badge>
                  <h2 className="text-2xl font-bold ml-4">Q2 2023</h2>
                </div>

                <div className="relative pl-8 border-l border-gray-800">
                  <div className="mb-12">
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-green-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-green">
                      Enhanced AI Lab
                    </h3>
                    <p className="text-gray-300 mb-4">
                      We're expanding our AI Lab with more powerful features and
                      integrations.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Improved AI chat with context awareness and memory
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Advanced study plan generation with customizable
                          parameters
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Enhanced flashcard system with spaced repetition
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Integration with more AI models and providers
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-12">
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-green-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-green">
                      Calendar Improvements
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Making our calendar integration more powerful and
                      user-friendly.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Enhanced calendar import with better parsing of events
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>AI-powered scheduling suggestions</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Two-way sync with Google Calendar and Outlook
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Smart notifications for upcoming events and deadlines
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-blue">
                      Mobile App Beta
                    </h3>
                    <p className="text-gray-300 mb-4">
                      We're launching a beta version of our mobile app for iOS
                      and Android.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Core features available on mobile</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Cross-device sync</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Push notifications</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Offline mode for flashcards and study resources
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Next Quarter */}
              <div className="mb-16">
                <div className="flex items-center mb-6">
                  <Badge className="bg-blue-600 text-white">Next Quarter</Badge>
                  <h2 className="text-2xl font-bold ml-4">Q3 2023</h2>
                </div>

                <div className="relative pl-8 border-l border-gray-800">
                  <div className="mb-12">
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-blue">
                      Collaboration Features
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Enabling students to collaborate and study together more
                      effectively.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Study groups with shared resources</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Real-time collaborative note-taking</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Shared flashcard sets</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Group study sessions with AI assistance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-12">
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-blue">
                      Advanced Analytics
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Providing deeper insights into your learning patterns and
                      progress.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Detailed learning analytics dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Progress tracking across subjects</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>AI-powered learning recommendations</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Study habit analysis and optimization</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-blue">
                      Content Library
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Building a comprehensive library of educational content
                      and resources.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Curated educational resources by subject</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Community-contributed study guides and notes
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Integration with open educational resources</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Future */}
              <div>
                <div className="flex items-center mb-6">
                  <Badge className="bg-purple-600 text-white">Future</Badge>
                  <h2 className="text-2xl font-bold ml-4">
                    Q4 2023 and Beyond
                  </h2>
                </div>

                <div className="relative pl-8 border-l border-gray-800">
                  <div className="mb-12">
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-purple-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-purple">
                      AI Tutor
                    </h3>
                    <p className="text-gray-300 mb-4">
                      A personalized AI tutor that adapts to your learning style
                      and needs.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Personalized learning paths</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Adaptive questioning and feedback</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Voice-based interactions</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Real-time problem-solving assistance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-12">
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-purple-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-purple">
                      AR/VR Learning Experiences
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Immersive learning experiences using augmented and virtual
                      reality.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          3D models and visualizations for complex concepts
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Virtual labs for science subjects</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Historical and geographical immersive experiences
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          VR study rooms for distraction-free learning
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="absolute -left-3 mt-1.5">
                      <div className="bg-purple-600 h-6 w-6 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 neon-text-purple">
                      Institution Partnerships
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Partnering with educational institutions to provide
                      integrated learning experiences.
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Integration with learning management systems
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Custom solutions for schools and universities
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Teacher dashboards and analytics</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Curriculum-aligned content and resources</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Input Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 neon-text-purple">
                Help Shape Our Future
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                We value your input! Our roadmap is constantly evolving based on
                user feedback and needs.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/80">
                  Share Your Ideas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black/80 border-t border-purple-900/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div>
              <a
                href="/"
                className="flex items-center gap-2 mb-4"
                aria-label="EduSphere AI Home"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                  EduSphere AI
                </span>
              </a>
              <p className="text-gray-400 mb-4">
                Empowering students with AI-powered learning tools and
                productivity solutions.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=100011003917426"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Facebook */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Twitter */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://github.com/MeeksonJr"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* GitHub */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/mohamed-datt-b60907296"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* LinkedIn */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/about"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/documentation"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/support"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="/roadmap"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Roadmap
                  </a>
                </li>
                <li>
                  <a
                    href="/features"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/terms"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/cookies"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/licenses"
                    className="text-gray-400 hover:text-purple-400 transition"
                  >
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="border-t border-purple-900/50 mt-12 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} EduSphere AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
