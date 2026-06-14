"use client";
import { Plus, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { LoanFormModal } from "./LoanFormModal";
import { RepayFormModal } from "./RepayFormModal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

// const fmt = (n) => "₦" + Number(n).toLocaleString("en-NG");
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const statusBadge = (s) => {
   const map = {
      approved: "bg-[#f0fdf4] text-[#15803d]",
      completed: " bg-[#eff6ff] text-[#1d4ed8]",
      pending: "bg-[#fef2f2] text-[#d97706]",
      rejected: "bg-[#fef2f2] text-[#dc2626]",
   };
   const icons = { approved: "●", completed: "✓", pending: "○", rejected: "⚠" };
   return (
      <span className={`${map[s]}`}>
         {icons[s]} {s ? s.charAt(0).toUpperCase() + s.slice(1) : ""}
      </span>
   );
};
export function LoanForm({ loans, session }) {
   const [search, setSearch] = useState("");
   const searchParams = useSearchParams();
   const [filter, setFilter] = useState("all");
   const statuses = ["all", "active", "completed", "rejected", "pending"];
   const [isOpen, setIsOpen] = useState(false);
   const [repayModal, setRepayModal] = useState(false);
   const [loanId, setLoanId] = useState(null);
   const router = useRouter();

   const filtered =
      loans &&
      loans.filter((l) => {
         const matchSearch =
            l.id?.toLowerCase().includes(search.toLowerCase()) ||
            l.amount?.toString()?.toLowerCase().includes(search.toLowerCase());
         const matchFilter = filter === "all" || l.status === filter;
         return matchSearch && matchFilter;
      });

   // verify payment status on page load
   useEffect(() => {
      const verifyPayments = async () => {
         const reference = searchParams.get("reference") || searchParams.get("trxref");

         if (!reference) return;
         try {
            const verifyResponse = await fetch(`/api/proxy/vendor/loan/verify?ref=${reference}`, {
               method: "POST",
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
               throw new Error(verifyData.error || "Payment verification failed");
            }
            toast.success("Your payment was successful!");
         } catch (error) {
            console.error("Error verifying payments:", error);
            toast.error("Payment verification failed");
         }
      };
      verifyPayments();
   }, [searchParams, router]);

   return (
      <>
         {isOpen && (
            <LoanFormModal isOpen={isOpen} setIsOpen={setIsOpen} role={session?.role} loans={loans} />
         )}
         {repayModal && (
            <RepayFormModal
               loans={loans?.find((l) => l.id === loanId)}
               repayModal={repayModal}
               setRepayModal={setRepayModal}
               session={session}
            />
         )}

         <div className="flex gap-6 md:gap-8 mb-4">
            {statuses.map((s) => (
               <Button
                  key={s}
                  className={`${filter === s ? "bg-white dark:bg-(--card-dark) p-2 rounded max-w-max" : ""}`}
                  onClick={() => setFilter(s)}
               >
                  {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
                  {s === "all"
                     ? `(${loans.length})`
                     : s === "active"
                       ? `(${loans.filter((l) => l.status === s).length})`
                       : ""}
               </Button>
            ))}
         </div>
         <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
               <SearchIcon className="absolute left-2 top-5 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
               <Input
                  className="bg-gray-100 shadow dark:bg-(--card-dark) w-100 h-10 pl-8 pr-4 outline-none rounded border-2 border-transparent focus:border-(--greenish-color) dark:focus:border-gray-700 transition transition-border"
                  placeholder="Search loans…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <Button
               className="flex max-w-max gap-2 items-center bg-(--greenish-color) hover:bg-(--dark-green-color) transition h-10 px-4 rounded text-white"
               onClick={() => setIsOpen(true)}
            >
               <span>
                  <Plus className="w-4 h-4" />
               </span>
               New Loan
            </Button>
         </div>

         <div className="mt-10">
            {/* Mobile */}
            <div className="md:hidden space-y-4">
               {filtered.length === 0 ? (
                  <p className="text-center">No loans found</p>
               ) : (
                  filtered.map((l) => (
                     <div
                        key={l.id}
                        className="border border-gray-100 rounded-md p-4 shadow-sm bg-white dark:bg-gray-700"
                     >
                        <div className="flex justify-between mb-2">
                           <span className="font-bold">LN_{l.id.toString().substring(0, 8)}</span>
                           {statusBadge(l.status)}
                        </div>
                        <p className="text-sm text-gray-600">{l.org_name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                           <div className="h-2 w-35 bg-gray-200 rounded-lg overflow-hidden min-width-[10vh]">
                              <div
                                 className="h-[100%] rounded-lg bg-gradient-to-r from-green-400 to-green-700"
                                 style={{ width: `${pct(l.amount_paid, l.repay_amount)}%` }}
                              />
                           </div>
                           <span style={{ fontSize: 11, minWidth: 28 }}>{pct(l.amount_paid, l.repay_amount)}%</span>
                        </div>
                        <button
                           onClick={() => {
                              setLoanId(l.id);
                              setRepayModal(true);
                           }}
                           className="w-full mt-4 py-2 bg-gray-400 text-white rounded"
                        >
                           View Details
                        </button>
                     </div>
                  ))
               )}
            </div>
            {/* Desktop - large screen */}
            <div className="shadow hidden overflow-x-auto md:block border border-gray-100 dark:border-gray-700">
               <table className="w-full min-w-[800px]">
                  <thead className="px-4 text-left bg-gray-200 dark:bg-(--card-dark) uppercase">
                     <tr className="[&>th]:px-2 [&>th]:py-3 [&>th]:font-medium [&>th]:text-sm">
                        <th>Loan ID</th>
                        <th>Name</th>
                        <th>Progress status</th>
                        <th>Date Applied</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Action</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-500">
                     {filtered.length === 0 ? (
                        <tr>
                           <td colSpan={9} className="text-center py-10">
                              No loans found
                           </td>
                        </tr>
                     ) : (
                        filtered?.map((l) => (
                           <tr
                              key={l.id}
                              className="[&>td]:px-2 [&>td]:py-3 [&>td]:border-t [&>td]:border-gray-100 text-sm"
                           >
                              <td>LN_{l.id.toString().substring(0, 8)}</td>
                              <td>{l.org_name}</td>
                              <td>
                                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div className="h-2 w-35 bg-gray-200 rounded-lg overflow-hidden min-width-[10vh]">
                                       <div
                                          className="h-[100%] rounded-lg bg-gradient-to-r from-green-400 to-green-700"
                                          style={{ width: `${pct(l.amount_paid, l.repay_amount)}%` }}
                                       />
                                    </div>
                                    <span style={{ fontSize: 11, minWidth: 28 }}>
                                       {pct(l.amount_paid, l.repay_amount)}%
                                    </span>
                                 </div>
                              </td>
                              <td>
                                 {l.created_at &&
                                    new Date(l.created_at).toLocaleDateString("en-US", {
                                       year: "numeric",
                                       month: "short",
                                       day: "numeric",
                                       hour: "2-digit",
                                       minute: "2-digit",
                                    })}
                              </td>
                              <td>
                                 {l.updated_at
                                    ? new Date(
                                         new Date(l.updated_at).setMonth(
                                            new Date(l.updated_at).getMonth() + l.repay_period,
                                         ),
                                      ).toLocaleDateString("en-US", {
                                         year: "numeric",
                                         month: "short",
                                         day: "numeric",
                                         hour: "2-digit",
                                         minute: "2-digit",
                                      })
                                    : ""}
                              </td>
                              <td>{statusBadge(l.status)}</td>
                              <td
                                 className="cursor-default bg-gray-400 hover:bg-gray-500 transition rounded"
                                 onClick={() => {
                                    setLoanId(loans.filter((loan) => loan.id === l.id)[0].id);
                                    setRepayModal(true);
                                 }}
                              >
                                 View Details
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
            {filtered.length > 0 && (
               <div
                  style={{
                     padding: "12px 0",
                     fontSize: "12px",
                  }}
               >
                  Showing {filtered.length} of {loans.length} loans
               </div>
            )}
         </div>
      </>
   );
}
