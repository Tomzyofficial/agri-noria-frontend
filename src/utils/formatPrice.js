export function formatPrice(price, countryIsoCode, currency) {
   return new Intl.NumberFormat(`en-${countryIsoCode}`, {
      style: "currency",
      currency: currency,
      currencyDisplay: "narrowSymbol",
   }).format(price);
}

// Used in the cart page
export const formatTotalPrice = (cart) => {
   if (!cart || cart.length === 0) return "₦0.00";

   // Get currency and country from first cart item
   const firstItem = cart[0];
   // const countryCode = firstItem?.user_country;
   const countryCode = firstItem?.user_country || "NG";

   const currency = firstItem?.currency;

   const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

   const formatted = formatPrice(cartTotal, countryCode, currency);
   return formatted;
};
