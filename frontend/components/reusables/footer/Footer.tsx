"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Image
                src={"/images/logo.png"}
                width={142}
                height={142}
                priority
                alt="WCE"
                className="cursor-pointer"
              />
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
                  className="hover:text-[#3d7e46] transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#3d7e46] transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#3d7e46] transition-colors"
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
                  className="hover:text-[#3d7e46] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#3d7e46] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#3d7e46] transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

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
          © 2024 weCareEhr. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
