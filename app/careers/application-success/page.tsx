import Link from "next/link"

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-900/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
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
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            Application Submitted!
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Thank you for applying to join the EduSphere AI team. We've received your application and will review it
            shortly.
          </p>
          <p className="text-gray-400 mb-8">
            Our team will contact you if your qualifications match our requirements. In the meantime, feel free to
            explore more about our company.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">
              Return Home
            </Link>
            <Link
              href="/careers"
              className="px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              View More Positions
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
