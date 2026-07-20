"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDroneListingSchema } from "@/_lib/validations/validateDroneListing";
import SubmitButton from "@/app/(dashboard)/dashboard/components/SubmitButton";
import { toast } from "react-toastify";
import axios from "axios";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AddDroneListingPage() {
   const {
      register,
      handleSubmit,
      watch,
      reset,
      formState: { errors },
      resetField,
   } = useForm({
      resolver: zodResolver(createDroneListingSchema),
   });
   const [loading, setLoading] = useState(false);

   const listingType = watch("listingType");
   const provideService = watch("provideService");

   const showSaleFields = listingType === "sale" || listingType === "both";
   const showRentFields = listingType === "rent" || listingType === "both";

   useEffect(() => {
      if (!showSaleFields) {
         resetField("salePrice");
         resetField("condition");
         resetField("warranty");
      }
   }, [showSaleFields, resetField]);

   useEffect(() => {
      if (!showRentFields) {
         resetField("rentalPrice");
         resetField("rentalPeriod");
      }
   }, [showRentFields, resetField]);

   useEffect(() => {
      if (!provideService) {
         resetField("serviceType");
      }
   }, [provideService, resetField]);

   // const onInvalid = (errors) => {
   //    const firstError = Object.values(errors)[0];

   //    if (firstError?.message) {
   //       toast.error(String(firstError.message, "path", firstError.path));
   //    }
   // };

   const onSubmit = async (data) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
         if (value == null) return;

         if (value instanceof FileList) {
            Array.from(value).forEach((file) => {
               formData.append(key, file);
            });
         } else {
            formData.append(key, value);
         }
      });

      try {
         setLoading(true);
         await axios.post("/api/proxy/vendor/drone/create", formData);
         toast.success("Listing created successfully");
         reset();
      } catch (error) {
         console.error(error);
         toast.error("Failed to create listing. Please try again later.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-(--card-dark) p-6">
         <div className="max-w-5xl mx-auto">
            <div className="mb-8">
               <h1 className="text-3xl font-bold">Create Drone Marketplace Listing</h1>

               <p className="text-gray-500 mt-2">Add your drone for sale, rental, or both.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl shadow p-6 space-y-10">
               <section>
                  <h2 className="text-xl font-semibold mb-5">Drone Information</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                     <div>
                        <Label htmlFor="listingName">
                           Drone Name
                           <Input id="listingName" placeholder="e.g., DJI Mavic 3" {...register("listingName")} />
                        </Label>
                        {errors.listingName && <p className="text-sm text-red-500 mt-1">{errors.listingName.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="manufacturer">
                           Manufacturer
                           <Input id="manufacturer" placeholder="e.g., DJI" {...register("manufacturer")} />
                        </Label>
                        {errors.manufacturer && <p className="text-sm text-red-500 mt-1">{errors.manufacturer.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="model">
                           Model
                           <Input id="model" placeholder="e.g., Mavic 3" {...register("model")} />
                        </Label>
                        {errors.model && <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="category">
                           Category
                           <select id="category" {...register("category")}>
                              <option value="">Choose category</option>
                              <option value="testing1">testing 1</option>
                              <option value="testing2">testing 2</option>
                              <option value="testing3">testing 3</option>
                              <option value="testing4">testing 4</option>
                              <option value="testing5">testing 5</option>
                           </select>
                        </Label>
                        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
                     </div>
                     <div>
                        <Label htmlFor="listingType">
                           Listing Type
                           <select id="listingType" {...register("listingType")}>
                              <option value="">Choose listing type</option>
                              <option value="rent">For Rent</option>
                              <option value="sale">For Sell</option>
                              <option value="both">Sell & Rent</option>
                           </select>
                        </Label>
                        {errors.listingType && <p className="text-sm text-red-500 mt-1">{errors.listingType.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="location">
                           Location
                           <Input type="text" placeholder="e.g., block 1 street" id="location" {...register("location")} />
                        </Label>
                        {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
                     </div>
                     <div>
                        <Label htmlFor="quantity">
                           Quantity
                           <Input type="number" placeholder="e.g., 10" id="quantity" {...register("quantity")} />
                        </Label>
                        {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>}
                     </div>
                     <div>
                        <Label htmlFor="unit">
                           Unit
                           <select id="unit" {...register("unit")}>
                              <option value="">Choose unit</option>
                              <option value="piece">Piece</option>
                              <option value="container">Container</option>
                              <option value="box">Box</option>
                           </select>
                        </Label>
                        {errors.unit && <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>}
                     </div>
                  </div>

                  <div className="mt-4">
                     <Label htmlFor="description">
                        Description
                        <Textarea placeholder="Clear description..." rows={5} id="description" {...register("description")} />
                     </Label>
                     {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                  </div>
               </section>

               {showSaleFields && (
                  <section>
                     <h2 className="text-xl font-semibold mb-5">Sale Information</h2>
                     <div className="grid md:grid-cols-2 gap-5">
                        <div>
                           <Label htmlFor="salePrice">
                              Selling Price
                              <Input id="salePrice" placeholder="e.g., 1000" type="number" {...register("salePrice")} />
                           </Label>
                           {errors.salePrice && <p className="text-sm text-red-500 mt-1">{errors.salePrice.message}</p>}
                        </div>

                        <div>
                           <Label htmlFor="condition">
                              Condition
                              <select id="condition" {...register("condition")}>
                                 <option value="">Choose Condition</option>
                                 <option value="new">New</option>
                                 <option value="used">Used</option>
                                 <option value="refurbished">Refurbished</option>
                              </select>
                           </Label>
                           {errors.condition && <p className="text-sm text-red-500 mt-1">{errors.condition.message}</p>}
                        </div>

                        <div>
                           <Label htmlFor="warranty">
                              Warranty Period <span className="text-gray-500 text-sm">(Optional)</span>
                              <Input id="warranty" placeholder="e.g., 2 years" {...register("warranty")} />
                           </Label>
                           {errors.warranty && <p className="text-sm text-red-500 mt-1">{errors.warranty.message}</p>}
                        </div>
                     </div>
                  </section>
               )}

               {showRentFields && (
                  <section>
                     <h2 className="text-xl font-semibold mb-5">Rental Information</h2>
                     <div className="grid md:grid-cols-2 gap-5">
                        <div>
                           <Label htmlFor="rentalPrice">
                              Rental price
                              <Input name="rentalPrice" placeholder="e.g., 1000" type="number" className="Input" {...register("rentalPrice")} />
                           </Label>
                           {errors.rentalPrice && <p className="text-sm text-red-500 mt-1">{errors.rentalPrice.message}</p>}
                        </div>

                        <div>
                           <Label htmlFor="rentalPeriod">
                              Rental Period
                              <select id="rentalPeriod" className="Input" {...register("rentalPeriod")}>
                                 <option value="">Choose Rental Period</option>
                                 <option value="per_day">Per Day</option>
                                 <option value="per_week">Per Week</option>
                                 <option value="per_month">Per Month</option>
                              </select>
                           </Label>
                           {errors.rentalPeriod && <p className="text-sm text-red-500 mt-1">{errors.rentalPeriod.message}</p>}
                        </div>
                     </div>
                  </section>
               )}

               <section>
                  <h2 className="text-xl font-semibold mb-5">Technical Specifications</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                     <div>
                        <Label htmlFor="maxPayload">
                           Maximum Payload
                           <Input placeholder="Maximum Payload" id="maxPayload" {...register("maxPayload")} />
                        </Label>
                        {errors.maxPayload && <p className="text-sm text-red-500 mt-1">{errors.maxPayload.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="operatingRange">
                           Operating Range
                           <Input placeholder="Operating Range" name="operatingRange" id="operatingRange" {...register("operatingRange")} />
                        </Label>
                        {errors.operatingRange && <p className="text-sm text-red-500 mt-1">{errors.operatingRange.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="cameraType">
                           Camera Type
                           <Input placeholder="Camera Type" id="cameraType" {...register("cameraType")} />
                        </Label>
                        {errors.cameraType && <p className="text-sm text-red-500 mt-1">{errors.cameraType.message}</p>}
                     </div>

                     <div>
                        <Label htmlFor="flightTime">
                           Flight Time
                           <Input placeholder="Flight Time" id="flightTime" {...register("flightTime")} />
                        </Label>
                        {errors.flightTime && <p className="text-sm text-red-500 mt-1">{errors.flightTime.message}</p>}
                     </div>
                  </div>
               </section>

               <section>
                  <h2 className="text-xl font-semibold mb-5">Drone Services</h2>
                  <div>
                     <Label className="flex items-center gap-3">
                        <Input type="checkbox" {...register("provideService")} />

                        <span>
                           I also provide drone operation services <span className="text-gray-500">(Optional)</span>
                        </span>
                     </Label>
                     {errors.provideService && <p className="text-sm text-red-500 mt-1">{errors.provideService.message}</p>}
                  </div>
                  {provideService && (
                     <div className="mt-4">
                        <Label>Service Type</Label>
                        <Input type="text" {...register("serviceType")} placeholder="Servce type (Spraying, Mapping, Monitoring...) " />
                        {errors.serviceType && <p className="text-sm text-red-500 mt-1">{errors.serviceType.message}</p>}
                     </div>
                  )}
               </section>

               <section>
                  <h2 className="text-xl font-semibold mb-5">Drone Image</h2>
                  <Input {...register("image")} accept="image/*" type="file" multiple />
                  {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>}
               </section>

               <div className="flex justify-end gap-4">
                  <Button type="reset" onClick={() => reset()} className="cursor-pointer px-6 py-3 rounded-md bg-gray-400 text-white">
                     Reset
                  </Button>

                  <SubmitButton loading={loading} text="Create Listing" />
               </div>
            </form>
         </div>
      </div>
   );
}
