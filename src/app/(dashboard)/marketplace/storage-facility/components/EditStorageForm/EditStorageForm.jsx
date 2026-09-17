"use client";
import FormFields from "@/app/(dashboard)/marketplace/storage-facility/components/AddStorage/FormFields";
import { Card, CardContent } from "@/components/ui/Card";
import { useStorageEditForm } from "./UseStorageEditForm";

export function EditItem({ storage }) {
   const { formData, handleChange, handleSubmit, preview, loading, handleAddFeature, handleRemoveFeature, featureText, setFeatureText } = useStorageEditForm(storage);

   return (
      <main className="py-10">
         <Card>
            <CardContent className="p-4 lg:p-6">
               <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-8">
                  <FormFields editForm={true} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} preview={preview} loading={loading} handleAddFeature={handleAddFeature} handleRemoveFeature={handleRemoveFeature} featureText={featureText} setFeatureText={setFeatureText} />
               </form>
            </CardContent>
         </Card>
      </main>
   );
}
