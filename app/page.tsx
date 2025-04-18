// @ts-nocheck
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Sparkles,
  BrainCircuit,
  CheckSquare,
  Palette,
  ArrowRight,
  Star,
  Users,
  Zap,
  Lightbulb,
  Layers,
  Shield,
  Beaker,
} from "lucide-react"
import { motion } from "framer-motion"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.3 } },
}

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
    },
  },
}

// @ts-ignore
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 py-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mr-2 bg-purple-600 rounded-lg p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold neon-text-purple">EduSphere AI</h1>
          </motion.div>
          <motion.nav
            className="hidden md:flex space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="#features" className="hover:neon-text-purple transition-all">
              Features
            </Link>
            <Link href="#pricing" className="hover:neon-text-purple transition-all">
              Pricing
            </Link>
            <Link href="#testimonials" className="hover:neon-text-purple transition-all">
              Testimonials
            </Link>
            <Link href="/blog" className="hover:neon-text-purple transition-all">
              Blog
            </Link>
          </motion.nav>
          <motion.div
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/login">
              <Button variant="outline" className="border-primary hover:neon-border-purple transition-all">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:neon-border-purple transition-all">Sign Up</Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="particles-container">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  initial={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0,
                  }}
                  animate={{
                    opacity: [0, 0.3, 0],
                    y: [0, -100 - Math.random() * 500],
                    x: [0, 50 - Math.random() * 100],
                  }}
                  transition={{
                    duration: 10 + Math.random() * 20,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 5,
                  }}
                  style={{
                    width: `${Math.random() * 10 + 2}px`,
                    height: `${Math.random() * 10 + 2}px`,
                  }}
                ></motion.div>
              ))}
            </div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/50"
                variants={fadeIn}
              >
                <span className="text-sm font-medium text-purple-300 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" /> AI-Powered Learning Revolution
                </span>
              </motion.div>
              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-6 neon-text-purple leading-tight"
                variants={fadeIn}
              >
                Study Smarter, Not Harder with AI
              </motion.h1>
              <motion.p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed" variants={fadeIn}>
                Revolutionize your academic journey with AI-powered tools designed to help you organize, learn, and
                excel in your studies.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row justify-center gap-4" variants={fadeIn}>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-primary hover:bg-primary/80 neon-border-purple animate-glow">
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#features">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-primary hover:neon-border-purple">
                      Explore Features
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div
                className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400"
                variants={fadeIn}
              >
                <motion.div className="flex items-center" whileHover={{ scale: 1.05, color: "#4ade80" }}>
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  <span>Privacy-Focused</span>
                </motion.div>
                <motion.div className="flex items-center" whileHover={{ scale: 1.05, color: "#60a5fa" }}>
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  <span>10,000+ Students</span>
                </motion.div>
                <motion.div className="flex items-center" whileHover={{ scale: 1.05, color: "#fbbf24" }}>
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-900/30 border border-green-700/50"
                variants={itemVariant}
              >
                <span className="text-sm font-medium text-green-300 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" /> Powerful Features
                </span>
              </motion.div>
              <motion.h2 className="text-4xl font-bold mb-4 neon-text-green" variants={itemVariant}>
                Supercharge Your Learning
              </motion.h2>
              <motion.p className="text-xl text-gray-400 max-w-2xl mx-auto" variants={itemVariant}>
                Our comprehensive suite of AI-powered tools is designed to transform how you study and manage your
                academic life.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {/* Feature 1 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-purple group"
                variants={itemVariant}
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHover}
              >
                <motion.div
                  className="bg-purple-900/30 p-3 rounded-lg w-fit mb-4 group-hover:bg-purple-900/50 transition-all"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                >
                  <Calendar className="h-6 w-6 text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4 group-hover:neon-text-purple transition-all">
                  Smart Calendar Integration
                </h3>
                <p className="text-gray-400">
                  Seamlessly import your academic schedule from Google Calendar or .ICS files. Our AI automatically
                  parses assignments, due dates, and classes.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <Link
                    href="/signup"
                    className="text-purple-400 hover:text-purple-300 flex items-center text-sm font-medium"
                  >
                    <motion.div className="flex items-center" whileHover={{ x: 5 }}>
                      Try it now <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-green group"
                variants={itemVariant}
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHover}
              >
                <motion.div
                  className="bg-green-900/30 p-3 rounded-lg w-fit mb-4 group-hover:bg-green-900/50 transition-all"
                  whileHover={{ scale: 1.2, rotate: 360, transition: { duration: 0.8 } }}
                >
                  <Sparkles className="h-6 w-6 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4 group-hover:neon-text-green transition-all">
                  AI Study Assistant
                </h3>
                <p className="text-gray-400">
                  Our context-aware AI chatbot understands your schedule, subjects, and deadlines to provide
                  personalized academic help exactly when you need it.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <Link
                    href="/signup"
                    className="text-green-400 hover:text-green-300 flex items-center text-sm font-medium"
                  >
                    <motion.div className="flex items-center" whileHover={{ x: 5 }}>
                      Try it now <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-blue group"
                variants={itemVariant}
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHover}
              >
                <motion.div
                  className="bg-blue-900/30 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-900/50 transition-all"
                  whileHover={{ y: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
                >
                  <CheckSquare className="h-6 w-6 text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4 group-hover:neon-text-blue transition-all">
                  Smart Assignment Management
                </h3>
                <p className="text-gray-400">
                  Assignments are auto-generated from your calendar or can be added manually. AI suggests the best
                  approaches to complete each task.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <Link
                    href="/signup"
                    className="text-blue-400 hover:text-blue-300 flex items-center text-sm font-medium"
                  >
                    <motion.div className="flex items-center" whileHover={{ x: 5 }}>
                      Try it now <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-pink group"
                variants={itemVariant}
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHover}
              >
                <motion.div
                  className="bg-pink-900/30 p-3 rounded-lg w-fit mb-4 group-hover:bg-pink-900/50 transition-all"
                  whileHover={{ scale: [1, 1.2, 1], transition: { duration: 0.5 } }}
                >
                  <Beaker className="h-6 w-6 text-pink-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4 group-hover:neon-text-pink transition-all">AI Lab</h3>
                <p className="text-gray-400">
                  Generate summaries, flashcards, quizzes, and essay outlines with our powerful AI tools. Transform
                  complex topics into digestible content.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <Link
                    href="/signup"
                    className="text-pink-400 hover:text-pink-300 flex items-center text-sm font-medium"
                  >
                    <motion.div className="flex items-center" whileHover={{ x: 5 }}>
                      Try it now <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Feature 5 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-purple group"
                variants={itemVariant}
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHover}
              >
                <motion.div
                  className="bg-purple-900/30 p-3 rounded-lg w-fit mb-4 group-hover:bg-purple-900/50 transition-all"
                  whileHover={{ rotate: [0, 15, -15, 15, 0], transition: { duration: 0.5 } }}
                >
                  <BrainCircuit className="h-6 w-6 text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4 group-hover:neon-text-purple transition-all">
                  Intelligent Flashcards
                </h3>
                <p className="text-gray-400">
                  Create and study with AI-generated flashcards that adapt to your learning style and help you memorize
                  information more effectively.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <Link
                    href="/signup"
                    className="text-purple-400 hover:text-purple-300 flex items-center text-sm font-medium"
                  >
                    <motion.div className="flex items-center" whileHover={{ x: 5 }}>
                      Try it now <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Feature 6 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-green group"
                variants={itemVariant}
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHover}
              >
                <motion.div
                  className="bg-green-900/30 p-3 rounded-lg w-fit mb-4 group-hover:bg-green-900/50 transition-all"
                  whileHover={{ scale: [1, 0.8, 1], transition: { duration: 0.5 } }}
                >
                  <Palette className="h-6 w-6 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4 group-hover:neon-text-green transition-all">
                  Personalized Experience
                </h3>
                <p className="text-gray-400">
                  Choose from various neon-accented dark themes to customize your experience. EduSphere adapts to your
                  preferences and study habits.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <Link
                    href="/signup"
                    className="text-green-400 hover:text-green-300 flex items-center text-sm font-medium"
                  >
                    <motion.div className="flex items-center" whileHover={{ x: 5 }}>
                      Try it now <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/50"
                variants={itemVariant}
              >
                <span className="text-sm font-medium text-blue-300 flex items-center">
                  <Layers className="h-4 w-4 mr-2" /> Simple Process
                </span>
              </motion.div>
              <motion.h2 className="text-4xl font-bold mb-4 neon-text-blue" variants={itemVariant}>
                How EduSphere Works
              </motion.h2>
              <motion.p className="text-xl text-gray-400 max-w-2xl mx-auto" variants={itemVariant}>
                Get started in minutes and transform your academic experience with our intuitive platform.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {/* Step 1 */}
              <motion.div className="relative" variants={itemVariant}>
                <motion.div
                  className="glass-card p-6 h-full flex flex-col items-center text-center"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(232, 121, 249, 0.3)" }}
                >
                  <motion.div
                    className="bg-blue-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
                    initial="initial"
                    animate="animate"
                    variants={pulseAnimation}
                  >
                    <span className="text-2xl font-bold text-blue-400">1</span>
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4">Sign Up & Connect</h3>
                  <p className="text-gray-400">Create your account and import your academic calendar to get started.</p>
                </motion.div>
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="h-8 w-8 text-blue-500/50" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div className="relative" variants={itemVariant}>
                <motion.div
                  className="glass-card p-6 h-full flex flex-col items-center text-center"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(232, 121, 249, 0.3)" }}
                >
                  <motion.div
                    className="bg-blue-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
                    initial="initial"
                    animate="animate"
                    variants={pulseAnimation}
                  >
                    <span className="text-2xl font-bold text-blue-400">2</span>
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4">Organize & Plan</h3>
                  <p className="text-gray-400">Let AI organize your assignments and create personalized study plans.</p>
                </motion.div>
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="h-8 w-8 text-blue-500/50" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={itemVariant}>
                <motion.div
                  className="glass-card p-6 h-full flex flex-col items-center text-center"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(232, 121, 249, 0.3)" }}
                >
                  <motion.div
                    className="bg-blue-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
                    initial="initial"
                    animate="animate"
                    variants={pulseAnimation}
                  >
                    <span className="text-2xl font-bold text-blue-400">3</span>
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4">Study & Excel</h3>
                  <p className="text-gray-400">
                    Use our AI tools to study more effectively and achieve better academic results.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/50"
                variants={itemVariant}
              >
                <span className="text-sm font-medium text-blue-300 flex items-center">
                  <Zap className="h-4 w-4 mr-2" /> Simple Pricing
                </span>
              </motion.div>
              <motion.h2 className="text-4xl font-bold mb-4 neon-text-blue" variants={itemVariant}>
                Choose Your Plan
              </motion.h2>
              <motion.p className="text-xl text-gray-400 max-w-2xl mx-auto" variants={itemVariant}>
                Select the perfect plan for your academic needs. Upgrade or downgrade anytime.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {/* Free Plan */}
              <motion.div
                variants={itemVariant}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="glass-card p-6 flex flex-col h-full transition-all hover:neon-border-purple">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
                    <div className="flex items-end mb-4">
                      <span className="text-4xl font-bold">$0</span>
                      <span className="text-lg font-normal text-gray-400 ml-1">/month</span>
                    </div>
                    <p className="text-gray-400 text-sm">Perfect for getting started with basic features.</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Import calendar
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      10 AI requests/month
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Access to Hugging Face basic tools
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Basic assignment management
                    </motion.li>
                    <motion.li
                      className="flex items-center text-gray-500"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2">✗</span>
                      Advanced AI features
                    </motion.li>
                    <motion.li
                      className="flex items-center text-gray-500"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2">✗</span>
                      Unlimited flashcards
                    </motion.li>
                  </ul>
                  <Link href="/signup" className="mt-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-primary hover:bg-primary/80">Get Started</Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                variants={itemVariant}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="glass-card p-6 flex flex-col h-full neon-border-blue relative transition-all hover:neon-border-blue">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    POPULAR
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
                    <div className="flex items-end mb-4">
                      <span className="text-4xl font-bold">$6.99</span>
                      <span className="text-lg font-normal text-gray-400 ml-1">/month</span>
                    </div>
                    <p className="text-gray-400 text-sm">Enhanced features for serious students.</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      <strong>Unlimited</strong> AI prompts
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Priority support
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Premium Gemini features
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Flashcard & quiz generator
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Advanced assignment tools
                    </motion.li>
                    <motion.li
                      className="flex items-center text-gray-500"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2">✗</span>
                      Multi-project support
                    </motion.li>
                  </ul>
                  <Link href="/signup?plan=pro" className="mt-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Choose Pro</Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Ultimate Plan */}
              <motion.div
                variants={itemVariant}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="glass-card p-6 flex flex-col h-full transition-all hover:neon-border-pink">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Ultimate Plan</h3>
                    <div className="flex items-end mb-4">
                      <span className="text-4xl font-bold">$12.99</span>
                      <span className="text-lg font-normal text-gray-400 ml-1">/month</span>
                    </div>
                    <p className="text-gray-400 text-sm">All features unlocked for maximum productivity.</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Everything in Pro
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Multi-project/class support
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Study groups (peer-to-peer)
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Voice assistant for Gemini AI
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Priority AI processing
                    </motion.li>
                    <motion.li
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <span className="mr-2 text-green-400">✓</span>
                      Advanced analytics & insights
                    </motion.li>
                  </ul>
                  <Link href="/signup?plan=ultimate" className="mt-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-pink-600 hover:bg-pink-700">Choose Ultimate</Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-block mb-4 px-4 py-1.5 rounded-full bg-pink-900/30 border border-pink-700/50"
                variants={itemVariant}
              >
                <span className="text-sm font-medium text-pink-300 flex items-center">
                  <Star className="h-4 w-4 mr-2" /> Student Success
                </span>
              </motion.div>
              <motion.h2 className="text-4xl font-bold mb-4 neon-text-pink" variants={itemVariant}>
                What Students Say
              </motion.h2>
              <motion.p className="text-xl text-gray-400 max-w-2xl mx-auto" variants={itemVariant}>
                Hear from students who have transformed their academic experience with EduSphere AI.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {/* Testimonial 1 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-purple"
                variants={itemVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-300 italic">
                  "EduSphere AI helped me organize my chaotic schedule and improved my grades significantly. The AI
                  assistant is like having a tutor available 24/7!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-900/50 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-purple-300 font-bold">AJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Alex Johnson</h4>
                    <p className="text-sm text-gray-400">Computer Science Student</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-green"
                variants={itemVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-300 italic">
                  "The flashcard generator and quiz tools saved me hours of study prep time. I can focus on actually
                  learning instead of organizing my notes."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-900/50 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-green-300 font-bold">SC</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sophia Chen</h4>
                    <p className="text-sm text-gray-400">Biology Major</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div
                className="glass-card p-6 transition-all hover:neon-border-blue"
                variants={itemVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-300 italic">
                  "As someone with ADHD, the visual organization and AI reminders have been game-changing for keeping me
                  on track with assignments."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-900/50 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-blue-300 font-bold">MW</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Marcus Williams</h4>
                    <p className="text-sm text-gray-400">Business Administration</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <div className="mt-12 text-center">
              <Link href="/testimonials">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="border-gray-700 hover:border-primary">
                    View All Testimonials <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 className="text-4xl font-bold mb-6 neon-text-purple" variants={fadeIn}>
                Ready to Transform Your Learning?
              </motion.h2>
              <motion.p className="text-xl text-gray-300 mb-8" variants={fadeIn}>
                Join thousands of students who are already studying smarter with EduSphere AI.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row justify-center gap-4" variants={fadeIn}>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-primary hover:bg-primary/80 neon-border-purple">
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/contact">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-primary hover:neon-border-purple">
                      Contact Sales
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* complete footer with frammer motion with hover and color affect with link having orbit ot special affect */}
      <motion.footer className="border-t border-purple-900/20 bg-black/95 py-12 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-gray-300 hover:text-purple-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-300 hover:text-purple-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-gray-300 hover:text-purple-500">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-purple-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="text-gray-300 hover:text-purple-500">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-300 hover:text-purple-500">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-purple-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-purple-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-300 hover:text-purple-500">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-400">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-purple-500">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-purple-500">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-300 hover:text-purple-500">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/licenses" className="text-gray-300 hover:text-purple-500">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between border-t border-purple-900/20 pt-8 md:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} EduSphere AI. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
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
        </div>
      </motion.footer>
    </div>
  )
}
