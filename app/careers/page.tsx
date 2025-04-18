export default function CareersPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-12 px-4 md:px-6 text-center bg-gradient-to-r from-purple-900/20 to-black">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
          Join Our Team
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300">
          Help us build the future of education technology
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:px-6">
        {/* Company Culture Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Our Culture</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-purple-300">Innovation First</h3>
              <p className="text-gray-300">We're constantly pushing the boundaries of what's possible in EdTech.</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-purple-300">Remote-Friendly</h3>
              <p className="text-gray-300">Work from anywhere in the world with our distributed team.</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-purple-300">Growth Mindset</h3>
              <p className="text-gray-300">We invest in your professional development and learning.</p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-white">Competitive Salary</h3>
                <p className="text-gray-300">We offer top-of-market compensation packages.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-white">Health Insurance</h3>
                <p className="text-gray-300">Comprehensive medical, dental, and vision coverage.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-white">Unlimited PTO</h3>
                <p className="text-gray-300">Take the time you need to rest and recharge.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-white">401(k) Matching</h3>
                <p className="text-gray-300">We help you save for your future.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Open Positions</h2>

          <div className="space-y-6">
            {/* Position Card */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Senior Frontend Developer</h3>
                <span className="inline-block mt-2 md:mt-0 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Remote
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                We're looking for an experienced frontend developer with expertise in React, Next.js, and TypeScript to
                help build our educational platform.
              </p>
              <a
                href="/careers/frontend-developer"
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Apply Now
              </a>
            </div>

            {/* Position Card */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">AI Engineer</h3>
                <span className="inline-block mt-2 md:mt-0 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Remote
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Join our AI team to develop cutting-edge machine learning models for our educational platform using
                Gemini and Hugging Face technologies.
              </p>
              <a
                href="/careers/ai-engineer"
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Apply Now
              </a>
            </div>

            {/* Position Card */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Product Manager</h3>
                <span className="inline-block mt-2 md:mt-0 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Remote
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                We're seeking a product manager with experience in EdTech to help shape the future of our platform and
                drive our product roadmap.
              </p>
              <a
                href="/careers/product-manager"
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Apply Now
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">EduSphere AI</h3>
              <p className="text-gray-400">Transforming education with AI-powered tools for students and educators.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/careers" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/support" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/edusphereai"
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
