"use client";
import { useCartContext } from "@/hooks/useCartContext";
import Skeleton from "@/components/ui/LoadingSkeleton";
import EmptyCart from "@/app/cart/components/EmptyCart";
import CartItems from "@/app/cart/components/CartItems";
import CartItemSummary from "@/app/cart/components/CartItemSummary";

export function CartPage() {
   const { cart, removeItem, cartCount, increaseQuantity, decreaseQuantity, loading } = useCartContext();

   if (loading) return <Skeleton />;

   if (!cart || cart.length < 1) {
      return <EmptyCart />;
   }

   return (
      <div className="m-4 md:m-10 gap-4 flex flex-col md:flex-row text-(--foreground)">
         <CartItems cart={cart} removeItem={removeItem} increaseQuantity={increaseQuantity} decreaseQuantity={decreaseQuantity} />

         <CartItemSummary cartCount={cartCount} cart={cart} />
      </div>
   );
}
