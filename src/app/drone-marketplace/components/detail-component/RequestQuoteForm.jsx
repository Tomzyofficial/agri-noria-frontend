"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestSchema } from "@/_lib/validations/DroneQuoteRequestSchema";
import { formatPrice } from "@/utils/formatPrice";

const RENTAL_PERIOD_LABEL = {
   per_day: "per day",
   per_week: "per week",
   per_month: "per month",
};

/**
 * RequestQuoteForm
 *
 * Client component: validates with the same Zod pattern used across the
 * app, then posts to /api/proxy/quotes rather than calling any backend
 * or third-party service directly.
 */
export default function RequestQuoteForm({ listing }) {
   const [submitState, setSubmitState] = useState("idle"); // idle | loading | success | error
   const [submitError, setSubmitError] = useState("");

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
   } = useForm({
      resolver: zodResolver(quoteRequestSchema),
      defaultValues: {
         full_name: "",
         email: "",
         phone: "",
         start_date: "",
         rentalDurationDays: "",
         additional_info: "",
      },
   });

   const periodLabel = RENTAL_PERIOD_LABEL[listing.rental_period] || "";

   async function onSubmit(values) {
      setSubmitState("loading");
      setSubmitError("");

      try {
         const response = await fetch(`/api/proxy/marketplace/booking-request/${listing.listing_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               ...values,
               quote_type: "drone",
            }),
         });

         if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.message || "Couldn't send your request. Try again.");
         }

         setSubmitState("success");
         reset();
      } catch (error) {
         setSubmitState("error");
         setSubmitError(error.message);
      }
   }

   if (submitState === "success") {
      return (
         <div className="border border-[#E2E4E3] bg-white p-5">
            <p className="font-mono text-[11px] tracking-[0.12em] text-[#3B7D6B]">REQUEST SENT</p>
            <p className="mt-2 text-sm text-[#14171A]">We&apos;ve received your quote request for {listing.listing_name}. Expect a reply by email shortly.</p>
            <button type="button" onClick={() => setSubmitState("idle")} className="mt-4 text-sm font-medium text-[#2F5D8A] underline underline-offset-2">
               Request another quote
            </button>
         </div>
      );
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 border border-[#E2E4E3] bg-white p-5">
         <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] tracking-[0.12em] text-[#5B6066]">RENTAL RATE</span>
            <span className="text-2xl font-semibold text-[#14171A]">
               {formatPrice(listing.rental_price, listing.country_code, listing.currency)}
               <span className="ml-1 text-sm font-normal text-[#5B6066]">{periodLabel}</span>
            </span>
         </div>

         <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="full_name" error={errors.full_name}>
               <input id="full_name" {...register("full_name")} className={inputClass(errors.full_name)} />
            </Field>

            <Field label="Email" htmlFor="email" error={errors.email}>
               <input id="email" type="email" {...register("email")} className={inputClass(errors.email)} />
            </Field>

            <Field label="Phone (optional)" htmlFor="phone" error={errors.phone}>
               <input id="phone" type="tel" {...register("phone")} className={inputClass(errors.phone)} />
            </Field>

            <Field label="Start date" htmlFor="start_date" error={errors.start_date}>
               <input id="start_date" type="date" {...register("start_date")} className={inputClass(errors.start_date)} />
            </Field>

            <Field label="Duration (days)" htmlFor="rentalDurationDays" error={errors.rentalDurationDays}>
               <input id="rentalDurationDays" type="number" min={1} {...register("rentalDurationDays")} className={inputClass(errors.rentalDurationDays)} />
            </Field>
         </div>

         <Field label="Note to owner (optional)" htmlFor="message" error={errors.message}>
            <textarea id="message" rows={3} {...register("additional_info")} className={inputClass(errors.additional_info)} />
         </Field>

         <button type="submit" disabled={isSubmitting || submitState === "loading"} className="bg-[#2F5D8A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26496e] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14171A]">
            {submitState === "loading" ? "Sending request…" : "Request a quote"}
         </button>

         <div role="status" aria-live="polite" className="text-sm">
            {submitState === "error" && <span className="text-[#B3432B]">{submitError}</span>}
         </div>
      </form>
   );
}

function Field({ label, htmlFor, error, children }) {
   return (
      <div className="flex flex-col gap-1">
         <label htmlFor={htmlFor} className="text-sm text-[#5B6066]">
            {label}
         </label>
         {children}
         {error && (
            <span className="text-xs text-[#B3432B]" role="alert">
               {error.message}
            </span>
         )}
      </div>
   );
}

function inputClass(error) {
   return `border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5D8A] ${error ? "border-[#B3432B]" : "border-[#E2E4E3] focus:border-[#2F5D8A]"}`;
}
