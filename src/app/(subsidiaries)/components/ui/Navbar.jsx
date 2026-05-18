import NavBarClient from "@/app/(subsidiaries)/components/ui/NavbarClient";
import { verifyBuyerSession } from "@/actions/session";

export default async function Navbar() {
   const user = await verifyBuyerSession();

   return <NavBarClient user={user} />;
}
