import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Zap,
  Smartphone,
  Monitor,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Gauge,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

export default function PageSpeedAuditor() {
  const [urlInput, setUrlInput] = useState("");
  const [strategy, setStrategy] = useState("mobile"); // 'mobile' | 'desktop'
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY;

  const runAudit = async () => {
    if (!urlInput.trim()) return;

    let targetUrl = urlInput.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Official Google PageSpeed API Endpoint
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        targetUrl,
      )}&strategy=${strategy}${apiKey ? `&key=\${apiKey}` : ""}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message || "Failed to analyze website URL.");
      }

      const lighthouse = data.lighthouseResult;
      const categories = lighthouse.categories;
      const audits = lighthouse.audits;

      setReport({
        url: targetUrl,
        strategy,
        score: Math.round((categories.performance.score || 0) * 100),
        fcp: audits["first-contentful-paint"]?.displayValue || "N/A",
        lcp: audits["largest-contentful-paint"]?.displayValue || "N/A",
        cls: audits["cumulative-layout-shift"]?.displayValue || "N/A",
        tbt: audits["total-blocking-time"]?.displayValue || "N/A",
        speedIndex: audits["speed-index"]?.displayValue || "N/A",
        opportunities: Object.values(audits).filter(
          (a) => a.details && a.details.type === "opportunity" && a.score < 0.9,
        ),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to reach Google PageSpeed API.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90)
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 50)
      return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Helmet>
        <title>
          PageSpeed & Core Web Vitals Audit | Forgetech URL Services
        </title>
      </Helmet>

      {/* Hero Section / Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">
              Google PageSpeed & Core Web Vitals Auditor
            </h2>
          </div>

          {/* Device Strategy Selector */}
          <div className="flex items-center bg-black p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setStrategy("mobile")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium transition-all ${
                strategy === "mobile"
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setStrategy("desktop")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium transition-all ${
                strategy === "desktop"
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter domain or page URL (e.g. example.com)..."
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            onClick={runAudit}
            disabled={loading || !urlInput.trim()}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            {loading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Running Audit...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Speed</span>
              </>
            )}
          </button>
        </div>

        {!apiKey && (
          <p className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-amber-400 font-bold">Tip:</span>
            <span>
              Running on Google's default rate-limit. Add your free API key in{" "}
              <code>.env.local</code> for higher speeds.
            </span>
          </p>
        )}
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs flex items-center space-x-2">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Dashboard */}
      {report && (
        <div className="space-y-6">
          {/* Main Score & Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Overall Score Circle Card */}
            <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center space-x-1">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Performance Score</span>
              </span>

              <div
                className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-4xl font-extrabold ${getScoreColor(
                  report.score,
                )}`}
              >
                {report.score}
              </div>

              <div className="mt-4 text-xs text-slate-400">
                <span>Tested on </span>
                <span className="text-white font-medium capitalize">
                  {report.strategy}
                </span>
              </div>
            </div>

            {/* Core Web Vitals Metrics Grid */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  FCP (Paint)
                </span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {report.fcp}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  First Contentful Paint
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  LCP (Largest)
                </span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">
                  {report.lcp}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Largest Contentful Paint
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  CLS (Shift)
                </span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {report.cls}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Cumulative Layout Shift
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  TBT (Blocking)
                </span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {report.tbt}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Total Blocking Time
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  Speed Index
                </span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {report.speedIndex}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Content Populate Rate
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                <a
                  href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(report.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>Google Deep Insights</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Performance Improvement Opportunities */}
          {report.opportunities.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Top Optimization Opportunities</span>
              </h3>

              <div className="space-y-2">
                {report.opportunities.slice(0, 5).map((opp, idx) => (
                  <div
                    key={idx}
                    className="bg-black border border-slate-800 p-3 rounded-lg text-xs space-y-1"
                  >
                    <div className="font-medium text-amber-300 flex justify-between items-center">
                      <span>{opp.title}</span>
                      {opp.displayValue && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                          {opp.displayValue}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {opp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
