"use client";
import { useState } from "react";
import { formatPrice } from "@/utils/formatPrice";

function IconClose(props) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
         <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
   );
}

export function WithdrawModal({ bankAccounts = [], currency, countryCode, availableBalance, onClose, onWithdraw }) {
   const [amount, setAmount] = useState("");
   const [selectedAccountId, setSelectedAccountId] = useState(bankAccounts.find((a) => a.is_default)?.id ?? bankAccounts[0]?.id ?? "");
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState("");
   // console.log(
   //    selectedAccountId,
   //    bankAccounts.find((a) => a.id === selectedAccountId)
   // );
   const numericAmount = Number(amount);
   const isValid = amount !== "" && numericAmount > 0 && numericAmount <= availableBalance && selectedAccountId !== "";

   async function handleSubmit() {
      if (bankAccounts.length === 0) {
         setError("Add a bank account before requesting a withdrawal.");
         return;
      }
      if (!isValid) {
         setError(numericAmount > availableBalance ? "That's more than your available balance." : "Enter an amount and choose an account.");
         return;
      }
      setError("");
      setSubmitting(true);
      try {
         await onWithdraw?.(numericAmount, selectedAccountId);
         onClose();
      } catch (err) {
         setError("Couldn't start the withdrawal. Try again in a moment.");
      } finally {
         setSubmitting(false);
      }
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,38,32,0.45)" }}>
         <div className="wallet-page card rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-display text-xl mb-1">Withdraw funds</h2>
            <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
               Available: <span className="font-mono">{formatPrice(availableBalance, countryCode, currency)}</span>
            </p>

            {bankAccounts.length === 0 ? (
               <div className="rounded-lg p-4 text-sm" style={{ background: "var(--amber-tint)", color: "var(--amber)" }}>
                  You don't have a verified bank account yet. Add one in your profile to withdraw funds.
               </div>
            ) : (
               <>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                     Pay to
                  </label>
                  <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="focus-ring w-full rounded-lg px-3 py-2.5 text-sm mt-1.5 mb-4" style={{ border: "1px solid var(--border)", background: "var(--paper)" }}>
                     {bankAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                           {acc.account_name} · {acc.bank_name} · ••{acc.account_number.slice(-4)}
                        </option>
                     ))}
                  </select>

                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                     Amount
                  </label>
                  <div className="relative mt-1.5">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style={{ color: "var(--ink-muted)" }}>
                        {currency || ""}
                     </span>
                     <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                           setAmount(e.target.value);
                           setError("");
                        }}
                        placeholder="0.00"
                        className="focus-ring font-mono w-full rounded-lg pl-8 pr-3 py-2.5 text-sm"
                        style={{ border: "1px solid var(--border)", background: "var(--paper)" }}
                     />
                  </div>
               </>
            )}

            {error && (
               <p className="text-sm mt-3 rounded-lg px-3 py-2" style={{ background: "var(--rust-tint)", color: "var(--rust)" }}>
                  {error}
               </p>
            )}

            <div className="flex gap-3 mt-6">
               <button type="button" onClick={onClose} className="focus-ring flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ border: "1px solid var(--border)" }}>
                  Cancel
               </button>
               <button type="button" onClick={handleSubmit} disabled={submitting || bankAccounts.length === 0} className="btn-primary focus-ring flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold">
                  {submitting ? "Processing…" : "Confirm withdrawal"}
               </button>
            </div>
         </div>
      </div>
   );
}
