"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { useState } from "react"

export default function CareerApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In a real application, you would fetch the job details based on the ID
  // For now, we'll handle a few predefined routes and show 404 for others
  const validPositions = ["frontend-developer", "ai-engineer", "product-manager"]

  if (!validPositions.includes(params.id)) {
    notFound()
  }

  // Format the position title for display
  const positionTitle = params.id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real application, you would submit the form data to your backend
    // For now, we'll just simulate a submission delay and redirect
    setTimeout(() => {
      router.push("/careers/application-success")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-purple-900/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              EduSphere AI
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-300 hover:text-purple-400 transition">
              Home
            </a>
            <a href="/careers" className="text-purple-400 font-medium">
              Careers
            </a>
            <a href="/login" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition">
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <a href="/" className="hover:text-purple-400 transition">
              Home
            </a>
            <span>/</span>
            <a href="/careers" className="hover:text-purple-400 transition">
              Careers
            </a>
            <span>/</span>
            <a href={`/careers/${params.id}`} className="hover:text-purple-400 transition">
              {positionTitle}
            </a>
            <span>/</span>
            <span className="text-purple-400">Apply</span>
          </div>

          <div className="bg-gray-900/50 border border-purple-900/50 rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Apply for {positionTitle} Position
            </h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Professional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="resume" className="block text-sm font-medium text-gray-300 mb-1">
                      Resume/CV (PDF) *
                    </label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-300 mb-1">
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      rows={5}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-300 mb-1">
                      Portfolio/GitHub URL
                    </label>
                    <input
                      type="url"
                      id="portfolio"
                      name="portfolio"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Questions */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Additional Questions</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">
                      Years of Experience *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-300 mb-1">
                      Earliest Start Date *
                    </label>
                    <input
                      type="date"
                      id="availability"
                      name="availability"
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-1">
                      Salary Expectations (USD)
                    </label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. $80,000 - $100,000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded"
                />
                <label htmlFor="consent" className="text-sm text-gray-300">
                  I consent to EduSphere AI storing and processing my application data *
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
                <Link
                  href={`/careers/${params.id}`}
                  className="px-6 py-3 rounded-md border border-purple-600 text-purple-400 hover:bg-purple-900/20 transition text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-purple-900/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
