"use client";

import CommonFields from "@/app/(dashboard)/marketplace/store/components/AddProduct/CommonFieldsForm";
import FarmerFields from "@/app/(dashboard)/marketplace/store/components/AddProduct/FarmerFieldsForm";
import EquipmentFieldsForm from "@/app/(dashboard)/marketplace/store/components/AddProduct/EquipmentFieldsForm";
import SubmitButton from "../../../../dashboard/components/SubmitButton";
import { Card, CardContent } from "@/components/ui/Card";
import { useProductEditForm } from "@/app/(dashboard)/marketplace/store/components/EditProduct/UseProductEditForm";
import FoodItemFields from "../AddProduct/FooditemForm";

export function EditProductForm({ product }) {
   const { formData, handleChange, handleSubmit, loading } = useProductEditForm(product);

   return (
      <main className="py-10">
         <Card>
            <CardContent className="p-4 lg:p-6">
               <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-8">
                  <CommonFields formData={formData} handleChange={handleChange} loading={loading} />

                  {formData.category === "farm_produce" ? (
                     <FarmerFields formData={formData} handleChange={handleChange} loading={loading} />
                  ) : formData.category === "equipment" ? (
                     <EquipmentFieldsForm formData={formData} handleChange={handleChange} loading={loading} />
                  ) : formData.category === "food_items" ? (
                     <FoodItemFields formData={formData} handleChange={handleChange} loading={loading} />
                  ) : null}
                  <SubmitButton loading={loading} text="Update" loadingText="Updating..." />
               </form>
            </CardContent>
         </Card>
      </main>
   );
}
