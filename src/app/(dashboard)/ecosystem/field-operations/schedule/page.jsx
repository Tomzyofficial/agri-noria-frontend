"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Calendar, MapPin, User, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function SchedulePage() {
   const [schedule, setSchedule] = useState([]);
   const [farmers, setFarmers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   
   const [formData, setFormData] = useState({
       farm_id: "",
       visit_type: "INSPECTION",
       scheduled_date: ""
   });
   const [submitting, setSubmitting] = useState(false);

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
      }
   };

   const fetchFarmers = async () => {
       try {
           const res = await fetch("/api/proxy/field-operations/farmers");
           if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                   setFarmers(json.data);
               }
           }
       } catch (err) {
           console.error("Failed to fetch farmers:", err);
       }
   };

   useEffect(() => {
      Promise.all([fetchSchedule(), fetchFarmers()]).finally(() => {
          setLoading(false);
      });
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
         } else {
             toast.error("Failed to delete visit");
         }
      } catch (err) {
         console.error("Error deleting visit:", err);
         toast.error("An error occurred");
      }
   };

   const handleSubmit = async (e) => {
       e.preventDefault();
       setSubmitting(true);
       try {
           const res = await fetch("/api/proxy/field-operations/schedule", {
               method: "POST",
               headers: {
                   "Content-Type": "application/json"
               },
               body: JSON.stringify(formData)
           });
           if (res.ok) {
               toast.success("Visit scheduled successfully");
               setShowForm(false);
               fetchSchedule();
               setFormData({ farm_id: "", visit_type: "INSPECTION", scheduled_date: "" });
           } else {
               toast.error("Failed to schedule visit");
           }
       } catch (err) {
           console.error("Error creating schedule:", err);
           toast.error("An error occurred");
       } finally {
           setSubmitting(false);
       }
   }

   const getVisitTypeColor = (type) => {
      switch (type) {
         case "INSPECTION":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
         case "VERIFICATION":
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
         case "MONITORING":
            return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
         default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
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
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">Visit Schedule</h1>
               <p className="text-gray-500 mt-1 text-lg">Manage your field officer visit schedule</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-xl px-6 py-6 font-medium text-lg">
               <Plus className="w-5 h-5" /> Schedule Visit
            </Button>
         </div>

         {/* Add Visit Form */}
         {showForm && (
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-black/5 dark:ring-white/10">
               <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Schedule New Visit</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Farmer / Farm</label>
                            <select 
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm"
                               value={formData.farm_id}
                               onChange={(e) => setFormData({...formData, farm_id: e.target.value})}
                               required
                            >
                                <option value="">Select Farmer</option>
                                {farmers.map(f => (
                                    <option key={f.farmer_id} value={f.farmer_id}>{f.name}</option>
                                ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visit Date & Time</label>
                            <input
                               type="datetime-local"
                               value={formData.scheduled_date}
                               onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm"
                               required
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visit Type</label>
                            <select 
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm"
                               value={formData.visit_type}
                               onChange={(e) => setFormData({...formData, visit_type: e.target.value})}
                               required
                            >
                               <option value="INSPECTION">INSPECTION</option>
                               <option value="VERIFICATION">VERIFICATION</option>
                               <option value="MONITORING">MONITORING</option>
                            </select>
                         </div>
                      </div>
                      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                         <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl px-6">
                            Cancel
                         </Button>
                         <Button type="submit" disabled={submitting} className="rounded-xl px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Schedule
                         </Button>
                      </div>
                   </form>
               </CardContent>
            </Card>
         )}

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 rounded-2xl overflow-hidden transition-all hover:shadow-xl">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                     <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Upcoming Visits</p>
                     <p className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{upcomingVisits.length}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 rounded-2xl overflow-hidden transition-all hover:shadow-xl">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                     <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Scheduled This Week</p>
                     <p className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">
                        {
                           schedule.filter(
                              (s) =>
                                 new Date(s.scheduledDate) > new Date() &&
                                 new Date(s.scheduledDate) <= new Date(Date.now() + 604800000),
                           ).length
                        }
                     </p>
                  </div>
               </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 rounded-2xl overflow-hidden transition-all hover:shadow-xl">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                     <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Visits</p>
                     <p className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{schedule.length}</p>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Schedule Calendar View */}
         <Card className="border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
               <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <Calendar className="w-5 h-5 text-blue-500" /> Upcoming Visits
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-4">
                  {upcomingVisits.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg">No upcoming visits scheduled</p>
                     </div>
                  ) : (
                     upcomingVisits.map((visit) => (
                        <div key={visit.id} className="group relative border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                 <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{visit.farmName || "Farm"}</h3>
                                    <span
                                       className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getVisitTypeColor(visit.visitType)}`}
                                    >
                                       {visit.visitType}
                                    </span>
                                 </div>
                                 <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                       <User className="w-4 h-4 text-gray-500" /> {visit.farmerName}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                       <MapPin className="w-4 h-4 text-gray-500" /> {visit.location || "Unknown"}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg">
                                       <Calendar className="w-4 h-4" />{" "}
                                       {new Date(visit.scheduledDate).toLocaleString(undefined, {
                                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                       })}
                                    </span>
                                 </div>
                                 <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    Officer: <span className="font-medium text-gray-700 dark:text-gray-300">{visit.officer || "Unassigned"}</span>
                                 </p>
                              </div>
                              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                 <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                                    onClick={() => handleDeleteVisit(visit.id)}
                                 >
                                    <Trash2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
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
