"use client";

import Link from "next/link";
import { Sprout, ScrollText, AlertTriangle, ArrowRight } from "lucide-react";

function FurrowDivider() {
   return (
      <div className="flex items-center gap-3 my-8" aria-hidden="true">
         <div className="flex-1 border-t border-dashed border-border" />
         <Sprout className="h-4 w-4 text-primary shrink-0" />
         <div className="flex-1 border-t border-dashed border-border" />
      </div>
   );
}

const SECTIONS = [
   { id: "acceptance", label: "1. Acceptance of Terms" },
   { id: "eligibility", label: "2. Eligibility & Accounts" },
   { id: "vendor-obligations", label: "3. Vendor Obligations" },
   { id: "buyer-obligations", label: "4. Buyer Obligations" },
   { id: "payments", label: "5. Payments & Fees" },
   { id: "prohibited-conduct", label: "6. Prohibited Conduct" },
   { id: "ip", label: "7. Intellectual Property" },
   { id: "liability", label: "8. Limitation of Liability" },
   { id: "indemnification", label: "9. Indemnification" },
   { id: "termination", label: "10. Termination" },
   { id: "disputes", label: "11. Dispute Resolution" },
   { id: "governing-law", label: "12. Governing Law" },
   { id: "changes", label: "13. Changes to These Terms" },
   { id: "contact", label: "14. Contact" },
];

