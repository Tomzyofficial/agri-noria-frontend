"use client";
import { useCartContext } from "@/hooks/useCartContext";
import { Button } from "@/components/ui/Button";
import { MdAddShoppingCart } from "react-icons/md";
import { Plus, Minus } from "lucide-react";
import { CiTrash } from "react-icons/ci";
import { formatPrice } from "@/utils/formatPrice";

export function ProductCartActions({ listing }) {
   const { cart, addToCart, removeItem, increaseQuantity, decreaseQuantity, loading } = useCartContext();
   const image = listing.image[0];

   const itemForCart = {
      listing_id: listing?.listing_id,
      product_image: image,
      listing_name: listing.listing_name,
      description: listing.description,
      price: listing.price,
      quantity: listing.available_quantity || 0,
      currency: listing.currency,
      country_code: listing.country_code,
      country_name: listing.country_name,
      state_name: listing.state_name,
      min_quantity: listing.min_quantity ?? null,
      discount: listing.discount ?? null,
   };

   const cartItem = cart?.find((n) => n.listing_id === itemForCart.listing_id);
   const itemInCart = !!cartItem;
   const itemQuantity = cartItem?.quantity || 0;

   if (loading) {
      return (
         <div className="bg-white shadow-md rounded-md p-4">
            <div className="flex gap-4 items-center">
               <p className="w-1/2 h-5 animate-pulse bg-gray-300" />
               <p className="w-1/2 h-5 animate-pulse bg-gray-300" />
            </div>
            <div className="w-full p-5 mt-10 rounded cursor-pointer relative bg-gray-300 animate-pulse flex items-center " />
         </div>
      );
   }

   return (
      <div className="bg-white shadow-md rounded-md p-4">
         {listing.price && (
            <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">Price:</span>
               <span className="text-lg font-bold">{formatPrice(listing.price, listing.country_code, listing.currency)}</span>
            </div>
         )}
         {itemInCart ? (
            <div className="flex justify-between items-center mt-10">
               <div className="flex items-center gap-4">
                  <Button onClick={() => decreaseQuantity(itemForCart)} className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)">
                     <Minus />
                  </Button>
                  <span className="text-lg">{itemQuantity}</span>
                  <Button onClick={() => increaseQuantity(itemForCart)} className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)">
                     <Plus />
                  </Button>
               </div>

               <Button className="text-red-400 dark:text-red-300 hover:bg-red-300 hover:text-red-700 rounded transition px-2 flex items-center gap-2 transition-background cursor-pointer" onClick={() => removeItem(itemForCart)}>
                  <span>
                     <CiTrash />
                  </span>
                  Remove
               </Button>
            </div>
         ) : (
            <Button onClick={() => addToCart(itemForCart)} id="addToCart" className="w-full p-2 mt-10 rounded cursor-pointer relative bg-(--greenish-color) hover:bg-(--dark-green-color) dark:bg-(--dark-green-color) text-(--white-fff) flex items-center">
               <span className="absolute left-4">
                  <MdAddShoppingCart className="w-5 h-5" />
               </span>
               <span className="mx-auto">Add to Cart</span>
            </Button>
         )}
      </div>
   );
}
