"use client";

import { disburseLoan } from "@/_lib/data";
import { useState } from "react";

export default function AdminLoanList({ loans }) {
   const [loanId, setLoanId] = useState(null);

   const handleDisburse = async (id) => {
      try {
         const result = await disburseLoan(id);
         setLoanId(id);

         alert(result.message);
      } catch (error) {
         alert(error.message);
      } finally {
         setLoanId(null);
      }
   };

   return (
      <div>
         {loans.map((loan) => (
            <div key={loan.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
               <p>
                  <strong>Organization:</strong> {loan.org_name}
               </p>
               <p>
                  <strong>Amount:</strong> {loan.amount}
               </p>
               <p>
                  <strong>Status:</strong> {loan.status}
               </p>

               {loan.status === "approved" && (
                  <button
                     className="bg-green-400 p-2"
                     onClick={() => handleDisburse(loan.id)}
                     disabled={loanId === loan.id}
                  >
                     {loanId === loan.id ? "Disbursing..." : "Disburse Loan"}
                  </button>
               )}
            </div>
         ))}
      </div>
   );
}
