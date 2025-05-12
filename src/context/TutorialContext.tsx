'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TutorialContextType = {
  isTutorialActive: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('hasSeenTutorial');
    if (tutorialSeen) {
      setHasSeenTutorial(JSON.parse(tutorialSeen));
    }
  }, []);

  // Save tutorial state to localStorage
  useEffect(() => {
    localStorage.setItem('hasSeenTutorial', JSON.stringify(hasSeenTutorial));
  }, [hasSeenTutorial]);

  const startTutorial = () => {
    setIsTutorialActive(true);
    setCurrentStep(0);
  };

  const endTutorial = () => {
    setIsTutorialActive(false);
    setCurrentStep(0);
    setHasSeenTutorial(true);
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        startTutorial,
        endTutorial,
        currentStep,
        setCurrentStep,
        hasSeenTutorial,
        setHasSeenTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}