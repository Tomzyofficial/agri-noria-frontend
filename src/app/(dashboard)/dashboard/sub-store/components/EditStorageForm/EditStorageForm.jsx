"use client";

import ImageUpload from "@/app/(dashboard)/dashboard/sub-store/components/AddStorage/ImageUpload";
import FormFields from "@/app/(dashboard)/dashboard/sub-store/components/AddStorage/FormFields";
import SubmitButton from "@/app/(dashboard)/dashboard/sub-store/components/AddStorage/SubmitButton";
import { Card, CardContent } from "@/components/ui/Card";
import { useStorageEditForm } from "./UseStorageEditForm";

export function EditItem({ storage }) {
   const { formData, handleChange, handleSubmit, preview, loading } = useStorageEditForm(storage);

   return (
      <main className="py-10">
         <Card>
            <CardContent className="p-4 lg:p-6">
               <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-8">
                  <ImageUpload preview={preview} loading={loading} handleChange={handleChange} />

                  <FormFields formData={formData} handleChange={handleChange} loading={loading} />

                  <SubmitButton loading={loading} text={"Update"} loadingText={"Updating..."} />
               </form>
            </CardContent>
         </Card>
      </main>
   );
}
