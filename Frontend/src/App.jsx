import React from "react";
import "./App.css";
import Layout from "./components/Layout/Layout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./About.jsx";
import History from "./components/History/History.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import MQTTModule from './components/MQTTModule/MQTTModule';
export default function App() {
  return (
    <BrowserRouter>
      <Header title="centralServer" subtitle="Weather Stations" />
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer/>
      <MQTTModule />
    </BrowserRouter>
  );
}
