import React from "react";
import { Play } from "lucide-react";

const HowItWorks = () => {
  return (
    <div id="how-it-works" className="md:p-6 p-3 space-y-14 py-10 scroll-mt-20">
      <div className="header text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          See how it works
        </h2>
        <p className="text-lg text-gray-600">
          Watch how wecareEHR transforms patient care in under 3 minutes
        </p>
      </div>

      <div className="main max-w-screen-2xl mx-auto">
        <div className="video-container rounded-4xl overflow-hidden bg-gray-100 relative aspect-video shadow-xl">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="wecareEHR Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
