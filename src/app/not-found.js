import Link from "next/link";

export default function NotFound() {
   return (
      <>
         <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center px-4">
               {/* 404 Animation */}
               <div className="mb-8">
                  <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">404</h1>
               </div>

               {/* Message */}
               <h2 className="text-3xl font-semibold text-gray-800 mb-4">Oops&#33; Page Not Found</h2>
               <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  The page you&apos;re looking for doesn&apos;t exist or has been moved to another location.
               </p>

               {/* Actions */}
               <div className="flex gap-4 justify-center">
                  <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                     Go Home
                  </Link>
               </div>
            </div>
         </div>
      </>
   );
}
