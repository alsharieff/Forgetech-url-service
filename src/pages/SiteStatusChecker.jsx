import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Activity,
  Play,
  RotateCcw,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";

export default function SiteStatusChecker() {
  const [inputUrls, setInputUrls] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all"); // 'all' | '2xx' | '3xx' | '4xx/5xx'
  const [copied, setCopied] = useState(false);

  // Settings
  const [concurrency, setConcurrency] = useState(5);
  const [timeout, setTimeoutVal] = useState(5000);

  // Mock checking logic to demonstrate SaaS UI preview
  const handleStartCheck = () => {
    const urls = inputUrls
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) return;

    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const total = urls.length;
    let completed = 0;
    const tempResults = [];

    // Simulate async URL status pinging
    urls.forEach((url, idx) => {
      setTimeout(
        () => {
          let cleanUrl = url.includes("://") ? url : `https://${url}`;

          // Mock responses for preview demo
          const mockStatuses = [
            {
              code: 200,
              statusText: "OK",
              latency: Math.floor(Math.random() * 250) + 40,
            },
            {
              code: 301,
              statusText: "Moved Permanently",
              redirectUrl: `${cleanUrl}/en`,
              latency: Math.floor(Math.random() * 300) + 100,
            },
            {
              code: 404,
              statusText: "Not Found",
              latency: Math.floor(Math.random() * 500) + 200,
            },
            {
              code: 500,
              statusText: "Internal Server Error",
              latency: Math.floor(Math.random() * 800) + 400,
            },
          ];

          // Pick status based on URL or index for clean preview
          let statusObj = mockStatuses[0];
          if (url.includes("old") || idx % 4 === 1) statusObj = mockStatuses[1];
          if (url.includes("missing") || idx % 4 === 2)
            statusObj = mockStatuses[2];
          if (url.includes("error") || idx % 4 === 3)
            statusObj = mockStatuses[3];

          tempResults.push({
            id: idx,
            originalUrl: url,
            fullUrl: cleanUrl,
            statusCode: statusObj.code,
            statusText: statusObj.statusText,
            latency: statusObj.latency,
            redirectUrl: statusObj.redirectUrl || null,
          });

          completed++;
          setProgress(Math.round((completed / total) * 100));
          setResults([...tempResults]);

          if (completed === total) {
            setIsRunning(false);
          }
        },
        (idx + 1) * 300,
      );
    });
  };

  const loadSample = () => {
    setInputUrls(
      `https://google.com\nhttps://github.com/missing-page-test\nhttps://bu.edu/old-link\nhttps://httpstat.us/500\nhttps://example.com/demo`,
    );
  };

  const handleClear = () => {
    setInputUrls("");
    setResults([]);
    setProgress(0);
  };

  // Stats calculation
  const totalChecked = results.length;
  const count2xx = results.filter(
    (r) => r.statusCode >= 200 && r.statusCode < 300,
  ).length;
  const count3xx = results.filter(
    (r) => r.statusCode >= 300 && r.statusCode < 400,
  ).length;
  const count4xx5xx = results.filter((r) => r.statusCode >= 400).length;
  const healthRatio =
    totalChecked > 0 ? Math.round((count2xx / totalChecked) * 100) : 0;

  // Filtered list
  const filteredResults = results.filter((item) => {
    if (filterCategory === "2xx")
      return item.statusCode >= 200 && item.statusCode < 300;
    if (filterCategory === "3xx")
      return item.statusCode >= 300 && item.statusCode < 400;
    if (filterCategory === "4xx/5xx") return item.statusCode >= 400;
    return true;
  });

  const exportCSV = () => {
    if (results.length === 0) return;
    const headers =
      "URL,Status Code,Status Text,Latency (ms),Redirect Target\n";
    const rows = results
      .map(
        (r) =>
          `"${r.fullUrl}",${r.statusCode},"${r.statusText}",${r.latency},"${r.redirectUrl || ""}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `site-status-report-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyTable = () => {
    if (filteredResults.length === 0) return;
    const text = filteredResults
      .map(
        (r) =>
          `${r.fullUrl} -> ${r.statusCode} ${r.statusText} (${r.latency}ms)`,
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Helmet>
        <title>HTTP Site Status Checker | Forgetech URL Services</title>
      </Helmet>

      {/* SaaS Analytics Stat Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Health Score
            </span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {healthRatio}%
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Healthy responses (2xx)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              2xx Success
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {count2xx}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Status 200 OK
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              3xx Redirects
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            {count3xx}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            301 / 302 Redirects
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              4xx / 5xx Errors
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400">
            {count4xx5xx}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            404 & 500 Server errors
          </p>
        </div>
      </section>

      {/* Main SaaS Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Settings Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="status-input"
                className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Bulk URLs Status Audit</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadSample}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
                >
                  Sample
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="status-input"
              value={inputUrls}
              onChange={(e) => setInputUrls(e.target.value)}
              placeholder="Enter list of URLs to test HTTP status codes (one per line)..."
              rows={8}
              className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
            />

            {/* Config Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Speed (Threads)
                </label>
                <select
                  value={concurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  className="w-full bg-black border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value={5}>5 Concurrent</option>
                  <option value={10}>10 Concurrent (Fast)</option>
                  <option value={20}>20 Concurrent (Turbo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Timeout (sec)
                </label>
                <select
                  value={timeout}
                  onChange={(e) => setTimeoutVal(Number(e.target.value))}
                  className="w-full bg-black border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value={3000}>3 Seconds</option>
                  <option value={5000}>5 Seconds</option>
                  <option value={10000}>10 Seconds</option>
                </select>
              </div>
            </div>

            {/* Run CTA */}
            <button
              onClick={handleStartCheck}
              disabled={isRunning || !inputUrls.trim()}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Auditing URLs ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start HTTP Status Check</span>
                </>
              )}
            </button>

            {/* Progress bar */}
            {isRunning && (
              <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Dynamic Live Results Table */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex-1 flex flex-col">
            {/* Header with Filter Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-2.5">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs sm:text-sm font-semibold text-slate-200">
                  Live Audit Results ({filteredResults.length})
                </h2>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center bg-black p-1 rounded-lg border border-slate-800 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                    filterCategory === "all"
                      ? "bg-amber-400 text-black font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setFilterCategory("2xx")}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                    filterCategory === "2xx"
                      ? "bg-emerald-500 text-black font-semibold"
                      : "text-slate-400 hover:text-emerald-400"
                  }`}
                >
                  2xx ({count2xx})
                </button>
                <button
                  onClick={() => setFilterCategory("3xx")}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                    filterCategory === "3xx"
                      ? "bg-amber-500 text-black font-semibold"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  3xx ({count3xx})
                </button>
                <button
                  onClick={() => setFilterCategory("4xx/5xx")}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                    filterCategory === "4xx/5xx"
                      ? "bg-rose-500 text-white font-semibold"
                      : "text-slate-400 hover:text-rose-400"
                  }`}
                >
                  Errors ({count4xx5xx})
                </button>
              </div>
            </div>

            {/* Results Table View */}
            <div className="flex-1 bg-black border border-slate-800 rounded-xl overflow-hidden min-h-[250px] max-h-[420px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center">
                  <Activity className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
                  <span>
                    No results to show yet. Paste URLs and click "Start HTTP
                    Status Check".
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {filteredResults.map((item) => {
                    let statusBadgeStyle =
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                    if (item.statusCode >= 300 && item.statusCode < 400) {
                      statusBadgeStyle =
                        "bg-amber-500/10 text-amber-400 border-amber-500/30";
                    } else if (item.statusCode >= 400) {
                      statusBadgeStyle =
                        "bg-rose-500/10 text-rose-400 border-rose-500/30";
                    }

                    return (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-slate-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        {/* URL info */}
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-mono text-slate-200 truncate"
                            title={item.fullUrl}
                          >
                            {item.fullUrl}
                          </div>
                          {item.redirectUrl && (
                            <div className="text-[10px] text-amber-400 flex items-center space-x-1 mt-0.5 truncate">
                              <ArrowRight className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {item.redirectUrl}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status badge & Latency */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-md border font-mono text-[11px] font-semibold ${statusBadgeStyle}`}
                          >
                            {item.statusCode} {item.statusText}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{item.latency}ms</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom SaaS Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={copyTable}
                disabled={filteredResults.length === 0}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-amber-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? "Copied Results!" : "Copy Filtered"}</span>
              </button>

              <button
                onClick={exportCSV}
                disabled={results.length === 0}
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
