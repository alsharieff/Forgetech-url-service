# 🚀 Forgetech URL Services — Project Architecture & Development Guide

> **Project Name:** Forgetech URL Services (`sharl-service`)  
> **Author & Developer:** Sharl ([Portfolio](https://devsharl-portfolio.vercel.app/))  
> **Primary Purpose:** All-in-one, privacy-focused, client-side SEO Audit & Bulk URL Processing Suite.

---

## 📌 1. Project Goal & Core Philosophy

Forgetech URL Services is built to provide high-performance SEO utilities for webmasters, digital marketers, and developers.

### Core Architecture Principles:

1. **100% In-Browser Privacy:** All URL processing, string manipulation, deduplication, and filtering run locally on the user's browser memory (no data logging or backend URL tracking).
2. **Modular Architecture:** Tools are split into distinct, isolated route pages inside `src/pages/` so new SEO features can be added incrementally without impacting existing functionality.
3. **Consistent Brand Theme:** Strictly uses solid brand colors inspired by the official logo — **Amber/Yellow (`#FACC15` / `text-amber-400`)**, **Deep Black (`#000000`)**, **Slate (`#0F172A`)**, and **Clean White (`#FFFFFF`)**. No distracting gradients.
4. **Mobile First & Responsive:** Optimized UI for mobile, tablet, and desktop viewports, featuring sticky navigation headers and touch-friendly controls.

---

## 🛠️ 2. Recommended Tech Stack

| Layer          | Technology                 | Purpose                                                 |
| :------------- | :------------------------- | :------------------------------------------------------ |
| **Framework**  | **React.js (v18+)**        | Component-driven frontend library                       |
| **Build Tool** | **Vite**                   | Fast HMR development server and bundler                 |
| **Styling**    | **Tailwind CSS (v3 / v4)** | Utility-first CSS framework for responsive dark design  |
| **Icons**      | **Lucide React**           | Lightweight, modern icon library                        |
| **Routing**    | **React Router DOM (v6)**  | Multi-tool page routing and SPA navigation              |
| **SEO Meta**   | **React Helmet Async**     | Dynamic OpenGraph, title, and JSON-LD schema management |
| **Deployment** | **Vercel / Netlify**       | Edge-ready static web hosting                           |

---

## 📁 3. File Directory Structure

```text
sharl-service/
├── public/
│   └── forgetech_logo.png           <-- Favicon & public root assets
├── src/
│   ├── assets/
│   │   └── forgetech_logo.png       <-- High-res brand logo
│   ├── components/                  <-- Shared UI Layout Components
│   │   ├── Header.jsx               <-- Sticky header with navigation & author link
│   │   ├── Footer.jsx               <-- Global footer component
│   │   ├── StatsDashboard.jsx       <-- Reusable stat card metrics dashboard
│   │   └── SidebarNav.jsx           <-- Multi-tool navigation bar
│   ├── pages/                       <-- Modular Tool Pages
│   │   ├── UrlCleaner.jsx           <-- Active: Bulk URL Cleaner & Unique Host Extractor
│   │   ├── SiteStatusChecker.jsx    <-- Planned: Live HTTP Status (200, 301, 404) Checker
│   │   ├── MetadataAnalyzer.jsx     <-- Planned: Title, Meta Description & OG Tag Audit
│   │   ├── AltTextAuditor.jsx       <-- Planned: Image Alt Text Missing Audit
│   │   └── ContentDuplicate.jsx     <-- Planned: Post Counter & Word/Content Deduplicator
│   ├── App.jsx                      <-- Router & Layout Shell Container
│   ├── index.css                    <-- Tailwind directive entry point
│   └── main.jsx                     <-- React root entry point with HelmetProvider
├── .gitignore
├── eslint.config.js
├── index.html                       <-- Meta viewport & favicon configuration
├── package.json
├── PROJECT.md                       <-- Master AI & developer documentation
├── tailwind.config.js
└── vite.config.js
```
