import React from "react";

export default function Footer() {
  return (
    <footer className="mt-16 pt-6 border-t border-slate-800 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span>Forgetech URL Services © 2026 • Built by </span>
          <a
            href="https://devsharl-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline font-medium"
          >
            Sharl
          </a>
        </div>

        {/* Footer Navigation Links */}
        <nav aria-label="Footer Links" className="flex items-center space-x-4">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Sitemap
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Robots.txt
          </a>
        </nav>
      </div>
    </footer>
  );
}
