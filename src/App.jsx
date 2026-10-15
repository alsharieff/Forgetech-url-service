import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import UrlCleaner from "./pages/UrlCleaner.jsx";
import ImageConverter from "./pages/ImageConverter.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-amber-400 selection:text-black pb-12">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<UrlCleaner />} />
            <Route path="/image-converter" element={<ImageConverter />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
