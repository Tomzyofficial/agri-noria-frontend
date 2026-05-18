export const metadata = {
  title: "Checkout Summary",
  description: "Review your order details, select delivery options, and complete your purchase securely on GreenOria's checkout page.",
  keywords: [
    "checkout",
    "order summary",
    "secure payment",
    "delivery options",
    "GreenOria checkout",
    "online purchase"
  ],
  openGraph: {
    title: "Checkout Summary",
    description: "Review your order and complete your purchase securely.",
    type: "website",
    url: "https://greenoria.com/checkout/summary",
    siteName: "GreenOria Holdings"
  }
};

export default function CheckoutLayout({ children }) {
  return (
      <>
        {children}
      </>
  );
}
