import { CreateTrainingForm } from "../components/CreateTrainingForm";
import Breadcrumbs from "../../components/BreadCrumbs";

export default function Page() {
   return (
      <>
         <Breadcrumbs
            breadcrumbs={[
               { href: "/dashboard/trainings", label: "Overview" },
               { href: "/dashboard/trainings/create-training", label: "Create Training", active: true },
            ]}
         />
         <CreateTrainingForm />
      </>
   );
}
