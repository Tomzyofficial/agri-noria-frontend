"use client";

import { useState } from "react";
import { Calendar, Clock, User, Mail, Phone, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function BookingsForm({ onClose, storageName }) {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      notes: "",
   });

   const inputStyle =
      "rounded-r border-1 border-transparent ring ring-(--greenish-color) dark:ring-gray-700 outline-none bg-(--gray-color) dark:bg-(--background) focus:border-(--dark-green-color) dark:focus:border-gray-500 p-2 w-full bookings";
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
         // Simulate API call
         await new Promise((resolve) => setTimeout(resolve, 1500));

         // In a real app, you would send this data to your backend
         // await api.bookStorageVisit({
         //   ...formData,
         //   storageName,
         //   timestamp: new Date().toISOString()
         // });

         setIsSuccess(true);
         // Reset form after successful submission
         setTimeout(() => {
            onClose();
         }, 2000);
      } catch (error) {
         console.error("Error submitting form:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   if (isSuccess) {
      return (
         <div className="text-center p-8">
            <div className="flex justify-center mb-4">
               <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-600" />
               </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Request Sent!</h3>
            <p className="text-gray-600 mb-6">
               We've received your request to visit {storageName}. Our team will contact you shortly to confirm your
               appointment.
            </p>
            <Button
               onClick={onClose}
               className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
               Close
            </Button>
         </div>
      );
   }

   return (
      <div className="p-6">
         <h3 className="text-2xl font-bold text-gray-900 mb-6">Schedule a Visit</h3>
         <p className="text-gray-600 mb-6">
            Fill in your details to book a visit to our {storageName} facility. We'll get back to you shortly to confirm
            your appointment.
         </p>

         <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
               <Label htmlFor="name">Full Name</Label>
               <div className="flex items-center">
                  <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                     <User className="h-4.5 w-5 text-gray-400" />
                  </div>
                  <Input
                     type="text"
                     name="name"
                     required
                     value={formData.name}
                     onChange={handleChange}
                     placeholder="John Doe"
                     className={inputStyle}
                     autoComplete="on"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center">
                     <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                        <Mail className="h-4.5 w-5 text-gray-400" />
                     </div>
                     <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={inputStyle}
                        autoComplete="on"
                        placeholder="your@email.com"
                     />
                  </div>
               </div>

               <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center">
                     <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                        <Phone className="h-4.5 w-5 text-gray-400" />
                     </div>
                     <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="+234 800 000 0000"
                     />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <Label htmlFor="date">Preferred Date</Label>
                  <div className="flex items-center">
                     <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                        <Calendar className="h-4.5 w-5 text-gray-400" />
                     </div>
                     <Input
                        type="date"
                        id="date"
                        name="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.date}
                        onChange={handleChange}
                        className={inputStyle}
                     />
                  </div>
               </div>

               <div className="space-y-1">
                  <Label htmlFor="time">Preferred Time</Label>
                  <div className="flex items-center">
                     <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                        <Clock className="h-4.5 w-5 text-gray-400" />
                     </div>
                     <select
                        id="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className={inputStyle}
                     >
                        <option value="">Select a time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="space-y-1">
               <Label htmlFor="notes">Additional Notes (Optional)</Label>
               <Textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  className={inputStyle}
                  autoComplete="on"
                  placeholder="Any special requirements or questions?"
               />
            </div>

            <div className="pt-3">
               <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                     isSubmitting
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  }`}
               >
                  {isSubmitting ? (
                     <div className="flex justify-center items-center gap-2">
                        <FaSpinner className="h-4 w-4 animate-spin" />
                        <span>Please wait...</span>
                     </div>
                  ) : (
                     "Schedule Visit"
                  )}
               </Button>

               <Button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
               >
                  Cancel
               </Button>
            </div>
         </form>
      </div>
   );
}
