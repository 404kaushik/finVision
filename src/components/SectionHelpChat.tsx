// src/components/SectionHelpChat.tsx

import { useState, useEffect, useRef } from "react";
import { HelpCircle, Send, X, ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import ChatImageGallery from "./ChatImageGallery";
import { toast } from "sonner";

interface SectionHelpChatProps {
  sectionTitle: string;
  sectionContext: string;
  companyName?: string;
  onNewResponse?: (sectionTitle: string, question: string, answer: string) => void;
}

interface ChatMessage {
  question: string;
  answer: string;
  timestamp?: Date;
  images?: {
    id: string;
    alt: string;
    url: string;
    link: string;
    thumb: string;
  }[];
}

export default function SectionHelpChat({ 
  sectionTitle, 
  sectionContext, 
  companyName = "",
  onNewResponse 
}: SectionHelpChatProps) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<any[]>([]);

  useEffect(() => {
    if (companyName) {
      fetchCachedResponses();
    }
  }, [companyName, sectionTitle]);

  useEffect(() => {
    if (open && companyName) {
      fetchCachedResponses();
    }
  }, [open, companyName, sectionTitle]);

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);

  useEffect(() => {
    if (chatAreaRef.current && chatOpen) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatHistory, answer, chatOpen]);

  // Add useEffect to save updated chat history to database
  useEffect(() => {
    if (chatHistory.length > 0 && companyName) {
      console.log(`Saving ${chatHistory.length} chat messages for section "${sectionTitle}"`);
      saveResponsesToDatabase();
    }
  }, [chatHistory, sectionTitle, companyName]);

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      // Save any pending changes when component unmounts
      if (chatHistory.length > 0 && companyName) {
        console.log('Saving on unmount:', chatHistory);
        saveResponsesToDatabase(chatHistory);
      }
    };
  }, [chatHistory, companyName]);

  const fetchCachedResponses = async () => {
    if (!companyName) {
      console.log("Cannot fetch responses: company name is missing");
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Cannot fetch responses: user is not authenticated");
        return;
      }

      // Convert company name to lowercase for consistent comparison
      const normalizedCompanyName = companyName.toLowerCase();

      const { data, error } = await supabase
        .from("saved_research")
        .select("chat_responses")
        .eq("user_id", user.id)
        .eq("company_name", normalizedCompanyName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setChatHistory([]);
          return;
        }
        console.error("Error fetching saved research:", error);
        setError("Failed to load saved responses. Please try again.");
        return;
      }

      if (!data?.chat_responses?.[sectionTitle]) {
        setChatHistory([]);
        return;
      }

      // Process and validate the responses
      const sectionResponses = data.chat_responses[sectionTitle].map((item: any) => ({
        question: item.question || '',
        answer: item.answer || '',
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        images: item.images || []
      }));

      setChatHistory(sectionResponses);
    } catch (err) {
      console.error("Error fetching cached responses:", err);
      setError("Failed to load saved responses. Please try again.");
    }
  };

  const saveResponsesToDatabase = async (currentHistory = chatHistory) => {
    if (!companyName) {
      console.log("Cannot save responses: company name is missing");
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Cannot save responses: user is not authenticated");
        return;
      }

      console.log('Saving responses for company:', companyName);
      console.log('Current history to save:', currentHistory);

      // First get the existing chat responses
      const { data: existingData, error: fetchError } = await supabase
        .from("saved_research")
        .select("chat_responses")
        .eq("user_id", user.id)
        .eq("company_name", companyName.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching existing data:", fetchError);
        throw fetchError;
      }

      // Merge existing responses with new ones
      const existingResponses = existingData?.chat_responses || {};
      const updatedResponses = {
        ...existingResponses,
        [sectionTitle]: currentHistory // Use the passed currentHistory
      };

      console.log('Existing responses:', existingResponses);
      console.log('Updated responses to save:', updatedResponses);

      // Save the merged responses back to Supabase
      const { error: upsertError } = await supabase
        .from("saved_research")
        .upsert({
          user_id: user.id,
          company_name: companyName.toLowerCase(),
          chat_responses: updatedResponses,
        }, {
          onConflict: 'user_id,company_name'
        });
      
      if (upsertError) {
        console.error("Error saving chat responses:", upsertError);
        throw upsertError;
      }
      
      console.log(`Successfully saved ${currentHistory.length} responses for section "${sectionTitle}"`);
      // toast.success("Responses saved successfully");
    } catch (err) {
      console.error("Error in saveResponsesToDatabase:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save responses";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setContentLoading(true);
    setImagesLoading(true);
    setError(null);
    setCurrentImages([]);

    const questionText = question;
    setCurrentQuestion(questionText);
    setQuestion("");
    
    try {
      if (!companyName) {
        throw new Error("Company information is missing");
      }

      const res = await fetch("/api/section-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle,
          sectionContext,
          question: questionText,
          companyName
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get answer");
      }
      
      const data = await res.json();
      setAnswer(data.answer);
      setCurrentImages(data.images || []);
      
      const newResponse = { 
        question: questionText, 
        answer: data.answer,
        images: data.images || [],
        timestamp: new Date()
      };
      
      // Update chat history and save to database
      setChatHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newResponse];
        saveResponsesToDatabase(updatedHistory);
        return updatedHistory;
      });
      
      if (onNewResponse) {
        onNewResponse(sectionTitle, questionText, data.answer);
      }

      // Set content loading to false after a short delay to allow for smooth animation
      setTimeout(() => {
        setContentLoading(false);
      }, 500);

      // Handle image loading
      if (data.images && data.images.length > 0) {
        const imagePromises = data.images.map((img: any) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(true);
            image.onerror = () => resolve(true); // Resolve even on error to not block loading state
            image.src = img.url;
          });
        });

        Promise.all(imagePromises).then(() => {
          setImagesLoading(false);
        });
      } else {
        setImagesLoading(false);
      }

      // toast.success("Response received");
    } catch (err) {
      console.error("Error in handleSend:", err);
      const errorMessage = err instanceof Error ? err.message : "Sorry, something went wrong.";
      setError(errorMessage);
      toast.error(errorMessage);
      setContentLoading(false);
      setImagesLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen) {
      setAnswer(null);
      setCurrentImages([]);
    }
    // Save responses when closing the chat
    if (chatOpen && chatHistory.length > 0) {
      console.log('Saving on chat close:', chatHistory);
      saveResponsesToDatabase(chatHistory);
    }
  };

  return (
    <div className="mt-4 mb-2 relative flex justify-end ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 transition-all bg-white dark:bg-accent hover:bg-primary hover:text-primary-foreground flex gap-1.5 shadow-xl"
              onClick={() => setOpen((v) => !v)}
              aria-label="Ask about this section"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Help?</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Ask Perplexity questions about this section</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 bottom-full mb-2 right-0 w-[350px] sm:w-[450px]"
          >
            <Card className="overflow-hidden border shadow-lg max-h-[500px]">
              <div className="flex items-center justify-between bg-accent dark:bg-accent/50 text-muted-foreground dark:text-white/90 p-3 border-b-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Ask about {sectionTitle}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    if (chatHistory.length > 0) {
                      console.log('Saving on modal close:', chatHistory);
                      saveResponsesToDatabase(chatHistory);
                    }
                    setOpen(false);
                  }}
                >
                  <X className="w-4 h-4 text-muted-foreground dark:text-white/90" />
                </Button>
              </div>
              
              <CardContent className="p-0">
                {chatHistory.length > 0 && (
                  <div 
                    className="p-3 border-b flex items-center justify-between cursor-pointer hover:bg-muted/40"
                    onClick={toggleChat}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-xs">
                        {chatHistory.length} {chatHistory.length === 1 ? 'Question' : 'Questions'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">View previous questions</span>
                    </div>
                    {chatOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
                
                <AnimatePresence>
                  {chatOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ScrollArea className="h-[250px] max-h-[250px] p-3">
                        <div className="space-y-4">
                          {chatHistory.map((item, index) => (
                            <div key={index} className="space-y-3">
                              {/* User Message */}
                              <div className="flex justify-end">
                                <div className="max-w-[80%] flex flex-col items-end gap-1">
                                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm">
                                    <p className="text-sm">{item.question}</p>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground px-2">
                                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                  </span>
                                </div>
                              </div>
                              
                              {/* AI Response */}
                              <div className="flex justify-start">
                                <div className="max-w-[80%] flex flex-col items-start gap-1">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                                      <AvatarFallback className="text-xs text-white">P</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
                                      <div className="text-sm whitespace-pre-wrap space-y-2 break-words">
                                        {item.answer.split('\n').map((paragraph, i) => {
                                          // Handle headers (assuming they start with # or **)
                                          if (paragraph.startsWith('**') || paragraph.startsWith('#')) {
                                            const headerText = paragraph.replace(/\*\*|#/g, '').trim();
                                            let emoji = "✨";
                                            
                                            // Choose emoji based on content
                                            if (headerText.toLowerCase().includes('summary')) emoji = "✨"; 
                                            else if (headerText.toLowerCase().includes('key')) emoji = "🔑";
                                            else if (headerText.toLowerCase().includes('important')) emoji = "💡";
                                            else if (headerText.toLowerCase().includes('benefit')) emoji = "✅";
                                            else if (headerText.toLowerCase().includes('growth')) emoji = "📈";
                                            else if (headerText.toLowerCase().includes('risk')) emoji = "⚠️";
                                            else if (headerText.toLowerCase().includes('revenue')) emoji = "💰";
                                            else if (headerText.toLowerCase().includes('analysis')) emoji = "📊";
                                            else if (headerText.toLowerCase().includes('outlook')) emoji = "🔮";
                                            else if (headerText.toLowerCase().includes('conclusion')) emoji = "🎯";
                                            else if (headerText.toLowerCase().includes('global')) emoji = "🌍";
                                            else if (headerText.toLowerCase().includes('market')) emoji = "📊";
                                            else if (headerText.toLowerCase().includes('presence')) emoji = "🌐";
                                            else if (headerText.toLowerCase().includes('strength')) emoji = "💪";
                                            
                                            return (
                                              <motion.p 
                                                key={i} 
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="font-bold text-primary mt-3 mb-1 flex items-center gap-2 border-b border-primary/20 pb-1"
                                              >
                                                <span className="text-lg">{emoji}</span> <span className="font-bold">{headerText}</span>
                                              </motion.p>
                                            );
                                          }
                                          
                                          // Handle bullet points
                                          if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                                            return (
                                              <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="ml-4 flex gap-2 items-start my-1.5"
                                              >
                                                <span className="text-primary/70">•</span>
                                                <span>{paragraph.replace(/^[•-]\s*/, '')}</span>
                                              </motion.div>
                                            );
                                          }
                                          
                                          // Handle numbered lists
                                          if (/^\d+\.\s/.test(paragraph.trim())) {
                                            return (
                                              <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="ml-4 flex gap-2 items-start my-1.5"
                                              >
                                                <span className="text-primary/80 font-medium">{paragraph.match(/^\d+\./)?.[0]}</span>
                                                <span>{paragraph.replace(/^\d+\.\s*/, '')}</span>
                                              </motion.div>
                                            );
                                          }
                                          
                                          // Handle key terms with colons
                                          if (paragraph.includes(':') && !paragraph.startsWith('http')) {
                                            const [term, ...rest] = paragraph.split(':');
                                            const description = rest.join(':');
                                            
                                            return (
                                              <p key={i} className={i > 0 ? "mt-2" : ""}>
                                                <span className="font-semibold text-primary/90">{term}:</span>
                                                {description}
                                              </p>
                                            );
                                          }
                                          
                                          // Regular paragraphs with subtle fade-in
                                          return (
                                            <motion.p 
                                              key={i} 
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              transition={{ duration: 0.3 }}
                                              className={i > 0 ? "mt-2" : ""}
                                            >
                                              {paragraph}
                                            </motion.p>
                                          );
                                        })}
                                      </div>
                                      
                                      {item.images && item.images.length > 0 && (
                                        <ChatImageGallery images={item.images} />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground px-2 ml-8">
                                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={chatAreaRef} />
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {answer && !chatOpen && (
                  <div className="p-3 space-y-3 max-h-[250px] overflow-y-auto">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] flex flex-col items-end gap-1">
                        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm">
                          <p className="text-sm">{currentQuestion}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground px-2">
                          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <AvatarFallback className="text-xs text-white">P</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
                            {contentLoading ? (
                              <div className="space-y-2">
                                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-3/4" />
                                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-1/2" />
                                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-2/3" />
                              </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap space-y-2 break-words">
                                {answer.split('\n').map((paragraph, i) => {
                                  // Handle headers (assuming they start with # or **)
                                  if (paragraph.startsWith('**') || paragraph.startsWith('#')) {
                                    const headerText = paragraph.replace(/\*\*|#/g, '').trim();
                                    let emoji = "✨";
                                    
                                    // Choose emoji based on content
                                    if (headerText.toLowerCase().includes('summary')) emoji = "✨"; 
                                    else if (headerText.toLowerCase().includes('key')) emoji = "🔑";
                                    else if (headerText.toLowerCase().includes('important')) emoji = "💡";
                                    else if (headerText.toLowerCase().includes('benefit')) emoji = "✅";
                                    else if (headerText.toLowerCase().includes('growth')) emoji = "📈";
                                    else if (headerText.toLowerCase().includes('risk')) emoji = "⚠️";
                                    else if (headerText.toLowerCase().includes('revenue')) emoji = "💰";
                                    else if (headerText.toLowerCase().includes('analysis')) emoji = "📊";
                                    else if (headerText.toLowerCase().includes('outlook')) emoji = "🔮";
                                    else if (headerText.toLowerCase().includes('conclusion')) emoji = "🎯";
                                    else if (headerText.toLowerCase().includes('global')) emoji = "🌍";
                                    else if (headerText.toLowerCase().includes('market')) emoji = "📊";
                                    else if (headerText.toLowerCase().includes('presence')) emoji = "🌐";
                                    else if (headerText.toLowerCase().includes('strength')) emoji = "💪";
                                    
                                    return (
                                      <motion.p 
                                        key={i} 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="font-bold text-primary mt-3 mb-1 flex items-center gap-2 border-b border-primary/20 pb-1"
                                      >
                                        <span className="text-lg">{emoji}</span> <span className="font-bold">{headerText}</span>
                                      </motion.p>
                                    );
                                  }
                                  
                                  // Handle bullet points
                                  if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                                    return (
                                      <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="ml-4 flex gap-2 items-start my-1.5"
                                      >
                                        <span className="text-primary/70">•</span>
                                        <span>{paragraph.replace(/^[•-]\s*/, '')}</span>
                                      </motion.div>
                                    );
                                  }
                                  
                                  // Handle numbered lists
                                  if (/^\d+\.\s/.test(paragraph.trim())) {
                                    return (
                                      <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="ml-4 flex gap-2 items-start my-1.5"
                                      >
                                        <span className="text-primary/80 font-medium">{paragraph.match(/^\d+\./)?.[0]}</span>
                                        <span>{paragraph.replace(/^\d+\.\s*/, '')}</span>
                                      </motion.div>
                                    );
                                  }
                                  
                                  // Handle key terms with colons
                                  if (paragraph.includes(':') && !paragraph.startsWith('http')) {
                                    const [term, ...rest] = paragraph.split(':');
                                    const description = rest.join(':');
                                    
                                    return (
                                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                                        <span className="font-semibold text-primary/90">{term}:</span>
                                        {description}
                                      </p>
                                    );
                                  }
                                  
                                  // Regular paragraphs with subtle fade-in
                                  return (
                                    <motion.p 
                                      key={i} 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className={i > 0 ? "mt-2" : ""}
                                    >
                                      {paragraph}
                                    </motion.p>
                                  );
                                })}
                              </div>
                            )}
                            
                            {imagesLoading && (
                              <div className="mt-4 grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                  <div 
                                    key={i} 
                                    className="aspect-video bg-muted-foreground/20 rounded animate-pulse"
                                  />
                                ))}
                              </div>
                            )}
                            
                            {!imagesLoading && answer && (
                              <ChatImageGallery images={currentImages} />
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground px-2 ml-8">
                          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3 border-t bg-muted/30">
                  <div className="flex gap-2 items-center">
                    <Input
                      ref={inputRef}
                      className="flex-1 bg-background border-muted-foreground/10 rounded-full py-2 px-4"
                      placeholder="Message Perplexity..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={loading}
                      onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={loading || !question.trim()} 
                      size="icon"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-9 w-9 shadow-sm"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <span>Perplexity is thinking...</span>
                    </div>                
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}