const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export function apiUrl(path) {
   if (!path) return;
   if (path.startsWith("http")) return path;
   const cleanPath = path.startsWith("/") ? path : `/${path}`;
   return `${BACKEND_URL}${cleanPath}`;
}
