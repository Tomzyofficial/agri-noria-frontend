import { Wheat } from "lucide-react";

export function Footer() {
   return (
      <footer className="border-t py-12 mt-30">
         <div className="mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <Wheat className="h-6 w-6 text-primary" />
                     <span className="font-bold text-lg">AgriConnect</span>
                  </div>
                  <p className="text-muted-foreground">Connecting the agricultural community through trusted marketplace solutions.</p>
               </div>
               <div>
                  <h5 className="font-semibold mb-4">For Sellers</h5>
                  <ul className="space-y-2 text-muted-foreground">
                     <li>List Products</li>
                     <li>Seller Dashboard</li>
                     <li>Pricing Guide</li>
                     <li>Success Stories</li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-semibold mb-4">For Buyers</h5>
                  <ul className="space-y-2 text-muted-foreground">
                     <li>Browse Products</li>
                     <li>Quality Guarantee</li>
                     <li>Shipping Info</li>
                     <li>Bulk Orders</li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-semibold mb-4">Support</h5>
                  <ul className="space-y-2 text-muted-foreground">
                     <li>Help Center</li>
                     <li>Contact Us</li>
                     <li>Safety Guidelines</li>
                     <li>Terms of Service</li>
                  </ul>
               </div>
            </div>
         </div>
      </footer>
   );
}
