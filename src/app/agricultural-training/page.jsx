import { TrainingPage } from "./components/TrainingPage";
import { apiUrl } from "@/_lib/api";
import NavBar from "@/components/ui/NavBar/NavBar";

export default async function Page() {
  const res = await fetch(apiUrl(`/api/vendor/materials`), {
    method: "GET",
    cache: "no-store",
  });

  let error = null;
  if (!res.ok) {
    error = `Failed to fetch materials: ${res.statusText}`;
  }
  const data = await res.json();

  if (!data.success) {
    error = data.error || "Failed to fetch materials";
  }

  const materials = data.data || [];

  return (
    <>
      <NavBar />
      <TrainingPage materials={materials} error={error} />
    </>
  );
}
