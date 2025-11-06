import React, { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout/Layout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./About.jsx";
import History from "./components/History/History.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import MQTTModule from './components/MQTTModule/MQTTModule';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function detectMobile() {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      if (mobileRegex.test(ua)) return true;
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true;
      return window.innerWidth <= 768;
    }

    setIsMobile(detectMobile());

    function onResize() {
      setIsMobile(detectMobile());
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  if (isMobile) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", padding: 20, textAlign: "center" }}>
        <div>
          <h1>This site is only available on computer</h1>
          <p>Please open this site on a desktop or laptop for the full experience.</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header title="centralServer" subtitle="Weather Stations" />
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}
