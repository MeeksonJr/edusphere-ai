import Link from "next/link"

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-900/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              EduSphere AI
            </span>
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="/" className="hover:text-purple-400 transition-colors">
              Home
            </a>
            <a href="/careers" className="text-purple-400 transition-colors">
              Careers
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            Application Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for applying to join the EduSphere AI team. We've received your application and will review it
            shortly.
          </p>
          <p className="text-gray-400 mb-12">
            Our team will contact you via email if your qualifications match our requirements. In the meantime, feel
            free to explore more about our company and products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors text-white font-medium"
            >
              Return to Home
            </Link>
            <Link
              href="/careers"
              className="px-6 py-3 rounded-md border border-purple-600 text-purple-400 hover:bg-purple-900/20 transition-colors font-medium"
            >
              View More Opportunities
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-purple-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
