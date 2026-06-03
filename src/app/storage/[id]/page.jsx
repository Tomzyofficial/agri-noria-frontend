import StorageDetail from "@/app/storage/[id]/storage-details";
import NavBar from "@/components/ui/NavBar/NavBar";
import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";

export const metadata = {
  title: "Storage Details",
  description: "View details of storage facility",
};

export default async function Page({ params }) {
  const cookieHeader = await cookieStoreFnc();
  const { id } = await params;
  let data;
  let error;
  try {
    const res = await fetch(apiUrl(`/api/marketplace/listed-storage/${id}`), {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      error = "Failed to fetch storage";
    }

    data = await res.json();
  } catch {}
  const storage = data.storage;
  return (
    <>
      <NavBar />
      <StorageDetail storage={storage} error={error} />
    </>
  );
}
