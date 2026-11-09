import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);

// Register the service worker so Veltrix can be installed as a PWA.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Veltrix service worker registration failed:", error);
    });
  });
}
