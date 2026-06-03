import { CreateTrainingForm } from "../components/CreateTrainingForm";
import Breadcrumbs from "../../../dashboard/components/BreadCrumbs";
import { verifyVendorSession } from "@/actions/session";

export default async function Page() {
  const session = await verifyVendorSession();
  if (
    !session?.authenticated ||
    session.role !== "trainer" ||
    session.workspace !== "marketplace"
  ) {
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
