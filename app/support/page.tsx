import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  FileText,
  Video,
  HelpCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SupportPage() {
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
                How Can We Help?
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Find answers to your questions and get the support you need to
                make the most of EduSphere AI.
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-10 py-6 text-lg bg-gray-900 border-gray-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center neon-text-blue">
              Browse by Category
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="glass-card hover:neon-border-blue transition-all">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-blue-400 mb-2" />
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Guides for new users</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Account setup and configuration
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Importing your calendar
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Creating your first assignment
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Using the AI Lab
                      </Link>
                    </li>
                  </ul>
                  <Button
                    variant="link"
                    className="mt-4 p-0 h-auto text-primary"
                  >
                    View all guides <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card hover:neon-border-green transition-all">
                <CardHeader>
                  <HelpCircle className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle>Troubleshooting</CardTitle>
                  <CardDescription>Common issues and solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Calendar sync problems
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        AI response errors
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Account access issues
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Billing and subscription
                      </Link>
                    </li>
                  </ul>
                  <Button
                    variant="link"
                    className="mt-4 p-0 h-auto text-primary"
                  >
                    View all solutions <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card hover:neon-border-pink transition-all">
                <CardHeader>
                  <FileText className="h-8 w-8 text-pink-400 mb-2" />
                  <CardTitle>Feature Guides</CardTitle>
                  <CardDescription>
                    Detailed feature documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        AI Lab capabilities
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Flashcard system
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Assignment management
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Calendar features
                      </Link>
                    </li>
                  </ul>
                  <Button
                    variant="link"
                    className="mt-4 p-0 h-auto text-primary"
                  >
                    View all features <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center neon-text-purple">
              Popular Support Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-blue-900/30 text-blue-300 border-blue-700/50">
                    Getting Started
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    How to Import Your Google Calendar
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Learn how to seamlessly import your Google Calendar events
                    into EduSphere AI.
                  </p>
                  <Link href="#">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read Article <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-green-900/30 text-green-300 border-green-700/50">
                    Troubleshooting
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Fixing Calendar Sync Issues
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Troubleshoot common calendar synchronization problems and
                    get your events showing up correctly.
                  </p>
                  <Link href="#">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read Article <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-purple-900/30 text-purple-300 border-purple-700/50">
                    Features
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Maximizing the AI Lab
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Get the most out of the AI Lab with tips and tricks for
                    generating better responses.
                  </p>
                  <Link href="#">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read Article <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-pink-900/30 text-pink-300 border-pink-700/50">
                    Account
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Managing Your Subscription
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Learn how to upgrade, downgrade, or cancel your
                    subscription, and manage your billing information.
                  </p>
                  <Link href="#">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read Article <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center neon-text-green">
              Still Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="glass-card hover:neon-border-blue transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <MessageCircle className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                  <p className="text-gray-400 mb-6">
                    Chat with our support team in real-time for immediate
                    assistance with your questions.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card hover:neon-border-purple transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Mail className="h-12 w-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Email Support</h3>
                  <p className="text-gray-400 mb-6">
                    Send us an email and our team will get back to you within 24
                    hours with a solution.
                  </p>
                  <Link href="/contact">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Contact Us
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="glass-card hover:neon-border-green transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Video className="h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Video Tutorials</h3>
                  <p className="text-gray-400 mb-6">
                    Watch step-by-step video guides to learn how to use all
                    features of EduSphere AI.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Watch Tutorials
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center neon-text-purple">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      How do I import my Google Calendar?
                    </h3>
                    <p className="text-gray-400">
                      To import your Google Calendar, go to Settings, then
                      Calendar, then Import and click on "Connect Google
                      Calendar." Follow the prompts to authorize EduSphere AI to
                      access your calendar data. Your events will automatically
                      sync within a few minutes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      What's the difference between the AI providers?
                    </h3>
                    <p className="text-gray-400">
                      EduSphere AI offers two AI providers: Gemini and Hugging
                      Face. Gemini is optimized for conversational responses and
                      general knowledge, while Hugging Face offers specialized
                      models for specific tasks like summarization, translation,
                      and classification.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      How do I cancel my subscription?
                    </h3>
                    <p className="text-gray-400">
                      You can cancel your subscription at any time by going to
                      Settings, then Billing, then Subscription and clicking
                      "Cancel Subscription." Your subscription will remain
                      active until the end of your current billing period.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      Is my data secure?
                    </h3>
                    <p className="text-gray-400">
                      Yes, we take data security very seriously. All your data
                      is encrypted both in transit and at rest. We never share
                      your personal information with third parties without your
                      consent. You can review our Privacy Policy for more
                      details.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      Can I use EduSphere AI offline?
                    </h3>
                    <p className="text-gray-400">
                      Currently, most features require an internet connection as
                      they rely on our AI services. However, Ultimate plan users
                      can download flashcards for offline study. We're working
                      on expanding offline capabilities in future updates.
                    </p>
                  </CardContent>
                </Card>
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
