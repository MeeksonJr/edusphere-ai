"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowUp } from "lucide-react"
import { FaXTwitter, FaGithub, FaLinkedinIn, FaDiscord } from "react-icons/fa6"

const footerLinks = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Roadmap", href: "/roadmap" },
    { name: "Documentation", href: "/docs" },
    { name: "Changelog", href: "/changelog" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  Resources: [
    { name: "Support", href: "/support" },
    { name: "FAQ", href: "/faq" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Community", href: "/community" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Licenses", href: "/licenses" },
  ],
}

const socials = [
  { icon: FaXTwitter, href: "https://twitter.com/edusphereai", label: "Twitter/X", hoverColor: "hover:text-foreground" },
  { icon: FaGithub, href: "https://github.com/edusphereai", label: "GitHub", hoverColor: "hover:text-foreground" },
  { icon: FaLinkedinIn, href: "https://linkedin.com/company/edusphereai", label: "LinkedIn", hoverColor: "hover:text-blue-400" },
  { icon: FaDiscord, href: "https://discord.gg/edusphereai", label: "Discord", hoverColor: "hover:text-indigo-400" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative border-t border-foreground/5">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold font-display text-foreground">
                EduSphere<span className="text-cyan-400"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/40 leading-relaxed mb-6 max-w-xs">
              AI-powered course creation platform. Transform your expertise into professional video courses in minutes.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center text-foreground/30 ${social.hoverColor} hover:border-foreground/15 hover:bg-foreground/[0.08] transition-all duration-300`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/35 hover:text-foreground/70 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-foreground/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-foreground/25">
              © {new Date().getFullYear()} EduSphere AI. All rights reserved.
            </span>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-foreground/25">All systems operational</span>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs text-foreground/25 hover:text-foreground/50 transition-colors group"
          >
            <ArrowUp className="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
