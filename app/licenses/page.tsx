import Link from "next/link";

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
              <Link
                href="/features"
                className="text-sm text-gray-300 hover:text-purple-500"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-gray-300 hover:text-purple-500"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-300 hover:text-purple-500"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-sm text-gray-300 hover:text-purple-500"
              >
                Blog
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
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
            EduSphere AI is built on the shoulders of giants. We use many open
            source libraries and frameworks, and we are grateful to the
            developers who have made their work available to us. Below is a list
            of the major open source software we use and their respective
            licenses.
          </p>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-purple-400">
              Frontend Libraries
            </h2>

            <div className="space-y-4">
              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Next.js</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">
                  A React framework for production that enables server-side
                  rendering and static site generation.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">React</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">
                  A JavaScript library for building user interfaces.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Tailwind CSS</h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">
                  A utility-first CSS framework for rapidly building custom user
                  interfaces.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">
                  Framer Motion
                </h3>
                <p className="mt-1 text-sm text-gray-400">License: MIT</p>
                <p className="mt-2 text-gray-300">
                  A production-ready motion library for React.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-400">
              Backend and Infrastructure
            </h2>

            <div className="space-y-4">
              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">Supabase</h3>
                <p className="mt-1 text-sm text-gray-400">
                  License: Apache 2.0
                </p>
                <p className="mt-2 text-gray-300">
                  An open source Firebase alternative with a PostgreSQL
                  database, authentication, and storage.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">TypeScript</h3>
                <p className="mt-1 text-sm text-gray-400">
                  License: Apache 2.0
                </p>
                <p className="mt-2 text-gray-300">
                  A typed superset of JavaScript that compiles to plain
                  JavaScript.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-400">
              AI and Machine Learning
            </h2>

            <div className="space-y-4">
              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">
                  Hugging Face Transformers
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  License: Apache 2.0
                </p>
                <p className="mt-2 text-gray-300">
                  State-of-the-art Natural Language Processing for PyTorch and
                  TensorFlow 2.0.
                </p>
              </div>

              <div className="rounded-md border border-purple-900/30 bg-black/40 p-4">
                <h3 className="text-lg font-medium text-white">
                  TensorFlow.js
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  License: Apache 2.0
                </p>
                <p className="mt-2 text-gray-300">
                  A JavaScript library for training and deploying machine
                  learning models in the browser and on Node.js.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-md border border-purple-900/30 bg-black/40 p-4">
            <h2 className="text-xl font-semibold text-purple-400">
              License Compliance
            </h2>
            <p className="mt-2 text-gray-300">
              We are committed to complying with the terms of all licenses for
              the software we use. If you believe we are not in compliance with
              any license, please contact us at{" "}
              <a
                href="mailto:legal@edusphereai.com"
                className="text-purple-400 hover:underline"
              >
                legal@edusphereai.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
