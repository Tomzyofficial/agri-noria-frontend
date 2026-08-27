import Link from "next/link";
import { Wheat, Sprout, SlidersHorizontal, BadgeCheck, LayoutGrid, Bookmark, ArrowRight, Check } from "lucide-react";
import { Footer } from "@/components/ui/Footer";
import NavBar from "@/components/ui/NavBar/NavBar";

function FurrowDivider() {
   return (
      <div className="flex items-center gap-3 my-14" aria-hidden="true">
         <div className="flex-1 border-t border-dashed border-border" />
         <Sprout className="h-4 w-4 text-primary shrink-0" />
         <div className="flex-1 border-t border-dashed border-border" />
      </div>
   );
}

const FEATURES = [
   {
      icon: SlidersHorizontal,
      title: "Smart filters",
      description: "Narrow thousands of listings down to what actually fits your order — by price, location, and more.",
      points: ["Price search available", "Filter by vendor location", "and more"],
   },
   {
      icon: BadgeCheck,
      title: "Verified vendors",
      description: "Look for the verified badge on a vendor's profile — it means their identity and farm or business details have been confirmed.",
      points: ["Identity-verified vendor accounts", "Visible ratings from past buyers", "Backed by our Quality Guarantee"],
   },
   {
      icon: LayoutGrid,
      title: "Browse by category",
      description: "From fresh produce to farm equipment to farm services, categories are structured so you can drill down fast.",
      points: ["Produce, farm services, equipment, and more", "Smart searches for precise browsing"],
   },
   // {
   //    icon: Bookmark,
   //    title: "Save & compare",
   //    description: "Keep track of listings you're considering, and come back to compare price, vendor, and delivery before you commit.",
   //    points: ["Save listings to review later", "Compare vendors on the same product", "Message a vendor before ordering"],
   // },
];

const STEPS = [
   {
      title: "Search or browse by category",
      description: "Use the search bar for something specific, or browse category pages if you're exploring options.",
   },
   {
      title: "Filter to narrow it down",
      description: "Apply price, location, and delivery filters until you're looking at listings that actually fit your order.",
   },
   {
      title: "Order or message the vendor",
      description: "Checkout directly, or message the vendor first if you have questions — especially useful for bulk orders.",
   },
];

export default function BrowseProductsPage() {
   return (
      <>
         <NavBar />
         <div className="min-h-screen">
            <header>
               <div className="mx-auto max-w-6xl px-4 py-16">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                     <Wheat className="h-4 w-4" />
                     <span>For Buyers</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">Find exactly what you're looking for</h1>
                  <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Thousands of listings from verified vendors across the country — filtered, categorized, and backed by our Quality Guarantee.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                     {/* <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        Start Browsing
                        <ArrowRight className="h-4 w-4" />
                     </Link> */}
                     <Link href="/quality-guarantee" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        View Quality Guarantee
                     </Link>
                  </div>
               </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 py-16">
               <div className="grid md:grid-cols-2 gap-6">
                  {FEATURES.map((feature) => {
                     const Icon = feature.icon;
                     return (
                        <div key={feature.title} className="rounded-lg border border-border p-6 flex flex-col">
                           <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                              <Icon className="h-5 w-5 text-primary" />
                           </div>
                           <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                           <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                           <ul className="mt-4 space-y-2">
                              {feature.points.map((point) => (
                                 <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span>{point}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     );
                  })}
               </div>

               <FurrowDivider />

               <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">How it works</h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl">From search to checkout in three steps.</p>
                  <div className="grid sm:grid-cols-3 gap-6">
                     {STEPS.map((step, index) => (
                        <div key={step.title} className="relative">
                           <div className="flex items-center gap-3 mb-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-gray-50 text-sm font-semibold shrink-0">{index + 1}</span>
                           </div>
                           <h3 className="font-medium text-foreground">{step.title}</h3>
                           <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="mt-16 rounded-lg border border-border bg-muted p-8 text-center">
                  <h2 className="text-xl font-semibold text-foreground">Ready to see what's available?</h2>
                  <p className="mt-2 text-muted-foreground max-w-md mx-auto">Browse live listings from vendors near you and across the country.</p>
                  {/* <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     Start Browsing
                     <ArrowRight className="h-4 w-4" />
                  </Link> */}
                  <p>Go to our dedicated marketplaces tailored to your need</p>
               </div>
            </div>
         </div>
         <Footer />
      </>
   );
}
