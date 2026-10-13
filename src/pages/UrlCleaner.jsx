import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Terminal,
  Filter,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Globe,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function UrlCleaner() {
  const [inputUrls, setInputUrls] = useState("");
  const [includeFilter, setIncludeFilter] = useState("");
  const [excludeFilter, setExcludeFilter] = useState("");
  const [removeWhitespace, setRemoveWhitespace] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [stripTrailingSlash, setStripTrailingSlash] = useState(false);
  const [extractRootDomain, setExtractRootDomain] = useState(false);

  const [outputMode, setOutputMode] = useState("all");
  const [outputUrls, setOutputUrls] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    output: 0,
    removed: 0,
    uniqueDomains: 0,
  });
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const clearAll = () => {
    setInputUrls("");
    setOutputUrls("");
    setIncludeFilter("");
    setExcludeFilter("");
  };

  useEffect(() => {
    try {
      let lines = inputUrls.split(/\r?\n/);

      if (removeWhitespace) {
        lines = lines.map((l) => l.trim()).filter((l) => l.length > 0);
      }

      if (includeFilter.trim() !== "") {
        const terms = includeFilter
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        lines = lines.filter((url) =>
          terms.some((term) => url.toLowerCase().includes(term)),
        );
      }

      if (excludeFilter.trim() !== "") {
        const terms = excludeFilter
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        lines = lines.filter(
          (url) => !terms.some((term) => url.toLowerCase().includes(term)),
        );
      }

      if (stripTrailingSlash) {
        lines = lines.map((url) =>
          url.length > 8 ? url.replace(/\/+\$/, "") : url,
        );
      }

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

      if (removeDuplicates) {
        lines = Array.from(new Set(lines));
      }

      const seenDomains = new Set();
      const uniqueDomainUrls = [];

      lines.forEach((url) => {
        try {
          let u = url.includes("://") ? url : `https://${url}`;
          const hostname = new URL(u).hostname.toLowerCase();
          if (!seenDomains.has(hostname)) {
            seenDomains.add(hostname);
            uniqueDomainUrls.push(url);
          }
        } catch {
          if (url.trim() && !seenDomains.has(url.trim())) {
            seenDomains.add(url.trim());
            uniqueDomainUrls.push(url);
          }
        }
      });

      const activeList = outputMode === "unique" ? uniqueDomainUrls : lines;
      setOutputUrls(activeList.join("\n"));

      const totalLines = inputUrls
        ? inputUrls
            .split(/\r?\n/)
            .filter((l) => (removeWhitespace ? l.trim() : l)).length
        : 0;
      const currentCount = activeList.filter(Boolean).length;

      setStats({
        total: totalLines,
        output: currentCount,
        removed: Math.max(0, totalLines - currentCount),
        uniqueDomains: seenDomains.size,
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
    outputMode,
  ]);

  const handleCopy = () => {
    if (!outputUrls) return;
    navigator.clipboard.writeText(outputUrls);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputUrls) return;
    const fileName =
      outputMode === "unique"
        ? `forgetech-unique-domains-${Date.now()}.txt`
        : `forgetech-filtered-urls-${Date.now()}.txt`;
    const blob = new Blob([outputUrls], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Helmet>
        <title>
          Bulk URL Cleaner & Unique Domain Extractor | Forgetech URL Services
        </title>
      </Helmet>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Input Total
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats.total}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Filtered Output
            </span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            {stats.output}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Filtered Out
            </span>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-300">
            {stats.removed}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Unique Domains
            </span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            {stats.uniqueDomains}
          </div>
        </div>
      </section>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Paste Bulk URLs</span>
              </label>
              <button
                onClick={clearAll}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg"
              >
                Clear
              </button>
            </div>
            <textarea
              value={inputUrls}
              onChange={(e) => setInputUrls(e.target.value)}
              placeholder="Paste URLs here (one per line)..."
              rows={8}
              className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Filter className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs sm:text-sm font-semibold text-slate-200">
                SEO Filtering & Cleaning Rules
              </h2>
            </div>
            <input
              type="text"
              value={includeFilter}
              onChange={(e) => setIncludeFilter(e.target.value)}
              placeholder="Include filter (e.g. .com, /blog)"
              className="w-full bg-black border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="text"
              value={excludeFilter}
              onChange={(e) => setExcludeFilter(e.target.value)}
              placeholder="Exclude filter (e.g. .blogspot, tag)"
              className="w-full bg-black border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <div className="pt-3 space-y-2 border-t border-slate-800">
              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Remove empty lines & whitespace</span>
                <input
                  type="checkbox"
                  checked={removeWhitespace}
                  onChange={(e) => setRemoveWhitespace(e.target.checked)}
                  className="accent-amber-400"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Auto-remove duplicate URLs</span>
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="accent-amber-400"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Strip trailing slashes (/)</span>
                <input
                  type="checkbox"
                  checked={stripTrailingSlash}
                  onChange={(e) => setStripTrailingSlash(e.target.checked)}
                  className="accent-amber-400"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Extract Root Domains Only</span>
                <input
                  type="checkbox"
                  checked={extractRootDomain}
                  onChange={(e) => setExtractRootDomain(e.target.checked)}
                  className="accent-amber-400"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Cleaned Output</span>
              </span>

              <div className="grid grid-cols-2 bg-black p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setOutputMode("all")}
                  className={`px-3 py-1 rounded-md font-medium ${outputMode === "all" ? "bg-amber-400 text-black font-semibold" : "text-slate-400"}`}
                >
                  All Filtered URLs
                </button>
                <button
                  onClick={() => setOutputMode("unique")}
                  className={`px-3 py-1 rounded-md font-medium ${outputMode === "unique" ? "bg-amber-400 text-black font-semibold" : "text-slate-400"}`}
                >
                  Unique Domains
                </button>
              </div>
            </div>

            <textarea
              value={outputUrls}
              readOnly
              rows={14}
              className="w-full flex-1 bg-black border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-amber-200 focus:outline-none min-h-[220px]"
            />

            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleCopy}
                disabled={!outputUrls}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? "Copied!" : "Copy Output"}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputUrls}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs border border-slate-700 flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
