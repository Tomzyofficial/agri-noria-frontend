import Link from "next/link";
import { Wheat, Sprout, Quote, ArrowRight, TrendingUp } from "lucide-react";

// -----------------------------------------------------------------------
// Placeholder stories — swap these for real vendor testimonials once you
// have them. Keep the same shape (name, role, location, quote, stat,
// statLabel) and the layout below will render as-is.
// -----------------------------------------------------------------------
const STORIES = [
   {
      name: "Amara Okonkwo",
      role: "Vegetable Farmer",
      location: "Nasarawa State",
      quote: "Before Agri-Noria I sold mostly to one middleman. Now I sell directly to buyers across three states, and I set my own prices.",
      stat: "3x",
      statLabel: "increase in monthly orders",
   },
   {
      name: "Ibrahim Danladi",
      role: "Poultry Vendor",
      location: "Kaduna State",
      quote: "The wallet system means I always know exactly what I've earned and when I can withdraw it. No more chasing payments.",
      stat: "48hrs",
      statLabel: "average time to payout",
   },
   {
      name: "Grace Effiong",
      role: "Equipment Supplier",
      location: "Cross River State",
      quote: "Running a sponsored listing for two weeks brought in more inquiries than three months of word of mouth.",
      stat: "5x",
      statLabel: "growth in listing views",
   },
];

function FurrowDivider() {
   return (
      <div className="flex items-center gap-3 my-14" aria-hidden="true">
         <div className="flex-1 border-t border-dashed border-border" />
         <Sprout className="h-4 w-4 text-primary shrink-0" />
         <div className="flex-1 border-t border-dashed border-border" />
      </div>
   );
}

export default function SuccessStoriesPage() {
   return (
      <div className="min-h-screen bg-background">
         <header className="border-b">
            <div className="mx-auto max-w-6xl px-4 py-16">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <Wheat className="h-4 w-4" />
                  <span>For Sellers</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">Real vendors, real growth</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">A few of the farmers and vendors building their business on Agri-Noria — and what's changed for them since they started.</p>
            </div>
         </header>

         <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid md:grid-cols-3 gap-6">
               {STORIES.map((story) => (
                  <div key={story.name} className="rounded-lg border border-border p-6 flex flex-col">
                     <Quote className="h-6 w-6 text-primary/40 mb-4" />
                     <p className="text-foreground leading-relaxed flex-1">"{story.quote}"</p>
                     <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-semibold text-foreground">{story.name}</p>
                        <p className="text-sm text-muted-foreground">
                           {story.role} · {story.location}
                        </p>
                        <div className="mt-4 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 w-fit">
                           <TrendingUp className="h-4 w-4 text-primary" />
                           <span className="text-sm font-semibold text-primary">{story.stat}</span>
                           <span className="text-xs text-muted-foreground">{story.statLabel}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <FurrowDivider />

            <div className="rounded-lg border border-border bg-muted p-8 text-center">
               <h2 className="text-xl font-semibold text-foreground">Your story could be next</h2>
               <p className="mt-2 text-muted-foreground max-w-md mx-auto">List your first product today and see what changes in your first month.</p>
               <Link href="/list-products" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Start Selling
                  <ArrowRight className="h-4 w-4" />
               </Link>
            </div>
         </div>
      </div>
   );
}
