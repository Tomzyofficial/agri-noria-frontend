import Link from "next/link";
import { Wheat, Sprout, FileText, MessagesSquare, PercentCircle, Headset, ArrowRight, Check } from "lucide-react";

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
      icon: FileText,
      title: "Request a quote",
      description: "Tell a vendor what you need and how much — quantity, timeline, delivery location — and they'll respond with pricing tailored to the order.",
      points: ["Specify quantity and delivery timeline", "Attach any specific requirements", "Send to one vendor or several at once"],
   },
   {
      icon: MessagesSquare,
      title: "Direct vendor negotiation",
      description: "Bulk orders often need back-and-forth — message the vendor directly to work out final pricing and delivery details before you commit.",
      points: ["In-platform messaging with the vendor", "Negotiate price, timeline, or delivery split", "Nothing is final until you both confirm"],
   },
   {
      icon: PercentCircle,
      title: "Volume pricing",
      description: "Many vendors offer better per-unit pricing at scale. Bulk requests make it easy for them to quote accordingly.",
      points: ["Vendor-set volume discounts", "Transparent final price before payment", "Standard commission still applies"],
   },
   {
      icon: Headset,
      title: "Dedicated support",
      description: "Large orders get extra attention from our support team — before, during, and after delivery.",
      points: ["Priority support for orders above a set threshold", "Help coordinating multi-vendor orders", "Same Quality Guarantee applies at any scale"],
   },
];

const STEPS = [
   {
      title: "Submit a bulk request",
      description: "Fill out quantity, delivery location, and timeline on any listing marked as available for bulk orders.",
   },
   {
      title: "Vendor reviews and responds",
      description: "The vendor confirms availability and sends back a quote, usually within a day or two.",
   },
   {
      title: "Confirm and pay securely",
      description: "Once you're both aligned on price and delivery, pay through Agri-Noria — the same buyer protections apply.",
   },
];

export default function BulkOrdersPage() {
   return (
      <div className="min-h-screen bg-background">
         <header className="border-b">
            <div className="mx-auto max-w-6xl px-4 py-16">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <Wheat className="h-4 w-4" />
                  <span>For Buyers</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">Buying in volume? Get pricing built for it</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Request quotes, negotiate directly with vendors, and place large orders without losing the protections of buying on Agri-Noria.</p>
               <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/browse-products" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     Browse Products
                     <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/contact-us" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     Talk to Support
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
               <p className="text-muted-foreground mb-8 max-w-2xl">From request to delivery, in three steps.</p>
               <div className="grid sm:grid-cols-3 gap-6">
                  {STEPS.map((step, index) => (
                     <div key={step.title} className="relative">
                        <div className="flex items-center gap-3 mb-3">
                           <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">{index + 1}</span>
                           {index < STEPS.length - 1 && <div className="hidden sm:block flex-1 border-t border-dashed border-border" />}
                        </div>
                        <h3 className="font-medium text-foreground">{step.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                     </div>
                  ))}
               </div>
            </div>

            <div className="mt-16 rounded-lg border border-border bg-muted p-8 text-center">
               <h2 className="text-xl font-semibold text-foreground">Need a quote for a large order?</h2>
               <p className="mt-2 text-muted-foreground max-w-md mx-auto">Find a listing marked for bulk orders and send your request directly to the vendor.</p>
               <Link href="/browse-products" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
               </Link>
            </div>
         </div>
      </div>
   );
}
