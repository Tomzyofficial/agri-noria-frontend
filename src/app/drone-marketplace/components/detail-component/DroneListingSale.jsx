import DroneListingHeader from "./DroneListingHeader";
import DroneImageGallery from "./DroneImageGallery";
import DroneListingDescription from "./DroneListingDescription";
import DroneSpecTable from "./DroneSpecTable";
// import AddToCartPanel from "./AddToCartPanel";
import { ProductCartActions } from "./ProductCartActions";

export default function DroneListingSale({ listing }) {
   return (
      <article className="mx-auto max-w-7xl grid grid-cols-1 gap-10 py-8 lg:grid-cols-5">
         <div className="lg:col-span-3 space-y-4">
            <DroneListingHeader listing={listing} />
            <DroneImageGallery image={listing.image} listingName={listing.listing_name} listingType={listing.listing_type} quantity={listing.available_quantity} />
            <DroneListingDescription listing={listing} />
            <DroneSpecTable listing={listing} />
         </div>

         <aside className="lg:sticky lg:top-6 lg:self-start col-span-2">
            {/* <AddToCartPanel listing={listing} /> */}
            <ProductCartActions listing={listing} />
         </aside>
      </article>
   );
}
