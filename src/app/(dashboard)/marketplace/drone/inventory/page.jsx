import { InventoryManagement } from "../components/InventoryManagement";

export default function Page() {
   return <InventoryManagement inventoryUrl="/api/proxy/vendor/drone/get-inventory?page=1&limit=10" deleteUrl="/api/proxy/vendor/drone/delete" addNewHref="/marketplace/drone/inventory/add-new" viewHref="/marketplace/drone/inventory" editHref="/marketplace/drone/inventory" />;
}
