'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function TermsPage() {
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
            <DocumentTextIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">Terms of Service</h1>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using flexconvert ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                flexconvert is a file conversion platform that allows users to convert files between various formats. We provide conversion services for images, documents, videos, audio files, and other supported formats.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
              <p className="mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Account Termination</h3>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in any fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload files containing illegal, harmful, or offensive content</li>
                <li>Upload files that infringe on intellectual property rights</li>
                <li>Upload files containing malware, viruses, or other harmful code</li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. File Uploads and Content</h2>
              <h3 className="text-xl font-semibold text-white mb-3">5.1 Your Content</h3>
              <p className="mb-4">
                You retain ownership of all files you upload. By uploading files, you grant us a limited, non-exclusive license to process and convert your files solely for the purpose of providing the Service.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 File Deletion</h3>
              <p className="mb-4">
                Files are automatically deleted after conversion completion or within a reasonable time period. We are not responsible for any loss of data resulting from file deletion.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 Prohibited Content</h3>
              <p className="mb-4">
                You may not upload files containing:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Copyrighted material without authorization</li>
                <li>Personal information of others without consent</li>
                <li>Illegal content or content that violates laws</li>
                <li>Content that violates our Acceptable Use Policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Service Availability</h2>
              <p className="mb-4">
                We strive to provide reliable service but do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uninterrupted or error-free service</li>
                <li>That all file formats will be supported</li>
                <li>That conversions will always be successful</li>
                <li>Specific uptime or availability percentages</li>
              </ul>
              <p className="mt-4">
                We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Subscription Plans</h2>
              <h3 className="text-xl font-semibold text-white mb-3">7.1 Free Plan</h3>
              <p className="mb-4">
                The free plan includes limited storage (5 GB) and standard conversion features. Free plan users are subject to file size limits and other restrictions.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.2 Premium Plan</h3>
              <p className="mb-4">
                Premium plans may offer additional features, unlimited storage, and higher file size limits. Premium subscriptions are subject to separate terms and pricing.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.3 Refunds</h3>
              <p className="mb-4">
                Refund policies for premium subscriptions will be specified at the time of purchase. Generally, refunds are not available for completed conversions or used services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
              <p className="mb-4">
                The Service, including its design, features, and functionality, is owned by flexconvert and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or create derivative works of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLEXCONVERT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="mb-4">
                Our total liability for any claims arising from the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless flexconvert, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Content you upload or transmit through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Privacy</h2>
              <p className="mb-4">
                Your use of the Service is also governed by our <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>. Please review it to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <p className="text-white font-semibold mb-2">flexconvert</p>
                <p className="text-gray-400">Email: legal@flexconvert.cloud</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

