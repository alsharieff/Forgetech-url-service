import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import UrlCleaner from "./pages/UrlCleaner.jsx";
import SiteStatusChecker from "./pages/SiteStatusChecker.jsx";
import PageSpeedAuditor from "./pages/PageSpeedAuditor.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-amber-400 selection:text-black pb-12">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<UrlCleaner />} />
            <Route path="/status-checker" element={<SiteStatusChecker />} />
            <Route path="/pagespeed" element={<PageSpeedAuditor />} />
            {/* Future pages will be added here as extra <Route /> items */}
          </Routes>
        </main>

        <footer className="mt-16 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>
            Forgetech URL Services © 2026 • Built by{" "}
            <a
              href="https://devsharl-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Sharl
            </a>
          </span>
        </footer>
      </div>
    </BrowserRouter>
  );
}
