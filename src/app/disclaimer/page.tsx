"use client"

import Layout from "@/components/Layout"
import { motion } from "framer-motion"

export default function Disclaimer() {
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
            <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Financial Information Disclaimer</h2>
            <p>
              The information provided by FinVision ("we," "our," or "us") on our mobile application and website (collectively, the "Service") is for general informational and educational purposes only. All information on the Service is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Not Financial Advice</h2>
            <p>
              The content available on the Service is not intended to be a substitute for professional financial advice, legal advice, or tax advice. You should not take, or refrain from taking, any action based on any information contained on the Service. Before you make any financial, legal, or tax decisions, you should consult with a professional advisor who is licensed and qualified in the area in which such advice is required.
            </p>
            <p>
              The use or reliance on any information contained on the Service is solely at your own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Investment Risks</h2>
            <p>
              Investing in securities involves risks, including the risk of loss. Past performance is not indicative of future results. Different types of investments involve varying degrees of risk, and there can be no assurance that any specific investment will either be suitable or profitable for a user's investment portfolio.
            </p>
            <p>
              The information provided through the Service does not constitute a recommendation to buy, sell, or hold any security. We do not provide personalized investment advice through the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">AI-Generated Content</h2>
            <p>
              The Service utilizes artificial intelligence technologies, including Perplexity AI, to generate financial research, insights, and educational content. AI-generated content may contain inaccuracies, inconsistencies, or outdated information. We do not guarantee the accuracy, completeness, or timeliness of any AI-generated content.
            </p>
            <p>
              You should always verify any information obtained from the Service with other sources before making any financial decisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Third-Party Information</h2>
            <p>
              The Service may contain information sourced from third parties, including financial data providers, news sources, and other content providers. We do not endorse, guarantee, or assume responsibility for any third-party content. We are not responsible for the accuracy, reliability, availability, or lawfulness of content provided by third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Educational Purpose</h2>
            <p>
              The Service is designed primarily for educational purposes. The tools, calculators, research, and other materials available on the Service are intended to help users learn about investing, financial markets, and financial concepts. They are not intended to provide specific advice for any individual situation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">No Fiduciary Relationship</h2>
            <p>
              Use of the Service does not create a fiduciary relationship between you and FinVision. We are not acting as your financial advisor, investment advisor, broker, or in any fiduciary capacity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Forward-Looking Statements</h2>
            <p>
              The Service may contain forward-looking statements about companies, markets, or economic trends. Forward-looking statements are subject to numerous assumptions, risks, and uncertainties. Actual results could differ materially from those anticipated in forward-looking statements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Disclaimer</h2>
            <p>
              We reserve the right to modify this disclaimer at any time. Changes and clarifications will take effect immediately upon their posting on the Service. We encourage users to check this page periodically for any changes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this Disclaimer, please contact us:
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