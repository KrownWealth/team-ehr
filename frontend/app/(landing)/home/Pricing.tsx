import Gradient1 from "@/components/reusables/Gradient1";
import React, { useState } from "react";

type BillingPeriod = "annual" | "monthly";

interface PricingData {
  price: number;
  save: number;
  perUser: number;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonStyle: "primary" | "secondary";
  badge?: string | null;
  showToggle?: boolean;
  subtext?: string;
  recommended?: boolean;
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const proPricing: Record<BillingPeriod, PricingData> = {
    annual: { price: 15000, save: 48000, perUser: 12000 },
    monthly: { price: 20000, save: 0, perUser: 16000 },
  };

  const currentProPricing = proPricing[billingPeriod];

  const pricingPlans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      description: "Perfect for solo practitioners.",
      features: [
        "Up to 50 patient records",
        "Basic patient registration",
        "Digital vitals recording",
        "Simple consultation notes",
        "Mobile access",
        "Email support",
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "secondary",
    },
    {
      id: "professional",
      name: "Professional",
      price: `₦${currentProPricing.price.toLocaleString()}/mo`,
      description: "For growing clinics.",
      features: [
        "Unlimited patient records",
        "AI-powered diagnosis suggestions",
        "Complete SOAP notes system",
        "Lab orders & results management",
        "SMS notifications included",
        "Priority support",
      ],
      buttonText: "Start 30-Day Free Trial",
      buttonStyle: "primary",
      badge:
        currentProPricing.save > 0
          ? `Save ₦${currentProPricing.save.toLocaleString()}/year`
          : null,
      showToggle: true,
      subtext: "No credit card required • Cancel anytime",
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "For hospitals and multi-facility orgs.",
      features: [
        "Everything in Professional",
        "Multi-clinic management",
        "Custom integrations (NHIS, HMOs)",
        "Advanced analytics & reporting",
        "Volume discounts available",
      ],
      buttonText: "Contact Sales",
      buttonStyle: "secondary",
    },
  ];

  return (
    <div
      id="Pricing"
      className="min-h-screen relative flex items-center justify-center p-8 py-20 overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 z-0 bg-primary rounded-4xl overflow-hidden">
        <Gradient1 />
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in drop-shadow-lg">
            Affordable Pricing
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 relative h-fit ${
                hoveredCard === plan.id ? "transform scale-105 shadow-2xl" : ""
              } ${
                plan.recommended ? "ring-4 ring-green-400 lg:-mt-4 lg:mb-4" : ""
              }`}
              onMouseEnter={() => setHoveredCard(plan.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="mb-6">
                {plan.showToggle && (
                  <div className="flex items-center justify-center space-x-2 mb-6 bg-gray-100 rounded-full p-1 w-fit mx-auto">
                    <button
                      onClick={() => setBillingPeriod("annual")}
                      className={`text-sm font-medium transition-all px-6 py-2 rounded-full ${
                        billingPeriod === "annual"
                          ? "bg-green-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Annual (Save 20%)
                    </button>
                    <button
                      onClick={() => setBillingPeriod("monthly")}
                      className={`text-sm font-medium transition-all px-6 py-2 rounded-full ${
                        billingPeriod === "monthly"
                          ? "bg-green-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                )}

                <div className="text-center mb-8">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {plan.name}
                  </p>
                  {plan.badge && (
                    <span className="inline-block text-xs text-green-700 font-semibold bg-green-50 px-3 py-1 rounded-full mb-3 border border-green-200">
                      {plan.badge}
                    </span>
                  )}

                  <h2 className="text-5xl font-bold text-gray-900 mb-3 transition-all duration-300">
                    {plan.price}
                  </h2>
                  <p className="text-gray-600 text-sm px-4">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start text-sm text-gray-700 transition-all duration-200 hover:translate-x-1"
                  >
                    <svg
                      className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: feature.replace(
                          /(₦[\d,]+\/month)/,
                          '<span class="font-semibold text-green-700">$1</span>'
                        ),
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 ${
                  plan.buttonStyle === "primary"
                    ? "bg-linear-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white shadow-lg transform hover:scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-200 hover:border-gray-300"
                }`}
              >
                {plan.buttonText}
              </button>

              {plan.subtext && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  {plan.subtext}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
