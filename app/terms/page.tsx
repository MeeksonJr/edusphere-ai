import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";

export default function TermsPage() {
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
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/50">
                <span className="text-sm font-medium text-blue-300 flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Legal
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-6 neon-text-blue">
                Terms of Service
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Please read these terms carefully before using EduSphere AI.
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="glass-card p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                  <p className="text-gray-300">
                    Welcome to EduSphere AI ("we," "our," or "us"). By accessing
                    or using our website, mobile applications, or any of our
                    services (collectively, the "Services"), you agree to be
                    bound by these Terms of Service ("Terms"). If you do not
                    agree to these Terms, please do not use our Services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
                  <p className="text-gray-300 mb-4">
                    You must be at least 13 years old to use our Services. If
                    you are under 18, you must have permission from a parent or
                    guardian to use our Services, and they must agree to these
                    Terms on your behalf.
                  </p>
                  <p className="text-gray-300">
                    By using our Services, you represent and warrant that you
                    meet all eligibility requirements. If you are using the
                    Services on behalf of an entity, organization, or company,
                    you represent and warrant that you have the authority to
                    bind that organization to these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    3. Accounts and Registration
                  </h2>
                  <p className="text-gray-300 mb-4">
                    To access certain features of our Services, you may need to
                    register for an account. When you register, you agree to
                    provide accurate, current, and complete information about
                    yourself and to keep this information up to date.
                  </p>
                  <p className="text-gray-300 mb-4">
                    You are responsible for safeguarding your account
                    credentials and for all activities that occur under your
                    account. You agree to notify us immediately of any
                    unauthorized use of your account or any other breach of
                    security.
                  </p>
                  <p className="text-gray-300">
                    We reserve the right to disable any user account at any
                    time, including if we believe you have violated these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    4. Subscription and Payments
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Some of our Services are offered on a subscription basis. By
                    subscribing to our Services, you agree to pay the applicable
                    fees as they become due. All fees are exclusive of taxes,
                    which may be added to the fees charged to you.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Subscriptions automatically renew for the same subscription
                    term unless you cancel your subscription before the end of
                    the current term. You can cancel your subscription at any
                    time through your account settings or by contacting us.
                  </p>
                  <p className="text-gray-300">
                    We reserve the right to change our subscription fees at any
                    time. If we change our fees, we will provide notice of the
                    change on the website or by email, at our discretion. Your
                    continued use of the Services after the fee change becomes
                    effective constitutes your agreement to pay the updated
                    fees.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">5. User Content</h2>
                  <p className="text-gray-300 mb-4">
                    Our Services may allow you to upload, submit, store, send,
                    or receive content ("User Content"). You retain ownership of
                    any intellectual property rights that you hold in that User
                    Content.
                  </p>
                  <p className="text-gray-300 mb-4">
                    By uploading, submitting, storing, sending, or receiving
                    User Content through our Services, you grant us a worldwide,
                    non-exclusive, royalty-free license to use, host, store,
                    reproduce, modify, create derivative works, communicate,
                    publish, publicly perform, publicly display, and distribute
                    such User Content for the limited purpose of providing and
                    improving our Services.
                  </p>
                  <p className="text-gray-300">
                    You are solely responsible for your User Content and the
                    consequences of sharing it. We are not responsible for the
                    content or accuracy of any User Content, and we have no
                    obligation to monitor or review any User Content.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    6. Prohibited Conduct
                  </h2>
                  <p className="text-gray-300 mb-4">You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>
                      Use our Services in any way that violates any applicable
                      law or regulation
                    </li>
                    <li>
                      Use our Services for any harmful, fraudulent, or deceptive
                      purpose
                    </li>
                    <li>
                      Upload, transmit, or distribute any content that is
                      illegal, harmful, threatening, abusive, harassing,
                      defamatory, vulgar, obscene, or otherwise objectionable
                    </li>
                    <li>
                      Attempt to gain unauthorized access to any portion of our
                      Services or any other systems or networks connected to our
                      Services
                    </li>
                    <li>
                      Use any automated means or interface not provided by us to
                      access our Services or to extract data
                    </li>
                    <li>
                      Attempt to interfere with or disrupt the integrity or
                      performance of our Services or the data contained therein
                    </li>
                    <li>
                      Circumvent any technological measure implemented by us to
                      restrict access to our Services
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    7. Intellectual Property
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Our Services and all content and materials included on our
                    Services, such as text, graphics, logos, button icons,
                    images, audio clips, digital downloads, data compilations,
                    and software, are the property of EduSphere AI or our
                    licensors and are protected by copyright, trademark, and
                    other intellectual property laws.
                  </p>
                  <p className="text-gray-300">
                    We grant you a limited, non-exclusive, non-transferable, and
                    revocable license to use our Services for their intended
                    purposes, subject to these Terms. You may not copy, modify,
                    distribute, sell, or lease any part of our Services or
                    included content, nor may you reverse engineer or attempt to
                    extract the source code of our software, unless laws
                    prohibit these restrictions or you have our written
                    permission.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                  <p className="text-gray-300 mb-4">
                    We may terminate or suspend your access to our Services
                    immediately, without prior notice or liability, for any
                    reason, including if you breach these Terms. Upon
                    termination, your right to use our Services will immediately
                    cease.
                  </p>
                  <p className="text-gray-300">
                    All provisions of these Terms which by their nature should
                    survive termination shall survive termination, including,
                    without limitation, ownership provisions, warranty
                    disclaimers, indemnity, and limitations of liability.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    9. Disclaimer of Warranties
                  </h2>
                  <p className="text-gray-300 mb-4">
                    OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                    ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                    INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF
                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
                    NON-INFRINGEMENT.
                  </p>
                  <p className="text-gray-300">
                    WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED,
                    TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS IN OUR
                    SERVICES WILL BE CORRECTED. WE DO NOT WARRANT THAT THE
                    RESULTS THAT MAY BE OBTAINED FROM THE USE OF OUR SERVICES
                    WILL BE ACCURATE OR RELIABLE.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    10. Limitation of Liability
                  </h2>
                  <p className="text-gray-300 mb-4">
                    IN NO EVENT SHALL EDUSPHERE AI, ITS OFFICERS, DIRECTORS,
                    EMPLOYEES, OR AGENTS, BE LIABLE TO YOU FOR ANY DIRECT,
                    INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL
                    DAMAGES WHATSOEVER RESULTING FROM ANY (I) ERRORS, MISTAKES,
                    OR INACCURACIES OF CONTENT, (II) PERSONAL INJURY OR PROPERTY
                    DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS
                    TO AND USE OF OUR SERVICES, (III) ANY UNAUTHORIZED ACCESS TO
                    OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL
                    INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN,
                    (IV) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR
                    FROM OUR SERVICES, (V) ANY BUGS, VIRUSES, TROJAN HORSES, OR
                    THE LIKE, WHICH MAY BE TRANSMITTED TO OR THROUGH OUR
                    SERVICES BY ANY THIRD PARTY, AND/OR (VI) ANY ERRORS OR
                    OMISSIONS IN ANY CONTENT OR FOR ANY LOSS OR DAMAGE OF ANY
                    KIND INCURRED AS A RESULT OF YOUR USE OF ANY CONTENT POSTED,
                    EMAILED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA OUR
                    SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY
                    OTHER LEGAL THEORY, AND WHETHER OR NOT THE COMPANY IS
                    ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                  </p>
                  <p className="text-gray-300">
                    THE FOREGOING LIMITATION OF LIABILITY SHALL APPLY TO THE
                    FULLEST EXTENT PERMITTED BY LAW IN THE APPLICABLE
                    JURISDICTION.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    11. Indemnification
                  </h2>
                  <p className="text-gray-300">
                    You agree to defend, indemnify, and hold harmless EduSphere
                    AI, its officers, directors, employees, and agents, from and
                    against any and all claims, damages, obligations, losses,
                    liabilities, costs or debt, and expenses (including but not
                    limited to attorney's fees) arising from: (i) your use of
                    and access to our Services; (ii) your violation of any term
                    of these Terms; (iii) your violation of any third-party
                    right, including without limitation any copyright, property,
                    or privacy right; or (iv) any claim that your User Content
                    caused damage to a third party. This defense and
                    indemnification obligation will survive these Terms and your
                    use of our Services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    12. Changes to Terms
                  </h2>
                  <p className="text-gray-300">
                    We reserve the right, at our sole discretion, to modify or
                    replace these Terms at any time. If a revision is material,
                    we will provide at least 30 days' notice prior to any new
                    terms taking effect. What constitutes a material change will
                    be determined at our sole discretion. By continuing to
                    access or use our Services after any revisions become
                    effective, you agree to be bound by the revised terms. If
                    you do not agree to the new terms, you are no longer
                    authorized to use our Services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
                  <p className="text-gray-300">
                    These Terms shall be governed and construed in accordance
                    with the laws of [Your Jurisdiction], without regard to its
                    conflict of law provisions. Our failure to enforce any right
                    or provision of these Terms will not be considered a waiver
                    of those rights. If any provision of these Terms is held to
                    be invalid or unenforceable by a court, the remaining
                    provisions of these Terms will remain in effect.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">14. Contact Us</h2>
                  <p className="text-gray-300">
                    If you have any questions about these Terms, please contact
                    us at legal@edusphereai.com.
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
