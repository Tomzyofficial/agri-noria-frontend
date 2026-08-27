"use client";

import { useState } from "react";
import { Wheat, Mail, Phone, Clock, Loader2, CheckCircle2 } from "lucide-react";
import SubmitButton from "../../components/dashboard/SubmitButton";

const CHANNELS = [
   {
      icon: Mail,
      title: "Email",
      value: "support@agri-noria.com",
      description: "Best for detailed questions or order issues.",
   },
   {
      icon: Phone,
      title: "Phone / WhatsApp",
      value: "+234 800 000 0000",
      description: "For urgent issues during business hours.",
   },
   {
      icon: Clock,
      title: "Support Hours",
      value: "Mon–Sat, 8am–6pm WAT",
      description: "Messages outside these hours are answered next business day.",
   },
];

const CATEGORY_OPTIONS = ["General question", "Order issue", "Payment or payout", "Vendor account", "Report a listing or vendor", "Something else"];

export function ContactUsPage() {
   const [form, setForm] = useState({
      name: "",
      email: "",
      category: CATEGORY_OPTIONS[0],
      message: "",
   });
   const [status, setStatus] = useState("idle"); // idle | submitting | success | error

   function handleChange(e) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
   }

   async function handleSubmit(e) {
      e.preventDefault();
      setStatus("submitting");
      try {
         const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
         });
         if (!res.ok) throw new Error("Request failed");
         setStatus("success");
         setForm({ name: "", email: "", category: CATEGORY_OPTIONS[0], message: "" });
      } catch (err) {
         setStatus("error");
      }
   }

   return (
      <div className="min-h-screen">
         <header>
            <div className="mx-auto max-w-6xl px-4 py-16">
               <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                  <Wheat className="h-4 w-4" />
                  <span>Support</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">Get in touch</h1>
               <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Whether it's a question about an order, your vendor account, or something else — we're here to help.</p>
            </div>
         </header>

         <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-[280px_1fr] gap-12">
            {/* Channels */}
            <div className="space-y-6">
               {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                     <div key={channel.title} className="flex gap-3">
                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                           <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                           <p className="font-medium text-foreground">{channel.title}</p>
                           <p className="text-sm text-foreground">{channel.value}</p>
                           <p className="text-sm text-muted-foreground mt-0.5">{channel.description}</p>
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Form */}
            <div className="rounded-lg border border-border p-6 md:p-8">
               {status === "success" ? (
                  <div className="flex flex-col items-center text-center py-12">
                     <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                     <p className="text-lg font-semibold text-foreground">Message sent</p>
                     <p className="text-muted-foreground mt-1 max-w-sm">Thanks for reaching out — our support team will get back to you by email, usually within one business day.</p>
                     <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                        Send another message
                     </button>
                  </div>
               ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                     <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                           <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                              Name
                           </label>
                           <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                        </div>
                        <div>
                           <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                              Email
                           </label>
                           <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
                           What's this about?
                        </label>
                        <select id="category" name="category" value={form.category} onChange={handleChange} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                           {CATEGORY_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                 {opt}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                           Message
                        </label>
                        <textarea id="message" name="message" required rows={5} value={form.message} onChange={handleChange} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
                     </div>

                     {status === "error" && <p className="text-sm text-destructive">Something went wrong sending your message. Please try again.</p>}

                     {/* <button type="submit" disabled={status === "submitting"} className="inline-flex items-center gap-2 rounded-md bg-(--greenish-color) px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
                        {status === "submitting" ? "Sending..." : "Send Message"}
                     </button> */}
                     <SubmitButton loading={status === "submitting"} text="SEnd Message" />
                  </form>
               )}
            </div>
         </div>
      </div>
   );
}
