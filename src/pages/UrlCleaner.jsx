import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Layers,
  CheckCircle2,
  Trash2,
  Globe,
  Filter,
  Copy,
  Download,
  Check,
  HelpCircle,
} from "lucide-react";

export default function UrlCleaner() {
  const [inputUrls, setInputUrls] = useState("");
  const [outputUrls, setOutputUrls] = useState([]);
  const [uniqueDomains, setUniqueDomains] = useState([]);
  const [includeFilter, setIncludeFilter] = useState("");
  const [excludeFilter, setExcludeFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copied, setCopied] = useState(false);

  // Checkbox Rules
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [stripTrailingSlashes, setStripTrailingSlashes] = useState(false);
  const [extractRootDomains, setExtractRootDomains] = useState(false);

  // Metrics
  const [stats, setStats] = useState({
    inputTotal: 0,
    filteredOutput: 0,
    filteredOut: 0,
    uniqueDomainsCount: 0,
  });

  useEffect(() => {
    processUrls();
  }, [
    inputUrls,
    includeFilter,
    excludeFilter,
    removeEmpty,
    removeDuplicates,
    stripTrailingSlashes,
    extractRootDomains,
  ]);

  const processUrls = () => {
    if (!inputUrls.trim()) {
      setOutputUrls([]);
      setUniqueDomains([]);
      setStats({
        inputTotal: 0,
        filteredOutput: 0,
        filteredOut: 0,
        uniqueDomainsCount: 0,
      });
      return;
    }

    let lines = inputUrls.split(/\r?\n/);
    const totalInputCount = lines.length;

    if (removeEmpty) {
      lines = lines.map((l) => l.trim()).filter((l) => l.length > 0);
    }

    if (stripTrailingSlashes) {
      lines = lines.map((url) => url.replace(/\/+\$/, ""));
    }

    if (includeFilter.trim()) {
      const inc = includeFilter.toLowerCase().trim();
      lines = lines.filter((url) => url.toLowerCase().includes(inc));
    }

    if (excludeFilter.trim()) {
      const exc = excludeFilter.toLowerCase().trim();
      lines = lines.filter((url) => !url.toLowerCase().includes(exc));
    }

    if (extractRootDomains) {
      lines = lines
        .map((url) => {
          try {
            const formatted = url.startsWith("http") ? url : `https://${url}`;
            const parsed = new URL(formatted);
            return parsed.hostname;
          } catch {
            return url;
          }
        })
        .filter(Boolean);
    }

    let finalUrls = lines;
    if (removeDuplicates) {
      finalUrls = Array.from(new Set(lines));
    }

    const domainsSet = new Set();
    finalUrls.forEach((url) => {
      try {
        const formatted = url.startsWith("http") ? url : `https://${url}`;
        const parsed = new URL(formatted);
        domainsSet.add(parsed.hostname);
      } catch {
        // ignore
      }
    });

    const domainList = Array.from(domainsSet);

    setOutputUrls(finalUrls);
    setUniqueDomains(domainList);
    setStats({
      inputTotal: totalInputCount,
      filteredOutput: finalUrls.length,
      filteredOut: Math.max(0, totalInputCount - finalUrls.length),
      uniqueDomainsCount: domainList.length,
    });
  };

  const handleCopy = () => {
    const textToCopy =
      activeTab === "all" ? outputUrls.join("\n") : uniqueDomains.join("\n");
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload =
      activeTab === "all" ? outputUrls.join("\n") : uniqueDomains.join("\n");
    if (!textToDownload) return;

    const element = document.createElement("a");
    const file = new Blob([textToDownload], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab === "all" ? "cleaned-urls" : "unique-domains"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <article className="space-y-6 sm:space-y-8">
      {/* Helmet for SEO, Canonical & Schema */}
      <Helmet>
        <title>
          Bulk URL Cleaner & Parameter Stripper | Forgetech URL Services
        </title>
        <meta
          name="description"
          content="Bulk URL cleaner and parameter remover. Clean tracking tags, extract unique domains, and optimize link structures 100% locally in your browser."
        />
        <link
          rel="canonical"
          href="https://forgetech-url-services.vercel.app/"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is a URL cleaner and why is it important for SEO?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A URL cleaner strips tracking parameters like UTM tags, session IDs, and referral tokens from links. It helps prevent duplicate content issues and keeps clean URL structures for better crawling.",
                },
              },
              {
                "@type": "Question",
                name: "Is my URL data private when using this tool?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, 100%. All processing runs locally in your browser memory. No URLs or parameter data are ever sent to external servers.",
                },
              },
            ],
          })}
        </script>
      </Helmet>

      {/* Stats Dashboard Section */}
      <section
        aria-label="Tool Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Input Total
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats.inputTotal}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Filtered Output
            </span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            {stats.filteredOutput}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Filtered Out
            </span>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-300">
            {stats.filteredOut}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Unique Domains
            </span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats.uniqueDomainsCount}
          </div>
        </div>
      </section>

      {/* Main Workspace Grid */}
      <section
        aria-label="URL Cleaning Tool"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left Column: Inputs & Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="url-input"
                className="text-xs font-semibold text-white flex items-center space-x-1.5"
              >
                <span>Paste Bulk URLs</span>
              </label>
              {inputUrls && (
                <button
                  onClick={() => setInputUrls("")}
                  className="text-[11px] text-slate-400 hover:text-rose-400 bg-black border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              id="url-input"
              rows={8}
              value={inputUrls}
              onChange={(e) => setInputUrls(e.target.value)}
              placeholder="Paste URLs here (one per line)..."
              className="w-full bg-black border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <fieldset className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <legend className="flex items-center space-x-2 pb-2 border-b border-slate-800 w-full">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">
                SEO Filtering & Cleaning Rules
              </span>
            </legend>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                value={includeFilter}
                onChange={(e) => setIncludeFilter(e.target.value)}
                placeholder="Include filter (e.g. .com, /blog)"
                aria-label="Include Filter"
                className="w-full bg-black border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                type="text"
                value={excludeFilter}
                onChange={(e) => setExcludeFilter(e.target.value)}
                placeholder="Exclude filter (e.g. .blogspot, tag)"
                aria-label="Exclude Filter"
                className="w-full bg-black border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-slate-300">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Remove empty lines & whitespace</span>
                <input
                  type="checkbox"
                  checked={removeEmpty}
                  onChange={(e) => setRemoveEmpty(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Auto-remove duplicate URLs</span>
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Strip trailing slashes (/)</span>
                <input
                  type="checkbox"
                  checked={stripTrailingSlashes}
                  onChange={(e) => setStripTrailingSlashes(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Extract Root Domains Only</span>
                <input
                  type="checkbox"
                  checked={extractRootDomains}
                  onChange={(e) => setExtractRootDomains(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </fieldset>
        </div>

        {/* Right Column: Output & Actions */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3 flex-1 flex flex-col">
            <header className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-semibold text-white">
                  Cleaned Output
                </h2>
              </div>

              <nav
                aria-label="Output View Tabs"
                className="flex items-center bg-black p-1 rounded-lg border border-slate-800 text-xs"
              >
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === "all"
                      ? "bg-amber-400 text-black font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Filtered URLs
                </button>
                <button
                  onClick={() => setActiveTab("domains")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === "domains"
                      ? "bg-amber-400 text-black font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Unique Domains
                </button>
              </nav>
            </header>

            <div className="bg-black border border-slate-800 rounded-xl p-3.5 flex-1 min-h-[300px] max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-all">
              {activeTab === "all"
                ? outputUrls.length > 0
                  ? outputUrls.join("\n")
                  : "Cleaned URLs will appear here..."
                : uniqueDomains.length > 0
                  ? uniqueDomains.join("\n")
                  : "Unique domain list will appear here..."}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleCopy}
              disabled={outputUrls.length === 0}
              className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Output</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={outputUrls.length === 0}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 border border-slate-700 py-3 px-5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download .txt</span>
            </button>
          </div>
        </div>
      </section>

      {/* Semantic FAQ Section */}
      <section
        aria-labelledby="faq-heading"
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 mt-8"
      >
        <header className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h2
            id="faq-heading"
            className="text-xs sm:text-sm font-semibold text-white"
          >
            Frequently Asked Questions (SEO Guide)
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <article className="bg-black/50 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
            <h3 className="font-semibold text-slate-200">
              What is a URL cleaner and why is it important for SEO?
            </h3>
            <p className="leading-relaxed">
              A URL cleaner strips unnecessary tracking parameters (like UTM
              codes, session IDs, and referral tokens). Cleaning parameters
              prevents Google from indexing duplicate content versions of the
              same web page.
            </p>
          </article>

          <article className="bg-black/50 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
            <h3 className="font-semibold text-slate-200">
              Is my URL data private when using this tool?
            </h3>
            <p className="leading-relaxed">
              Yes, 100%. All link cleaning and domain extraction algorithms
              execute locally inside your browser memory. Your links are never
              transmitted to external servers.
            </p>
          </article>
        </div>
      </section>
    </article>
  );
}
