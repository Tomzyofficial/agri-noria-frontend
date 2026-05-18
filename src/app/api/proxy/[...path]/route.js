/* 


/* import { cookies } from "next/headers";

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

      let body;
      if (req.method !== "GET" && req.method !== "HEAD") {
         body = await req.arrayBuffer();
      }

      const forwardedHeaders = {};
      req.headers.forEach((value, key) => {
         const k = key.toLowerCase();
         if (k !== "host" && k !== "content-length" && k !== "connection" && k !== "cookie" && k !== "content-type") {
            forwardedHeaders[key] = value;
         }
      });

      const backendRes = await fetch(constructedUrl, {
         method: req.method,
         headers: {
            ...forwardedHeaders,
            // "Content-Type": "application/json",
            Cookie: cookieHeader,
         },
         body: body,
         cache: "no-store",
      });

      const contentType = backendRes.headers.get("content-type");
      const data = await backendRes.text();

      return new Response(data, {
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
 */

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
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? await req.body
          : undefined,
      cache: "no-store",
      duplex: "half",
    });

    const contentType = backendRes.headers.get("content-type");
    const data = await backendRes.text();

    return new Response(data, {
      status: backendRes.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ message: "Proxy error", error: error.message }),
      { status: 500 },
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
