"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-10 pb-6">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="text-blue-500" />
              <h2 className="font-bold text-lg text-gray-800">HealthCare+</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Modern healthcare management for the digital age
            </p>
          </div>
          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Product</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Company</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          {/* Slow filesystem detected. The benchmark took 804ms. If
          C:\Users\USER\healthcare-app\team-ehr\frontend\.next is a network
          drive, consider moving it to a local folder. If you have an antivirus
          enabled, consider excluding your project directory. */}
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Contact</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>support@healthcare.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Medical Center Drive</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-10 pt-4 text-center text-gray-500 text-sm">
          © 2024 HealthCare+. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
