import { apiUrl } from "@/_lib/api";

import AdminLoanList from "../../../../dashboard/components/AdminLoanList";

// Prevent static generation during build
export const dynamic = "force-dynamic";

export const adminLoans = async () => {
  try {
    const res = await fetch(apiUrl("/api/loans/"), {
      cache: "no-store",
      // Add error handling for build time
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      // Handle non-200 responses gracefully
      console.error("API response not OK:", res.status, res.statusText);
      return []; // Return empty array as fallback
    }

    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    return []; // Return empty array as fallback
  } catch (error) {
    console.error("Error fetching loans:", error);
    return []; // Return empty array as fallback
  }
};

export default async function AdminLoansPage() {
  const loans = await adminLoans();

  return (
    <div>
      <h1>Loan Applications</h1>

      <AdminLoanList loans={loans} />
    </div>
  );
}
