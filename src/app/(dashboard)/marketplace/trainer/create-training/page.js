import { CreateTrainingForm } from "../components/CreateTrainingForm";
import Breadcrumbs from "../../../../../components/dashboard/BreadCrumbs";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export const metadata = {
   title: "Create new training session",
};

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "trainer" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   return (
      <>
         <Breadcrumbs
            breadcrumbs={[
               { href: "/marketplace/trainer", label: "Overview" },
               {
                  href: "/marketplace/trainer/create-training",
                  label: "Create Training",
                  active: true,
               },
            ]}
         />
         <CreateTrainingForm />
      </>
   );
}
