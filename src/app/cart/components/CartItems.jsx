import Image from "next/image";
import { IncrementItemBtn, DecrementItemBtn, RemoveItemBtn } from "./productCartActionBtns";
import { formatPrice } from "@/utils/formatPrice";

export default function CartItems({ cart, removeItem, increaseQuantity, decreaseQuantity }) {
   return (
      <div className="w-full md:w-[70%]">
         {cart.map((item) => (
            <div key={item.listing_name} className="mb-4 py-2 bg-(--white-fff) dark:bg-(--card-dark) rounded h-fit ">
               <p className="font-semibold p-3 text-(--foreground) text-lg border-b border-(--background)">
                  Cart ({item.quantity})
               </p>
               <div className="flex relative justify-between p-3 pb-15">
                  <div className="flex gap-3">
                     <div>
                        <Image
                           priority
                           src={item.product_image}
                           alt={`${item.listing_name} Image`}
                           width={500}
                           height={500}
                           style={{ objectFit: "cover", width: "100px", height: "auto", borderRadius: "5px" }}
                        />
                     </div>
                     <div className="text-lg">
                        <p className="font-semibold">{item.listing_name}</p>
                        <p className="text-[14px]">{item.description}</p>
                     </div>
                     <RemoveItemBtn className="absolute left-3 bottom-0" removeItem={removeItem} item={item} />
                  </div>

                  <div>
                     {formatPrice(item.price, item.country_code, item.currency)}
                     <div className="absolute bottom-0 right-3 flex items-center">
                        <div className="flex items-center gap-4">
                           <DecrementItemBtn decreaseQuantity={decreaseQuantity} item={item} />
                           <span className="text-lg">{item.quantity}</span>
                           <IncrementItemBtn increaseQuantity={increaseQuantity} item={item} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}
