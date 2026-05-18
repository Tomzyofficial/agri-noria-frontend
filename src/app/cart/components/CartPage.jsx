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

   // const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

   return (
      <div className="m-4 md:m-10 gap-4 flex flex-col md:flex-row pb-10 text-(--foreground)">
         {/* Left side */}
         <CartItems
            cart={cart}
            removeItem={removeItem}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
         />

         {/* Right side */}
         <CartItemSummary cartCount={cartCount} cart={cart} />
      </div>
   );
}
