"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Calendar, MapPin, User, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function SchedulePage() {
   const [schedule, setSchedule] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   const [selectedDate, setSelectedDate] = useState("");

   useEffect(() => {
      const fetchSchedule = async () => {
         try {
            const res = await fetch("/api/proxy/field-operations/schedule");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                  setSchedule(json.data);
               }
            }
         } catch (err) {
            console.error("Failed to fetch schedule:", err);
            // Mock data
            const mockSchedule = [
               {
                  id: "SCH-001",
                  farmName: "Green Farm A",
                  farmerName: "John Kipchoge",
                  location: "Uasin Gishu County",
                  visitType: "INSPECTION",
                  scheduledDate: new Date(Date.now() + 86400000).toISOString(),
                  officer: "Peter Kipchoge",
               },
               {
                  id: "SCH-002",
                  farmName: "Rainbow Fields",
                  farmerName: "Mary Kipchoge",
                  location: "Nandi County",
                  visitType: "VERIFICATION",
                  scheduledDate: new Date(Date.now() + 172800000).toISOString(),
                  officer: "Jane Kipchoge",
               },
            ];
            setSchedule(mockSchedule);
         } finally {
            setLoading(false);
         }
      };
      fetchSchedule();
   }, []);

   const handleDeleteVisit = async (id) => {
      if (!confirm("Are you sure you want to delete this scheduled visit?")) return;
      try {
         const res = await fetch(`/api/proxy/field-operations/schedule/${id}`, {
            method: "DELETE",
         });
         if (res.ok) {
            setSchedule(schedule.filter((s) => s.id !== id));
            toast.success("Visit deleted");
         }
      } catch (err) {
         console.error("Error deleting visit:", err);
      }
   };

   const getVisitTypeColor = (type) => {
      switch (type) {
         case "INSPECTION":
            return "bg-blue-100 text-blue-700";
         case "VERIFICATION":
            return "bg-green-100 text-green-700";
         case "MONITORING":
            return "bg-orange-100 text-orange-700";
         default:
            return "bg-gray-100 text-gray-700";
      }
   };

   const upcomingVisits = schedule.filter((s) => new Date(s.scheduledDate) > new Date());

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold text-(--foreground)">Visit Schedule</h1>
               <p className="text-gray-500 mt-1">Manage your field officer visit schedule.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
               <Plus className="w-4 h-4" /> Schedule Visit
            </Button>
         </div>

         {/* Add Visit Form */}
         {showForm && (
            <Card>
               <CardHeader>
                  <CardTitle>Schedule New Visit</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-2">Farm Name</label>
                        <input
                           type="text"
                           placeholder="Farm name"
                           className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-2">Farmer Name</label>
                        <input
                           type="text"
                           placeholder="Farmer name"
                           className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-2">Visit Date</label>
                        <input
                           type="date"
                           value={selectedDate}
                           onChange={(e) => setSelectedDate(e.target.value)}
                           className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-2">Visit Type</label>
                        <select className="w-full px-3 py-2 border rounded-md dark:bg-gray-800">
                           <option>INSPECTION</option>
                           <option>VERIFICATION</option>
                           <option>MONITORING</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                     <Button onClick={() => setShowForm(false)} variant="outline">
                        Cancel
                     </Button>
                     <Button
                        onClick={() => {
                           toast.success("Visit scheduled");
                           setShowForm(false);
                        }}
                     >
                        Schedule
                     </Button>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Upcoming Visits</p>
                  <p className="text-2xl font-bold mt-2 text-blue-600">{upcomingVisits.length}</p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Scheduled This Week</p>
                  <p className="text-2xl font-bold mt-2">
                     {
                        schedule.filter(
                           (s) =>
                              new Date(s.scheduledDate) > new Date() &&
                              new Date(s.scheduledDate) <= new Date(Date.now() + 604800000),
                        ).length
                     }
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Total Visits</p>
                  <p className="text-2xl font-bold mt-2">{schedule.length}</p>
               </CardContent>
            </Card>
         </div>

         {/* Schedule Calendar View */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Upcoming Visits
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                  {upcomingVisits.length === 0 ? (
                     <p className="text-gray-500 py-8 text-center">No upcoming visits scheduled</p>
                  ) : (
                     upcomingVisits.map((visit) => (
                        <div key={visit.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
                           <div className="flex items-start justify-between">
                              <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold">{visit.farmName}</h3>
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(visit.visitType)}`}
                                    >
                                       {visit.visitType}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                       <User className="w-4 h-4" /> {visit.farmerName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                       <MapPin className="w-4 h-4" /> {visit.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                       <Calendar className="w-4 h-4" />{" "}
                                       {new Date(visit.scheduledDate).toLocaleDateString()}
                                    </span>
                                 </div>
                                 <p className="text-sm text-gray-500 mt-2">Officer: {visit.officer}</p>
                              </div>
                              <div className="flex gap-2">
                                 <Button size="sm" variant="ghost" className="text-blue-600">
                                    <Edit2 className="w-4 h-4" />
                                 </Button>
                                 <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => handleDeleteVisit(visit.id)}
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
