import Link from "next/link"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-purple-500">Cookie Policy</h1>

        <div className="space-y-8 mb-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
            <p>
              At EduSphere AI, we use cookies to enhance your experience, analyze site usage, and assist in our
              marketing efforts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">How We Use Cookies</h2>
            <p className="mb-4">We use cookies for several purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-purple-300">Essential cookies:</strong> These are necessary for the website to
                function properly.
              </li>
              <li>
                <strong className="text-purple-300">Preference cookies:</strong> These remember your settings and
                preferences.
              </li>
              <li>
                <strong className="text-purple-300">Analytics cookies:</strong> These help us understand how visitors
                interact with our website.
              </li>
              <li>
                <strong className="text-purple-300">Marketing cookies:</strong> These track your online activity to help
                deliver targeted advertising.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Managing Cookies</h2>
            <p className="mb-4">
              Most web browsers allow you to control cookies through their settings. You can usually find these settings
              in the "Options" or "Preferences" menu of your browser.
            </p>
            <p>
              You can also set your browser to reject all cookies, but this might prevent some websites from working
              properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Our Cookies</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                <thead className="bg-purple-900">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Purpose</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-4 py-3">session</td>
                    <td className="px-4 py-3">Maintains your session state</td>
                    <td className="px-4 py-3">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">preferences</td>
                    <td className="px-4 py-3">Stores your site preferences</td>
                    <td className="px-4 py-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">analytics</td>
                    <td className="px-4 py-3">Collects anonymous usage data</td>
                    <td className="px-4 py-3">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Changes to Our Cookie Policy</h2>
            <p>
              We may update our Cookie Policy from time to time. Any changes will be posted on this page, and if the
              changes are significant, we will provide a more prominent notice.
            </p>
          </section>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="mb-4">
            If you have any questions about our Cookie Policy, please contact us at{" "}
            <span className="text-purple-400">support@edusphere.ai</span>
          </p>
          <p>Last updated: April 2025</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">EduSphere AI</h3>
              <p className="mb-4">Empowering students with AI-powered learning tools.</p>
              <div className="flex space-x-4">
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
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="hover:text-purple-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-purple-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="hover:text-purple-500">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="hover:text-purple-500">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-purple-500">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-purple-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-purple-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-purple-500">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="hover:text-purple-500">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-purple-500">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-purple-500 font-medium">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
