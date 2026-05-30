import "./globals.css";
import Link from "next/link";

export const metadata = {
   title: "404 - Page Not Found",
   description: "The page you seek is not found",
};

export default function GlobalNotFound() {
   return (
      <html lang="en">
         <body className="bg-gray-50 text-gray-900">
            <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
               <h1 className="text-7xl font-black text-green-600 mb-4">404</h1>
               <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
               <p className="text-gray-600 max-w-md mb-8">
                  The page you are looking for does not exist or has been moved.
               </p>
               <Link
                  href="/"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
               >
                  Go Home
               </Link>
            </main>
         </body>
      </html>
   );
}
