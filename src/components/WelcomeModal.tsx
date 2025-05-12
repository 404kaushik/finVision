'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '@/context/TutorialContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTutorial, hasSeenTutorial, setHasSeenTutorial } = useTutorial();

  useEffect(() => {
    // Show modal for first-time visitors
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  const handleStartTutorial = () => {
    setIsOpen(false);
    startTutorial();
  };

  const handleSkipTutorial = () => {
    setIsOpen(false);
    setHasSeenTutorial(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6 mx-4"
          >
            <button
              onClick={handleSkipTutorial}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8 text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Finance Research App!</h2>
              <p className="text-gray-600">
                Your all-in-one platform for financial research, market data, and investment insights.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-500 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Research Companies</h3>
                  <p className="text-sm text-gray-500">Get comprehensive analysis on any publicly traded company</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-500 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Track Markets</h3>
                  <p className="text-sm text-gray-500">Monitor stocks, cryptocurrencies, and market indices</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-500 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Stay Informed</h3>
                  <p className="text-sm text-gray-500">Get the latest financial news and insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSkipTutorial}
                variant="outline"
                className="flex-1"
              >
                Skip Tutorial
              </Button>
              <Button
                onClick={handleStartTutorial}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                Take the Tour
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}