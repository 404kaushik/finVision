// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
// import { useTutorial } from '@/context/TutorialContext';
// import { Button } from '@/components/ui/button';
// import { motion } from 'framer-motion';

// export default function Tutorial() {
//   const router = useRouter();
//   const { 
//     isTutorialActive, 
//     endTutorial, 
//     currentStep, 
//     setCurrentStep,
//     hasSeenTutorial
//   } = useTutorial();

//   // Define the tutorial steps with page paths
//   const steps: (Step & { path?: string })[] = [
//     {
//       target: 'body',
//       content: (
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold">Welcome to Finance Research App!</h2>
//           <p>This quick tour will guide you through the main features of our application.</p>
//           <p>Click "Next" to continue or "Skip" to exit the tutorial.</p>
//         </div>
//       ),
//       placement: 'center',
//       disableBeacon: true,
//       path: '/', // Home page
//     },
//     {
//       target: '.search-bar',
//       content: (
//         <div className="space-y-3">
//           <h3 className="text-lg font-semibold">Research Tool</h3>
//           <p>Enter a company name to get comprehensive research and analysis.</p>
//           <p>Our AI-powered tool provides insights on financials, market position, and more.</p>
//         </div>
//       ),
//       placement: 'top',
//       path: '/', // Research page
//     },
//     {
//       target: '.stock-carousel',
//       content: (
//         <div className="space-y-3">
//           <h3 className="text-lg font-semibold">Stock Carousel</h3>
//           <p>Browse through popular stocks and see their current prices and performance.</p>
//           <p>Click on any stock to view more detailed information.</p>
//         </div>
//       ),
//       placement: 'top',
//       path: '/', // Home page
//     },
//     {
//       target: '.crypto-section',
//       content: (
//         <div className="space-y-3">
//           <h3 className="text-lg font-semibold">Cryptocurrency Tracker</h3>
//           <p>Monitor the latest cryptocurrency prices and market trends.</p>
//           <p>Stay updated with real-time data on major cryptocurrencies.</p>
//         </div>
//       ),
//       placement: 'bottom',
//       path: '/', // Crypto page
//     },
//     {
//       target: '.market-section',
//       content: (
//         <div className="space-y-3">
//           <h3 className="text-lg font-semibold">Financial News</h3>
//           <p>Get the latest news related to companies and markets.</p>
//           <p>Stay informed about events that might impact your investments.</p>
//         </div>
//       ),
//       placement: 'top',
//       path: '/', // News page
//     },
//     {
//       target: 'body',
//       content: (
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold">You're all set!</h2>
//           <p>You now know the main features of our Finance Research App.</p>
//           <p>Feel free to explore and discover more on your own!</p>
//         </div>
//       ),
//       placement: 'center',
//       path: '/', // Return to home page
//     },
//   ];

//   // Navigate to the correct page when step changes
//   useEffect(() => {
//     if (isTutorialActive && steps[currentStep]?.path) {
//       const currentPath = window.location.pathname;
//       const targetPath = steps[currentStep].path;
      
//       if (currentPath !== targetPath) {
//         router.push(targetPath);
//       }
//     }
//   }, [currentStep, isTutorialActive, router, steps]);

//   const handleJoyrideCallback = (data: CallBackProps) => {
//     const { status, index, type, action } = data;
    
//     // Handle navigation between steps
//     if (type === 'step:after' && action === 'next') {
//       // Move to the next step
//       setCurrentStep(index + 1);
//     } else if (type === 'step:after' && action === 'prev') {
//       // Move to the previous step
//       setCurrentStep(index - 1);
//     } else if (type === 'step:before') {
//       // Update current step when a step is about to be shown
//       setCurrentStep(index);
//     }
    
//     // End the tutorial when it's finished or skipped
//     if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
//       endTutorial();
//     }
    
//     // Scroll to the target element when step changes
//     if (type === 'step:after' && index < steps.length - 1) {
//       const nextStep = steps[index + 1];
//       if (nextStep.target !== 'body') {
//         const targetElement = document.querySelector(nextStep.target as string);
//         if (targetElement) {
//           targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         }
//       }
//     }
//   };

//   return (
//     <>
//       {isTutorialActive && (
//         <Joyride
//           steps={steps}
//           run={isTutorialActive}
//           continuous={true}
//           showProgress={true}
//           showSkipButton={true}
//           callback={handleJoyrideCallback}
//           stepIndex={currentStep}
//           styles={{
//             options: {
//               primaryColor: '#3b82f6', // blue-500
//               textColor: '#1f2937', // gray-800
//               backgroundColor: '#ffffff',
//               arrowColor: '#ffffff',
//               overlayColor: 'rgba(0, 0, 0, 0.5)',
//             },
//             tooltip: {
//               borderRadius: '0.5rem',
//               padding: '1rem',
//             },
//             buttonNext: {
//               backgroundColor: '#3b82f6',
//               borderRadius: '0.25rem',
//               color: '#ffffff',
//             },
//             buttonBack: {
//               color: '#6b7280',
//               marginRight: '0.5rem',
//             },
//             buttonSkip: {
//               color: '#6b7280',
//             },
//           }}
//           locale={{
//             last: 'Finish',
//             skip: 'Skip tutorial',
//           }}
//           disableOverlayClose={true}
//           disableCloseOnEsc={true}
//         />
//       )}

//       {!isTutorialActive && !hasSeenTutorial && (
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="fixed bottom-6 right-6 z-50"
//         >
//           <Button 
//             onClick={() => endTutorial()}
//             className="mr-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
//           >
//             Skip Tutorial
//           </Button>
//           <Button 
//             onClick={() => setCurrentStep(0)}
//             className="bg-blue-500 hover:bg-blue-600"
//           >
//             Start Tutorial
//           </Button>
//         </motion.div>
//       )}
//     </>
//   );
// }