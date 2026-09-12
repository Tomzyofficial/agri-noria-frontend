"use client";

import FormFields from "@/app/(dashboard)/marketplace/storage-facility/components/AddStorage/FormFields";
import { Card, CardContent } from "@/components/ui/Card";
import { useStorageForm } from "./UseStorageForm";

export function AddStorageForm() {
   const { formData, handleChange, handleSubmit, preview, loading, handleAddFeature, handleRemoveFeature, featureText, setFeatureText } = useStorageForm();
   return (
      <main className="py-10">
         <Card>
            <CardContent className="p-4 lg:p-6">
               <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-8">
                  <FormFields formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} preview={preview} loading={loading} handleAddFeature={handleAddFeature} handleRemoveFeature={handleRemoveFeature} featureText={featureText} setFeatureText={setFeatureText} />
               </form>
            </CardContent>
         </Card>
      </main>
   );
}
