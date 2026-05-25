import { CreateTrainingForm } from "../components/CreateTrainingForm";
import Breadcrumbs from "../../../dashboard/components/BreadCrumbs";

export default function Page() {
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
