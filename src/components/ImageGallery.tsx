import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  children: React.ReactNode;
}

export default function ImageGallery({ images, productName, children }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return <>{children}</>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer group">
          {children}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <ZoomIn className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          {images.length > 1 && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-3 right-3 text-xs bg-black/80 text-white border-none px-2 py-1 font-medium"
            >
              +{images.length - 1} fotos
            </Badge>
          )}
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] h-[95vh] p-0 bg-black border-none overflow-hidden">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
            <div className="text-white">
              <h3 className="font-semibold text-lg truncate max-w-md">{productName}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {currentIndex + 1} de {images.length} imagens
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Imagem principal */}
          <div className="flex-1 relative flex items-center justify-center p-0">
            <img
              src={images[currentIndex]}
              alt={`${productName} - Imagem ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain bg-gray-900"
            />

            {/* Navegação */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 rounded-full p-4 h-12 w-12 shadow-lg backdrop-blur-sm bg-black/30 border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 rounded-full p-4 h-12 w-12 shadow-lg backdrop-blur-sm bg-black/30 border border-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
              <div className="flex gap-3 justify-center overflow-x-auto scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      index === currentIndex 
                        ? 'border-white ring-2 ring-white/50' 
                        : 'border-white/30 hover:border-white/70'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}