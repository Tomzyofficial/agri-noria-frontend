import DroneListingHeader from "./DroneListingHeader";
import DroneImageGallery from "./DroneImageGallery";
import DroneListingDescription from "./DroneListingDescription";
import DroneSpecTable from "./DroneSpecTable";
import PurchaseModeTabs from "./PurchaseModeTabs";

export default function DroneListingBoth({ listing }) {
   return (
      <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px] lg:gap-10">
         <div className="flex flex-col gap-6">
            <DroneListingHeader listing={listing} />
            <DroneImageGallery images={listing.product_image} listingName={listing.listing_name} listingType={listing.listing_type} quantity={listing.available_quantity} />
            <DroneListingDescription listing={listing} />
            <DroneSpecTable listing={listing} />
         </div>

         <aside className="lg:sticky lg:top-6 lg:self-start">
            <PurchaseModeTabs listing={listing} />
         </aside>
      </article>
   );
}
