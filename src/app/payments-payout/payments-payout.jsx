"use client";

import Link from "next/link";
import { Sprout, Wallet, CheckCircle2, Landmark, Megaphone, CalendarCheck, XCircle, ArrowRight } from "lucide-react";

// -----------------------------------------------------------------------
// Edit these to reflect Agri-Noria's real payout timing and ad rates.
// -----------------------------------------------------------------------
const PAYOUT = {
   holdHours: 24,
   processingDays: "1–3 business days",
   minimumWithdrawal: "No minimum — withdraw any available amount",
};

const AD_RATES = {
   lastUpdated: "August 2026",
   placements: [
      {
         name: "Banner Carousel",
         location: "Homepage hero rotation",
         price: "₦15,000",
         unit: "1500",
      },
      {
         name: "Sponsored Product Row",
         location: "Category & search pages",
         price: "₦5000",
         unit: "per week",
      },
   ],
};

const PAYOUT_STEPS = [
   {
      title: "Order delivered & confirmed",
      description: "The buyer confirms receipt, or the order auto-confirms after the standard delivery window closes.",
   },
   {
      title: "Funds move to Pending Balance",
      description: "The sale amount is credited to your wallet as pending balance.",
   },
   {
      title: `${PAYOUT.holdHours}-hours hold`,
      description: "Funds sit as pending balance while the buyer's claim window is open, protecting both sides if something's wrong with the order.",
   },
   {
      title: "Auto-release to Available Balance",
      description: "If no claim is filed, funds release automatically to your available balance once the hold period ends — no action needed from you.",
   },
   {
      title: "Request a withdrawal",
      description: "From your wallet page, request a withdrawal to your linked bank account anytime funds are available.",
   },
   {
      title: "Bank transfer arrives",
      description: `Withdrawals are sent via Paystack transfer and typically land in your account within ${PAYOUT.processingDays}.`,
   },
];

const AD_STEPS = [
   {
      title: "Choose a placement and dates",
      description: "Pick Banner Carousel or Sponsored Product Row, then select your start and end dates. Overlapping bookings on the same slot aren't allowed — you'll be prompted to choose another date if yours is taken.",
   },
   {
      title: "Pay upfront",
      description: "Campaigns are paid in full before they run, at the flat rate shown below. Payment is processed through Paystack.",
   },
   {
      title: "Pending Payment → Scheduled or Active",
      description: "Once payment clears, your campaign moves to Scheduled if it starts in the future, or Active immediately if it starts today.",
   },
   {
      title: "Campaign runs, then Expires",
      description: "Your ad appears in its placement for the full period you booked, then automatically moves to Expired and the slot becomes available again.",
   },
];

const SECTIONS = [
   { id: "overview", label: "Overview" },
   { id: "payout-process", label: "Vendor Payout Process" },
   { id: "ad-rates", label: "Advertising Rate Card" },
   { id: "ad-payment", label: "How Ad Payments Work" },
   { id: "cancellations", label: "Cancellations & Refunds" },
   { id: "faq", label: "Frequently Asked Questions" },
];

function FurrowDivider() {
   return (
      <div className="flex items-center gap-3 my-10" aria-hidden="true">
         <div className="flex-1 border-t border-dashed border-border" />
         <Sprout className="h-4 w-4 text-primary shrink-0" />
         <div className="flex-1 border-t border-dashed border-border" />
      </div>
   );
}

