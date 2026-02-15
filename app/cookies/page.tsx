"use client";

import { useState } from "react";
import { LegalPageTemplate } from "@/components/shared/LegalPageTemplate";
import { Cookie } from "lucide-react";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

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
    localStorage.setItem("cookiePreferences", JSON.stringify(cookies));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <LegalPageTemplate
      title="Cookie Policy"
      icon={Cookie}
      lastUpdated="January 1, 2026"
    >
      <h2 className="text-2xl font-bold text-foreground mb-4">What Are Cookies</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        Cookies are small text files that are placed on your computer or mobile device when 
        you visit a website. They are widely used to make websites work more efficiently and 
        provide information to the website owners.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">How We Use Cookies</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        At EduSphere AI, we use cookies to enhance your experience, analyze site usage, and 
        assist in our marketing efforts. Below you can manage your cookie preferences.
      </p>

      {/* Cookie Settings */}
      <div className="mt-8 mb-8">
        <ScrollReveal direction="up">
          <GlassSurface className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Manage Cookie Preferences
            </h3>
            <div className="space-y-6">
              {cookies.map((cookie) => (
                <div
                  key={cookie.id}
                  className="flex items-start justify-between p-4 glass-surface rounded-lg border border-foreground/10"
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Label
                        htmlFor={cookie.id}
                        className="text-white font-semibold cursor-pointer"
                      >
                        {cookie.name}
                      </Label>
                      {cookie.required && (
                        <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/60 text-sm">{cookie.description}</p>
                  </div>
                  <Switch
                    id={cookie.id}
                    checked={cookie.enabled}
                    onCheckedChange={() => handleToggle(cookie.id)}
                    disabled={cookie.required}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-foreground"
              >
                Save Preferences
              </Button>
              {saved && (
                <span className="text-green-400 text-sm">Preferences saved!</span>
              )}
            </div>
          </GlassSurface>
        </ScrollReveal>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Managing Cookies</h2>
      <p className="text-foreground/70 mb-4 leading-relaxed">
        Most web browsers allow you to control cookies through their settings. You can usually 
        find these settings in the "Options" or "Preferences" menu of your browser.
      </p>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        You can also set your browser to reject all cookies, but this might prevent some 
        websites from working properly.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">More Information</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        For more information about cookies and how they work, visit{" "}
        <a
          href="https://www.allaboutcookies.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          www.allaboutcookies.org
        </a>
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Contact Us</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        If you have any questions about our use of cookies, please contact us at{" "}
        <a href="mailto:privacy@edusphere.ai" className="text-cyan-400 hover:text-cyan-300 underline">
          privacy@edusphere.ai
        </a>
      </p>
    </LegalPageTemplate>
  );
}
