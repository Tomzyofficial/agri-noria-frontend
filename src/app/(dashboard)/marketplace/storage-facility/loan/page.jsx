import { LoanForm } from "@/app/(dashboard)/dashboard/components/Loan/LoanForm";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "../../../dashboard/components/Unauthorized";
import { getAllLoans } from "@/_lib/data";
import { ErrorUi } from "@/components/ui/Error";

export const metadata = {
  title: "Loan",
  description: "Vendor loan management",
};

export default async function LoanManagement() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.account_type !== "Storage_Facility") {
    return <Unauthorized />;
  }
  let loans = [];
  try {
    const loanData = await getAllLoans();
    loans = loanData.data || [];
  } catch {
    return <ErrorUi />;
  }

  return (
    <div className="my-25 lg:my-5">
      <h2 className="text-2xl font-semibold mb-4">Loan Management</h2>
      <LoanForm loans={loans} session={session} />
    </div>
  );
}
