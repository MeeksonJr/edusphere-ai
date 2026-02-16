"use client";

import { useState } from "react";
import { LegalPageTemplate } from "@/components/shared/LegalPageTemplate";
import { Cookie, CheckCircle, Shield } from "lucide-react";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

const cookieCategories = [
  {
    id: "essential",
    name: "Essential Cookies",
    description:
      "These cookies are necessary for the website to function properly. They cannot be disabled.",
    required: true,
    enabled: true,
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    required: false,
    enabled: false,
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements.",
    required: false,
    enabled: false,
  },
  {
    id: "preferences",
    name: "Preference Cookies",
    description:
      "Remember your settings and preferences to provide a personalized experience.",
    required: false,
    enabled: false,
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description: "Enable the website to provide enhanced functionality and personalization.",
    required: false,
    enabled: false,
  }
];

export default function CookiesPage() {
  const [cookies, setCookies] = useState(cookieCategories);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setCookies((prev) =>
      prev.map((cookie) =>
        cookie.id === id && !cookie.required
          ? { ...cookie, enabled: !cookie.enabled }
          : cookie
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    // Save preferences to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("cookiePreferences", JSON.stringify(cookies));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <LegalPageTemplate
      title="Cookie Policy"
      icon={Cookie}
      lastUpdated="January 1, 2026"
    >
      <div className="space-y-8 text-foreground/80">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            What Are Cookies
          </h2>
          <p className="leading-relaxed">
            Cookies are small text files that are placed on your computer or mobile device when
            you visit a website. They are widely used to make websites work more efficiently and
            provide information to the website owners.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Cookies</h2>
          <p className="leading-relaxed">
            At EduSphere AI, we use cookies to enhance your experience, analyze site usage, and
            assist in our marketing efforts. Below you can manage your cookie preferences.
          </p>
        </div>

        {/* Cookie Settings */}
        <div className="py-2">
          <ScrollReveal direction="up">
            <GlassSurface className="p-8 border-cyan-500/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Shield className="w-32 h-32 text-foreground" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center relative z-10">
                <Shield className="w-5 h-5 mr-2 text-cyan-500" />
                Manage Cookie Preferences
              </h3>

              <div className="space-y-6 relative z-10">
                {cookies.map((cookie) => (
                  <div
                    key={cookie.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-foreground/5 border border-foreground/10 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex-1 mr-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Label
                          htmlFor={cookie.id}
                          className="text-foreground font-bold cursor-pointer text-base"
                        >
                          {cookie.name}
                        </Label>
                        {cookie.required && (
                          <span className="text-xs font-bold text-cyan-600 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/60 text-sm leading-relaxed">{cookie.description}</p>
                    </div>
                    <Switch
                      id={cookie.id}
                      checked={cookie.enabled}
                      onCheckedChange={() => handleToggle(cookie.id)}
                      disabled={cookie.required}
                      className="data-[state=checked]:bg-cyan-500 mt-1"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <Button
                  onClick={handleSave}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
                >
                  Save Preferences
                </Button>

                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center text-green-500 font-medium bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Preferences saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Managing Cookies Browser Settings</h2>
          <p className="mb-4 leading-relaxed">
            Most web browsers allow you to control cookies through their settings. You can usually
            find these settings in the "Options" or "Preferences" menu of your browser.
          </p>
          <p className="leading-relaxed">
            You can also set your browser to reject all cookies, but this might prevent some
            websites from working properly.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">More Information</h2>
          <p className="leading-relaxed">
            For more information about cookies and how they work, visit{" "}
            <a
              href="https://www.allaboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-500 hover:text-cyan-600 underline decoration-cyan-500/30 underline-offset-4 transition-all"
            >
              www.allaboutcookies.org
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about our use of cookies, please contact us at{" "}
            <a href="mailto:privacy@edusphere.ai" className="text-cyan-500 hover:text-cyan-600 underline decoration-cyan-500/30 underline-offset-4 transition-all">
              privacy@edusphere.ai
            </a>
          </p>
        </div>
      </div>
    </LegalPageTemplate>
  );
}
