import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Load GA script once
    if (!window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-7CTLFMZB4R";
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag("js", new Date());
        gtag("config", "G-7CTLFMZB4R");

        console.log("✅ Google Analytics initialized");
      };
    }

    // Track page view on route change
    if (window.gtag) {
      window.gtag("config", "G-7CTLFMZB4R", {
        page_path: location.pathname,
      });
      console.log(`📊 GA pageview tracked: ${location.pathname}`);
    }
  }, [location]);

  return null; // This component renders nothing
};

export default GoogleAnalytics;
