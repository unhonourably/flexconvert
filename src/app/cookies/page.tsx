'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function CookiesPage() {
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">Cookie Policy</h1>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                This Cookie Policy explains how flexconvert ("we," "our," or "us") uses cookies and similar tracking technologies when you visit our website and use our services. This policy should be read in conjunction with our <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>.
              </p>
              <p>
                This Cookie Policy complies with the General Data Protection Regulation (GDPR) and the ePrivacy Directive (Cookie Law).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="mb-4">
                Cookies can be "persistent" (remain on your device until deleted or expired) or "session" cookies (deleted when you close your browser).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">3.1 Essential Cookies</h3>
              <p className="mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Authentication cookies (to keep you logged in)</li>
                  <li>Session management cookies</li>
                  <li>Security cookies</li>
                </ul>
                <p className="text-sm mt-3 text-gray-400">
                  <strong>Legal Basis:</strong> These cookies are necessary for the performance of a contract (providing the service you requested).
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Functional Cookies</h3>
              <p className="mb-4">
                These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>User preference cookies</li>
                  <li>Language selection cookies</li>
                  <li>Cookie consent preferences</li>
                </ul>
                <p className="text-sm mt-3 text-gray-400">
                  <strong>Legal Basis:</strong> These cookies are based on your consent or legitimate interest in providing a better user experience.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.3 Analytics Cookies</h3>
              <p className="mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Page view tracking</li>
                  <li>User behavior analytics</li>
                  <li>Performance monitoring</li>
                </ul>
                <p className="text-sm mt-3 text-gray-400">
                  <strong>Legal Basis:</strong> These cookies require your consent. We use them to improve our service based on legitimate interest.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Specific Cookies We Use</h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-white font-semibold pb-2 pr-4">Cookie Name</th>
                      <th className="text-left text-white font-semibold pb-2 pr-4">Purpose</th>
                      <th className="text-left text-white font-semibold pb-2 pr-4">Type</th>
                      <th className="text-left text-white font-semibold pb-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400">
                    <tr className="border-b border-gray-800">
                      <td className="py-3 pr-4">auth-token</td>
                      <td className="py-3 pr-4">Maintains your authentication session</td>
                      <td className="py-3 pr-4">Essential</td>
                      <td className="py-3">Session</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 pr-4">cookie-consent</td>
                      <td className="py-3 pr-4">Stores your cookie consent preferences</td>
                      <td className="py-3 pr-4">Functional</td>
                      <td className="py-3">1 year</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 pr-4">user-preferences</td>
                      <td className="py-3 pr-4">Stores your user settings and preferences</td>
                      <td className="py-3 pr-4">Functional</td>
                      <td className="py-3">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Cookies</h2>
              <p className="mb-4">
                We may use third-party services that set their own cookies. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Authentication Providers:</strong> OAuth providers (Discord, GitHub) may set cookies for authentication</li>
                <li><strong className="text-white">Analytics Services:</strong> We may use analytics services that set cookies to track usage</li>
              </ul>
              <p className="mt-4">
                These third parties have their own privacy policies and cookie practices. We encourage you to review their policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Managing Cookies</h2>
              <h3 className="text-xl font-semibold text-white mb-3">6.1 Browser Settings</h3>
              <p className="mb-4">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Delete existing cookies</li>
                <li>Set your browser to notify you when cookies are set</li>
              </ul>
              <p className="mt-4 mb-4">
                Please note that blocking essential cookies may affect the functionality of our website.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Cookie Consent</h3>
              <p className="mb-4">
                When you first visit our website, you will be asked to consent to the use of non-essential cookies. You can change your cookie preferences at any time through your browser settings or by clearing your cookies and revisiting the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights (GDPR)</h2>
              <p className="mb-4">
                Under GDPR, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be informed about cookie usage (this policy)</li>
                <li>Give or withdraw consent for non-essential cookies</li>
                <li>Access information about cookies we use</li>
                <li>Request deletion of cookie data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Local Storage and Similar Technologies</h2>
              <p className="mb-4">
                In addition to cookies, we may use other storage technologies such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Local Storage:</strong> To store user preferences and settings</li>
                <li><strong className="text-white">Session Storage:</strong> For temporary session data</li>
              </ul>
              <p className="mt-4">
                These technologies are subject to the same privacy protections as cookies and can be managed through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Updates to This Cookie Policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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

