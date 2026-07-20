import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
   console.error("BACKEND_URL is not defined");
   throw new Error("BACKEND_URL is not defined");
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

      // Forward query parameters to backend
      const queryString = req.nextUrl.search;
      const constructedUrl = `${BACKEND_URL}/api/${pathStr}${queryString}`;
      console.log("Constructed URL:", constructedUrl);

      const backendRes = await fetch(constructedUrl, {
         method: req.method,
         headers: {
            ...Object.fromEntries(req.headers.entries()),
            Cookie: cookieHeader,
         },
         // signal: AbortSignal.timeout(30000),
         body: req.method !== "GET" && req.method !== "HEAD" ? await req.body : undefined,
         cache: "no-store",
         duplex: "half",
      });

      const contentType = backendRes.headers.get("content-type");

      return new Response(backendRes.body, {
         status: backendRes.status,
         headers: {
            "Content-Type": contentType || "application/json",
         },
      });
   } catch (error) {
      console.error("Proxy error:", error);
      return new Response(JSON.stringify({ message: "Proxy error", error: error.message }), { status: 500 });
   }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
