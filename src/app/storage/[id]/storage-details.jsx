"use client";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import {
  ArrowRight,
  Check,
  MapPin,
  Clock,
  Shield,
  Thermometer,
  BarChart3,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { formatPrice } from "@/utils/formatPrice";
import StorageForm from "@/components/quoteRequest/StorageForm";

export default function StorageDetail({ storage, error }) {
  const [openModal, setOpenModal] = useState(false);

  if (error || !storage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Storage Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The requested storage space could not be found."}
          </p>
          <Link
            href="/storage"
            className="text-green-600 hover:underline font-medium"
          >
            ← Back to Storage Page
          </Link>
        </div>
      </div>
    );
  }

  // Ensure features is an array
  const features = Array.isArray(storage.features) ? storage.features : [];

  const id = storage?.id;

  useEffect(() => {
    if (!id) return;

    const trackView = async () => {
      try {
        await fetch(`/api/proxy/marketplace/listed-storage/${id}/track-view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to track storage view", error);
      }
    };

    trackView();
  }, [id]);

  const handleQuoteRequest = async () => {
    setOpenModal(true);
    try {
      if (id) {
        await fetch(`/api/proxy/marketplace/listed-storage/${id}/track-click`, {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Failed to track booking click", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-(--card-dark)">
      {/* Hero Section */}
      <div className="text-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-bold mb-4">
                {storage.storage_name
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </h1>
              <p className="text-xl text-neutral-700 mb-6">
                {storage.description}
              </p>
              <div className="flex items-center text-2xl font-bold mb-6">
                {formatPrice(
                  storage.price,
                  storage.country_code,
                  storage.currency,
                )}
                <span className="text-lg font-normal ml-2">/ Per MT</span>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin size={20} className="mr-2 text-green-600" />
                  <span>{storage.location}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Thermometer size={20} className="mr-2 text-green-600" />
                  <span>{storage.temperature}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Shield size={20} className="mr-2 text-green-600" />
                  <span>{storage.storage_type}</span>
                </div>
              </div>
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {storage.available} / {storage.capacity} MT Available
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((parseFloat(storage.available) / parseFloat(storage.capacity)) * 100).toFixed(0)}%`,
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={handleQuoteRequest}
                className="cursor-pointer bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
              >
                Request Quote <ArrowRight size={18} />
              </Button>

              {/* Quote request form */}
              <Modal onClick={() => setOpenModal(false)} isOpen={openModal}>
                <StorageForm
                  onClose={() => setOpenModal(false)}
                  targetId={storage}
                  quoteType="storage"
                />
              </Modal>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative h-80 md:h-96 w-full rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={storage.storage_image}
                  alt={`${storage.storage_name} Image`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Storage Details
            </h2>
            <ul className="space-y-4">
              {storage.temperature && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-0.5">
                    <Thermometer size={20} />
                  </div>
                  <span className="text-gray-700">
                    Temperature: {storage.temperature}
                  </span>
                </li>
              )}
              {storage.storage_type && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-0.5">
                    <Shield size={20} />
                  </div>
                  <span className="text-gray-700">
                    Type: {storage.storage_type}
                  </span>
                </li>
              )}
              {storage.city && storage.state && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-0.5">
                    <MapPin size={20} />
                  </div>
                  <span className="text-gray-700">
                    Location: {storage.city}, {storage.state}
                  </span>
                </li>
              )}
              {storage.capacity && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-0.5">
                    <BarChart3 size={20} />
                  </div>
                  <span className="text-gray-700">
                    Total Capacity: {storage.capacity} MT
                  </span>
                </li>
              )}
              {storage.available && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-0.5">
                    <Clock size={20} />
                  </div>
                  <span className="text-gray-700">
                    Available: {storage.available} MT
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Features & Benefits
            </h3>
            {features.length > 0 ? (
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">
                No features listed for this storage facility.
              </p>
            )}

            {storage.vendor_id && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Vendor Information
                </h4>
                {/* {
                           storage.storage_image && (
                              <Image src={storage.profile_image_url} width={150} height={150} className="rounded-full" />
                           )
                        } */}
                {storage.fname && storage.lname && (
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Vendor:</strong> {storage.fname} {storage.lname}
                  </p>
                )}
                {/* {storage.phone && (
                  <Link
                    href={`tel:${storage.phone}`}
                    className="inline-flex items-center text-green-700 hover:text-green-900 font-medium"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {storage.phone}
                  </Link>
                )} */}
              </div>
            )}

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                Need Help Deciding?
              </h4>
              <p className="text-sm text-green-700 mb-4">
                Our storage experts are available to help you choose the perfect
                storage solution for your needs.
              </p>
              {/* <Link
                href="tel:+2348139262626"
                className="inline-flex items-center text-green-700 hover:text-green-900 font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                +234 813 926 2626
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Reserve your storage space today and experience premium agricultural
            storage solutions.
          </p>
          <p>
            Send your enquiry today and we'll get back to you as soon as
            possible.
          </p>
          {/* <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="https://wa.me/2348139262626"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-2"
            >
              <FaWhatsapp />
              Chat on WhatsApp
            </Link>
            <Link
              href="tel:+2348139262626"
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition inline-flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Call Us Now
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
