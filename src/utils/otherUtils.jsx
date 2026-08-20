import { cookieStoreFnc } from "@/actions/session";

function formatLabel(value) {
   if (!value) return "Not specified";
   return String(value)
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
}

function oppositeFormatLabel(value) {
   if (!value) return "Not specified";
   return String(value)
      .replace(/ /g, "-")
      .replace(/\b\w/g, (char) => char.toLowerCase());
}

function formatDate(value, hr = true, min = true) {
   if (!value) return "Date N/A";
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return value;
   if (value && hr && min) {
      return date.toLocaleDateString(undefined, {
         month: "short",
         day: "numeric",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   }
   return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
   });
}

const fetcher = async (url) => {
   const cookieHeader = await cookieStoreFnc();
   const res = await fetch(url, {
      headers: {
         cookie: cookieHeader,
      },
   });
   if (!res.ok) {
      throw new Error(data.error || data.message || "Request failed");
   }
   const data = await res.json();
   return data;
};

export { formatLabel, oppositeFormatLabel, formatDate, fetcher };
