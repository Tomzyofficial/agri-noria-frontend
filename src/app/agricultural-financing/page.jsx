"use client";

import { useState } from "react";

// ── Icons (inline SVG to avoid external deps) ──────────────────────────────
const Icon = ({ d, size = 24, className = "" }) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
   >
      <path d={d} />
   </svg>
);

const icons = {
   check: "M20 6L9 17l-5-5",
   arrow: "M5 12h14M12 5l7 7-7 7",
   file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
   search: "M11 17a6 6 0 100-12 6 6 0 000 12zM21 21l-4.35-4.35",
   shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
   send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
   repeat: "M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3",
   building: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
   growth: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
   zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
   clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
   layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
   users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
   chevronDown: "M6 9l6 6 6-6",
};

// ── Colour palette tokens ──────────────────────────────────────────────────
// Forest-green fintech palette: authoritative, fresh, trustworthy
// Primary: deep emerald  /  Accent: gold  /  Text: near-black slate

// ── Sub-components ─────────────────────────────────────────────────────────

function Navbar() {
   const [open, setOpen] = useState(false);
   return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
         <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group">
               <span className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
               </span>
               <span className="text-slate-900 font-bold text-lg tracking-tight">
                  Vendor<span className="text-emerald-700">Finance</span>
               </span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
               {["About", "How It Works", "Benefits", "FAQ"].map((l) => (
                  <a
                     key={l}
                     href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                     className="hover:text-emerald-700 transition-colors"
                  >
                     {l}
                  </a>
               ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
               <a
                  href="#apply"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
               >
                  Apply for Financing
               </a>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-slate-700" onClick={() => setOpen(!open)}>
               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
               </svg>
            </button>
         </div>

         {/* Mobile menu */}
         {open && (
            <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-slate-700">
               {["About", "How It Works", "Benefits", "FAQ"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setOpen(false)}>
                     {l}
                  </a>
               ))}
               <a href="#apply" className="bg-emerald-700 text-white text-center py-2 rounded-lg font-semibold">
                  Apply for Financing
               </a>
            </div>
         )}
      </nav>
   );
}

