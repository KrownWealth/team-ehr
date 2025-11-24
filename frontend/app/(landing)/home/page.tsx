"use client";


import React from "react";
import PricingPage from "./Pricing";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import ContactUs from "./Contact";
import Banner from "./Banner";
import About from "./About";

function page() {
  return (
    <div className="p-4 space-y-10 md:space-y-20">
      <Banner />
      <br />
      <About/>
      <Features />
      <PricingPage />
      <HowItWorks />
      <ContactUs />
    </div>
  );
}

export default page;
