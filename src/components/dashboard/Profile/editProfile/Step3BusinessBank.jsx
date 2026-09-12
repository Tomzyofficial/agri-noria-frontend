import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { FaSpinner } from "react-icons/fa6";
import { useState, useEffect } from "react";
export function BusinessBank({ ispending, formData, banks = [], handleInputChange, handleSubmitBank }) {
   const [resolving, setResolving] = useState(false);
   const [resolveError, setResolveError] = useState("");

   useEffect(() => {
      const selectedBank = banks.find((bank) => bank.name === formData.bank_name);
      const accountNumber = formData.account_number?.trim() || "";
      const bankCode = formData.bank_code || selectedBank?.code;
      if (!bankCode || accountNumber.length !== 10) {
         setResolving(false);
         setResolveError("");
         return undefined;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(async () => {
         setResolving(true);
         setResolveError("");
         try {
            const response = await fetch("/api/proxy/vendor/wallet/bank-accounts/resolve", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
               signal: controller.signal,
            });
            const result = await response.json();
            if (!response.ok || !result.accountName) {
               throw new Error(result.error || "Could not verify this account");
            }
            handleInputChange({ target: { name: "account_name", value: result.accountName } });
         } catch (error) {
            if (error.name !== "AbortError") {
               handleInputChange({ target: { name: "account_name", value: "" } });
               setResolveError(error.message || "Could not verify this account");
            }
         } finally {
            if (!controller.signal.aborted) setResolving(false);
         }
      }, 500);

      return () => {
         clearTimeout(timeoutId);
         controller.abort();
      };
   }, [formData.account_number, formData.bank_name, formData.bank_code, banks, handleInputChange]);

   return (
      <section className="space-y-2">
         <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <select id="bank_name" name="bank_name" disabled={ispending} className={`border p-2 w-full rounded ${ispending ? "opacity-50" : ""}`} value={formData.bank_name} onChange={handleInputChange}>
               <option value="">Select a bank</option>
               {Array.isArray(banks) &&
                  banks.length > 0 &&
                  banks.map((b) => (
                     <option key={b.name} value={b.name} data-code={b.code}>
                        {b.name}
                     </option>
                  ))}
            </select>
         </div>
         <div>
            <Label htmlFor="account_number">Account Number</Label>
            <Input type="text" autoComplete="on" disabled={ispending} className={ispending ? "opacity-50" : ""} id="account_number" name="account_number" value={formData.account_number} onChange={handleInputChange} placeholder="Account Number" />
         </div>
         <div>
            <Label htmlFor="account_name">Account Name</Label>
            <Input type="text" autoComplete="off" disabled={ispending || resolving} className={ispending ? "opacity-50" : ""} id="account_name" readOnly name="account_name" value={resolving ? "Verifying account..." : formData.account_name} placeholder="Account Name" />
            {resolveError && <p className="text-sm text-red-600">{resolveError}</p>}
         </div>
         <div>
            <Button type="button" disabled={ispending || resolving || !formData.bank_name || !formData.account_number} className={`bg-green-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:opacity-50`} onClick={handleSubmitBank}>
               {ispending ? (
                  <span className="flex items-center gap-2">
                     <FaSpinner className="animate-spin h-4 w-4" />
                     Saving...
                  </span>
               ) : (
                  "Save"
               )}
            </Button>
         </div>
      </section>
   );
}
