import React from "react";
import "./App.css";
import Layout from "./components/Layout/Layout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./About.jsx";
import Header from "./components/Header/Header.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Header title="centralServer" subtitle="Weather Stations" />
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
