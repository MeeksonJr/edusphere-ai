import Link from "next/link"
import { ArrowRight, Book, Code, FileText, Github, Twitter } from "lucide-react"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">EduSphere AI</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/documentation" className="text-purple-500 font-medium">
                Documentation
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-gray-400 mb-12">
            Learn how to get the most out of EduSphere AI with our comprehensive documentation.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-purple-500 transition-colors">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold">Getting Started</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Learn the basics of EduSphere AI and how to set up your account for success.
              </p>
              <Link
                href="/documentation/getting-started"
                className="flex items-center text-purple-500 hover:text-purple-400"
              >
                Read guide <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-purple-500 transition-colors">
              <div className="flex items-center mb-4">
                <Code className="h-6 w-6 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold">API Reference</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Explore our API documentation to integrate EduSphere AI with your existing tools.
              </p>
              <Link href="/documentation/api" className="flex items-center text-purple-500 hover:text-purple-400">
                View reference <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">Core Features</h2>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-3">Calendar Integration</h3>
                  <p className="text-gray-400">
                    Learn how to import your academic calendars from Google Calendar, Outlook, or iCal.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-3">AI Assistant</h3>
                  <p className="text-gray-400">
                    Discover how our AI can help you with assignments, study guides, and more.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-3">Flashcards & Study Resources</h3>
                  <p className="text-gray-400">
                    Master the art of creating effective flashcards and study resources with our AI tools.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-3">How do I upgrade my subscription?</h3>
                  <p className="text-gray-400">
                    Visit your account settings and select the "Subscription" tab to view available plans and upgrade
                    options.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-3">Is my data secure?</h3>
                  <p className="text-gray-400">
                    Yes, we use industry-standard encryption and security practices to protect your data. Learn more in
                    our Privacy Policy.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-3">Can I use EduSphere AI offline?</h3>
                  <p className="text-gray-400">
                    Some features are available offline, but AI-powered features require an internet connection.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-gray-400 hover:text-white transition-colors">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/documentation" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Book className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold">EduSphere AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} EduSphere AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
