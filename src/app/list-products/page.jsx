import Link from "next/link";
import { Wheat, Sprout, Camera, ClipboardList, Tag, Truck, ArrowRight, Check } from "lucide-react";
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
      icon: Camera,
      title: "Photos that sell",
      description: "Buyers can't feel or smell your produce through a screen — the photo does that work. Clear, well-lit images build trust fast.",
      points: ["Natural light, no heavy filters", "Show scale — a hand, a crate, a bag"],
   },
   {
      icon: ClipboardList,
      title: "Accurate details",
      description: "Accurate details help buyers decide on exactly what they need, and saves time for both parties.",
      points: ["Honest condition — don't oversell", "Quantity available, you can update as you sell"],
   },
   {
      icon: Tag,
      title: "Fair pricing",
      description: "Don't overprice or underprice your listings. Fair price tend to draw more customers.",
      points: ["Compare against similar active listings"],
   },
   // {
   //    icon: Truck,
   //    title: "Delivery options",
   //    description: "Set your own delivery zones and costs, or mark a listing as pickup-only if that works better for what you're selling.",
   //    points: ["Define delivery radius and fee", "Pickup-only option for bulky or perishable goods", "Costs shown to buyers before checkout"],
   // },
];

const STEPS = [
   {
      title: "Create your vendor account",
      description: "Sign up and verify your details. This only happens once — after that you can list as many products as you want.",
   },
   {
      title: "Add product details",
      description: "Upload photos, write a well-detailed description, set your price and quantity.",
   },
   {
      title: "Publish and go live",
      description: "Your listing appears in its dedicated marketplace pages immediately. Edit it anytime as stock or pricing changes.",
   },
];

export default function ListProductsPage() {
   return (
      <>
         <NavBar />
         <div className="min-h-screen">
            <header>
               <div className="mx-auto max-w-6xl px-4 py-16">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                     <Wheat className="h-4 w-4" />
                     <span>For Sellers</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">List your products in minutes</h1>
                  <p className="mt-4 max-w-2xl text-lg ">No listing fees, no approval queue for basic listings. Add a product, and it's visible to buyers on Agri-Noria right away.</p>
                  {/* <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/vendor/dashboard/new-listing" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     Create a Listing
                     <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing-guide" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     View Pricing Guide
                  </Link>
               </div> */}
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
                  <p className="text-muted-foreground mb-8 max-w-2xl">Three steps between you and your first sale.</p>
                  <div className="grid sm:grid-cols-3 gap-6">
                     {STEPS.map((step, index) => (
                        <div key={step.title} className="relative">
                           <div className="flex items-center gap-3 mb-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-gray-50 text-sm font-semibold shrink-0">{index + 1}</span>
                              {/* {index < STEPS.length - 1 && <div className="hidden sm:block flex-1 border-t border-dashed border-border" />} */}
                           </div>
                           <h3 className="font-medium text-foreground">{step.title}</h3>
                           <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="mt-16 rounded-lg border border-border bg- p-8 text-center">
                  <h2 className="text-xl font-semibold text-foreground">Your next sale starts with a listing</h2>
                  <p className="mt-2 text-gray-500 max-w-md mx-auto">It takes a few minutes, and there's no fee to publish.</p>
                  <p className="text-gray-500">Visit your dashboard to create your first listing.</p>
               </div>
            </div>
         </div>
         <Footer />
      </>
   );
}
