"use client";
import CommonFields from "@/app/(dashboard)/dashboard/store/components/AddProduct/CommonFieldsForm";
import FarmerFields from "@/app/(dashboard)/dashboard/store/components/AddProduct/FarmerFieldsForm";
import EquipmentFieldsForm from "@/app/(dashboard)/dashboard/store/components/AddProduct/EquipmentFieldsForm";
import SubmitButton from "../../../components/SubmitButton";
import { Card, CardContent } from "@/components/ui/Card";
import { useProductForm } from "@/app/(dashboard)/dashboard/store/components/AddProduct/UseProductForm";
import FoodItemFields from "@/app/(dashboard)/dashboard/store/components/AddProduct/FooditemForm";

export function AddProductForm({ user }) {
  const { formData, handleChange, handleSubmit, loading, preview } =
    useProductForm(user);

  return (
    <main className="py-10">
      <Card>
        <CardContent className="p-4 lg:p-6">
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading}
            className="space-y-8"
          >
            <CommonFields
              formData={formData}
              handleChange={handleChange}
              loading={loading}
              preview={preview}
            />

            {formData.category === "farm_produce" ? (
              <FarmerFields
                formData={formData}
                handleChange={handleChange}
                loading={loading}
              />
            ) : formData.category === "equipment" ? (
              <EquipmentFieldsForm
                formData={formData}
                handleChange={handleChange}
                loading={loading}
              />
            ) : formData.category === "food_items" ? (
              <FoodItemFields
                formData={formData}
                handleChange={handleChange}
                loading={loading}
              />
            ) : null}

            <SubmitButton
              loading={loading}
              text="Create Listing"
              loadingText="Submitting..."
            />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
