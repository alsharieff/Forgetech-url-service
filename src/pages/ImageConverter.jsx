import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Image as ImageIcon,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  HardDrive,
  HelpCircle,
} from "lucide-react";

export default function ImageConverter() {
  const [images, setImages] = useState([]);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [isDragging, setIsDragging] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processFiles = (files) => {
    const fileList = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!fileList.length) return;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const initialFormattedName =
            file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

          const newImageItem = {
            id: Math.random().toString(36).substr(2, 9),
            originalFile: file,
            previewUrl: event.target.result,
            width: img.width,
            height: img.height,
            originalSize: file.size,
            outputName: initialFormattedName,
            convertedBlob: null,
            convertedUrl: null,
            convertedSize: 0,
          };

          convertImageItem(newImageItem, outputFormat, quality, img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset file input value to allow re-uploading same image after deletion
    e.target.value = null;
  };

  const convertImageItem = (item, format, qualityVal, imgObj) => {
    const processConversion = (img) => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (format === "jpeg" || format === "jpg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "avif"
            ? "image/avif"
            : `image/${format}`;
      const qualityFactor = format === "png" ? 1.0 : qualityVal / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const convertedUrl = URL.createObjectURL(blob);

          setImages((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            if (exists) {
              // Revoke old URL memory before updating
              if (exists.convertedUrl) URL.revokeObjectURL(exists.convertedUrl);
              return prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      convertedBlob: blob,
                      convertedUrl,
                      convertedSize: blob.size,
                    }
                  : i,
              );
            } else {
              return [
                ...prev,
                {
                  ...item,
                  convertedBlob: blob,
                  convertedUrl,
                  convertedSize: blob.size,
                },
              ];
            }
          });
        },
        mimeType,
        qualityFactor,
      );
    };

    if (imgObj) {
      processConversion(imgObj);
    } else {
      const img = new Image();
      img.onload = () => processConversion(img);
      img.src = item.previewUrl;
    }
  };

  // Fixed delete image function
  const removeImage = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.convertedUrl) {
        URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Fixed clear all function
  const clearAll = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    images.forEach((item) => {
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setImages([]);
  };

  const handleFormatOrQualityChange = (newFormat, newQuality) => {
    setOutputFormat(newFormat);
    setQuality(newQuality);

    images.forEach((item) => {
      convertImageItem(item, newFormat, newQuality);
    });
  };

  const downloadImage = (item) => {
    if (!item.convertedUrl) return;
    const link = document.createElement("a");
    link.href = item.convertedUrl;
    link.download = `${item.outputName || "converted-image"}.${outputFormat}`;
    link.click();
  };

  const totalOriginalSize = images.reduce(
    (acc, curr) => acc + curr.originalSize,
    0,
  );
  const totalConvertedSize = images.reduce(
    (acc, curr) => acc + (curr.convertedSize || curr.originalSize),
    0,
  );
  const totalSavedBytes = Math.max(0, totalOriginalSize - totalConvertedSize);
  const totalSavedPercent =
    totalOriginalSize > 0
      ? Math.round((totalSavedBytes / totalOriginalSize) * 100)
      : 0;

  return (
    <article className="space-y-6 sm:space-y-8">
      {/* Helmet for SEO, Canonical & Schema */}
      <Helmet>
        <title>
          Bulk Image Converter & Compressor | Forgetech URL Services
        </title>
        <meta
          name="description"
          content="Free bulk image converter and compressor. Convert PNG, JPG, and WEBP images locally in your browser with no file limits or privacy risks."
        />
        <link
          rel="canonical"
          href="https://forgetech-url-services.vercel.app/image-converter"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Why should I convert my website images to WebP?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "WebP provides superior lossy and lossless compression for web images, drastically reducing page load speed without losing visual quality.",
                },
              },
              {
                "@type": "Question",
                name: "Are my uploaded images stored on a server?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Image conversion uses HTML5 Canvas directly in your web browser. Your images never leave your device.",
                },
              },
            ],
          })}
        </script>
      </Helmet>

      {/* Metrics Section */}
      <section
        aria-label="Conversion Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Total Images
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {images.length}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Uploaded batch files
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Original Size
            </span>
            <HardDrive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-300">
            {formatBytes(totalOriginalSize)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Uncompressed input total
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Optimized Size
            </span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            {formatBytes(totalConvertedSize)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Ready for web export
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              Total Savings
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {totalSavedPercent}%
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            {formatBytes(totalSavedBytes)} saved
          </div>
        </div>
      </section>

      {/* Main Upload Control Section */}
      <section
        aria-label="Upload and Settings Workspace"
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4"
      >
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h1 className="text-sm sm:text-base font-semibold text-white">
              Bulk Image Converter & Compressor
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-black border border-slate-800 px-3 py-1.5 rounded-xl">
              <label
                htmlFor="output-format-select"
                className="text-xs text-slate-400 font-medium"
              >
                Format:
              </label>
              <select
                id="output-format-select"
                value={outputFormat}
                onChange={(e) =>
                  handleFormatOrQualityChange(e.target.value, quality)
                }
                className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none uppercase cursor-pointer"
              >
                <option value="webp" className="bg-slate-900 text-slate-200">
                  WEBP (Recommended)
                </option>
                <option value="png" className="bg-slate-900 text-slate-200">
                  PNG
                </option>
                <option value="jpeg" className="bg-slate-900 text-slate-200">
                  JPG/JPEG
                </option>
              </select>
            </div>

            {outputFormat !== "png" && (
              <div className="flex items-center space-x-2 bg-black border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <label htmlFor="quality-slider" className="text-slate-400">
                  Quality:
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) =>
                    handleFormatOrQualityChange(
                      outputFormat,
                      Number(e.target.value),
                    )
                  }
                  className="w-16 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-amber-400 font-bold w-7 text-right">
                  {quality}%
                </span>
              </div>
            )}

            {images.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </header>

        {/* Drag and Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
            isDragging
              ? "border-amber-400 bg-amber-400/10 scale-[1.01]"
              : "border-slate-800 hover:border-amber-400/50 bg-black/50 hover:bg-black"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            aria-label="Upload Image Files"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <UploadCloud
            className={`w-8 h-8 mb-2 transition-colors ${
              isDragging ? "text-amber-400 animate-bounce" : "text-slate-500"
            }`}
          />
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            {isDragging
              ? "Drop images here to convert"
              : "Click to upload or drag and drop images"}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Supports PNG, JPG, WEBP, GIF, SVG, AVIF (100% In-Browser Privacy)
          </span>
        </div>
      </section>

      {/* Uploaded List */}
      {images.length > 0 && (
        <section aria-label="Converted Files List" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Uploaded Images ({images.length})</span>
            <span>Optimized Outputs</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {images.map((item) => (
              <article
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-lg bg-black border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2
                        className="text-xs sm:text-sm font-semibold text-white truncate"
                        title={item.originalFile.name}
                      >
                        {item.originalFile.name}
                      </h2>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>
                          {item.width}x{item.height}px
                        </span>
                        <span>•</span>
                        <span className="line-through text-slate-500">
                          {formatBytes(item.originalSize)}
                        </span>
                        <span>→</span>
                        <span className="text-amber-400 font-semibold">
                          {formatBytes(item.convertedSize)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadImage(item)}
                      className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="uppercase">Download {outputFormat}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => removeImage(item.id, e)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                      title="Remove Image"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-4 h-4 pointer-events-none" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Semantic FAQ Section */}
      <section
        aria-labelledby="image-faq-heading"
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 mt-8"
      >
        <header className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h2
            id="image-faq-heading"
            className="text-xs sm:text-sm font-semibold text-white"
          >
            Frequently Asked Questions (Image Optimization)
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <article className="bg-black/50 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
            <h3 className="font-semibold text-slate-200">
              Why should I convert my website images to WebP?
            </h3>
            <p className="leading-relaxed">
              WebP offers significantly smaller file sizes compared to PNG or
              JPEG, which accelerates Core Web Vitals and improves search engine
              rankings.
            </p>
          </article>

          <article className="bg-black/50 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
            <h3 className="font-semibold text-slate-200">
              Are my uploaded images stored on a server?
            </h3>
            <p className="leading-relaxed">
              No. Conversions happen locally via client-side JavaScript. Your
              photos are private and never uploaded to any server.
            </p>
          </article>
        </div>
      </section>
    </article>
  );
}
