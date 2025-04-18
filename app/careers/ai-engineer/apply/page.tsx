"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AIEngineerApplyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    portfolio: "",
    github: "",
    linkedin: "",
    experience: "",
    aiSkills: "",
    whyJoin: "",
    additionalInfo: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real application, you would submit this data to your backend
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      // Show success message and redirect
      router.push("/careers/application-success")
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("There was an error submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
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

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <a href="/" className="hover:text-purple-400 transition-colors">
            Home
          </a>
          <span>/</span>
          <a href="/careers" className="hover:text-purple-400 transition-colors">
            Careers
          </a>
          <span>/</span>
          <a href="/careers/ai-engineer" className="hover:text-purple-400 transition-colors">
            AI Engineer
          </a>
          <span>/</span>
          <span className="text-purple-400">Apply</span>
        </div>
      </div>

      {/* Application Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            Apply for AI Engineer
          </h1>
          <p className="text-gray-400 mb-8">
            Please fill out the form below to apply for this position. All fields marked with * are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-400">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </section>

            {/* Professional Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-400">Professional Information</h2>
              <div>
                <label htmlFor="resume" className="block text-sm font-medium mb-1">
                  Resume/CV *
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resume"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-700 hover:border-purple-500 bg-gray-900/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOCX or RTF (MAX. 5MB)</p>
                    </div>
                    <input id="resume" type="file" className="hidden" accept=".pdf,.docx,.rtf" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="block text-sm font-medium mb-1">
                    GitHub URL *
                  </label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    required
                    placeholder="https://github.com/yourusername"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </section>

            {/* Experience & Skills */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-400">Experience & Skills</h2>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-1">
                  Years of Experience in AI/ML *
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select years of experience</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-7">5-7 years</option>
                  <option value="7+">7+ years</option>
                </select>
              </div>
              <div>
                <label htmlFor="aiSkills" className="block text-sm font-medium mb-1">
                  AI/ML Skills & Technologies *
                </label>
                <textarea
                  id="aiSkills"
                  name="aiSkills"
                  required
                  rows={4}
                  placeholder="List your AI/ML skills, frameworks, and technologies you're proficient with (e.g., TensorFlow, PyTorch, NLP, Computer Vision, etc.)"
                  value={formData.aiSkills}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="whyJoin" className="block text-sm font-medium mb-1">
                  Why do you want to join EduSphere AI? *
                </label>
                <textarea
                  id="whyJoin"
                  name="whyJoin"
                  required
                  rows={4}
                  placeholder="Tell us why you're interested in this position and what you can bring to our team"
                  value={formData.whyJoin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                ></textarea>
              </div>
            </section>

            {/* Additional Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-400">Additional Information</h2>
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">
                  Anything else you'd like to share?
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={4}
                  placeholder="Any additional information you'd like us to know"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                ></textarea>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-4 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-colors text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-purple-900/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