export function PaymentsPayoutPage() {
   return (
      <div className="min-h-screen">
         <header>
            <div className="mx-auto max-w-6xl px-4 py-14">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <Wallet className="h-4 w-4" />
                  <span>Vendor Policy</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Payments & Payout</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Exactly how money moves from a buyer's payment into your bank account, and what advertising costs if you want more visibility on the platform.</p>
               <p className="mt-4 text-sm text-muted-foreground">Last updated {AD_RATES.lastUpdated}</p>
            </div>
         </header>

         <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-[220px_1fr] gap-12">
            <nav aria-label="Page sections" className="hidden md:block sticky top-20 self-start">
               <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">On this page</p>
               <ul className="space-y-2 border-l border-border">
                  {SECTIONS.map((s) => (
                     <li key={s.id}>
                        <a href={`#${s.id}`} className="block pl-4 -ml-px border-l-2 border-transparent py-1 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                           {s.label}
                        </a>
                     </li>
                  ))}
               </ul>
            </nav>

            <main className="min-w-0">
               <nav aria-label="Page sections" className="md:hidden mb-10">
                  <label htmlFor="section-select" className="sr-only">
                     Jump to section
                  </label>
                  <select
                     id="section-select"
                     className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                     onChange={(e) => {
                        const el = document.getElementById(e.target.value);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                     }}
                     defaultValue=""
                  >
                     <option value="" disabled>
                        Jump to section
                     </option>
                     {SECTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                           {s.label}
                        </option>
                     ))}
                  </select>
               </nav>

               <section id="overview" className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">Every sale you make on Agri-Noria goes through your wallet before it reaches your bank account — this protects both you and the buyer. Advertising works differently: it's a flat, upfront fee for a fixed placement and duration, with no bidding involved.</p>
                  <div className="mt-6 grid sm:grid-cols-3 gap-4">
                     <div className="rounded-lg border border-border p-4">
                        <p className="text-2xl font-bold text-primary tabular-nums">{PAYOUT.holdHours} hours</p>
                        <p className="text-sm text-muted-foreground mt-1">Hold before funds are available</p>
                     </div>
                     <div className="rounded-lg border border-border p-4">
                        <p className="text-2xl font-bold text-primary tabular-nums">{PAYOUT.processingDays}</p>
                        <p className="text-sm text-muted-foreground mt-1">Bank transfer processing time</p>
                     </div>
                     <div className="rounded-lg border border-border p-4">
                        <p className="text-2xl font-bold text-primary">{PAYOUT.minimumWithdrawal}</p>
                     </div>
                  </div>
               </section>

               <FurrowDivider />

               <section id="payout-process" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-6">
                     <Landmark className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Vendor Payout Process</h2>
                  </div>
                  <div className="space-y-6">
                     {PAYOUT_STEPS.map((step, index) => (
                        <div key={step.title} className="flex gap-4">
                           <div className="flex flex-col items-center">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">{index + 1}</span>
                              {index < PAYOUT_STEPS.length - 1 && <div className="w-px flex-1 border-l border-dashed border-border mt-2" />}
                           </div>
                           <div className="pb-2">
                              <p className="font-medium text-foreground">{step.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <FurrowDivider />

               <section id="ad-rates" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Megaphone className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Advertising Rate Card</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">Fixed pricing, no bidding — pick a placement, pick your dates, pay once.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                     {AD_RATES.placements.map((placement) => (
                        <div key={placement.name} className="rounded-lg border border-border p-5">
                           <p className="font-semibold text-foreground">{placement.name}</p>
                           <p className="text-sm text-muted-foreground mt-1">{placement.location}</p>
                           <p className="mt-4 text-2xl font-bold text-primary tabular-nums">
                              {placement.price}
                              <span className="text-sm font-normal text-muted-foreground ml-1">{placement.unit}</span>
                           </p>
                        </div>
                     ))}
                  </div>
               </section>

               <FurrowDivider />

               <section id="ad-payment" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-6">
                     <CalendarCheck className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">How Ad Payments Work</h2>
                  </div>
                  <div className="space-y-6">
                     {AD_STEPS.map((step, index) => (
                        <div key={step.title} className="flex gap-4">
                           <div className="flex flex-col items-center">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">{index + 1}</span>
                              {index < AD_STEPS.length - 1 && <div className="w-px flex-1 border-l border-dashed border-border mt-2" />}
                           </div>
                           <div className="pb-2">
                              <p className="font-medium text-foreground">{step.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <FurrowDivider />

               <section id="cancellations" className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Cancellations & Refunds</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                     {/* <div>
                        <div className="flex items-center gap-2 mb-3">
                           <CheckCircle2 className="h-5 w-5 text-primary" />
                           <p className="font-medium text-foreground">Refundable</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Campaigns still in Pending Payment or Scheduled status can be cancelled from your dashboard for a full refund to your wallet.</p>
                     </div> */}
                     <div>
                        <div className="flex items-center gap-2 mb-3">
                           <XCircle className="h-5 w-5 text-muted-foreground" />
                           <p className="font-medium text-foreground">Non-refundable</p>
                        </div>
                        {/* <p className="text-sm text-muted-foreground">Once a campaign moves to Active, it's non-refundable — the placement is already running and can't be resold for that period.</p> */}
                        <p>There's no refund policy right now.</p>
                     </div>
                  </div>
               </section>

               <FurrowDivider />

               <section id="faq" className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                     <div>
                        <p className="font-medium text-foreground">Why isn't my money available right after a sale?</p>
                        <p className="text-muted-foreground mt-1">The {PAYOUT.holdHours}-hours hold gives buyers a window to report a problem before funds are finalized. It's the same window described in our Quality Guarantee.</p>
                     </div>
                     <div>
                        <p className="font-medium text-foreground">Can I book the same ad placement for multiple days?</p>
                        <p className="text-muted-foreground mt-1">Yes — book consecutive days in one go, or run daily campaigns back to back. You only pay for what you use.</p>
                     </div>
                     <div>
                        <p className="font-medium text-foreground">What happens if my withdrawal fails?</p>
                        <p className="text-muted-foreground mt-1">Funds return to your available balance automatically, and you'll see a failure reason on your wallet page — usually an issue with the linked bank account details.</p>
                     </div>
                  </div>
               </section>

               {/* <div className="mt-14 rounded-lg border border-border bg-muted p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">Want the full commission breakdown by category too?</p>
                  <Link href="/pricing-guide" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0">
                     View Pricing Guide
                     <ArrowRight className="h-4 w-4" />
                  </Link>
               </div> */}
            </main>
         </div>
      </div>
   );
}
