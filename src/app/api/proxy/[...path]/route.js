import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
   console.error("BACKEND_URL is not defined");
   throw new Error("BACKEND_URL is not defined");
}

const HOP_BY_HOP_HEADERS = new Set([
   "host",
   "connection",
   "keep-alive",
   "transfer-encoding",
   "content-length",
   "upgrade",
   "proxy-authenticate",
   "proxy-authorization",
   "te",
   "trailer",
]);

function isTransientFetchError(err) {
   if (!err) return false;
   const msg = String(err.message || "");
   const code = err.code || err.cause?.code || "";
   return (
      msg.includes("fetch failed") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("socket hang up") ||
      code === "ECONNRESET" ||
      code === "ECONNREFUSED" ||
      code === "ETIMEDOUT" ||
      code === "EPIPE" ||
      code === "UND_ERR_SOCKET"
   );
}

async function handler(req, { params }) {
   try {
      const cookieStore = await cookies();

      // Forward all cookies from browser
      const cookieHeader = cookieStore
         .getAll()
         .map((c) => `${c.name}=${c.value}`)
         .join("; ");
      const { path } = await params;

      const pathStr = path.join("/");

      // Determine active workspace from Referer or explicit header
      const referer = req.headers.get("referer") || "";
      const explicitWorkspace = req.headers.get("x-active-workspace");
      let activeWorkspace = explicitWorkspace || "ecosystem";
      if (!explicitWorkspace) {
         if (referer.includes("/dashboard/super-admin")) activeWorkspace = "super-admin";
         else if (referer.includes("/marketplace") || referer.includes("/dashboard/buyer")) activeWorkspace = "marketplace";
         else if (referer.includes("/ecosystem")) activeWorkspace = "ecosystem";
      }

      // Forward query parameters to backend
      const queryString = req.nextUrl.search;
      const constructedUrl = `${BACKEND_URL}/api/${pathStr}${queryString}`;

      // Build clean headers without hop-by-hop headers that cause ECONNRESET in Node undici
      const forwardedHeaders = {};
      for (const [key, value] of req.headers.entries()) {
         if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            forwardedHeaders[key] = value;
         }
      }
      forwardedHeaders["Cookie"] = cookieHeader;
      forwardedHeaders["x-active-workspace"] = activeWorkspace;

      // Buffer body once for non-GET/HEAD so retries can replay it safely
      const hasBody = req.method !== "GET" && req.method !== "HEAD";
      const bodyBuffer = hasBody ? await req.arrayBuffer() : undefined;

      const retryDelays = [250, 500, 1000, 1500];
      let lastError = null;

      for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
         try {
            const backendRes = await fetch(constructedUrl, {
               method: req.method,
               headers: forwardedHeaders,
               body: hasBody && bodyBuffer && bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
               cache: "no-store",
            });

            const contentType = backendRes.headers.get("content-type");

            return new Response(backendRes.body, {
               status: backendRes.status,
               headers: {
                  "Content-Type": contentType || "application/json",
               },
            });
         } catch (fetchErr) {
            lastError = fetchErr;
            if (attempt < retryDelays.length && isTransientFetchError(fetchErr)) {
               await new Promise((r) => setTimeout(r, retryDelays[attempt]));
               continue;
            }
            throw fetchErr;
         }
      }

      throw lastError;
   } catch (error) {
      console.warn("Proxy transient connection error:", error?.cause?.code || error?.message);
      return new Response(
         JSON.stringify({
            success: false,
            proxyNetworkError: true,
            message: "Proxy error",
            error: error?.message || "Backend temporarily unreachable",
         }),
         {
            status: 503,
            headers: { "Content-Type": "application/json" },
         }
      );
   }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
