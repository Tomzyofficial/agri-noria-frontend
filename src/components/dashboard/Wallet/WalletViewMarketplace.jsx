"use client";

import { useState, useMemo } from "react";
import useSwr from "swr";
import { WithdrawModal } from "./WithdrawModalMarketplace";
import { BalanceCard } from "./BalanceCardMarketplace";
import { fetcher } from "@/utils/otherUtils";
import { formatDate } from "@/utils/otherUtils";
import { formatPrice } from "@/utils/formatPrice";
import Skeleton from "@/components/ui/LoadingSkeleton";

function WalletStyles() {
   return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

      .wallet-page {
        --ink: #1C2620;
        --ink-muted: #6B7566;
        --ink-faint: #9AA398;
        --paper: #FAF7F1;
        --card: #FFFFFF;
        --border: #E3DDCF;
        --forest: #1F3D2B;
        --forest-dark: #16301F;
        --forest-tint: #E7F0E8;
        --amber: #B9791E;
        --amber-tint: #FBF0DC;
        --rust: #A23E3E;
        --rust-tint: #F7E8E6;

        background: var(--paper);
        color: var(--ink);
        font-family: 'Inter', sans-serif;
      }

      .wallet-page .font-display {
        font-family: 'Fraunces', serif;
      }

      .wallet-page .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }

      .wallet-page .card {
        background: var(--card);
        border: 1px solid var(--border);
      }

      /* A hairline "perforation" under card headers — a quiet nod to a
         ledger page / receipt tear-off, without being decoration for
         its own sake. */
      .wallet-page .perforated {
        border-bottom: 1px dashed var(--border);
      }

      /* ---- Ledger stamp: the one signature element on this page ----
         Each transaction gets a small circular ink-stamp mark instead
         of a generic colored pill. It borrows from the produce-grading
         stamps used on agricultural goods — fitting for a marketplace
         wallet — and is the single bold visual idea; everything else
         on the page stays quiet. */
      .wallet-page .stamp {
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        border: 1.5px dashed currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transform: rotate(-6deg);
      }

      .wallet-page .stamp-credit { color: var(--forest); background: var(--forest-tint); }
      .wallet-page .stamp-release { color: var(--forest); background: var(--forest-tint); }
      .wallet-page .stamp-debit { color: var(--amber); background: var(--amber-tint); }
      .wallet-page .stamp-reversal { color: var(--rust); background: var(--rust-tint); }

      .wallet-page .btn-primary {
        background: var(--forest);
        color: #fff;
      }
      .wallet-page .btn-primary:hover { background: var(--forest-dark); }
      .wallet-page .btn-primary:disabled {
        background: var(--ink-faint);
        cursor: not-allowed;
      }

      .wallet-page .focus-ring:focus-visible {
        outline: 2px solid var(--forest);
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        .wallet-page * { transition: none !important; animation: none !important; }
      }
    `}</style>
   );
}

const ICON_PROPS = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };

function IconArrowDownLeft(props) {
   return (
      <svg {...ICON_PROPS} {...props}>
         <path d="M7 7l10 10M17 17H9M17 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
function IconArrowUpRight(props) {
   return (
      <svg {...ICON_PROPS} {...props}>
         <path d="M7 17L17 7M7 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
function IconClock(props) {
   return (
      <svg {...ICON_PROPS} {...props}>
         <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
         <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
function IconUndo(props) {
   return (
      <svg {...ICON_PROPS} {...props}>
         <path d="M4 9h9a5 5 0 015 5v0a5 5 0 01-5 5h-3M4 9l4-4M4 9l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
function IconSearch(props) {
   return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
         <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
         <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
   );
}
function IconChevronLeft(props) {
   return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
         <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
function IconChevronRight(props) {
   return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
         <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
function IconChevronDown(props) {
   return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
         <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}

function IconInbox(props) {
   return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" {...props}>
         <path d="M3 12h4l2 3h6l2-3h4M5 12L4 5h16l-1 7M5 12v6a1 1 0 001 1h12a1 1 0 001-1v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}

function formatCountdown(targetDate) {
   const diffMs = new Date(targetDate).getTime() - Date.now();
   if (diffMs <= 0) return "releasing shortly";
   const hours = Math.floor(diffMs / (1000 * 60 * 60));
   const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
   if (hours <= 0) return `${minutes}m`;
   return `${hours}h ${minutes}m`;
}

const TYPE_META = {
   credit: { label: "Order payout", stampClass: "stamp-credit", Icon: IconArrowDownLeft, sign: "+" },
   release: { label: "Hold cleared", stampClass: "stamp-release", Icon: IconClock, sign: "" },
   debit: { label: "Withdrawal", stampClass: "stamp-debit", Icon: IconArrowUpRight, sign: "-" },
   reversal: { label: "Reversed", stampClass: "stamp-reversal", Icon: IconUndo, sign: "+" },
};

const FILTER_OPTIONS = [
   { value: "all", label: "All activity" },
   { value: "credit", label: "Order payouts" },
   { value: "release", label: "Holds cleared" },
   { value: "debit", label: "Withdrawals" },
   { value: "reversal", label: "Reversals" },
];

function BalanceSummary({ currency, countryCode, availableBalance, pendingBalance, lifetimeEarned, nextReleaseAt, onOpenWithdraw }) {
   return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <BalanceCard
            label="Available balance"
            currency={currency}
            countryCode={countryCode}
            amount={availableBalance}
            accent="var(--forest)"
            helper="Ready to withdraw"
            action={
               <button type="button" onClick={onOpenWithdraw} disabled={availableBalance <= 0} className="btn-primary focus-ring rounded-lg px-4 py-2.5 text-sm font-semibold w-full transition-colors">
                  Withdraw funds
               </button>
            }
         />
         <BalanceCard label="Pending balance" currency={currency} countryCode={countryCode} amount={pendingBalance} accent="var(--amber)" helper={pendingBalance > 0 ? `Held for review · next release in ${formatCountdown(nextReleaseAt)}` : "Nothing on hold right now"} />
         <BalanceCard label="Lifetime earned" currency={currency} countryCode={countryCode} amount={lifetimeEarned} helper="Total credited since joining" />
      </div>
   );
}

const PAGE_SIZE = 8;

function TransactionHistory({ transactions, isLoading, error }) {
   const [query, setQuery] = useState("");
   const [typeFilter, setTypeFilter] = useState("all");
   const [page, setPage] = useState(1);
   const [filterOpen, setFilterOpen] = useState(false);

   const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return transactions?.filter((txn) => {
         const matchesType = typeFilter === "all" || txn.type === typeFilter;
         const matchesQuery = q === "" || txn.description.toLowerCase().includes(q) || txn.reference.toLowerCase().includes(q);
         return matchesType && matchesQuery;
      });
   }, [transactions, query, typeFilter]);

   const totalPages = Math.max(1, Math.ceil(filtered?.length / PAGE_SIZE));
   const currentPage = Math.min(page, totalPages);
   const pageRows = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

   function handleSearchChange(value) {
      setQuery(value);
      setPage(1);
   }

   function handleFilterChange(value) {
      setTypeFilter(value);
      setPage(1);
      setFilterOpen(false);
   }

   return (
      <div className="card rounded-2xl overflow-hidden">
         {/* Header: title + search + filter */}
         <div className="perforated flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5">
            <h2 className="font-display text-xl">Transaction history</h2>
            <div className="flex gap-2">
               <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-faint)" }} />
                  <input
                     type="text"
                     value={query}
                     onChange={(e) => handleSearchChange(e.target.value)}
                     placeholder="Search description or reference"
                     className="focus-ring font-mono text-xs sm:text-sm rounded-lg pl-9 pr-3 py-2 w-full sm:w-64"
                     style={{ border: "1px solid var(--border)", background: "var(--paper)" }}
                     aria-label="Search transactions"
                  />
               </div>
               <div className="relative">
                  <button type="button" onClick={() => setFilterOpen((v) => !v)} className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap" style={{ border: "1px solid var(--border)", background: "var(--paper)" }} aria-haspopup="listbox" aria-expanded={filterOpen}>
                     {FILTER_OPTIONS.find((o) => o.value === typeFilter).label}
                     <IconChevronDown />
                  </button>
                  {filterOpen && (
                     <ul role="listbox" className="card absolute right-0 mt-1 w-48 rounded-lg overflow-hidden z-10 shadow-lg">
                        {FILTER_OPTIONS.map((opt) => (
                           <li key={opt.value}>
                              <button
                                 type="button"
                                 role="option"
                                 aria-selected={typeFilter === opt.value}
                                 onClick={() => handleFilterChange(opt.value)}
                                 className="focus-ring w-full text-left px-3.5 py-2.5 text-sm"
                                 style={{
                                    background: typeFilter === opt.value ? "var(--forest-tint)" : "transparent",
                                    color: typeFilter === opt.value ? "var(--forest)" : "var(--ink)",
                                 }}
                              >
                                 {opt.label}
                              </button>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         </div>

         {/* Column headers — desktop only */}

         <div
            className="hidden md:grid px-5 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{
               gridTemplateColumns: "40px 2fr 1fr 1fr 1fr",
               gap: "16px",
               color: "var(--ink-muted)",
               borderBottom: "1px solid var(--border)",
            }}
         >
            <span></span>
            <span>Description</span>
            <span>Reference</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
         </div>

         {/* Rows */}
         {isLoading ? (
            <Skeleton />
         ) : error ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
               <div className="rounded-full p-3 mb-3" style={{ background: "var(--rust-tint)", color: "var(--rust)" }}>
                  <IconUndo />
               </div>
               <p className="font-display text-lg">Error loading transactions</p>
               <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                  There was a problem fetching your transaction history. Please try again later.
               </p>
            </div>
         ) : pageRows?.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
               <div className="rounded-full p-3 mb-3" style={{ background: "var(--forest-tint)", color: "var(--forest)" }}>
                  <IconInbox />
               </div>
               <p className="font-display text-lg">No matching transactions</p>
               <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                  Try a different search term or switch the filter back to all activity.
               </p>
            </div>
         ) : (
            <ul>
               {pageRows?.map((txn) => {
                  const meta = TYPE_META[txn.type];
                  return (
                     <li
                        key={txn.id}
                        className="px-5 py-4 flex flex-col gap-3 md:grid md:items-center"
                        style={{
                           gridTemplateColumns: "40px 2fr 1fr 1fr 1fr",
                           gap: "16px",
                           borderBottom: "1px solid var(--border)",
                        }}
                     >
                        <div className="flex items-center gap-3 md:contents">
                           <span className={`stamp ${meta.stampClass}`} aria-hidden="true">
                              <meta.Icon />
                           </span>
                           <div className="md:hidden">
                              <p className="text-sm font-medium">{txn.description}</p>
                              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-muted)" }}>
                                 {txn.reference}
                              </p>
                           </div>
                        </div>

                        <p className="hidden md:block text-sm font-medium">{txn.description}</p>
                        <p className="hidden md:block text-xs font-mono" style={{ color: "var(--ink-muted)" }}>
                           {txn.reference}
                        </p>

                        <div className="flex items-center justify-between md:block">
                           <span className="text-xs md:hidden font-semibold uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
                              Date
                           </span>
                           <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
                              {formatDate(txn.date)}
                           </span>
                        </div>

                        <div className="flex items-center justify-between md:justify-end">
                           <span className="text-xs md:hidden font-semibold uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
                              Amount
                           </span>
                           <span
                              className="font-mono text-sm font-semibold md:text-right"
                              style={{
                                 color: meta.sign === "-" ? "var(--amber)" : meta.sign === "+" ? "var(--forest)" : "var(--ink)",
                              }}
                           >
                              {meta.sign}
                              {formatPrice(txn.amount, txn.countryCode, txn.currency)}
                           </span>
                        </div>
                     </li>
                  );
               })}
            </ul>
         )}

         {/* Pagination */}
         {filtered?.length > 0 && (
            <div className="flex items-center justify-between px-5 py-4">
               <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
               </p>
               <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page" className="focus-ring rounded-md p-1.5 disabled:opacity-30" style={{ border: "1px solid var(--border)" }}>
                     <IconChevronLeft />
                  </button>
                  <span className="text-xs font-mono px-2" style={{ color: "var(--ink-muted)" }}>
                     {currentPage} / {totalPages}
                  </span>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page" className="focus-ring rounded-md p-1.5 disabled:opacity-30" style={{ border: "1px solid var(--border)" }}>
                     <IconChevronRight />
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default function WalletPage({ onWithdraw }) {
   const [withdrawOpen, setWithdrawOpen] = useState(false);
   const [withdrawalMessage, setWithdrawalMessage] = useState("");

   async function handleWithdraw(amount, selectedAccountId) {
      if (onWithdraw) {
         await onWithdraw(amount, selectedAccountId);
      } else {
         const response = await fetch("/api/proxy/vendor/wallet/withdraw", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               amount,
               bankAccountId: selectedAccountId,
            }),
         });
         const result = await response.json();
         if (!response.ok) {
            throw new Error(result.error || "Withdrawal failed");
         }
         setWithdrawalMessage(result.message || "Withdrawal submitted successfully");
      }
   }

   const { data: walletData, error: walletError, loading: walletLoading, mutate: mutateWallet } = useSwr("/api/proxy/vendor/wallet/summary", fetcher);
   const { data: trxHistoryData, error: trxHistoryError, isLoading: trxHistoryLoading, mutate: mutateTransactions } = useSwr("/api/proxy/vendor/wallet/transactions", fetcher);

   const { data: bankAccountsData, error: bankAccountsError, isLoading: bankAccountsLoading } = useSwr("/api/proxy/vendor/wallet/bank-accounts", fetcher);

   return (
      <div className="wallet-page min-h-screen p-6 md:p-10">
         <WalletStyles />

         <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <header>
               <h1 className="font-display text-3xl">Wallet</h1>
               <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                  Track what you've earned, what's on hold, and withdraw when you're ready.
               </p>
               {withdrawalMessage && (
                  <p className="text-sm mt-3" style={{ color: "var(--forest)" }}>
                     {withdrawalMessage}
                  </p>
               )}
            </header>

            <BalanceSummary currency={walletData?.currency} countryCode={walletData?.countryCode} availableBalance={walletData?.availableBalance} pendingBalance={walletData?.pendingBalance} lifetimeEarned={walletData?.lifetimeEarned || 0} nextReleaseAt={walletData?.nextReleaseAt} onOpenWithdraw={() => setWithdrawOpen(true)} />

            <TransactionHistory transactions={trxHistoryData?.transactions} isLoading={trxHistoryLoading} error={trxHistoryError} />
         </div>

         {withdrawOpen && (
            <WithdrawModal
               bankAccounts={bankAccountsData?.bankAccounts}
               currency={walletData?.currency}
               countryCode={walletData?.countryCode}
               availableBalance={walletData?.availableBalance}
               onClose={() => setWithdrawOpen(false)}
               onWithdraw={async (amount, accountId) => {
                  await handleWithdraw(amount, accountId);
                  await Promise.all([mutateWallet(), mutateTransactions()]);
               }}
            />
         )}
      </div>
   );
}
