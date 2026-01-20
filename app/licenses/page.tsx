"use client";

import { LegalPageTemplate } from "@/components/shared/LegalPageTemplate";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const licenses = [
  {
    name: "Next.js",
    version: "15.2.4",
    license: "MIT",
    description: "React framework for production",
  },
  {
    name: "React",
    version: "19.0.0",
    license: "MIT",
    description: "JavaScript library for building user interfaces",
  },
  {
    name: "Remotion",
    version: "4.0.407",
    license: "Business Source License",
    description: "Create videos programmatically in React",
  },
  {
    name: "Tailwind CSS",
    version: "3.4.17",
    license: "MIT",
    description: "Utility-first CSS framework",
  },
  {
    name: "Framer Motion",
    version: "latest",
    license: "MIT",
    description: "Animation library for React",
  },
  {
    name: "Supabase",
    version: "latest",
    license: "Apache 2.0",
    description: "Open source Firebase alternative",
  },
  {
    name: "Radix UI",
    version: "latest",
    license: "MIT",
    description: "Low-level UI primitives",
  },
  {
    name: "Lucide React",
    version: "0.454.0",
    license: "ISC",
    description: "Beautiful & consistent icon toolkit",
  },
];

export default function LicensesPage() {
  return (
    <LegalPageTemplate
      title="Open Source Licenses"
      icon={FileText}
      lastUpdated="January 1, 2026"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Third-Party Libraries</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        EduSphere AI is built with the help of many amazing open-source projects. 
        Below is a list of the major libraries and frameworks we use, along with their licenses.
      </p>

      <div className="space-y-4 mb-8">
        {licenses.map((license, index) => (
          <ScrollReveal
            key={license.name}
            direction="up"
            delay={0.05 * index}
          >
            <GlassSurface className="p-6 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {license.name}
                    </h3>
                    <span className="text-sm text-white/50">v{license.version}</span>
                  </div>
                  <p className="text-white/60 mb-3">{license.description}</p>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {license.license}
                  </Badge>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Our License</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        EduSphere AI proprietary code is protected by copyright. However, we are committed 
        to using and contributing to open-source software wherever possible.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Attributions</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        We thank all the developers and organizations who have contributed to the open-source 
        projects we use. Their work makes EduSphere AI possible.
      </p>
    </LegalPageTemplate>
  );
}
