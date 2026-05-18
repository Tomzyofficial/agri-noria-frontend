export function ProductInformation({ product }) {
   // Parse attributes if it's a string
   let parsedAttributes = product?.attributes;
   if (typeof parsedAttributes === "string") {
      try {
         parsedAttributes = JSON.parse(parsedAttributes);
      } catch {
         parsedAttributes = {};
      }
   }

   const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
         year: "numeric",
         month: "long",
         day: "numeric",
      });
   };

   // Map attributes for display
   const mappedObj = parsedAttributes
      ? Object.entries(parsedAttributes)
           .filter(([key, value]) => key && value && value !== "")
           .map(([key, value]) => ({
              key: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              value: key.includes("date") ? formatDate(value) : value,
           }))
      : [];

   return (
      <div className="bg-(--white-fff) dark:bg-(--card-dark) divide-y divide-gray-100 dark:divide-gray-700 space-y-4 rounded-md text-(--foreground) p-3 mt-4">
         <h1 className="text-lg font-bold">Product Information</h1>
         <p className="text-sm">Product Description: {product.description}</p>
         <p className="text-sm">Location: {product.location}</p>
         <p className="text-sm">Available Quantity: {product.available_quantity}</p>
         <p className="text-sm">Unit: {product.unit}</p>
         {mappedObj.map((attr, index) => (
            <p key={index}>
               {attr.key}: {attr.value}
            </p>
         ))}
      </div>
   );
}
