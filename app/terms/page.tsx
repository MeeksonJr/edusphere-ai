"use client";

import { LegalPageTemplate } from "@/components/shared/LegalPageTemplate";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <LegalPageTemplate
      title="Terms of Service"
      icon={FileText}
      lastUpdated="January 1, 2026"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        By accessing or using EduSphere AI, you agree to be bound by these Terms of Service 
        and all applicable laws and regulations. If you do not agree with any of these terms, 
        you are prohibited from using or accessing this service.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Use License</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Permission is granted to temporarily use EduSphere AI for personal, non-commercial 
        transitory viewing only. This is the grant of a license, not a transfer of title, 
        and under this license you may not:
      </p>
      <ul className="list-disc list-inside space-y-2 text-white/70 mb-6 ml-4">
        <li>Modify or copy the materials</li>
        <li>Use the materials for any commercial purpose or for any public display</li>
        <li>Attempt to reverse engineer any software contained in EduSphere AI</li>
        <li>Remove any copyright or other proprietary notations from the materials</li>
        <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Accounts</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        When you create an account with us, you must provide information that is accurate, 
        complete, and current at all times. You are responsible for safeguarding the password 
        and for all activities that occur under your account.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Content</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        You retain ownership of all content you create using EduSphere AI. By using our service, 
        you grant us a license to store, process, and display your content as necessary to provide 
        the service.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Prohibited Uses</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        You agree not to use the service:
      </p>
      <ul className="list-disc list-inside space-y-2 text-white/70 mb-6 ml-4">
        <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
        <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
        <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
        <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
        <li>To submit false or misleading information</li>
        <li>To upload or transmit viruses or any other type of malicious code</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Subscription and Payment</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Certain features of the service require payment. You agree to provide current, complete, 
        and accurate purchase and account information. You agree to promptly update your account 
        and other information so that we can complete your transactions and contact you as needed.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Cancellation and Refunds</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        You may cancel your subscription at any time. Refunds are available within 30 days of 
        purchase. Contact our support team for assistance with cancellations and refunds.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Intellectual Property</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        The service and its original content, features, and functionality are and will remain 
        the exclusive property of EduSphere AI and its licensors. The service is protected by 
        copyright, trademark, and other laws.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Limitation of Liability</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        In no event shall EduSphere AI, nor its directors, employees, partners, agents, suppliers, 
        or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
        damages, including without limitation, loss of profits, data, use, goodwill, or other 
        intangible losses, resulting from your use of the service.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Disclaimer</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        The information on this service is provided on an "as is" basis. To the fullest extent 
        permitted by law, EduSphere AI excludes all representations, warranties, and conditions 
        relating to our service and the use of this service.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Changes to Terms</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any 
        time. If a revision is material, we will try to provide at least 30 days notice prior 
        to any new terms taking effect.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Information</h2>
      <p className="text-white/70 mb-6 leading-relaxed">
        If you have any questions about these Terms of Service, please contact us at{" "}
        <a href="mailto:legal@edusphere.ai" className="text-cyan-400 hover:text-cyan-300 underline">
          legal@edusphere.ai
        </a>
      </p>
    </LegalPageTemplate>
  );
}
