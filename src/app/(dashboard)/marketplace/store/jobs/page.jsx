import { apiUrl } from "@/_lib/api";
import { JobsPage } from "./jobsPage";
import { cookieStoreFnc } from "@/actions/session";

export default async function Page() {
  const cookieHeader = await cookieStoreFnc();
  let jobs = [];
  try {
    const response = await fetch(apiUrl("/api/vendor/jobs/get-all"), {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });
    if (!response.ok) console.error("errorss", response.statusText);
    const data = await response.json();
    jobs = data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
  return <JobsPage job={jobs.data} />;
}
