import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { toast } from "react-toastify";
import { Info } from "lucide-react";
import { useTransition } from "react";

export function RepayFormModal({ loans, repayModal, setRepayModal, session }) {
   const repayAmount = Number(loans.repay_amount);
   const amountPaid = Number(loans.amount_paid);
   const installment = Number(loans.monthly_installment);
   const period = Number(loans.repay_period);

   const remainingBalance = Number((repayAmount - amountPaid).toFixed(2));

   // calculate completed payments
   const paymentsMade = Math.floor(amountPaid / installment);

   // detect final cycle
   const isFinalPayment = paymentsMade + 1 === period;

   let paymentAmount;

   if (isFinalPayment) {
      paymentAmount = remainingBalance;
   } else {
      paymentAmount = installment;
   }

   const [isPending, startTransition] = useTransition();
   const [formData, setFormData] = useState({
      email: session?.email || "",
      amount: paymentAmount.toFixed(2),
      loanId: loans?.id || "",
   });

   const activeLoan = loans?.status === "active";

   const formatCurrency = (value) => {
      if (!value) return "0.00";
      return Number(value).toLocaleString("en-NG", {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      });
   };

   const handleChange = (e) => {
      const { name, value } = e.target;

      if (name === "amount") {
         const numericValue = Number(value.replace(/,/g, ""));
         if (!isNaN(numericValue)) {
            setFormData((prev) => ({
               ...prev,
               amount: numericValue,
            }));
         }
      } else {
         setFormData((prev) => ({
            ...prev,
            [name]: value,
         }));
      }
   };

   const handlePayFull = () => {
      if (loans) {
         const remaining = remainingBalance;
         setFormData((prev) => ({
            ...prev,
            amount: Number(remaining.toFixed(2)),
         }));
      }
   };

   const handlePayHalf = () => {
      if (isFinalPayment) {
         return;
      }
      if (loans) {
         const installment = Number(loans?.monthly_installment);
         setFormData((prev) => ({
            ...prev,
            amount: Number(installment.toFixed(2)),
         }));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         if (!formData.email) {
            throw new Error("Email is required");
         }

         if (!formData.amount || formData.amount <= 0) {
            throw new Error("Invalid repayment amount");
         }

         startTransition(async () => {
            const response = await fetch(`/api/proxy/vendor/loan/initialize/${formData.loanId}`, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  email: formData.email,
                  amount: formData.amount,
               }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
               throw new Error(data.error || "Failed to initialize payment");
            }
            window.location.href = data.data.authorization_url;
         });
      } catch (error) {
         toast.error(error.message || "Failed to initialize payment");
      }
   };

   return (
      <Modal isOpen={repayModal} onClick={() => setRepayModal(false)}>
         <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-6 pt-10 px-4">
            <div className="bg-gray-100 dark:bg-black/50 p-4 rounded-lg mb-4 flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
               <div>
                  <h2>Outstanding Balance:</h2>
                  <span className="text-red-500 text-lg font-bold">₦{formatCurrency(remainingBalance)}</span>
               </div>

               <div>
                  <h2>Monthly Repayment:</h2>
                  <span className="font-bold text-lg">₦{formatCurrency(loans?.monthly_installment) || 0}</span>
               </div>
            </div>

            <div>
               <Label htmlFor="email">Email:</Label>
               <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly
                  required
                  placeholder="Enter your email"
               />
            </div>

            <div>
               <Label htmlFor="amount">Amount (₦):</Label>
               <Input
                  id="amount"
                  type="text"
                  name="amount"
                  value={formatCurrency(formData.amount)}
                  onChange={handleChange}
                  required
                  readOnly
                  placeholder="Enter repayment amount"
               />
            </div>

            <div className="flex gap-4 flex-col md:flex-row md:justify-between">
               <button
                  className="w-full border border-gray-400 dark:border-gray-100 hover:bg-gray-200 hover:text-neutral-900 p-3 rounded transition"
                  type="button"
                  onClick={handlePayHalf}
               >
                  Pay Installment
               </button>

               <button
                  className="w-full border border-blue-200 rounded hover:bg-blue-200 hover:text-blue-700 transition p-3"
                  type="button"
                  onClick={handlePayFull}
               >
                  Pay Full
               </button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-100 text-blue-150 rounded dark:text-blue-400">
               <Info className="flex-shrink-0 mt-0.5" size={16} />
               <p className="text-xs">
                  You will be redirected to Paystack&apos;s secure checkout to complete your payment. We never store
                  your card details.
               </p>
            </div>

            <Button
               type="submit"
               className={`w-full ${
                  !activeLoan || isPending
                     ? "opacity-50 cursor-not-allowed bg-gray-400"
                     : "bg-(--greenish-color) hover:bg-(--dark-green-color) transition cursor-pointer"
               } p-3 text-white rounded`}
               disabled={!activeLoan || isPending}
            >
               {isPending ? "Redirecting..." : "Proceed to Payment"}
            </Button>
         </form>
      </Modal>
   );
}
