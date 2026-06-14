"use client";
import { UseLoanForm } from "./UseLoanForm";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FaSpinner } from "react-icons/fa6";
import StorageFacilityLoanForm from "./StorageFacilityLoanForm";
import { FarmerLoanForm } from "./FarmerLoanForm";
import { EquipmentSellerLoanForm } from "./EquipmentSellerLoanForm";
import { toast } from "react-toastify";

export function LoanFormModal({ isOpen, setIsOpen, role, loans }) {
   const { formData, handleChange, handleSubmit, loading } = UseLoanForm();
   const [currentStep, setCurrentStep] = useState(1);
   const totalSteps = 3;

   const validateStep = (step) => {
      let requiredFields = [];

      if (step === 1) {
         requiredFields = [
            "org_name",
            "years_in_operation",
            "amount",
            // "repay_amount",
            "repay_period",
            "monthly_revenue",
         ];
         if (formData.amount <= 0 || isNaN(formData.amount)) {
            toast.error("Please enter a valid amount greater than 0.");
            return false;
         }
      } else if (step === 2) {
         if (role === "Farmer") requiredFields = ["farmSize", "crop"];
         if (role === "Seller") requiredFields = ["inv_type"];
         if (role === "Storage_Facility")
            requiredFields = ["total_capacity", "current_utilization", "storage_type", "farmers_served"];
      } else if (step === 3) {
         const fileInputs = document.querySelectorAll("input[type='file']");
         for (const input of fileInputs) {
            if (!input.files || input.files.length === 0) {
               toast.error("Please upload all required documents before proceeding.");
               return false;
            }
         }
         return true;
      }

      // Check each required field
      for (const field of requiredFields) {
         if (!formData[field] || formData[field].toString().trim() === "") {
            toast.error("Please fill in all required fields before proceeding.", formData[field]);
            return false;
         }
      }

      return true;
   };
   const handleNext = (e) => {
      e.stopPropagation();
      if (validateStep(currentStep)) {
         setCurrentStep((s) => s + 1);
      }
   };

   const handleBack = (e) => {
      e.stopPropagation();
      setCurrentStep((s) => s - 1);
   };

   const hasOpenLoan = loans.some((loan) => ["pending", "approved", "active"].includes(loan.status));

   return (
      <Modal isOpen={isOpen} onClick={() => setIsOpen(false)}>
         <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4">
            <div style={{ padding: 20 }}>
               {hasOpenLoan && (
                  <p className="text-md text-gray-500 mt-1 text-center">You already have a loan in progress.</p>
               )}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
               <div
                  className="h-2 bg-(--greenish-color) rounded-full transition-all"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
               />
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
               Step {currentStep} of {totalSteps}
            </div>

            {currentStep === 1 && (
               <>
                  <section className="space-y-4">
                     <h3 className="text-lg font-bold border-b pb-2 border-primary/20 text-primary">Loan Details</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="org_name">Organization Name</Label>
                           <Input
                              type="text"
                              id="org_name"
                              name="org_name"
                              value={formData?.org_name}
                              onChange={handleChange}
                              placeholder="Enter organization name"
                              className="p-3 border rounded-xl dark:bg-slate-800"
                              required
                           />
                        </div>
                        <div>
                           <Label htmlFor="years_in_operation" className="text-sm font-semibold mb-1">
                              Years in Operation
                           </Label>
                           <Input
                              type="number"
                              id="years_in_operation"
                              name="years_in_operation"
                              value={formData?.years_in_operation}
                              onChange={handleChange}
                              placeholder="e.g. 5"
                              className="p-3 border rounded-xl dark:bg-slate-800"
                              required
                           />
                        </div>
                        <div>
                           <Label htmlFor="amount" className="text-sm font-semibold mb-1">
                              Requested Amount
                           </Label>
                           <Input
                              type="number"
                              id="amount"
                              name="amount"
                              value={formData?.amount}
                              onChange={handleChange}
                              placeholder="E.g. 5000"
                              className="p-3 border rounded-xl dark:bg-slate-800"
                              required
                           />
                        </div>

                        <div>
                           <Label htmlFor="repay_amount">Repayable amount</Label>
                           <div className="relative">
                              <Input
                                 type="text"
                                 id="repay_amount"
                                 name="repay_amount"
                                 value={formData?.repay_amount}
                                 onChange={handleChange}
                                 placeholder="Auto-calculated (10% of amount)"
                                 readOnly
                                 className="p-3 border rounded-xl dark:bg-slate-800 pr-16"
                              />
                              {Number(formData.amount) > 0 && (
                                 <div className="absolute right-3 top-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                    Auto-calculated
                                 </div>
                              )}
                           </div>
                        </div>

                        <div>
                           <Label htmlFor="repay_period" className="text-sm font-semibold mb-1">
                              Repayment Period
                           </Label>
                           <select
                              id="repay_period"
                              name="repay_period"
                              value={formData?.repay_period}
                              onChange={handleChange}
                              className="p-3 border rounded-xl dark:bg-slate-800"
                           >
                              <option value="" disabled>
                                 Choose one
                              </option>
                              <option value="3">3 Months</option>
                              <option value="6">6 Months</option>
                              <option value="12">12 Months</option>
                           </select>
                        </div>

                        <div className="flex flex-col">
                           <Label
                              htmlFor="monthly_revenue"
                              className="text-sm font-semibold mb-1 text-green-600 font-bold"
                           >
                              Monthly Revenue
                           </Label>
                           <Input
                              type="number"
                              id="monthly_revenue"
                              name="monthly_revenue"
                              placeholder="e.g. 5000"
                              value={formData?.monthly_revenue}
                              onChange={handleChange}
                              className="p-3 border rounded-xl border-green-200 dark:bg-slate-800"
                              required
                           />
                        </div>
                     </div>
                  </section>
               </>
            )}

            {currentStep === 2 && (
               <section>
                  {role === "Farmer" && <FarmerLoanForm formData={formData} handleChange={handleChange} />}
                  {role === "Seller" && (
                     <EquipmentSellerLoanForm formData={formData} handleChange={handleChange} />
                  )}
                  {role === "Storage_Facility" && (
                     <StorageFacilityLoanForm formData={formData} handleChange={handleChange} />
                  )}
               </section>
            )}

            {currentStep === 3 && (
               <section className="space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2 border-primary/20 text-primary">
                     Supporting Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                     <div className="flex flex-col border-2 border-dashed p-4 rounded-xl text-center hover:bg-slate-50">
                        <Label htmlFor="supporting_doc" className="font-bold cursor-pointer">
                           Upload ID / Supporting doc
                           <Input
                              required
                              type="file"
                              name="supporting_doc"
                              id="supporting_doc"
                              onChange={handleChange}
                           />
                        </Label>
                     </div>
                     <div className="flex flex-col border-2 border-dashed p-4 rounded-xl text-center hover:bg-slate-50">
                        <Label htmlFor="bank_statement" className="font-bold cursor-pointer">
                           Bank Statement (6 Months)
                           <Input
                              required
                              type="file"
                              name="bank_statement"
                              id="bank_statement"
                              onChange={handleChange}
                           />
                        </Label>
                     </div>
                  </div>
               </section>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
               <Button
                  type="button"
                  className={`${
                     loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } bg-gray-200 dark:bg-gray-500 text-(--foreground) px-4 py-2 rounded-md`}
                  onClick={handleBack}
                  disabled={loading || currentStep === 1}
               >
                  Back
               </Button>

               {currentStep < totalSteps ? (
                  <Button
                     type="button"
                     className={`${
                        loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                     } bg-(--greenish-color) text-(--white-fff) px-4 py-2 rounded-md`}
                     onClick={handleNext}
                     disabled={loading}
                  >
                     Next
                  </Button>
               ) : (
                  <Button
                     type="button"
                     className={`${
                        loading || hasOpenLoan ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                     } transition transition-background w-full bg-(--greenish-color) hover:bg-(--dark-green-color) text-(--white-fff) font-normal p-2 rounded-md`}
                     disabled={loading || hasOpenLoan}
                     onClick={handleSubmit}
                  >
                     {loading ? (
                        <div className="flex justify-center items-center gap-2">
                           <FaSpinner className="h-4 w-4 animate-spin" />
                           <span>Please wait...</span>
                        </div>
                     ) : (
                        "Submit Application"
                     )}
                  </Button>
               )}
            </div>
         </form>
      </Modal>
   );
}
