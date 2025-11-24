"use client";

import React, { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ImageItem {
  src: string;
  alt: string;
  label: string;
  description: string;
}

interface ImageFolderProps {
  images: {
    desktop: ImageItem[];
    mobile: ImageItem[];
  };
  title?: string;
}

const ImageFolder: React.FC<ImageFolderProps> = ({ images }) => {
  const [currentView, setCurrentView] = useState<"desktop" | "mobile">(
    "mobile"
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCurrentView("desktop");
      } else {
        setCurrentView("mobile");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Select only relevant images
  const currentImages =
    currentView === "desktop" ? images.desktop : images.mobile;
  const hasMultiple = currentImages.length > 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultiple) return;
    setCurrentIndex(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length
    );
  };

  // Don't render anything if no images for the current view
  if (!currentImages || currentImages.length === 0) return null;

  return (
    <div
      className={cn(
        "flex relative mx-auto mt-10 items-end justify-center",
        "lg:w-full lg:max-w-7xl max-w-md md:h-[640px] h-[540px] w-[350px]"
      )}
    >
      {/* Background shadows */}
      <div className="absolute top-0 w-[90%] h-full bg-gray-200 rounded-t-2xl transform -translate-y-6 opacity-60 transition-transform duration-300 ease-out z-0" />
      <div className="absolute top-0 w-[95%] h-full bg-gray-300 rounded-t-2xl transform -translate-y-3 opacity-80 transition-transform duration-300 ease-out z-10" />

      {/* Image container */}
      <div className="relative w-full h-full bg-white rounded-t-2xl shadow-2xl overflow-hidden z-20 border border-gray-200">
        <div className="relative w-full h-full">
          {currentImages.map((img, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out bg-gray-50 lg:p-0 p-0",
                idx === currentIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover lg:object-cover"
              />
            </div>
          ))}

          {hasMultiple && (
            <>
              <div
                onClick={handlePrev}
                className="absolute top-0 left-0 w-1/5 h-full z-30 cursor-pointer group"
              >
                <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div
                onClick={handleNext}
                className="absolute top-0 right-0 w-1/5 h-full z-30 cursor-pointer group"
              >
                <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageFolder;
