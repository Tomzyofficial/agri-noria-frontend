"use client";
import { useCartContext } from "@/hooks/useCartContext";
import { Button } from "@/components/ui/Button";
import { MdAddShoppingCart } from "react-icons/md";
import { Plus, Minus } from "lucide-react";
import { CiTrash } from "react-icons/ci";

export function ProductCartActions({ product }) {
   const { cart, addToCart, removeItem, increaseQuantity, decreaseQuantity, loading } = useCartContext();

   const itemForCart = {
      listing_id: product.listing_id,
      product_image: product.product_image,
      listing_name: product.listing_name,
      description: product.description,
      price: product.price,
      quantity: product.quantity || 0,
      currency: product.currency,
      country_code: product.country_code,
      min_quantity: product.min_quantity,
      discount: product.discount,
   };

   const cartItem = cart?.find((n) => n.listing_id === itemForCart.listing_id);
   const itemInCart = !!cartItem;
   const itemQuantity = cartItem?.quantity || 0;
   if (loading) {
      return (
         <div className="flex justify-between items-center">
            <div className="flex gap-4">
               <div className="h-10 w-10 mt-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
               <div className="h-10 w-10 mt-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
            <div className="h-10 w-10 mt-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
         </div>
      );
   }

   if (!itemInCart && loading) {
      return (
         <div className="w-full p-5 mt-10 rounded cursor-pointer relative bg-gray-400 animate-pulse flex items-center ">
            <span className="absolute left-4 bg-gray-100">
               <span className="w-5 h-5" />
            </span>
            <div className="mx-auto bg-gray-100" />
         </div>
      );
   }

   if (itemInCart) {
      return (
         <div className="flex justify-between items-center mt-10">
            <div className="flex items-center gap-4">
               <Button
                  onClick={() => decreaseQuantity(itemForCart)}
                  className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)"
               >
                  <Minus />
               </Button>
               <span className="text-lg">{itemQuantity}</span>
               <Button
                  onClick={() => increaseQuantity(itemForCart)}
                  className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)"
               >
                  <Plus />
               </Button>
            </div>

            <Button
               className="text-red-400 dark:text-red-300 hover:bg-red-300 hover:text-red-700 rounded transition px-2 flex items-center gap-2 transition-background cursor-pointer"
               onClick={() => removeItem(itemForCart)}
            >
               <span>
                  <CiTrash />
               </span>
               Remove
            </Button>
         </div>
      );
   }

   return (
      <Button
         onClick={() => addToCart(itemForCart)}
         id="addToCart"
         className="w-full p-2 mt-10 rounded cursor-pointer relative bg-(--greenish-color) hover:bg-(--dark-green-color) dark:bg-(--dark-green-color) text-(--white-fff) flex items-center"
      >
         <span className="absolute left-4">
            <MdAddShoppingCart className="w-5 h-5" />
         </span>
         <span className="mx-auto">Add to Cart</span>
      </Button>
   );
}
