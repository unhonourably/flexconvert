'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Home
        </Link>

        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">Privacy Policy</h1>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to flexconvert ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our file conversion service.
              </p>
              <p>
                This Privacy Policy complies with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Personal Information</h3>
              <p className="mb-4">
                We may collect the following personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address (when you create an account)</li>
                <li>Name or username (if provided)</li>
                <li>Profile picture (if you authenticate via OAuth providers like Discord or GitHub)</li>
                <li>Authentication tokens and session data</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 File Data</h3>
              <p className="mb-4">
                When you upload files for conversion:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>File names and metadata</li>
                <li>File sizes and formats</li>
                <li>Conversion history and preferences</li>
              </ul>
              <p className="mt-4">
                <strong className="text-white">Important:</strong> We do not access, read, or store the actual content of your files beyond what is necessary for the conversion process. Files are automatically deleted after conversion is complete or after a reasonable retention period.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Technical Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage statistics and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain our file conversion service</li>
                <li>To process your file conversion requests</li>
                <li>To manage your account and authentication</li>
                <li>To improve our service and user experience</li>
                <li>To communicate with you about your account or our service</li>
                <li>To comply with legal obligations</li>
                <li>To prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="mb-4">Under GDPR, we process your personal data based on:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Consent:</strong> When you provide explicit consent for specific processing activities</li>
                <li><strong className="text-white">Contract:</strong> To fulfill our contractual obligations in providing the conversion service</li>
                <li><strong className="text-white">Legitimate Interest:</strong> To improve our services and ensure security</li>
                <li><strong className="text-white">Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With service providers who assist us in operating our platform (e.g., cloud storage, authentication providers)</li>
                <li>When required by law or to respond to legal processes</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Automatic deletion of files after processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights (GDPR)</h2>
              <p className="mb-4">Under GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong className="text-white">Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong className="text-white">Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong className="text-white">Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong className="text-white">Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information: Retained while your account is active</li>
                <li>Uploaded files: Automatically deleted after conversion completion or within 24 hours</li>
                <li>Conversion history: Retained for service functionality and may be deleted upon account deletion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies. For detailed information, please see our <Link href="/cookies" className="text-purple-400 hover:text-purple-300 underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <p className="text-white font-semibold mb-2">flexconvert</p>
                <p className="text-gray-400">Email: privacy@flexconvert.cloud</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

