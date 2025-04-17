"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Check, X, Zap, BrainCircuit, Users, Calendar, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  const toggleBilling = () => {
    setAnnual(!annual)
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 py-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 bg-purple-600 rounded-lg p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold neon-text-purple">EduSphere AI</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/features" className="hover:neon-text-purple transition-all">
              Features
            </Link>
            <Link href="/pricing" className="hover:neon-text-purple transition-all">
              Pricing
            </Link>
            <Link href="/blog" className="hover:neon-text-purple transition-all">
              Blog
            </Link>
            <Link href="/contact" className="hover:neon-text-purple transition-all">
              Contact
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-primary hover:neon-border-purple transition-all">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/80">Sign Up</Button>
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
              <h1 className="text-5xl font-bold mb-6 neon-text-purple">Simple, Transparent Pricing</h1>
              <p className="text-xl text-gray-300 mb-8">
                Choose the plan that's right for you and start boosting your academic performance today.
              </p>

              <div className="flex items-center justify-center mb-12">
                <span className={`mr-2 ${!annual ? "text-white" : "text-gray-400"}`}>Monthly</span>
                <Switch id="billing-toggle" checked={annual} onCheckedChange={toggleBilling} />
                <span className={`ml-2 ${annual ? "text-white" : "text-gray-400"}`}>Annual</span>
                <Badge className="ml-2 bg-green-900 text-green-300 border-green-700">Save 20%</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <Card className="glass-card relative overflow-hidden">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                  <div className="mt-4 text-4xl font-bold">$0</div>
                  <p className="text-sm text-gray-400">Forever free</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Import calendar events</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>10 AI requests per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Basic assignment management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Access to Hugging Face basic tools</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">Flashcard & quiz generator</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">Advanced AI features</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full border-gray-700">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="glass-card relative overflow-hidden border-purple-600">
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-tl-none rounded-br-none bg-purple-600 text-white">Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For serious students</CardDescription>
                  <div className="mt-4 text-4xl font-bold neon-text-purple">
                    ${annual ? "5.59" : "6.99"}
                    <span className="text-base font-normal text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">{annual ? "Billed annually ($67.08/year)" : "Billed monthly"}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        <span className="font-bold">Unlimited</span> AI prompts
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced assignment management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Flashcard & quiz generator</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Premium Gemini features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">Multi-project support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup?plan=pro" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/80">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Ultimate Plan */}
              <Card className="glass-card relative overflow-hidden">
                <CardHeader>
                  <CardTitle>Ultimate</CardTitle>
                  <CardDescription>For power users</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    ${annual ? "10.39" : "12.99"}
                    <span className="text-base font-normal text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {annual ? "Billed annually ($124.68/year)" : "Billed monthly"}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Multi-project/class support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Study groups (peer-to-peer)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Voice assistant for AI</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Priority support with 24-hour response</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Early access to new features</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup?plan=ultimate" className="w-full">
                    <Button variant="outline" className="w-full border-gray-700">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center neon-text-purple">Compare Features</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="py-4 px-6 text-left">Feature</th>
                      <th className="py-4 px-6 text-center">Free</th>
                      <th className="py-4 px-6 text-center">Pro</th>
                      <th className="py-4 px-6 text-center">Ultimate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                          Calendar Integration
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">Basic</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <BrainCircuit className="h-5 w-5 mr-2 text-purple-400" />
                          AI Requests
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">10/month</td>
                      <td className="py-4 px-6 text-center">Unlimited</td>
                      <td className="py-4 px-6 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                          Flashcards
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-green-400" />
                          Study Plans
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">Basic</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-pink-400" />
                          Collaboration
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-blue-400" />
                          Voice Assistant
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                          Priority Support
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center neon-text-purple">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-2">Can I switch plans later?</h3>
                  <p className="text-gray-400">
                    Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new pricing will take
                    effect immediately. If you downgrade, the new pricing will take effect at the end of your current
                    billing cycle.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-2">How does the AI request limit work?</h3>
                  <p className="text-gray-400">
                    Free users get 10 AI requests per month. These requests reset on the first day of each month. Pro
                    and Ultimate users get unlimited AI requests, allowing them to fully leverage our AI capabilities
                    without restrictions.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-2">Do you offer student discounts?</h3>
                  <p className="text-gray-400">
                    Yes! We offer a 20% discount for students with a valid .edu email address. Contact our support team
                    after signing up to verify your student status and receive the discount.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-2">Is there a free trial for paid plans?</h3>
                  <p className="text-gray-400">
                    We offer a 7-day free trial for both our Pro and Ultimate plans. You can cancel anytime during the
                    trial period and won't be charged.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-400">
                    We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as PayPal.
                    All payments are processed securely through our payment providers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 neon-text-purple">Ready to Transform Your Learning?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of students who are already using EduSphere AI to boost their academic performance.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/80">
                  Get Started Free
                </Button>
              </Link>
              <p className="mt-4 text-sm text-gray-400">No credit card required for free plan</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-2 bg-purple-600 rounded-lg p-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold neon-text-purple">EduSphere AI</h3>
              </div>
              <p className="text-gray-400 mb-4">Revolutionizing student productivity with AI-powered tools.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="hover:text-white">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
