import { CartPage } from "@/app/cart/components/CartPage";
import NavBar from "@/components/ui/NavBar/Navbar";

// export const metadata = {
//    title: "Cart",
//    description: "Cart items",
// };

export default async function Cart() {
  return (
    <>
      <NavBar />
      <CartPage />
    </>
  );
}
