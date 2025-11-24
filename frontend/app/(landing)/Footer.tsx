import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "How it works", href: "#how-it-works" },
      { name: "Features", href: "#Features" },
      { name: "Pricing", href: "#Pricing" },
      { name: "About", href: "#About" },
    ],
    features: [
      { name: "Patient Management", href: "#Features" },
      { name: "Queue System", href: "#Features" },
      { name: "AI Clinical Support", href: "#Features" },
      { name: "Lab Management", href: "#Features" },
      { name: "E-Prescriptions", href: "#Features" },
    ],
    useCases: [
      { name: "Private Clinics", href: "#" },
      { name: "Primary Healthcare Centers", href: "#" },
      { name: "Hospitals", href: "#" },
      { name: "Diagnostic Centers", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="">
      <div className="mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="block mb-4">
              <Image
                src="/images/logo.png"
                alt="wecareEHR"
                width={140}
                height={48}
                className="w-32"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Modern EHR system built for African healthcare settings.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Use Cases</h3>
            <ul className="space-y-3">
              {footerLinks.useCases.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} wecareEHR. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
