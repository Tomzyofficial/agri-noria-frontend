"use client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import ImageUploadPreview from "../../../../dashboard/components/ImageUploadPreview";
import { Country } from "country-state-city";

export default function CommonFields({ formData, handleChange, loading, preview }) {
  const countries = Country.getAllCountries();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-2">
        <ImageUploadPreview text="Product Image" preview={preview} previewText="No Image" name="product_image" id="product_image" loading={loading} handleChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="listing_name">Product Name</Label>
        <Input name="listing_name" id="listing_name" placeholder="Eg., Tomatoes, Rice..." value={formData.listing_name} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input name="location" id="location" placeholder="Eg., Street, city, state..." value={formData.location} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <div className="flex">
          <Input type="text" placeholder="E.g., 5000" name="price" value={formData.price} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
        </div>
      </div>

      <div>
        <Label htmlFor="unit_measure">Unit Measure</Label>
        <select type="text" name="unit_measure" value={formData.unit_measure} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading}>
          <option value="">Select one</option>
          <option value="per_kg">Per Kg</option>
          <option value="per_bunch">Per Bunch</option>
          <option value="per_piece">Per Piece</option>
          <option value="per_ton">Per Ton</option>
          <option value="per_unit">Per Unit</option>
        </select>
      </div>

      <div>
        <Label htmlFor="available_quantity">Available Quantity</Label>
        <Input name="available_quantity" type="text" id="available_quantity" placeholder="E.g., 500" value={formData.available_quantity} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
      </div>

      <div>
        <Label htmlFor="unit">Unit</Label>
        <select type="text" name="unit" value={formData.unit} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading}>
          <option value="">Select one</option>
          <option value="kg">Kg</option>
          <option value="bunch">Bunch</option>
          <option value="piece">Piece</option>
          <option value="ton">Ton</option>
          <option value="unit">Unit</option>
        </select>
      </div>

      <div className="col-span-2">
        <Label htmlFor="category">Category</Label>
        <select name="category" value={formData.category} onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading}>
          <option value="">Select one</option>
          <option value="food_items">Food Items</option>
          <option value="farm_produce">Farm Produce</option>
          <option value="equipment">Equipment</option>
        </select>
      </div>

      <div className="col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Enter description, clearly describe the product..." value={formData.description} onChange={handleChange} disabled={loading} className={loading ? "opacity-50 cursor-not-allowed" : ""} rows={4} required style={{ resize: "none" }} />
      </div>

      <div className="col-span-2 border border-(--greenish-color) p-4 rounded-lg">
        <h3 className="font-semibold text-lg">Discount (Optional)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="">
            <Label>Buy at least {formData.min_quantity ? formData.min_quantity : "X"} item(s)</Label>
            <Input type="text" name="min_quantity" value={formData.min_quantity || ""} onChange={handleChange} placeholder="Eg., 10" disabled={loading} />
          </div>
          <div>
            <Label>get {formData.discount ? formData.discount : "Y"}% off</Label>
            <Input type="text" name="discount" value={formData.discount || ""} onChange={handleChange} placeholder="Eg., 10" disabled={loading} />
          </div>
        </div>
        <p className="text-sm text-gray-500 py-2">Discount applies when customer buys this quantity or more.</p>
      </div>
    </div>
  );
}
