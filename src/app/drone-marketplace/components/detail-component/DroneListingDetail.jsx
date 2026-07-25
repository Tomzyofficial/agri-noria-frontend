import DroneListingSale from "./DroneListingSale";
import DroneListingRent from "./DroneListingRent";
import DroneListingBoth from "./Dronelistingboth";

export default function DroneListingDetail({ listing }) {
   switch (listing.listing_type) {
      case "sale":
         return <DroneListingSale listing={listing} />;
      case "rent":
         return <DroneListingRent listing={listing} />;
      case "both":
         return <DroneListingBoth listing={listing} />;
      default:
         return (
            <div className="mx-auto max-w-5xl px-4 py-8">
               <p className="text-sm text-[#B3432B]">This listing has an unrecognized listing type.</p>
            </div>
         );
   }
}
