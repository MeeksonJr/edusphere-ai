import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield } from "lucide-react";

export default function PrivacyPage() {
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
              href="/#features"
              className="hover:neon-text-purple transition-all"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="hover:neon-text-purple transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/#testimonials"
              className="hover:neon-text-purple transition-all"
            >
              Testimonials
            </Link>
            <Link
              href="/blog"
              className="hover:neon-text-purple transition-all"
            >
              Blog
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
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/50">
                <span className="text-sm font-medium text-blue-300 flex items-center">
                  <Shield className="h-4 w-4 mr-2" /> Privacy & Security
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-6 neon-text-blue">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                We're committed to protecting your privacy and ensuring the
                security of your data.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="glass-card p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                  <p className="text-gray-300">
                    At EduSphere AI, we take your privacy seriously. This
                    Privacy Policy explains how we collect, use, disclose, and
                    safeguard your information when you use our platform. Please
                    read this privacy policy carefully. If you do not agree with
                    the terms of this privacy policy, please do not access the
                    site.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Information We Collect
                  </h2>
                  <p className="text-gray-300 mb-4">
                    We collect information that you provide directly to us when
                    you:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Create an account</li>
                    <li>Use our services</li>
                    <li>Participate in surveys or promotions</li>
                    <li>Contact customer support</li>
                    <li>Engage with us on social media</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    This information may include your name, email address,
                    educational institution, academic interests, and any other
                    information you choose to provide.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    How We Use Your Information
                  </h2>
                  <p className="text-gray-300 mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Personalize your experience</li>
                    <li>Process transactions</li>
                    <li>
                      Send you technical notices, updates, security alerts, and
                      support messages
                    </li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Develop new products and services</li>
                    <li>
                      Monitor and analyze trends, usage, and activities in
                      connection with our services
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                  <p className="text-gray-300">
                    We have implemented appropriate technical and organizational
                    security measures designed to protect the security of any
                    personal information we process. However, please also
                    remember that we cannot guarantee that the internet itself
                    is 100% secure. Although we will do our best to protect your
                    personal information, transmission of personal information
                    to and from our services is at your own risk.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
                  <p className="text-gray-300">
                    We will only keep your personal information for as long as
                    it is necessary for the purposes set out in this privacy
                    policy, unless a longer retention period is required or
                    permitted by law. No purpose in this policy will require us
                    keeping your personal information for longer than the period
                    of time in which users have an account with us.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                  <p className="text-gray-300 mb-4">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Access the personal information we have about you</li>
                    <li>Correct inaccuracies in your personal information</li>
                    <li>Delete your personal information</li>
                    <li>
                      Object to the processing of your personal information
                    </li>
                    <li>
                      Request that we limit our processing of your personal
                      information
                    </li>
                    <li>Request portability of your personal information</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-300">
                    We may update our privacy policy from time to time. We will
                    notify you of any changes by posting the new privacy policy
                    on this page and updating the "Last Updated" date at the top
                    of this privacy policy. You are advised to review this
                    privacy policy periodically for any changes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                  <p className="text-gray-300">
                    If you have any questions about this privacy policy, please
                    contact us at privacy@edusphereai.com.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Last Updated: June 1, 2023
                  </p>
                </div>
              </div>
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
