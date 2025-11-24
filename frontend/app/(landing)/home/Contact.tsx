import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinicName: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div id="Contact" className="md:p-6 p-3 space-y-14 scroll-mt-20">
      <div className="header text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          Ready to transform <br /> your clinic?
        </h2>
        <p className="text-lg text-gray-600">
          Get in touch and we'll help you get started in 15 minutes
        </p>
      </div>

      <div className="main max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-semibold mb-6">Let's talk</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're a solo practitioner or running a multi-facility
                hospital, we're here to help you digitize patient care.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Mail className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Email us</p>
                  <a
                    href="mailto:hello@wecareehr.com"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    hello@wecareehr.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Phone className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Call us</p>
                  <a
                    href="tel:+2349012345678"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    +234 901 234 5678
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <MapPin className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Visit us</p>
                  <p className="text-gray-600">Lagos, Nigeria</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-4xl p-8">
              <h4 className="font-semibold text-xl mb-3">Free 30-day trial</h4>
              <p className="text-gray-600 leading-relaxed">
                No credit card required. Get full access to all features. Cancel
                anytime. Setup assistance included.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-100 rounded-4xl p-10 md:p-12">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Dr. Adewale Johnson"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="adewale@clinic.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+234 901 234 5678"
                />
              </div>

              <div>
                <label
                  htmlFor="clinicName"
                  className="block text-sm font-semibold mb-2"
                >
                  Clinic/Hospital Name
                </label>
                <input
                  type="text"
                  id="clinicName"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="St. Mary's Clinic"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell us about your clinic and what you need..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Send Message
                <Send className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
