import DroneListingHeader from "./DroneListingHeader";
import DroneImageGallery from "./DroneImageGallery";
import DroneListingDescription from "./DroneListingDescription";
import DroneSpecTable from "./DroneSpecTable";
import PurchaseModeTabs from "./PurchaseModeTabs";

export default function DroneListingBoth({ listing }) {
   return (
      <article className="mx-auto max-w-7xl grid gap-10 py-8 lg:grid-cols-5">
         <div className="col-span-3 space-y-4">
            <DroneListingHeader listing={listing} />
            <DroneImageGallery image={listing.image} listingName={listing.listing_name} listingType={listing.listing_type} quantity={listing.available_quantity} />
            <DroneListingDescription listing={listing} />
            <DroneSpecTable listing={listing} />
         </div>

         <aside className="lg:sticky lg:top-6 lg:self-start col-span-2">
            <PurchaseModeTabs listing={listing} />
         </aside>
      </article>
   );
}
