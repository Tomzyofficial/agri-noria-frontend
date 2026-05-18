"use client";
// components/Skeleton.js
export default function Skeleton() {
   return (
      <div className="col-span-full flex items-center justify-center py-12">
         <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading, please wait...</p>
         </div>
      </div>
   );
}
