// "use client";
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { CheckCircle, Truck, Package, ShieldAlert, Activity, FileText } from "lucide-react";

// export default function CommodityMovement({ role }) {
//   const [activeStage, setActiveStage] = useState(0);

//   const workflowStages = [
//     { title: "Harvest Ready", icon: <Package className="w-5 h-5" />, role: "farmer" },
//     { title: "Collection", icon: <Truck className="w-5 h-5" />, role: "aggregator" },
//     { title: "Storage Booking", icon: <FileText className="w-5 h-5" />, role: "storage" },
//     { title: "Stored Inventory", icon: <Package className="w-5 h-5" />, role: "storage" },
//     { title: "Dispatch Requests", icon: <FileText className="w-5 h-5" />, role: "buyer" },
//     { title: "Transport Assignment", icon: <Truck className="w-5 h-5" />, role: "logistics" },
//     { title: "In Transit", icon: <Activity className="w-5 h-5" />, role: "logistics" },
//     { title: "Delivered", icon: <CheckCircle className="w-5 h-5" />, role: "buyer" },
//     { title: "Settlements", icon: <WalletIcon className="w-5 h-5" />, role: "finance" },
//   ];

//   // A simple icon fallback for Settlements
//   function WalletIcon({ className }) {
//     return (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         className={className}
//       >
//         <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z"></path>
//         <path d="M16 10h5v4h-5z"></path>
//       </svg>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto w-full">
//       <div className="mb-8">
//         <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
//           Commodity Movement Workflow
//         </h1>
//         <p className="text-gray-500 mt-1 font-medium">
//           Unified tracking of commodities from harvest to settlement.
//         </p>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left Sidebar: Timeline/Stages */}
//         <div className="lg:w-1/3">
//           <Card className="h-full">
//             <CardHeader>
//               <CardTitle className="text-lg">Pipeline Stages</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {workflowStages.map((stage, index) => {
//                   const isPast = index < activeStage;
//                   const isCurrent = index === activeStage;
//                   return (
//                     <button
//                       key={index}
//                       onClick={() => setActiveStage(index)}
//                       className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
//                         isCurrent
//                           ? "bg-(--greenish-color) text-white shadow-md shadow-green-900/20"
//                           : isPast
//                           ? "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
//                           : "text-gray-400 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-800"
//                       }`}
//                     >
//                       <div
//                         className={`p-2 rounded-full ${
//                           isCurrent
//                             ? "bg-white/20"
//                             : isPast
//                             ? "bg-green-100 text-green-600 dark:bg-green-900/30"
//                             : "bg-gray-100 dark:bg-gray-800"
//                         }`}
//                       >
//                         {stage.icon}
//                       </div>
//                       <div className="flex-1">
//                         <p className="font-bold text-sm">{stage.title}</p>
//                       </div>
//                       {isPast && <CheckCircle className="w-4 h-4 text-green-500" />}
//                     </button>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Area: Active Stage Details */}
//         <div className="lg:w-2/3">
//           <Card className="h-full">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 bg-(--greenish-color) text-white rounded-xl">
//                   {workflowStages[activeStage].icon}
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-black text-(--foreground)">
//                     {workflowStages[activeStage].title}
//                   </h2>
//                   <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Role context: {workflowStages[activeStage].role}
//                   </p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="p-6">
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
//                 <h3 className="text-lg font-bold text-gray-400">
//                   Select a batch to view details for this stage.
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-2 max-w-md">
//                   In a fully wired system, this area would list all batches currently in the "{workflowStages[activeStage].title}" state, allowing you to process them.
//                 </p>
//                 <Button className="mt-6 bg-(--greenish-color) text-white hover:bg-green-700">
//                   Simulate Action for {role}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
