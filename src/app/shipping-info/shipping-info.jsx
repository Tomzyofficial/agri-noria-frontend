"use client";
import Link from "next/link";
import { Sprout, Truck, Wallet, Clock, MapPin, UserCheck, ArrowRight } from "lucide-react";

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
   { id: "options", label: "Delivery Options" },
   { id: "costs", label: "Costs" },
   { id: "timelines", label: "Estimated Timelines" },
   { id: "tracking", label: "Tracking Your Order" },
   { id: "responsibility", label: "Responsibility" },
   { id: "faq", label: "Frequently Asked Questions" },
];

const TIMELINES = [
   { zone: "Same city as vendor", estimate: "1–2 days" },
   { zone: "Same region / neighboring states", estimate: "2–4 days" },
   { zone: "Other regions within Nigeria", estimate: "4–7 days" },
   { zone: "Pickup at vendor location", estimate: "Same day, by appointment" },
];

export function ShippingInfoPage() {
   return (
      <div className="min-h-screen">
         <header>
            <div className="mx-auto max-w-6xl px-4 py-14">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <Truck className="h-4 w-4" />
                  <span>Buyer Policy</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Shipping Info</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Delivery is arranged by each vendor, with costs and timelines shown before you check out. Here's how it works end to end.</p>
            </div>
         </header>

         <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-[220px_1fr] gap-12">
            <nav aria-label="Page sections" className="hidden md:block sticky top-20 self-start">
               <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">On this page</p>
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

               <section id="overview" className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">Agri-Noria doesn't run its own delivery fleet — each vendor sets their own delivery options, coverage area, and cost per listing. What you see at checkout is exactly what you'll pay, with no added platform shipping markup.</p>
               </section>

               <FurrowDivider />

               <section id="options" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Truck className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Delivery Options</h2>
                  </div>
                  <ul className="space-y-3">
                     <li className="text-muted-foreground">
                        <span className="text-foreground font-medium">Vendor delivery.</span> The vendor delivers directly within a radius they define.
                     </li>
                     <li className="text-muted-foreground">
                        <span className="text-foreground font-medium">Third-party logistics.</span> For larger or long-distance orders, some vendors ship through a logistics partner — tracking details are shared once the shipment is dispatched.
                     </li>
                     <li className="text-muted-foreground">
                        <span className="text-foreground font-medium">Pickup.</span> Some listings are pickup-only, at a location and time you arrange with the vendor.
                     </li>
                  </ul>
               </section>

               <FurrowDivider />

               <section id="costs" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Wallet className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Costs</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Delivery cost is set by the vendor and shown on the listing before you add it to your order — it's added to your total at checkout, never charged separately afterward. Pickup listings have no delivery cost.</p>
               </section>

               <FurrowDivider />

               <section id="timelines" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <Clock className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Estimated Timelines</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">Actual delivery time depends on the vendor and product type — these are general estimates for planning purposes.</p>
                  <div className="overflow-hidden rounded-lg border border-border">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="bg-muted text-left">
                              <th className="px-4 py-3 font-medium text-foreground">Zone</th>
                              <th className="px-4 py-3 font-medium text-foreground">Estimated time</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                           {TIMELINES.map((row) => (
                              <tr key={row.zone}>
                                 <td className="px-4 py-3 text-foreground font-medium">{row.zone}</td>
                                 <td className="px-4 py-3 text-muted-foreground">{row.estimate}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </section>

               <FurrowDivider />

               <section id="tracking" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <MapPin className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Tracking Your Order</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Order status updates in your buyer dashboard as the vendor moves it from confirmed to out for delivery to delivered. You'll be notified at each stage.</p>
               </section>

               <FurrowDivider />

               <section id="responsibility" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4">
                     <UserCheck className="h-5 w-5 text-primary" />
                     <h2 className="text-2xl font-semibold text-foreground">Responsibility</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                     The vendor is responsible for proper packaging and safe handling until delivery is confirmed. You're responsible for providing an accurate delivery address and being available to receive the order — repeated failed deliveries due to an incorrect address may not be covered under our Quality Guarantee.
                  </p>
               </section>

               <FurrowDivider />

               <section id="faq" className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                     <div>
                        <p className="font-medium text-foreground">Can I change my delivery address after ordering?</p>
                        <p className="text-muted-foreground mt-1">Message the vendor as soon as possible — changes are possible before the order is dispatched, but not guaranteed after.</p>
                     </div>
                     <div>
                        <p className="font-medium text-foreground">What if my order never arrives?</p>
                        <p className="text-muted-foreground mt-1">Report it from your order page — non-delivery is covered under our Quality Guarantee.</p>
                     </div>
                  </div>
               </section>

               <div className="mt-14 rounded-lg border border-border bg-muted p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">Questions about a specific order's delivery?</p>
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
