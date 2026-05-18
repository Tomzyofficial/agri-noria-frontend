import Link from "next/link";
import { formatTotalPrice } from "@/utils/formatPrice";

export default function CartItemSummary({ cartCount, cart }) {
   return (
      <div className="w-full h-full md:w-[30%] bg-(--white-fff) dark:bg-(--card-dark) rounded-md">
         <div className="divide-y divide-(--background) font-normal">
            <h1 className="p-2 text-lg">Cart Summary</h1>

            <div className="flex justify-between p-2">
               <p>Item's total ({cartCount})</p>
               <p className="text-sm font-semibold">{formatTotalPrice(cart)}</p>
            </div>

            <div className="flex justify-between p-2">
               <p>Subtotal</p>
               <p className="text-lg">{formatTotalPrice(cart)}</p>
            </div>

            <div className="p-2">
               <Link
                  href="/checkout/summary"
                  className="cursor-pointer text-center block mx-auto shadow hover:shadow-md transition transition-background bg-(--greenish-color) hover:bg-(--dark-green-color) p-2 rounded text-(--white-fff)"
               >
                  Checkout {formatTotalPrice(cart)}
               </Link>
            </div>
         </div>
      </div>
   );
}
