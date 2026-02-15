"use client";

import { LegalPageTemplate } from "@/components/shared/LegalPageTemplate";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      icon={Shield}
      lastUpdated="January 1, 2026"
    >
      <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        At EduSphere AI, we take your privacy seriously. This Privacy Policy explains 
        how we collect, use, disclose, and safeguard your information when you use our 
        service. Please read this policy carefully to understand our practices regarding 
        your personal data.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Information We Collect</h2>
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Personal Information</h3>
          <ul className="list-disc list-inside space-y-2 text-foreground/70 ml-4">
            <li>Name and email address when you create an account</li>
            <li>Payment information (processed securely through third-party providers)</li>
            <li>Profile information you choose to provide</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Usage Data</h3>
          <ul className="list-disc list-inside space-y-2 text-foreground/70 ml-4">
            <li>Course creation and interaction data</li>
            <li>Feature usage and preferences</li>
            <li>Device and browser information</li>
            <li>IP address and location data</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">How We Use Your Information</h2>
      <p className="text-foreground/70 mb-4 leading-relaxed">
        We use the information we collect to:
      </p>
      <ul className="list-disc list-inside space-y-2 text-foreground/70 mb-6 ml-4">
        <li>Provide, maintain, and improve our services</li>
        <li>Process transactions and send related information</li>
        <li>Send administrative information and updates</li>
        <li>Respond to your comments, questions, and requests</li>
        <li>Monitor and analyze usage patterns and trends</li>
        <li>Detect, prevent, and address technical issues</li>
      </ul>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Data Security</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        We implement appropriate technical and organizational measures to protect your 
        personal information against unauthorized access, alteration, disclosure, or 
        destruction. However, no method of transmission over the Internet is 100% secure, 
        and we cannot guarantee absolute security.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Your Rights</h2>
      <p className="text-foreground/70 mb-4 leading-relaxed">
        You have the right to:
      </p>
      <ul className="list-disc list-inside space-y-2 text-foreground/70 mb-6 ml-4">
        <li>Access and receive a copy of your personal data</li>
        <li>Rectify inaccurate or incomplete data</li>
        <li>Request deletion of your personal data</li>
        <li>Object to or restrict processing of your data</li>
        <li>Data portability</li>
        <li>Withdraw consent at any time</li>
      </ul>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Third-Party Services</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        We use third-party services for payment processing, analytics, and hosting. 
        These services have their own privacy policies governing the use of your information.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Cookies</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        We use cookies and similar tracking technologies to track activity on our service 
        and hold certain information. You can instruct your browser to refuse all cookies 
        or to indicate when a cookie is being sent.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Children's Privacy</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        Our service is not intended for individuals under the age of 13. We do not 
        knowingly collect personal information from children under 13.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Changes to This Policy</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        We may update our Privacy Policy from time to time. We will notify you of any 
        changes by posting the new Privacy Policy on this page and updating the "Last 
        updated" date.
      </p>

      <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Contact Us</h2>
      <p className="text-foreground/70 mb-6 leading-relaxed">
        If you have any questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:privacy@edusphere.ai" className="text-cyan-400 hover:text-cyan-300 underline">
          privacy@edusphere.ai
        </a>
      </p>
    </LegalPageTemplate>
  );
}
