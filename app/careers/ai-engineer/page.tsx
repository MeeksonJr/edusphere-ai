export default function AIEngineerJobPage() {
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
            <a href="/features" className="text-gray-300 hover:text-purple-400 transition">
              Features
            </a>
            <a href="/pricing" className="text-gray-300 hover:text-purple-400 transition">
              Pricing
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

      {/* Job Details */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
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
            <span className="text-purple-400">AI Engineer</span>
          </div>

          {/* Job Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              AI Engineer
            </h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 text-purple-400 text-sm">
                Full-time
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 text-purple-400 text-sm">
                Remote / San Francisco
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 text-purple-400 text-sm">
                Engineering Team
              </span>
            </div>
            <p className="text-xl text-gray-300">
              Join our team to build cutting-edge AI solutions that transform how students learn and study.
            </p>
          </div>

          {/* Job Description */}
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">About the Role</h2>
              <p className="text-gray-300 leading-relaxed">
                As an AI Engineer at EduSphere AI, you will be at the forefront of developing and implementing advanced
                AI models that power our educational platform. You will work on natural language processing, machine
                learning, and deep learning solutions to create intelligent features that help students learn more
                effectively. This role offers a unique opportunity to apply cutting-edge AI technologies to solve
                real-world educational challenges.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Key Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>
                  Design, develop, and implement AI models for various features including content summarization,
                  question answering, and personalized learning recommendations
                </li>
                <li>
                  Integrate with large language models (LLMs) like Gemini and Hugging Face models to enhance our
                  platform's capabilities
                </li>
                <li>
                  Collaborate with product and engineering teams to translate business requirements into AI solutions
                </li>
                <li>Optimize AI models for performance, accuracy, and scalability</li>
                <li>Stay up-to-date with the latest advancements in AI and machine learning research</li>
                <li>Implement data pipelines for training, evaluating, and deploying AI models</li>
                <li>Develop and maintain documentation for AI systems and processes</li>
                <li>Mentor junior engineers and contribute to the growth of the AI team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Bachelor's or Master's degree in Computer Science, AI, Machine Learning, or a related field</li>
                <li>3+ years of experience in developing and deploying AI/ML models in production environments</li>
                <li>
                  Strong proficiency in Python and experience with AI/ML frameworks such as TensorFlow, PyTorch, or
                  Hugging Face Transformers
                </li>
                <li>Experience with natural language processing (NLP) and large language models (LLMs)</li>
                <li>Familiarity with cloud platforms (AWS, GCP, or Azure) and containerization technologies</li>
                <li>Strong problem-solving skills and attention to detail</li>
                <li>
                  Excellent communication skills and ability to explain complex AI concepts to non-technical
                  stakeholders
                </li>
                <li>Experience with version control systems (Git) and CI/CD pipelines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Nice to Have</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>PhD in AI, Machine Learning, or a related field</li>
                <li>Experience with educational technology or learning systems</li>
                <li>Publications in AI/ML conferences or journals</li>
                <li>Experience with reinforcement learning or generative AI</li>
                <li>Knowledge of JavaScript/TypeScript and web development</li>
                <li>Experience with data annotation and management tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Benefits</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Competitive salary and equity package</li>
                <li>Flexible remote work policy</li>
                <li>Comprehensive health, dental, and vision insurance</li>
                <li>401(k) matching program</li>
                <li>Generous PTO and paid holidays</li>
                <li>Professional development budget</li>
                <li>Home office stipend</li>
                <li>Team retreats and social events</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Our Commitment to Diversity</h2>
              <p className="text-gray-300 leading-relaxed">
                EduSphere AI is committed to building a diverse and inclusive workplace. We are an equal opportunity
                employer and welcome applications from people of all backgrounds, regardless of race, color, religion,
                gender, gender identity or expression, sexual orientation, national origin, genetics, disability, age,
                or veteran status.
              </p>
            </section>

            {/* Apply Button */}
            <div className="pt-6">
              <a
                href="/careers/ai-engineer/apply"
                className="inline-block px-8 py-4 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg shadow-purple-900/30"
              >
                Apply for this Position
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-purple-900/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <a href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                  EduSphere AI
                </span>
              </a>
              <p className="text-gray-400 mb-4">
                Empowering students with AI-powered learning tools and productivity solutions.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-400 hover:text-purple-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/careers" className="text-gray-400 hover:text-purple-400 transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-purple-400 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-purple-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/documentation" className="text-gray-400 hover:text-purple-400 transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/support" className="text-gray-400 hover:text-purple-400 transition">
                    Support
                  </a>
                </li>
                <li>
                  <a href="/roadmap" className="text-gray-400 hover:text-purple-400 transition">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="/features" className="text-gray-400 hover:text-purple-400 transition">
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-purple-400 transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-purple-400 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-gray-400 hover:text-purple-400 transition">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/licenses" className="text-gray-400 hover:text-purple-400 transition">
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-900/50 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
