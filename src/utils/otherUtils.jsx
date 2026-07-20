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

function formatDate(value) {
   if (!value) return "-";
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return value;
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
   const data = await res.json();
   if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || "Request failed");
   }
   return data;
};

export { formatLabel, oppositeFormatLabel, formatDate, fetcher };
