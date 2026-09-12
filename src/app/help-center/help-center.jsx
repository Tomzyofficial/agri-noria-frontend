"use client";

import { useState } from "react";
import Link from "next/link";
import { Wheat, Sprout, Rocket, Wallet, Truck, Megaphone, ShieldCheck, ChevronDown, ArrowRight } from "lucide-react";

function FurrowDivider() {
   return (
      <div className="flex items-center gap-3 my-14" aria-hidden="true">
         <div className="flex-1 border-t border-dashed border-border" />
         <Sprout className="h-4 w-4 text-primary shrink-0" />
         <div className="flex-1 border-t border-dashed border-border" />
      </div>
   );
}

const CATEGORIES = [
   {
      icon: Rocket,
      title: "Getting Started",
      description: "Setting up your account and your first listing or order.",
      href: "/list-products",
   },
   {
      icon: Wallet,
      title: "Payments & Payouts",
      description: "Commission, ad rates, wallet, and withdrawals.",
      href: "/pricing-guide",
   },
   {
      icon: Truck,
      title: "Orders & Delivery",
      description: "Delivery options, timelines, and processes.",
      href: "/shipping-info",
   },
   {
      icon: Megaphone,
      title: "Advertising",
      description: "Banner and sponsored placements for vendors.",
      href: "/pricing-guide",
   },
   {
      icon: ShieldCheck,
      title: "Trust & Safety",
      description: "Verified vendors, safe transactions, reporting issues.",
      href: "/safety-guidelines",
   },
];

const FAQS = [
   {
      question: "How do I become a verified vendor?",
      answer: "Verification happens automatically once you complete your vendor profile with valid identification and contact details. Most accounts are verified within 24 hours.",
   },
   {
      question: "How long does it take to get paid after a sale?",
      answer: "Funds move to your wallet as pending balance right after delivery is confirmed, then release automatically after a short hold period. See the Pricing Guide for exact timing.",
   },
   {
      question: "What if my order arrives damaged or wrong?",
      answer: "Report it from your order page within 24 hours of delivery. It's covered under our Quality Guarantee, which explains exactly what happens next.",
   },
   {
      question: "Can I sell outside my local area?",
      answer: "Yes — there's no restriction on which states you can sell into.",
   },
   {
      question: "How do I report a suspicious listing or vendor?",
      answer: "Use the report option on the listing, or contact support directly. See our Safety Guidelines for what counts as suspicious activity.",
   },
];

function FaqItem({ question, answer }) {
   const [open, setOpen] = useState(false);
   return (
      <div className="border-b border-border">
         <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
            <span className="font-medium text-foreground">{question}</span>
            <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
         </button>
         {open && <p className="pb-5 text-muted-foreground leading-relaxed pr-8">{answer}</p>}
      </div>
   );
}

export function HelpCenterPage() {
   return (
      <div className="min-h-screen bg-background">
         <header>
            <div className="mx-auto max-w-6xl px-4 py-16">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <Wheat className="h-4 w-4" />
                  <span>Support</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">How can we help?</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Browse a topic below, or check the most common questions further down the page.</p>
            </div>
         </header>

         <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
               {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                     <Link key={cat.title} href={cat.href} className="rounded-lg border border-border p-5 hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                           <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="font-medium text-foreground">{cat.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                     </Link>
                  );
               })}
            </div>

            <FurrowDivider />

            <div>
               <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently asked questions</h2>
               <div>
                  {FAQS.map((faq) => (
                     <FaqItem key={faq.question} {...faq} />
                  ))}
               </div>
            </div>

            <div className="mt-16 rounded-lg border border-border bg-muted p-8 text-center">
               <h2 className="text-xl font-semibold text-foreground">Still need help?</h2>
               <p className="mt-2 text-muted-foreground max-w-md mx-auto">Our support team can help with anything specific to your account or order.</p>
               <Link href="/contact-us" className="group mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Contact Us
                  <ArrowRight className="group-hover:translate-x-2 transition duration-305 h-4 w-4" />
               </Link>
            </div>
         </div>
      </div>
   );
}
