import ApplicationForm from "../../components/ApplicationForm";
import { cookies } from "next/headers";

export default async function ApplyPage({ params }) {
  const { id } = await params;
  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold text-center">Apply For This Postion</h1>

      <ApplicationForm id={id} />
    </div>
  );
}
