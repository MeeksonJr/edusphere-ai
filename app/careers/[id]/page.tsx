import { notFound } from "next/navigation"

export default function CareerPositionPage({ params }: { params: { id: string } }) {
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
            <span className="text-purple-400">{positionTitle}</span>
          </div>

          <div className="bg-gray-900/50 border border-purple-900/50 rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              {positionTitle} Position
            </h1>

            <p className="text-gray-300 mb-6">
              Thank you for your interest in the {positionTitle} position at EduSphere AI. Please use the application
              form to submit your resume and other required information.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/careers/${params.id}/apply`}
                className="px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition text-center"
              >
                Apply Now
              </a>
              <a
                href="/careers"
                className="px-6 py-3 rounded-md border border-purple-600 text-purple-400 hover:bg-purple-900/20 transition text-center"
              >
                View All Positions
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Application Process</h2>
              <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                <li>Fill out the application form with your personal and professional information</li>
                <li>Upload your resume/CV and any other relevant documents</li>
                <li>Our team will review your application</li>
                <li>If your qualifications match our requirements, we'll contact you for an interview</li>
                <li>The interview process typically includes 2-3 rounds, including technical assessments</li>
                <li>Final candidates will receive an offer letter</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">What to Expect</h2>
              <p className="text-gray-300 mb-4">
                At EduSphere AI, we believe in a transparent and efficient hiring process. Here's what you can expect:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Acknowledgment of your application within 48 hours</li>
                <li>Initial screening response within 1-2 weeks</li>
                <li>The entire process typically takes 3-4 weeks</li>
                <li>We value your time and will keep you updated throughout the process</li>
                <li>We welcome questions at any stage of the application process</li>
              </ul>
            </section>
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
