import { Wheat } from "lucide-react";
import Link from "next/link";
import { oppositeFormatLabel } from "@/utils/otherUtils";

const sellers = ["List Products", "Payments Payout"];
const buyers = ["Browse Products", "Quality Guarantee", "Shipping Info"];
const support = ["Help Center", "Contact Us", "Safety Guidelines", "Terms of Service"];

export function Footer() {
   return (
      <footer className="border-t py-12 mt-30">
         <div className="mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <Wheat className="h-6 w-6 text-primary" />
                     <span className="font-bold text-lg">Agri-Noria</span>
                  </div>
                  <p className="text-muted-foreground">Coordinating Agricultural Ecosystems. Regenerating. Sustaining. Feeding the Future.</p>
               </div>
               <div>
                  <h5 className="font-semibold mb-4">For Sellers</h5>
                  <ul className="space-y-2 text-muted-foreground">
                     <li className="flex flex-col">
                        {sellers.map((s) => (
                           <Link key={s} href={oppositeFormatLabel(s)}>
                              {s}
                           </Link>
                        ))}
                     </li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-semibold mb-4">For Buyers</h5>
                  <ul className="space-y-2 text-muted-foreground">
                     <li className="flex flex-col">
                        {buyers.map((b) => (
                           <Link key={b} href={oppositeFormatLabel(b)}>
                              {b}
                           </Link>
                        ))}
                     </li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-semibold mb-4">Support</h5>
                  <ul className="space-y-2 text-muted-foreground">
                     <li className="flex flex-col">
                        {support.map((s) => (
                           <Link key={s} href={oppositeFormatLabel(s)}>
                              {s}
                           </Link>
                        ))}
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </footer>
   );
}