export function TermsOfServicePage() {
   return (
      <div className="min-h-screen bg-background">
         <header>
            <div className="mx-auto max-w-6xl px-4 py-14">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <ScrollText className="h-4 w-4" />
                  <span>Legal</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Terms of Service</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">These terms govern your use of Agri-Noria as a buyer or vendor. By creating an account, you agree to them.</p>
               <p className="mt-4 text-sm text-muted-foreground">Last updated August 2026</p>

               <div className="mt-8 flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 max-w-2xl">
                  <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                     <span className="font-medium text-foreground">Template notice:</span> this document is a starting draft grounded in Agri-Noria's actual features and policies. Have it reviewed by a qualified lawyer before publishing it as your binding Terms of Service.
                  </p>
               </div>
            </div>
         </header>

         <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-[240px_1fr] gap-12">
            <nav aria-label="Page sections" className="hidden md:block sticky top-20 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
               <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Sections</p>
               <ul className="space-y-2 border-l border-border">
                  {SECTIONS.map((s) => (
                     <li key={s.id}>
                        <Link href={`#${s.id}`} className="block pl-4 -ml-px border-l-2 border-transparent py-1 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                           {s.label}
                        </Link>
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

               <div className="prose-none space-y-2 text-muted-foreground leading-relaxed">
                  <section id="acceptance" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                     <p>By creating an account, listing a product, or placing an order on Agri-Noria, you agree to be bound by these Terms of Service and any policies referenced within them, including our Quality Guarantee, Shipping Info, and Safety Guidelines. If you don't agree, you should not use the platform.</p>
                  </section>

                  <FurrowDivider />

                  <section id="eligibility" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">2. Eligibility & Accounts</h2>
                     <p>You must be at least 18 years old and able to enter a binding contract under applicable law to create an account. You're responsible for maintaining accurate account information and for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.</p>
                  </section>

                  <FurrowDivider />

                  <section id="vendor-obligations" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">3. Vendor Obligations</h2>
                     <p className="mb-3">As a vendor on Agri-Noria, you agree to:</p>
                     <ul className="list-disc pl-5 space-y-1.5">
                        <li>List products you have the legal right to sell, with accurate descriptions, pricing, and quantities</li>
                        <li>Fulfill confirmed orders within the delivery window you've committed to</li>
                        <li>Package and handle goods appropriately for their type</li>
                        {/* <li>Respond to buyer messages and claims in good faith</li> */}
                        <li>Never solicit payment outside the Agri-Noria platform for a transaction initiated on it</li>
                     </ul>
                  </section>

                  <FurrowDivider />

                  <section id="buyer-obligations" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">4. Buyer Obligations</h2>
                     <p className="mb-3">As a buyer, you agree to:</p>
                     <ul className="list-disc pl-5 space-y-1.5">
                        <li>Provide an accurate delivery address and be reasonably available to receive orders</li>
                        <li>Pay only through Agri-Noria's supported payment methods</li>
                        <li>Report issues with an order within the timeframe set out in our Quality Guarantee</li>
                        <li>Use claims and disputes in good faith, not to obtain goods without payment</li>
                     </ul>
                  </section>

                  <FurrowDivider />

                  <section id="payments" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">5. Payments & Fees</h2>
                     <p>
                        All payments are processed through our payment partner, Paystack. Agri-Noria charges vendors based on subscriptions and flat fees for optional advertising placements, both detailed in our Pricing Guide. Vendor payouts are held for a short period after delivery confirmation before becoming available for withdrawal, as
                        described in that same guide.
                     </p>
                  </section>

                  <FurrowDivider />

                  <section id="prohibited-conduct" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">6. Prohibited Conduct</h2>
                     <p className="mb-3">You may not use Agri-Noria to:</p>
                     <ul className="list-disc pl-5 space-y-1.5">
                        <li>List or attempt to sell any item prohibited under our Safety Guidelines</li>
                        <li>Circumvent platform payments or fees</li>
                        <li>Post false, misleading, or fraudulent listings or reviews</li>
                        <li>Harass, threaten, or defraud another user</li>
                        <li>Attempt to access another user's account or data without authorization</li>
                        <li>Interfere with the normal operation of the platform, including through automated scraping or bot activity</li>
                     </ul>
                  </section>

                  <FurrowDivider />

                  <section id="ip" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
                     <p>The Agri-Noria name, logo, and platform design are the property of Agri-Noria and may not be used without permission. Vendors retain ownership of the product photos and descriptions they upload, but grant Agri-Noria a license to display them on the platform for the purpose of operating the marketplace.</p>
                  </section>

                  <FurrowDivider />

                  <section id="liability" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
                     <p>
                        Agri-Noria operates as a marketplace, coordinating Agricultural Ecosystems, connecting buyers and vendors and is not itself a party to the sale of goods between them. To the fullest extent permitted by law, Agri-Noria is not liable for indirect, incidental, or consequential damages arising from a transaction between a buyer
                        and vendor, or ecosystem operations, except as expressly provided under our Quality Guarantee.
                     </p>
                  </section>

                  <FurrowDivider />

                  <section id="indemnification" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">9. Indemnification</h2>
                     <p>You agree to indemnify and hold Agri-Noria harmless from any claims, damages, or expenses arising from your breach of these terms, your listings, or your conduct on the platform.</p>
                  </section>

                  <FurrowDivider />

                  <section id="termination" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">10. Termination</h2>
                     <p>Agri-Noria may suspend or terminate an account for violation of these terms, including repeated Quality Guarantee claims, prohibited listings, or unsafe conduct.</p>
                  </section>

                  <FurrowDivider />

                  <section id="disputes" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">11. Dispute Resolution</h2>
                     <p>Disputes between buyers and vendors should first be raised through our claims process described in the Quality Guarantee. Disputes between a user and Agri-Noria will be addressed through good-faith negotiation before either party pursues formal legal action.</p>
                  </section>

                  <FurrowDivider />

                  <section id="governing-law" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">12. Governing Law</h2>
                     <p>These terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.</p>
                  </section>

                  <FurrowDivider />

                  <section id="changes" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">13. Changes to These Terms</h2>
                     <p>We may update these terms from time to time. Material changes will be communicated by email or in-platform notice. Continued use of Agri-Noria after a change takes effect constitutes acceptance of the updated terms.</p>
                  </section>

                  <FurrowDivider />

                  <section id="contact" className="scroll-mt-24">
                     <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact</h2>
                     <p>Questions about these terms can be directed to our support team.</p>
                  </section>
               </div>

               <div className="mt-14 rounded-lg border border-border bg-muted p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">Questions about these terms?</p>
                  <Link href="/contact-us" className="group inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0">
                     Contact Support
                     <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition duration-305" />
                  </Link>
               </div>
            </main>
         </div>
      </div>
   );
}
