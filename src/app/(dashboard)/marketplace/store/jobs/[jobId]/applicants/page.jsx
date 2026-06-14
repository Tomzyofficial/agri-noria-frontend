export default function JobApplicantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Farm Manager Applicants</h1>

        <p className="text-muted-foreground">Review and manage job applications.</p>
      </div>

      <div className="rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Applicant</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Applied</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-4">John Doe</td>
              <td className="p-4">5 Years</td>
              <td className="p-4">Jun 13</td>
              <td className="p-4">New</td>

              <td className="p-4">
                <div className="flex gap-3">
                  <button className="text-primary">View</button>

                  <button className="text-primary">Download CV</button>

                  <button className="text-green-600">Shortlist</button>

                  <button className="text-red-600">Reject</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
