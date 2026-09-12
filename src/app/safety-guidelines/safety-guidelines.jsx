"use client";

import Link from "next/link";
import { Sprout, ShieldAlert, BadgeCheck, Lock, Ban, Flag, ArrowRight } from "lucide-react";

function FurrowDivider() {
   return (
      <div className="flex items-center gap-3 my-10" aria-hidden="true">
         <div className="flex-1 border-t border-dashed border-border" />
         <Sprout className="h-4 w-4 text-primary shrink-0" />
         <div className="flex-1 border-t border-dashed border-border" />
      </div>
   );
}

const SECTIONS = [
   { id: "overview", label: "Overview" },
   { id: "verified", label: "Verified Vendors" },
   { id: "transactions", label: "Safe Transactions" },
   { id: "prohibited", label: "Prohibited Items" },
   { id: "reporting", label: "Reporting" },
   { id: "faq", label: "Frequently Asked Questions" },
];

const PROHIBITED = ["Illegal substances or controlled items without proper authorization", "Counterfeit or misrepresented products", "Stolen goods or equipment", "Endangered or protected species and their products", "Items requiring a license the vendor cannot provide on request"];

export function SafetyGuidelinesPage() {
   return (
      <div className="min-h-screen">
         <header>
            <div className="mx-auto max-w-6xl px-4 py-14">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Support</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Safety Guidelines</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">How Agri-Noria keeps transactions safe, and what to do if something looks wrong.</p>
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
                  <p className="text-muted-foreground leading-relaxed">Most transactions on Agri-Noria go smoothly. These guidelines exist for the exceptions — how we verify who you're dealing with, what keeps a payment safe, and what to do if you spot something that doesn't look right.</p>
               </section>

               <FurrowDivider />

               <section id="verified" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <BadgeCheck className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Verified Vendors</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">A verified badge on a vendor's profile means their identity and contact details have been confirmed against valid identification. It doesn't guarantee every transaction will be perfect, but it does mean we know who they are and can act if there's a problem.</p>
               </section>

               <FurrowDivider />

               <section id="transactions" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Lock className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Safe Transactions</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">The single most important rule: always pay through Agri-Noria. Payments made outside the platform aren't covered by our Quality Guarantee, and we can't help recover them if something goes wrong.</p>
                  <ul className="space-y-2 text-muted-foreground">
                     <li>Be cautious if a vendor asks you to pay directly by bank transfer "to save on fees" — this is a common scam pattern.</li>
                     <li>Be cautious of prices far below similar listings for the same product.</li>
                     <li>Never share your account password or one-time verification codes with anyone, including someone claiming to be Agri-Noria support.</li>
                  </ul>
               </section>

               <FurrowDivider />

               <section id="prohibited" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Ban className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Prohibited Items</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">The following may not be listed on Agri-Noria under any circumstances:</p>
                  <ul className="space-y-2">
                     {PROHIBITED.map((item) => (
                        <li key={item} className="text-muted-foreground pl-1">
                           {item}
                        </li>
                     ))}
                  </ul>
               </section>

               <FurrowDivider />

               <section id="reporting" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Flag className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Reporting</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Use the report option on any listing or vendor profile, or contact support directly. Reports are reviewed by our trust and safety team, and repeated or serious violations can result in listing removal or account suspension.</p>
               </section>

               <FurrowDivider />

               <section id="faq" className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                     <div>
                        <p className="font-medium text-foreground">A vendor asked me to pay outside the platform — what do I do?</p>
                        <p className="text-muted-foreground mt-1">Don't send payment directly, and report the vendor. This is against our terms and puts your payment at risk.</p>
                     </div>
                     <div>
                        <p className="font-medium text-foreground">How long does a report take to review?</p>
                        <p className="text-muted-foreground mt-1">Most reports are reviewed within one to two business days.</p>
                     </div>
                  </div>
               </section>

               <div className="mt-14 rounded-lg border border-border bg-muted p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">Something doesn't look right? Report it or reach out to support.</p>
                  <Link href="/contact-us" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0">
                     Contact Support
                     <ArrowRight className="h-4 w-4" />
                  </Link>
               </div>
            </main>
         </div>
      </div>
   );
}
