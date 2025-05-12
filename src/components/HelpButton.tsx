'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '@/context/TutorialContext';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTutorial } = useTutorial();

  const handleStartTutorial = () => {
    setIsOpen(false);
    startTutorial();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600 shadow-lg"
        aria-label="Help"
      >
        <HelpCircle size={24} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64"
          >
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Need help?</h3>
              <p className="text-sm text-gray-500">
                Take a guided tour to learn about the features of our application.
              </p>
              <Button
                onClick={handleStartTutorial}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Start Tutorial
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}