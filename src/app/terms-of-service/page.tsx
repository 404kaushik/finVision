"use client"

import Layout from "@/components/Layout"
import { motion } from "framer-motion"

export default function TermsOfService() {
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
            <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p>
              Welcome to FinVision. These Terms of Service ("Terms") govern your use of the FinVision mobile application and website (collectively, the "Service") operated by FinVision ("we," "our," or "us").
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Use of the Service</h2>
            <p>
              FinVision provides a platform for users to access financial information, research, and educational content about companies and investments. The Service is intended for informational and educational purposes only.
            </p>
            <p>
              <strong>Not Financial Advice:</strong> The information provided through the Service is not intended to be and does not constitute financial advice, investment advice, trading advice, or any other advice. The information provided through the Service is general in nature and is not specific to you or anyone else.
            </p>
            <p>
              <strong>No Investment Recommendations:</strong> The Service does not recommend any securities, investments, or investment strategies. You are solely responsible for your investment decisions, and any reliance on information provided by the Service is at your own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and up-to-date information. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
            <p>
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Content</h2>
            <p>
              Our Service allows you to access content provided by us and third parties. This content includes, but is not limited to, financial data, company information, news, and educational materials.
            </p>
            <p>
              <strong>Accuracy of Information:</strong> We strive to provide accurate and up-to-date information, but we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the Service for any purpose.
            </p>
            <p>
              <strong>Third-Party Content:</strong> The Service may include content provided by third parties, including financial data providers, news sources, and AI-generated content. We do not endorse, guarantee, or assume responsibility for any third-party content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of FinVision and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            <p>
              Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FinVision.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Prohibited Uses</h2>
            <p>
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>To impersonate or attempt to impersonate FinVision, a FinVision employee, another user, or any other person or entity</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm FinVision or users of the Service or expose them to liability</li>
              <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service</li>
              <li>To attack the Service via a denial-of-service attack or a distributed denial-of-service attack</li>
              <li>To use the Service for any commercial purpose without our prior written consent</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or request account deletion through the profile settings or by contacting us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p>
              In no event shall FinVision, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              <li>Any investment or financial decisions made based on information provided through the Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>
            <p>
              FinVision does not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that any errors in the Service will be corrected.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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