function Hero() {
   return (
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
         {/* Decorative orbs */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
         <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
            {/* Copy */}
            <div>
               <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Structured Vendor Financing
               </span>

               <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                  Vendor
                  <br />
                  <span className="text-emerald-400">Financing</span>
                  <br />
                  Program
               </h1>

               <p className="text-lg text-slate-300 leading-relaxed mb-4 max-w-md">
                  Access the capital you need to grow your business with structured financing designed specifically for
                  vendors like you.
               </p>
               <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-md">
                  Apply directly through your vendor dashboard. We facilitate the process with accredited financial
                  institutions and government-backed funding programs — so you can focus on growing.
               </p>

               <div className="flex flex-wrap gap-4">
                  <a
                     href="#apply"
                     className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40"
                  >
                     Apply for Financing
                     <Icon d={icons.arrow} size={18} />
                  </a>
                  <a
                     href="#how-it-works"
                     className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl transition-all backdrop-blur-sm"
                  >
                     Learn How It Works
                  </a>
               </div>

               {/* Trust badges */}
               <div className="mt-12 flex flex-wrap gap-6 text-xs text-slate-400">
                  {["Financial Institution Partners", "Government Programs", "Secure & Transparent"].map((t) => (
                     <span key={t} className="flex items-center gap-1.5">
                        <Icon d={icons.check} size={14} className="text-emerald-400" />
                        {t}
                     </span>
                  ))}
               </div>
            </div>

            {/* Illustration card */}
            <div className="relative hidden md:block">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                     <span className="text-sm font-semibold text-slate-300">Loan Application Status</span>
                     <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                        Active
                     </span>
                  </div>

                  {/* Mock steps */}
                  {[
                     { label: "Application Submitted", done: true },
                     { label: "Documents Verified", done: true },
                     { label: "Credit Assessment", done: true },
                     { label: "Approval & Disbursement", done: false },
                  ].map((s, i) => (
                     <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                        <div
                           className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              s.done ? "bg-emerald-500 text-white" : "border-2 border-slate-600"
                           }`}
                        >
                           {s.done && (
                              <svg
                                 width="12"
                                 height="12"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="3"
                              >
                                 <path d="M20 6L9 17l-5-5" />
                              </svg>
                           )}
                        </div>
                        <span className={`text-sm ${s.done ? "text-white" : "text-slate-500"}`}>{s.label}</span>
                     </div>
                  ))}

                  <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                     <p className="text-xs text-emerald-400 font-medium mb-1">Loan Amount</p>
                     <p className="text-3xl font-bold text-white">₦2,500,000</p>
                     <p className="text-xs text-slate-400 mt-1">12-month repayment · 8% p.a.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}

function ProblemSection() {
   const problems = [
      {
         icon: icons.building,
         title: "Limited Capital Access",
         desc: "Many vendors lack access to the working capital needed to grow — banks demand collateral and a lengthy history that small businesses often can't provide.",
      },
      {
         icon: icons.layers,
         title: "Traditional Loan Barriers",
         desc: "High interest rates, complex paperwork, and rigid requirements from traditional financial institutions shut out the very vendors who need support most.",
      },
      {
         icon: icons.users,
         title: "No Structured Programs",
         desc: "Without a structured financing pathway, vendors are left to self-fund or miss growth opportunities that require immediate capital injection.",
      },
   ];

   return (
      <section className="py-24 px-6 bg-slate-50">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-3">The Problem</p>
               <h2 className="text-4xl font-bold text-slate-900 mb-4">The Capital Gap Vendors Face</h2>
               <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Across the marketplace, talented vendors with real potential are held back not by ambition — but by
                  lack of access to fair, structured financing.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {problems.map((p, i) => (
                  <div
                     key={i}
                     className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                     <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                        <Icon d={p.icon} size={22} className="text-red-500" />
                     </div>
                     <h3 className="font-bold text-slate-900 text-lg mb-2">{p.title}</h3>
                     <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}

function AboutSection() {
   return (
      <section id="about" className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="relative">
               <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-10 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-6">
                     Program Overview
                  </p>
                  <h3 className="text-2xl font-bold mb-6 leading-snug">
                     Helping Vendors Grow with Reliable Access to Capital
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     {[
                        { label: "Vendors Served", value: "1,200+" },
                        { label: "Total Disbursed", value: "₦4.8B" },
                        { label: "Avg. Approval Time", value: "5 Days" },
                        { label: "Repayment Rate", value: "96.4%" },
                     ].map((s) => (
                        <div key={s.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                           <p className="text-2xl font-bold text-white">{s.value}</p>
                           <p className="text-xs text-emerald-300 mt-1">{s.label}</p>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Copy */}
            <div>
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-3">
                  About the Program
               </p>
               <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Vendor Financing Program</h2>
               <div className="space-y-4 text-slate-600 leading-relaxed text-base">
                  <p>
                     Growing a business often requires capital — whether it is to purchase equipment, expand production,
                     buy inventory, or manage operational costs. Unfortunately, many small and medium-scale vendors
                     struggle to access structured financing from traditional financial institutions.
                  </p>
                  <p>
                     Our <strong className="text-slate-800">Vendor Financing Program</strong> was created to solve that
                     problem.
                  </p>
                  <p>
                     Through this initiative, we provide qualified vendors with access to funding that helps them scale
                     their businesses, improve productivity, and meet increasing market demand.
                  </p>
               </div>
            </div>
         </div>
      </section>
   );
}

function HowItWorks() {
   const steps = [
      {
         num: "01",
         icon: icons.file,
         title: "Loan Application",
         desc: "Submit a loan request through your dashboard by completing the financing application form and uploading required documentation.",
      },
      {
         num: "02",
         icon: icons.search,
         title: "Verification & Review",
         desc: "Our financing team reviews your application and documents to assess business capacity, eligibility, and repayment ability.",
      },
      {
         num: "03",
         icon: icons.shield,
         title: "Approval Process",
         desc: "Eligible vendors receive approval for a specific loan amount along with clear repayment terms.",
      },
      {
         num: "04",
         icon: icons.send,
         title: "Loan Disbursement",
         desc: "Approved funds are disbursed to you after the agreement is finalized. Fast, direct, and secure.",
      },
      {
         num: "05",
         icon: icons.repeat,
         title: "Repayment",
         desc: "Repay through structured installments or settle the full amount at once — flexible options designed for your cash flow.",
      },
   ];

   return (
      <section id="how-it-works" className="py-24 px-6 bg-slate-950 text-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">The Process</p>
               <h2 className="text-4xl font-bold mb-4">How the Financing System Works</h2>
               <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  A straightforward five-step process built for speed, clarity, and vendor confidence.
               </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
               {steps.map((s, i) => (
                  <div key={i} className="relative group">
                     {/* Connector line */}
                     {i < steps.length - 1 && (
                        <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[-50%] h-px bg-slate-700 z-0" />
                     )}
                     <div className="relative z-10 bg-slate-900 border border-slate-800 hover:border-emerald-700/50 rounded-2xl p-6 transition-all group-hover:shadow-lg group-hover:shadow-emerald-950">
                        <span className="text-xs font-bold text-emerald-500 tracking-widest mb-4 block">{s.num}</span>
                        <div className="w-11 h-11 bg-emerald-700/20 rounded-xl flex items-center justify-center mb-4">
                           <Icon d={s.icon} size={20} className="text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-white text-sm mb-2">{s.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}

function WhySection() {
   return (
      <section className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-3">Our Mission</p>
               <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Why This Program Exists</h2>
               <p className="text-slate-600 leading-relaxed mb-6">
                  We partner with financial institutions, government programs, and development organizations to bring
                  institutional-grade financing directly to marketplace vendors.
               </p>
               <p className="text-slate-600 leading-relaxed mb-8">
                  As a <strong className="text-slate-800">trusted intermediary</strong>, we handle the complexity — you
                  never need to interact directly with financial institutions. We bridge the gap, advocate for your
                  business, and ensure a smooth, transparent financing experience.
               </p>

               <div className="grid grid-cols-3 gap-4">
                  {[
                     { label: "Financial Institutions", icon: icons.building },
                     { label: "Government Programs", icon: icons.shield },
                     { label: "Development Orgs", icon: icons.users },
                  ].map((p) => (
                     <div key={p.label} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                        <div className="w-9 h-9 bg-emerald-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                           <Icon d={p.icon} size={18} className="text-white" />
                        </div>
                        <p className="text-xs font-semibold text-emerald-800 leading-tight">{p.label}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right visual */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8">
               <p className="text-sm font-semibold text-slate-700 mb-6">Our Role as Financing Partner</p>
               <div className="space-y-4">
                  {[
                     "Application processing",
                     "Vendor verification",
                     "Loan administration",
                     "Disbursement coordination",
                     "Repayment monitoring",
                  ].map((item, i) => (
                     <div
                        key={i}
                        className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-5 py-4 shadow-sm"
                     >
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                           <Icon d={icons.check} size={13} className="text-emerald-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{item}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}

function Benefits() {
   const benefits = [
      {
         icon: icons.layers,
         title: "Structured Business Financing",
         desc: "Access properly structured loan products designed around your business model and repayment capacity.",
      },
      {
         icon: icons.zap,
         title: "Faster Approval Process",
         desc: "Our streamlined review system gets eligible vendors approved significantly faster than traditional banks.",
      },
      {
         icon: icons.repeat,
         title: "Flexible Repayment",
         desc: "Choose between installment schedules or lump-sum repayment — structured to match your cash flow.",
      },
      {
         icon: icons.growth,
         title: "Capital for Expansion",
         desc: "Fund equipment purchases, inventory build-up, or production expansion with dedicated capital.",
      },
      {
         icon: icons.users,
         title: "Vendor Growth Support",
         desc: "Beyond capital, gain access to a network of financing partners invested in your long-term success.",
      },
      {
         icon: icons.shield,
         title: "Secure & Transparent",
         desc: "Every step of the process is documented and monitored, ensuring full transparency for all parties.",
      },
   ];

   return (
      <section id="benefits" className="py-24 px-6 bg-slate-50">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-3">Benefits</p>
               <h2 className="text-4xl font-bold text-slate-900 mb-4">What You Gain From This Program</h2>
               <p className="text-slate-500 text-lg max-w-xl mx-auto">
                  Designed to remove barriers and put capital where it matters most — in the hands of growing vendors.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {benefits.map((b, i) => (
                  <div
                     key={i}
                     className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                     <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mb-5">
                        <Icon d={b.icon} size={22} className="text-white" />
                     </div>
                     <h3 className="font-bold text-slate-900 text-lg mb-2">{b.title}</h3>
                     <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}

function Eligibility() {
   const criteria = [
      "Registered vendors on the platform",
      "Vendors with active marketplace participation",
      "Businesses that can provide supporting documentation",
      "Vendors with clear production or expansion goals",
   ];

   return (
      <section id="eligibility" className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-3">Eligibility</p>
               <h2 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">Who Can Apply?</h2>
               <p className="text-slate-600 leading-relaxed mb-8">
                  Our program is designed for vendors who are actively participating on the platform and have a
                  verifiable business profile. If you meet the criteria below, you are encouraged to apply.
               </p>

               <div className="space-y-3">
                  {criteria.map((c, i) => (
                     <div
                        key={i}
                        className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4"
                     >
                        <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                           <Icon d={icons.check} size={11} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-emerald-900">{c}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right decoration */}
            <div className="bg-gradient-to-br from-emerald-700 to-slate-900 rounded-3xl p-10 text-white text-center">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon d={icons.clock} size={30} className="text-emerald-400" />
               </div>
               <h3 className="text-2xl font-bold mb-2">Fast-Track Review</h3>
               <p className="text-emerald-200 text-sm leading-relaxed mb-6">
                  Eligible vendors with complete documentation typically receive a decision within{" "}
                  <strong className="text-white">3 – 5 business days</strong>.
               </p>
               <a
                  href="#apply"
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
               >
                  Start Application
                  <Icon d={icons.arrow} size={16} />
               </a>
            </div>
         </div>
      </section>
   );
}

function FAQ() {
   const faqs = [
      {
         q: "Who can apply for vendor financing?",
         a: "Any registered vendor on the platform who is actively participating in the marketplace and can provide the required documentation may apply. Eligibility is assessed on a case-by-case basis.",
      },
      {
         q: "How long does loan approval take?",
         a: "For vendors with complete documentation, our team typically issues a decision within 3 to 5 business days. Complex cases may take slightly longer depending on the verification requirements.",
      },
      {
         q: "How are repayments structured?",
         a: "Repayment terms are agreed upon during the approval process. Vendors may repay through fixed monthly installments or choose to settle the full outstanding amount at any time without penalty.",
      },
      {
         q: "Do vendors interact directly with financial institutions?",
         a: "No. Our platform acts as a trusted intermediary, managing all communication and coordination with funding partners on your behalf. You deal only with our financing team.",
      },
      {
         q: "What documents are required to apply?",
         a: "Typical documentation includes a valid business registration, bank statements, proof of marketplace activity, and a brief statement of purpose for the loan. The application form will guide you through the full requirements.",
      },
   ];

   const [open, setOpen] = useState(null);

   return (
      <section id="faq" className="py-24 px-6 bg-slate-50">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
               <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-3">FAQ</p>
               <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
               <p className="text-slate-500">Everything you need to know before applying.</p>
            </div>

            <div className="space-y-3">
               {faqs.map((f, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                     <button
                        className="w-full text-left px-7 py-5 flex items-center justify-between gap-4"
                        onClick={() => setOpen(open === i ? null : i)}
                     >
                        <span className="font-semibold text-slate-900 text-base">{f.q}</span>
                        <Icon
                           d={icons.chevronDown}
                           size={20}
                           className={`text-slate-400 flex-shrink-0 transition-transform ${
                              open === i ? "rotate-180" : ""
                           }`}
                        />
                     </button>
                     {open === i && (
                        <div className="px-7 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4">
                           {f.a}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}

function CTA() {
   return (
      <section id="apply" className="py-24 px-6 bg-emerald-700">
         <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">Ready to Grow Your Business?</h2>
            <p className="text-emerald-100 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
               If your business needs funding to expand operations or increase production capacity, you can start your
               financing application directly from your vendor dashboard.
            </p>
            <a
               href="/dashboard/financing/apply"
               className="inline-flex items-center gap-3 bg-white text-emerald-800 font-bold text-base px-10 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-xl"
            >
               Apply for Financing
               <Icon d={icons.arrow} size={20} />
            </a>
            <p className="text-emerald-300 text-xs mt-6">
               Applications reviewed within 3–5 business days. Secure & confidential.
            </p>
         </div>
      </section>
   );
}

function Footer() {
   return (
      <footer className="bg-slate-950 text-slate-400 py-14 px-6">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
               <a href="#" className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center">
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                     </svg>
                  </span>
                  <span className="text-white font-bold">
                     Vendor<span className="text-emerald-500">Finance</span>
                  </span>
               </a>
               <p className="text-xs leading-relaxed max-w-xs">
                  A structured vendor financing platform connecting marketplace vendors with institutional funding
                  partners.
               </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
               {["About", "Vendors", "Financing", "FAQ", "Contact"].map((l) => (
                  <a key={l} href="#" className="hover:text-emerald-400 transition-colors">
                     {l}
                  </a>
               ))}
            </div>
         </div>

         <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} VendorFinance. All rights reserved.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
               </a>
               <a href="#" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
               </a>
            </div>
         </div>
      </footer>
   );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function FinancingPage() {
   return (
      <>
         <Navbar />
         <main>
            <Hero />
            <ProblemSection />
            <AboutSection />
            <HowItWorks />
            <WhySection />
            <Benefits />
            <Eligibility />
            <FAQ />
            <CTA />
         </main>
         <Footer />
      </>
   );
}
