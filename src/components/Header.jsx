import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Terminal, Zap } from "lucide-react";
import logo from "../assets/forgetech_logo.png";

export default function Header() {
  const location = useLocation();

  const navItems = [
    { name: "URL Cleaner", path: "/", icon: Terminal },
    { name: "Speed Auditor", path: "/pagespeed", icon: Zap },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-slate-800 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Forgetech Logo"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-lg font-bold text-white tracking-tight">
              Forgetech <span className="text-amber-400">URL Services</span>
            </h1>
          </Link>

          <a
            href="https://devsharl-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden flex items-center space-x-1 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg"
          >
            <span>Sharl</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Multi-Tool Navigation Menu */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-400 text-black font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Author Credit */}
        <a
          href="https://devsharl-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
        >
          <span>
            Built by <strong className="text-slate-200">Sharl</strong>
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}
