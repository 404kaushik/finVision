"use client"

import Layout from "@/components/Layout"
import { motion } from "framer-motion"

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p>
              FinVision ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by FinVision when you use our mobile application and website (collectively, the "Service").
            </p>
            <p>
              By using our Service, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information Collection and Use</h2>
            <p>
              While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to, your email address, name, and other information ("Personal Information").
            </p>
            <h3 className="text-xl font-medium mt-4">Information We Collect</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect information about how you use the Service, including the pages you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.
              </li>
              <li>
                <strong>Search History:</strong> We store information about the companies you search for and the research you view to provide personalized recommendations and improve your experience.
              </li>
              <li>
                <strong>Saved Items:</strong> We store companies and research that you save to your profile.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Use of Data</h2>
            <p>FinVision uses the collected data for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To provide you with personalized financial insights and recommendations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Storage and Security</h2>
            <p>
              We use Supabase, a secure database service, to store your personal information and usage data. All data is encrypted both in transit and at rest. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Advertising and Cookies</h2>
            <p>
              FinVision uses Google AdSense to display advertisements. Google AdSense uses cookies and web beacons to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
            </p>
            <p>
              You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info/choices/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
            </p>
            <h3 className="text-xl font-medium mt-4">Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements and track ad performance</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Google AdSense</h2>
            <p>
              We use Google AdSense to display advertisements on our website. Google AdSense is an advertising service provided by Google Inc. that uses the "Doubleclick" Cookie, which tracks use of our website and user behavior concerning ads, products, and the services we offer.
            </p>
            <p>
              You may decide to disable all cookies through your browser settings. However, please note that if you do this, you may not be able to use the full functionality of our website.
            </p>
            <p>
              For more information about Google's privacy practices, please visit the <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
            <p>
              Our Service uses third-party services that may collect information used to identify you. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google may use cookies and web beacons to collect information about your visits to this and other websites to provide relevant advertisements.
              </li>
              <li>
                <strong>Google Analytics:</strong> We use Google Analytics to analyze website traffic and user behavior. Google Analytics uses cookies to collect information about how visitors use our site.
              </li>
              <li>
                <strong>Perplexity AI:</strong> We use Perplexity AI to generate financial research and insights. The queries you make may be processed by Perplexity AI, but we do not share your personal information with them.
              </li>
              <li>
                <strong>Supabase:</strong> We use Supabase for authentication and data storage. Your account information is stored securely in their systems.
              </li>
              <li>
                <strong>Unsplash:</strong> We use Unsplash to provide images related to companies and financial concepts.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Analytics</h2>
            <p>
              We may use third-party Service Providers to monitor and analyze the use of our Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Children's Privacy</h2>
            <p>
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Data Rights</h2>
            <p>
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access, update or delete the information we have on you</li>
              <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete</li>
              <li>The right to object to our processing of your personal data</li>
              <li>The right of restriction - the right to request that we restrict the processing of your personal information</li>
              <li>The right to data portability - the right to receive a copy of your personal data in a structured, machine-readable format</li>
              <li>The right to withdraw consent at any time where we relied on your consent to process your personal information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Account Deletion</h2>
            <p>
              You can request to delete your account and all associated data at any time by visiting your profile settings or contacting us at kaushiknag72@gmail.com. Upon receiving your request, we will delete all your personal information and usage data from our systems within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>By email: kaushiknag72@gmail.com</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </Layout>
  )
}