const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export function apiUrl(path) {
   if (!path) return;
   if (path.startsWith("http")) return path;
   const cleanPath = path.startsWith("/") ? path : `/${path}`;
   let baseUrl = BACKEND_URL;
   if (baseUrl && baseUrl.includes("localhost")) {
       baseUrl = baseUrl.replace("localhost", "127.0.0.1");
   }
   return `${baseUrl}${cleanPath}`;
}
