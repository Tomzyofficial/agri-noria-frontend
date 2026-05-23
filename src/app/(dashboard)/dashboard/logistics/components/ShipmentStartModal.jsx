"use client";

import { useState } from "react";
import { X, Upload, Check, AlertCircle, Loader2 } from "lucide-react";

export function ShipmentStartModal({ orderId, orderData, open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    assigned_driver_name: "",
    assigned_driver_phone: "",
    vehicle_plate_number: "",
    estimated_delivery_datetime: "",
    pickup_confirmation: false,
    dispatch_notes: "",
    pickup_location: orderData?.delivery_address || "",
    delivery_location: orderData?.delivery_address || "",
  });

  const [pickupPhoto, setPickupPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setPickupPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      if (validationErrors.pickup_photo) {
        setValidationErrors((prev) => ({ ...prev, pickup_photo: null }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.assigned_driver_name || formData.assigned_driver_name.trim().length < 2) {
      errors.assigned_driver_name = "Driver name is required (min 2 characters)";
    }

    if (!formData.assigned_driver_phone || formData.assigned_driver_phone.trim().length < 10) {
      errors.assigned_driver_phone = "Driver phone is required (min 10 digits)";
    }

    if (!formData.vehicle_plate_number || formData.vehicle_plate_number.trim().length < 3) {
      errors.vehicle_plate_number = "Vehicle plate number is required";
    }

    if (!formData.estimated_delivery_datetime) {
      errors.estimated_delivery_datetime = "Estimated delivery date/time is required";
    } else {
      const deliveryDate = new Date(formData.estimated_delivery_datetime);
      const minDeliveryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      if (deliveryDate < minDeliveryTime) {
        errors.estimated_delivery_datetime = "Delivery time must be at least 1 hour in the future";
      }
    }

    if (!formData.pickup_confirmation) {
      errors.pickup_confirmation = "You must confirm pickup";
    }

    if (!pickupPhoto) {
      errors.pickup_photo = "Pickup photo is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("assigned_driver_name", formData.assigned_driver_name);
      formDataToSend.append("assigned_driver_phone", formData.assigned_driver_phone);
      formDataToSend.append("vehicle_plate_number", formData.vehicle_plate_number);
      formDataToSend.append("estimated_delivery_datetime", formData.estimated_delivery_datetime);
      formDataToSend.append("pickup_confirmation", formData.pickup_confirmation);
      formDataToSend.append("dispatch_notes", formData.dispatch_notes);
      formDataToSend.append("pickup_location", formData.pickup_location);
      formDataToSend.append("delivery_location", formData.delivery_location);
      formDataToSend.append("pickup_photo", pickupPhoto);

      const response = await fetch(
        `/api/proxy/vendor/logistics/orders/${orderId}/start-shipment-confirm`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to start shipment");
      }

      // Success
      onSuccess?.(result.data);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to start shipment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      assigned_driver_name: "",
      assigned_driver_phone: "",
      vehicle_plate_number: "",
      estimated_delivery_datetime: "",
      pickup_confirmation: false,
      dispatch_notes: "",
      pickup_location: orderData?.delivery_address || "",
      delivery_location: orderData?.delivery_address || "",
    });
    setPickupPhoto(null);
    setPreviewUrl(null);
    setError(null);
    setValidationErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold">Start Shipment</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Driver Information</h3>
            
            <div>
              <label htmlFor="assigned_driver_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Driver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="assigned_driver_name"
                name="assigned_driver_name"
                value={formData.assigned_driver_name}
                onChange={handleInputChange}
                placeholder="Enter driver's full name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.assigned_driver_name ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {validationErrors.assigned_driver_name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.assigned_driver_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="assigned_driver_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Driver Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="assigned_driver_phone"
                name="assigned_driver_phone"
                value={formData.assigned_driver_phone}
                onChange={handleInputChange}
                placeholder="Enter driver's phone number"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.assigned_driver_phone ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {validationErrors.assigned_driver_phone && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.assigned_driver_phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="vehicle_plate_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vehicle_plate_number"
                name="vehicle_plate_number"
                value={formData.vehicle_plate_number}
                onChange={handleInputChange}
                placeholder="Enter vehicle plate number"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.vehicle_plate_number ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {validationErrors.vehicle_plate_number && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.vehicle_plate_number}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Information</h3>
            
            <div>
              <label htmlFor="estimated_delivery_datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Delivery Date/Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="estimated_delivery_datetime"
                name="estimated_delivery_datetime"
                value={formData.estimated_delivery_datetime}
                onChange={handleInputChange}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.estimated_delivery_datetime ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {validationErrors.estimated_delivery_datetime && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.estimated_delivery_datetime}</p>
              )}
            </div>

            <div>
              <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                id="pickup_location"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleInputChange}
                placeholder="Enter pickup location"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="delivery_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Location
              </label>
              <input
                type="text"
                id="delivery_location"
                name="delivery_location"
                value={formData.delivery_location}
                onChange={handleInputChange}
                placeholder="Enter delivery location"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Pickup Confirmation</h3>
            
            <div>
              <label htmlFor="pickup_photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pickup Photo <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Pickup preview"
                        className="mx-auto h-48 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPickupPhoto(null);
                          setPreviewUrl(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="pickup_photo"
                          className="relative cursor-pointer rounded-md font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="pickup_photo"
                            name="pickup_photo"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handlePhotoChange}
                            className="sr-only"
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, or WebP up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              {validationErrors.pickup_photo && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.pickup_photo}</p>
              )}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="pickup_confirmation"
                  name="pickup_confirmation"
                  type="checkbox"
                  checked={formData.pickup_confirmation}
                  onChange={handleInputChange}
                  className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${
                    validationErrors.pickup_confirmation ? "border-red-500" : ""
                  }`}
                  disabled={loading}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="pickup_confirmation" className="font-medium text-gray-700 dark:text-gray-300">
                  I confirm that the pickup has been completed and the goods are in transit
                  <span className="text-red-500">*</span>
                </label>
                {validationErrors.pickup_confirmation && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.pickup_confirmation}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="dispatch_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dispatch Notes (Optional)
            </label>
            <textarea
              id="dispatch_notes"
              name="dispatch_notes"
              value={formData.dispatch_notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any additional logistics instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Start Shipment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
