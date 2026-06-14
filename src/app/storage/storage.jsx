"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { ErrorUi } from "@/components/ui/Error";
import { Package } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Warehouse,
  Thermometer,
  Shield,
  MapPin,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

export default function StoragePage({ result, error }) {
  const [activeTab, setActiveTab] = useState("cold");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent background scrolling when image modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const storageTypes = [
    {
      id: "cold",
      name: "Cold Storage",
      icon: Thermometer,
      temp: "-5°C to 4°C",
      capacity: "5,000 MT",
      ideal: "Fruits, Vegetables, Dairy",
      features: [
        "Climate Controlled",
        "Humidity Management",
        "24/7 Monitoring",
      ],
    },
    {
      id: "dry",
      name: "Dry Storage",
      icon: Warehouse,
      temp: "15°C to 25°C",
      capacity: "10,000 MT",
      ideal: "Grains, Pulses, Seeds",
      features: ["Pest Control", "Ventilation System", "Fire Safety"],
    },
    {
      id: "controlled",
      name: "Controlled Atmosphere",
      icon: Shield,
      temp: "0°C to 15°C",
      capacity: "3,000 MT",
      ideal: "Long-term Fresh Produce",
      features: [
        "Gas Composition Control",
        "Extended Shelf Life",
        "Quality Preservation",
      ],
    },
  ];

  const locations = [
    { id: 1, city: "Port Harcourt", state: "Rivers", available: 2400 },
    { id: 2, city: "Lagos", state: "Lagos", available: 3200 },
    { id: 3, city: "Kano", state: "Kano", available: 1800 },
    { id: 4, city: "Ibadan", state: "Oyo", available: 2900 },
  ];

  const coreFeatures = [
    {
      icon: Shield,
      title: "Advanced Security",
      description:
        "CCTV surveillance, biometric access, and 24/7 security personnel ensure your produce is safe.",
    },
    {
      icon: Thermometer,
      title: "Temperature Control",
      description:
        "Precision climate management with real-time monitoring and automated alerts.",
    },
    {
      icon: BarChart3,
      title: "Inventory Management",
      description:
        "Digital tracking system with real-time stock levels and automated reporting.",
    },
    {
      icon: Clock,
      title: "Flexible Access",
      description:
        "24/7 facility access with advance scheduling and rapid loading/unloading.",
    },
    {
      icon: MapPin,
      title: "Strategic Locations",
      description:
        "Facilities near major highways and markets for efficient distribution.",
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description:
        "Regular quality checks and compliance with international storage standards.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-[#1b1a19] dark:to-[#1b1a19]">
      {/* Hero Section */}
      <header
        className="bg-gradient-to-r from-green-600 to-green-700 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/storage-1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Premium Storage Facilities
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Preserve your harvest with state-of-the-art storage solutions
              designed for modern agriculture
            </p>
          </div>
        </div>
      </header>

      {/* Storage Types Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-foreground mb-4">
            Our Partners Storage Solutions
          </h2>
          <p className="text-gray-600 dark:text-gray-50 text-lg">
            Choose the perfect storage environment for your agricultural
            products
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {storageTypes?.map((type) => {
            const Icon = type.icon;
            const isActive = activeTab === type.id;
            return (
              <div
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "bg-green-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-800 shadow-md hover:shadow-lg"
                }`}
              >
                <Icon
                  size={48}
                  className={`mb-4 ${isActive ? "text-white" : "text-green-600"}`}
                />
                <h3 className="text-2xl font-bold mb-2">{type.name}</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Temperature:</strong> {type.temp}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {type.capacity}
                  </p>
                  <p>
                    <strong>Ideal For:</strong> {type.ideal}
                  </p>
                  <div className="mt-4 pt-4 border-t border-opacity-20 border-current">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Section */}
      <section className="bg-gray-50 dark:bg-[#1b1a19] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-foreground mb-4">
              Why Choose Our Facilities
            </h2>
            <p className="text-gray-600 dark:text-gray-50 text-lg">
              Industry-leading features that protect and preserve your produce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition"
                >
                  <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location Availability Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Available Locations
          </h2>
          <p className="text-gray-600 text-lg">
            Find storage facilities near you with real-time availability
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((location) => {
            const utilization =
              ((location.total - location.available) / location.total) * 100;
            return (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  selectedLocation === location.id
                    ? "bg-green-600 text-white shadow-xl"
                    : "bg-white text-gray-800 shadow-md hover:shadow-lg"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={24} />
                  <div>
                    <h3 className="text-xl font-bold">{location.city}</h3>
                    <p className="text-sm opacity-80">{location.state} State</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    {/* <div className="flex justify-between text-sm mb-1">
                                 <span>Capacity</span>
                                 <span className="font-semibold">{utilization.toFixed(0)}% Used</span>
                              </div> */}
                    {/* <div className="w-full bg-opacity-20 bg-current rounded-full h-2">
                                 <div
                                    className="bg-current h-2 rounded-full transition-all"
                                    style={{ width: `${utilization}%`, opacity: 1 }}
                                 />
                              </div> */}
                  </div>
                  {/* <div className="pt-3 border-t border-opacity-20 border-current">
                              <p className="text-sm">
                                 <strong>{location.available} MT</strong> available
                              </p>
                              <p className="text-sm">{location.facilities} facilities</p>
                           </div> */}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookings Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Start booking for your storage
            </h2>
            <p className="text-gray-600 text-lg">
              Choose a storage facility that fits your storage needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            {error ? (
              <ErrorUi />
            ) : result.length === 0 ? (
              <div className="flex flex-col items-center justify-center col-span-full py-12">
                <Package className="h-12 w-12 text-(--foreground) mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-center">
                  No ads found{" "}
                </h3>
              </div>
            ) : (
              result?.length > 0 &&
              result?.map((st) => (
                <section key={st.id}>
                  <Link
                    href={`/storage/${st.id}`}
                    className="flex items-center"
                  >
                    <Card className="p-2 text-start">
                      <div>
                        <Image
                          onClick={() => setIsModalOpen(true)}
                          src={st.storage_image}
                          alt={st.storage_name}
                          width={400}
                          height={400}
                          className="w-full h-50 rounded object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {st.storage_name
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </h3>
                      <p className="text-sm">{st.description}</p>
                      <div className="mb-6 flex justify-between items-center rounded p-2 bg-gray-300">
                        <span className="text-lg font-semibold">
                          {formatPrice(st.price, st.country_code, st.currency)}{" "}
                          / Per MT
                        </span>
                      </div>
                    </Card>
                  </Link>
                </section>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Store with Us?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of business owners who trust our facilities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Phone size={20} />
              <span className="font-semibold">+234 803 456 7890</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={20} />
              <span className="font-semibold">storage@greenoria.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 Agro Storage Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
