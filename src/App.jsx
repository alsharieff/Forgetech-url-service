import React, { useState, useEffect } from "react";
import {
  Terminal,
  Filter,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Globe,
  Zap,
} from "lucide-react";

export default function App() {
  const [inputUrls, setInputUrls] = useState("");
  const [includeFilter, setIncludeFilter] = useState("");
  const [excludeFilter, setExcludeFilter] = useState("");
  const [removeWhitespace, setRemoveWhitespace] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [stripTrailingSlash, setStripTrailingSlash] = useState(false);
  const [extractRootDomain, setExtractRootDomain] = useState(false);

  const [outputUrls, setOutputUrls] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    output: 0,
    removed: 0,
    uniqueDomains: 0,
  });
  const [copied, setCopied] = useState(false);

  const sampleData = `https://example.com/page-1\nhttps://myblog.blogspot.com/post-a\n   \nhttps://example.com/page-1\nhttps://agency.org/services\nhttp://test.blogspot.com/demo?id=123/\nhttps://shop.com/product/\nhttps://example.com/page-2\n   \nhttps://partner.net/about/`;

  const loadSample = () => {
    setInputUrls(sampleData);
  };

  const clearAll = () => {
    setInputUrls("");
    setOutputUrls("");
    setIncludeFilter("");
    setExcludeFilter("");
  };

  useEffect(() => {
    try {
      let lines = inputUrls.split(/\r?\n/);
      const initialCount = lines.length;

      // 1. Whitespace and empty lines
      if (removeWhitespace) {
        lines = lines.map((l) => l.trim()).filter((l) => l.length > 0);
      }

      // 2. Include Filter
      if (includeFilter.trim() !== "") {
        const includeTerms = includeFilter
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        lines = lines.filter((url) => {
          const lower = url.toLowerCase();
          return includeTerms.some((term) => lower.includes(term));
        });
      }

      // 3. Exclude Filter (comma-separated support)
      if (excludeFilter.trim() !== "") {
        const excludeTerms = excludeFilter
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        lines = lines.filter((url) => {
          const lower = url.toLowerCase();
          return !excludeTerms.some((term) => lower.includes(term));
        });
      }

      // 4. Strip Trailing Slashes
      if (stripTrailingSlash) {
        lines = lines.map((url) => {
          try {
            if (url.endsWith("/") && url.length > 8) {
              return url.replace(/\/+$/, "");
            }
            return url;
          } catch {
            return url;
          }
        });
      }

      // 5. Extract Root Domains Only
      if (extractRootDomain) {
        lines = lines.map((url) => {
          try {
            let cleanUrl = url.includes("://") ? url : `https://${url}`;
            const parsed = new URL(cleanUrl);
            return `${parsed.protocol}//${parsed.hostname}`;
          } catch {
            return url;
          }
        });
      }

      // 6. Remove Duplicates
      if (removeDuplicates) {
        lines = Array.from(new Set(lines));
      }

      const finalOutput = lines.join("\n");
      setOutputUrls(finalOutput);

      // Calculate unique domains for stats
      const domainSet = new Set();
      lines.forEach((l) => {
        try {
          let u = l.includes("://") ? l : `https://${l}`;
          domainSet.add(new URL(u).hostname);
        } catch {
          domainSet.add(l);
        }
      });

      setStats({
        total: inputUrls
          ? inputUrls
              .split(/\r?\n/)
              .filter((l) => (removeWhitespace ? l.trim() : l)).length
          : 0,
        output: lines.filter(Boolean).length,
        removed: Math.max(
          0,
          (inputUrls
            ? inputUrls
                .split(/\r?\n/)
                .filter((l) => (removeWhitespace ? l.trim() : l)).length
            : 0) - lines.filter(Boolean).length,
        ),
        uniqueDomains: domainSet.size,
      });
    } catch (err) {
      console.error(err);
    }
  }, [
    inputUrls,
    includeFilter,
    excludeFilter,
    removeWhitespace,
    removeDuplicates,
    stripTrailingSlash,
    extractRootDomain,
  ]);

  const handleCopy = () => {
    if (!outputUrls) return;
    navigator.clipboard.writeText(outputUrls);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputUrls) return;
    const blob = new Blob([outputUrls], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sharl-service-filtered-urls-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Forgetech url services
                </h1>
                <span className="text-xs font-semibold uppercase tracking-wider bg-slate-900 text-blue-400 border border-slate-700 px-3 py-1 rounded-md">
                  SEO Suite
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Advanced Bulk URL Cleaner, Filter & Domain Extractor
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Input Total
                </span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-500 mt-1">
                Total lines processed
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Filtered Output
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {stats.output}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Clean URLs ready
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Filtered Out
                </span>
                <Trash2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-300">
                {stats.removed}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Duplicates & rules matched
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Unique Domains
                </span>
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {stats.uniqueDomains}
              </div>
              <div className="text-xs text-slate-500 mt-1">Distinct hosts</div>
            </div>
          </div>

          {/* Main Grid: Control Panel & Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Control Panel & Input */}
            <div className="lg:col-span-5 space-y-6">
              {/* Input Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span>Paste Bulk URLs</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={loadSample}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Sample</span>
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  value={inputUrls}
                  onChange={(e) => setInputUrls(e.target.value)}
                  placeholder="Paste URLs here (one per line)... e.g. https://example.com/page, https://blog.blogspot.com/post"
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                  <span>Supports raw text lists, sitemaps, exports</span>
                  <span className="font-mono">
                    {inputUrls.split(/\r?\n/).filter(Boolean).length} lines
                  </span>
                </div>
              </div>

              {/* Filters & Rules Control Center */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    SEO Filtering & Cleaning Rules
                  </h2>
                </div>

                {/* Include Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Include Filter (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={includeFilter}
                    onChange={(e) => setIncludeFilter(e.target.value)}
                    placeholder="e.g. .com, /services"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Keeps only URLs containing these strings.
                  </p>
                </div>

                {/* Exclude Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Exclude Filter (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={excludeFilter}
                    onChange={(e) => setExcludeFilter(e.target.value)}
                    placeholder="e.g. .blogspot.com, .org, tag"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Removes URLs matching these terms (.blogspot, etc.).
                  </p>
                </div>

                {/* Toggles */}
                <div className="pt-3 space-y-3 border-t border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Remove empty lines & whitespace
                    </span>
                    <input
                      type="checkbox"
                      checked={removeWhitespace}
                      onChange={(e) => setRemoveWhitespace(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Auto-remove duplicate URLs
                    </span>
                    <input
                      type="checkbox"
                      checked={removeDuplicates}
                      onChange={(e) => setRemoveDuplicates(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Strip trailing slashes (
                      <code className="text-blue-400">/</code>)
                    </span>
                    <input
                      type="checkbox"
                      checked={stripTrailingSlash}
                      onChange={(e) => setStripTrailingSlash(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Extract Root Domains Only
                    </span>
                    <input
                      type="checkbox"
                      checked={extractRootDomain}
                      onChange={(e) => setExtractRootDomain(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-600"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Output Section */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm font-semibold text-slate-200">
                      Cleaned Output Results
                    </h2>
                  </div>
                  <span className="text-xs bg-slate-950 text-blue-400 border border-slate-800 px-3 py-1 rounded-md font-mono">
                    {stats.output} URLs
                  </span>
                </div>

                <textarea
                  value={outputUrls}
                  readOnly
                  placeholder="Filtered URLs will appear here automatically..."
                  rows={20}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-blue-300 placeholder-slate-600 focus:outline-none resize-y"
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    {copied ? (
                      <span className="text-blue-400 font-medium flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Successfully copied to clipboard!</span>
                      </span>
                    ) : (
                      <span>Ready to export for SEO audits or sitemaps.</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button
                      onClick={handleCopy}
                      disabled={!outputUrls}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Output</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      disabled={!outputUrls}
                      className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            <span>sharl-service © 2026 • Advanced SEO URL Toolkit</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>All filters running locally in-browser</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
