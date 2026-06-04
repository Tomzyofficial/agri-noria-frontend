import { QuoteRequestPage } from "./quoteRequest";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export default async function Page() {
  const session = await verifyVendorSession();
  if (
    !session?.authenticated ||
    session.role !== "storage facility" ||
    session.workspace !== "marketplace"
  ) {
    return <Unauthorized />;
  }
  return (
    <>
      <QuoteRequestPage />
    </>
  );
}
