import Link from "next/link"

export default function LicensesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-purple-900/20 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
                EduSphere AI
              </span>
            </Link>
            <nav className="hidden space-x-8 md:flex">
              <Link href="/features" className="text-sm text-gray-300 hover:text-purple-500">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-gray-300 hover:text-purple-500">
                Pricing
              </Link>
              <Link href="/about" className="text-sm text-gray-300 hover:text-purple-500">
                About
              </Link>
              <Link href="/blog" className="text-sm text-gray-300 hover:text-purple-500">
                Blog
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Open Source Licenses
          </span>
        </h1>

        <div className="mx-auto max-w-4xl space-y-8 rounded-lg border border-purple-900/20 bg-gray-900/20 p-8 backdrop-blur">
          <p className="text-gray-300">
            EduSphere AI is built on the shoulders of giants. We use many open source libraries and frameworks, and we
            are grateful to the developers who have made their work available to us. Below is a list of the major open
            source software we use and their respective licenses.
          </p>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-purple-400">Frontend Libraries</h2>

            <div className="space-y-4">
              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Next.js</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">
                  A React framework for production that enables server-side rendering and static site generation.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">React</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">A JavaScript library for building user interfaces.</p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Tailwind CSS</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">
                  A utility-first CSS framework for rapidly building custom user interfaces.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Framer Motion</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">A production-ready motion library for React.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-400">Backend and Infrastructure</h2>

            <div className="space-y-4">
              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Supabase</h3>
                <p className="mt-1 text-sm text-gray-400">License: Apache 2.0</p>
                <p className="mt-2 text-gray-300">
                  An open source Firebase alternative with a PostgreSQL database, authentication, and storage.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">TypeScript</h3>
                <p className="mt-1 text-sm text-gray-400">License: Apache 2.0</p>
                <p className="mt-2 text-gray-300">A typed superset of JavaScript that compiles to plain JavaScript.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-400">AI and Machine Learning</h2>

            <div className="space-y-4">
              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Hugging Face Transformers</h3>
                <p className="mt-1 text-sm text-gray-400">License: Apache 2.0</p>
                <p className="mt-2 text-gray-300">
                  State-of-the-art Natural Language Processing for PyTorch and TensorFlow 2.0.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">TensorFlow.js</h3>
                <p className="mt-1 text-sm text-gray-400">License: Apache 2.0</p>
                <p className="mt-2 text-gray-300">
                  A JavaScript library for training and deploying machine learning models in the browser and on Node.js.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-md border border-purple-900/30 bg-black/40 p-4">
            <h2 className="text-xl font-semibold text-purple-400">License Compliance</h2>
            <p className="mt-2 text-gray-300">
              We are committed to complying with the terms of all licenses for the software we use. If you believe we
              are not in compliance with any license, please contact us at{" "}
              <a href="mailto:legal@edusphereai.com" className="text-purple-400 hover:underline">
                legal@edusphereai.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/20 bg-black/95 py-12 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-gray-300 hover:text-purple-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-300 hover:text-purple-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-gray-300 hover:text-purple-500">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-purple-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="text-gray-300 hover:text-purple-500">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-300 hover:text-purple-500">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-purple-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-purple-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-300 hover:text-purple-500">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-purple-500">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-purple-500">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-300 hover:text-purple-500">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/licenses" className="text-gray-300 hover:text-purple-500">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between border-t border-purple-900/20 pt-8 md:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} EduSphere AI. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
