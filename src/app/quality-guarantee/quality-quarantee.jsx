"use client";

import Link from "next/link";
import { Sprout, ShieldCheck, CheckCircle2, XCircle, FileWarning, RotateCcw, ArrowRight } from "lucide-react";
import { Footer } from "@/components/ui/Footer";

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
   { id: "covered", label: "What's Covered" },
   { id: "filing", label: "Filing a Claim" },
   { id: "refunds", label: "Refunds & Replacements" },
   { id: "accountability", label: "Vendor Accountability" },
   { id: "faq", label: "Frequently Asked Questions" },
];

const COVERED = ["Item significantly different from its listing description or photos", "Item arrived damaged, spoiled, or unusable", "Wrong item delivered", "Order confirmed as paid but never delivered"];

const NOT_COVERED = ["Change of mind after a perishable item has been delivered fresh", "Minor natural variation in size, color, or ripeness for fresh produce", "Delays caused by an incorrect delivery address provided by the buyer", "Damage caused after delivery was accepted and confirmed"];

export function QualityGuaranteePage() {
   return (
      <>
         {/* <NavBar /> */}
         <div className="min-h-screen">
            <header>
               <div className="mx-auto max-w-6xl px-4 py-14">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                     <ShieldCheck className="h-4 w-4" />
                     <span>Buyer Policy</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Quality Guarantee</h1>
                  <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Every order placed through Agri-Noria is backed by this guarantee. Here's exactly what's covered, and how to file a claim if something goes wrong.</p>
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
                     <p className="text-muted-foreground leading-relaxed">When you pay through Agri-Noria, your funds don't go straight to the vendor. They're held while your order is delivered and confirmed, which gives you a real window to report a problem before the vendor is paid out. This guarantee explains what's covered and what isn't.</p>
                  </section>

                  <FurrowDivider />

                  <section id="covered" className="scroll-mt-24">
                     <h2 className="text-2xl font-semibold text-foreground mb-6">What's Covered</h2>
                     <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                           <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                              <p className="font-medium text-foreground">Covered</p>
                           </div>
                           <ul className="space-y-2">
                              {COVERED.map((item) => (
                                 <li key={item} className="text-sm text-muted-foreground pl-1">
                                    {item}
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-3">
                              <XCircle className="h-5 w-5 text-muted-foreground" />
                              <p className="font-medium text-foreground">Not covered</p>
                           </div>
                           <ul className="space-y-2">
                              {NOT_COVERED.map((item) => (
                                 <li key={item} className="text-sm text-muted-foreground pl-1">
                                    {item}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </section>

                  <FurrowDivider />

                  <section id="filing" className="scroll-mt-24">
                     <div className="flex items-center gap-2 mb-4">
                        <FileWarning className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold text-foreground">Filing a Claim</h2>
                     </div>
                     <p className="text-muted-foreground leading-relaxed mb-4">
                        Open the order from your buyer dashboard and select <span className="font-medium text-foreground">Report an Issue</span>. Claims must be filed within 24 hours of the delivery being marked complete — after that, funds may already have released to the vendor.
                     </p>
                     <p className="text-muted-foreground leading-relaxed">Include photos where possible. Our support team reviews claims and reaches out to both you and the vendor, usually within one business day.</p>
                  </section>

                  <FurrowDivider />

                  <section id="refunds" className="scroll-mt-24">
                     <div className="flex items-center gap-2 mb-4">
                        <RotateCcw className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold text-foreground">Refunds & Replacements</h2>
                     </div>
                     <p className="text-muted-foreground leading-relaxed">
                        Once a claim is confirmed, you'll be offered a refund to your original payment, a replacement item from the same vendor, or a partial refund depending on the issue. Refunds are paid from the held balance, so the vendor is never paid for an order that didn't arrive as described.
                     </p>
                  </section>

                  <FurrowDivider />

                  <section id="accountability" className="scroll-mt-24">
                     <h2 className="text-2xl font-semibold text-foreground mb-4">Vendor Accountability</h2>
                     <p className="text-muted-foreground leading-relaxed">Vendors with repeated, verified claims against them are reviewed by our team. This can result in listing restrictions or, for serious or repeated violations, suspension from the platform. See our Safety Guidelines for how we handle reported vendors.</p>
                  </section>

                  <FurrowDivider />

                  <section id="faq" className="scroll-mt-24">
                     <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
                     <div className="space-y-6">
                        <div>
                           <p className="font-medium text-foreground">What if I don't notice a problem until after 24 hours?</p>
                           <p className="text-muted-foreground mt-1">Contact support anyway — claims filed late are reviewed case by case, especially if the funds haven't released yet.</p>
                        </div>
                        <div>
                           <p className="font-medium text-foreground">Does this guarantee cover bulk orders?</p>
                           <p className="text-muted-foreground mt-1">Yes, the same protections apply regardless of order size.</p>
                        </div>
                     </div>
                  </section>

                  <div className="mt-14 rounded-lg border border-border bg-muted p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <p className="text-sm text-muted-foreground">Have an issue with a recent order? Report it from your order page, or reach out to support directly.</p>
                     <Link href="/contact-us" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0">
                        Contact Support
                        <ArrowRight className="h-4 w-4" />
                     </Link>
                  </div>
               </main>
            </div>
         </div>
         <Footer />
      </>
   );
}
