// src/components/ChatImageGallery.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AspectRatio } from "./ui/aspect-ratio"; 
import { ExternalLink, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface ChatImage {
  id: string;
  alt: string;
  url: string;
  link: string;
  thumb: string;
}

export default function ChatImageGallery({ images }: { images: ChatImage[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2 grid grid-cols-3 gap-2"
    >
      {images.map((img) => (
        <motion.div 
          key={img.id}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-md overflow-hidden border border-primary/20"
        >
          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="w-full h-full" 
                onClick={() => setSelectedImage(img.url)}
              >
                <AspectRatio ratio={16/9}>
                  <img 
                    src={img.url} 
                    alt={img.alt} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-1 border-none bg-transparent">
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
              <AspectRatio ratio={16/9}>
                <img 
                  src={img.url} 
                  alt={img.alt} 
                  className="object-contain w-full h-full rounded-lg" 
                />
              </AspectRatio>
            </DialogContent>
          </Dialog>
        </motion.div>
      ))}
    </motion.div>
  );
}