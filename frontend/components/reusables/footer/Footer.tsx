"use client";

import Image from "next/image";
import { useBrand } from "@/lib/hooks/use-brand";

export default function Footer() {
  const brand = useBrand();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Brand Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Image
              src={"/images/logo.png"}
              width={142}
              height={142}
              priority
              alt={brand.name}
              className="cursor-pointer"
            />
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Modern healthcare management for the digital age
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-10 pt-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
