import "@/app/globals.css";
import { CartProvider } from "@/hooks/useCartContext";
import { ToastContainer } from "react-toastify";
import { verifyBuyerSession } from "@/actions/session";

export const metadata = {
  title: {
    template: "%s | Agri-Noria",
    default: "Home | Agri-Noria",
  },
  description:
    "Agriculture is a way of life. We make it easier. We bridge the gap between farmers, buyers, and sellers.",
  keywords: [
    "Agriculture",
    "Farmers",
    "Buyers",
    "Sellers",
    "Agriculture is a way of life",
    "We make it easier",
    "We bridge the gap between farmers, buyers and sellers",
  ],
};

export default async function RootLayout({ children }) {
  let userId = null;
  try {
    const user = await verifyBuyerSession();
    userId = user?.buyerId;
  } catch {}

  return (
    <html lang="en">
      <body className="bg-(--background)">
        <CartProvider buyerId={userId}>{children}</CartProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
