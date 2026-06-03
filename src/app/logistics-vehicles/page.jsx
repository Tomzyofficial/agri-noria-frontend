import Link from "next/link";
import { formatLabel } from "@/utils/otherUtils";
import {
  CheckCircle2,
  MapPin,
  PackageCheck,
  Route,
  Truck,
  Wrench,
} from "lucide-react";
import { Footer } from "@/components/ui/Footer";
import NavBar from "@/components/ui/NavBar/NavBar";
import { getListedLogisticsVehicles } from "@/_lib/data";
import { formatPrice } from "@/utils/formatPrice";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

export const metadata = {
  title: "Logistics Vehicles",
  description:
    "Browse available agricultural logistics vehicles for produce delivery, cold-chain movement, and farm supply transport.",
};

const statusStyles = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  in_transit: "border-amber-200 bg-amber-50 text-amber-700",
  maintenance: "border-slate-200 bg-slate-100 text-slate-600",
};

function getImage(vehicle) {
  return Array.isArray(vehicle.images) && vehicle.images.length > 0
    ? vehicle.images[0]
    : null;
}

function VehicleImage({ vehicle }) {
  const image = getImage(vehicle);

  if (image) {
    return (
      <Image
        width={150}
        height={150}
        src={image}
        alt={vehicle.title || "Logistics vehicle"}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
      <Truck className="h-14 w-14" />
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const regions = Array.isArray(vehicle.operating_regions)
    ? vehicle.operating_regions
    : [];
  const status = vehicle.status || "available";
  const statusClass = statusStyles[status] || statusStyles.maintenance;

  return (
    <Link href={`/logistics-vehicles/${vehicle.id}`}>
      <Card className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
          <VehicleImage vehicle={vehicle} />
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {formatLabel(vehicle.vehicle_type)}
              </p>
              <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-950">
                {vehicle.title}
              </h2>
            </div>
            <span
              className={`shrink-0 rounded border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
            >
              {formatLabel(status)}
            </span>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{vehicle.base_location}</span>
            </p>
            <p className="flex items-start gap-2">
              <Route className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {regions.length > 0
                  ? regions.slice(0, 3).join(", ")
                  : "Operating regions not listed"}
                {regions.length > 3 ? ` +${regions.length - 3} more` : ""}
              </span>
            </p>
          </div>

          <div className="flex items-end justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-500">
                {formatLabel(vehicle.pricing_model)}
              </p>
              <p className="text-lg font-bold text-slate-950">
                {formatPrice(
                  vehicle.rate_amount,
                  vehicle.country_code,
                  vehicle.currency,
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <Truck className="mx-auto h-12 w-12 text-slate-400" />
      <h2 className="mt-4 text-lg font-semibold text-slate-950">
        No vehicles listed yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Logistics partners have not published vehicles to the marketplace yet.
        Check back later for available transport capacity.
      </p>
    </section>
  );
}

export default async function LogisticsVehiclesPage() {
  const result = await getListedLogisticsVehicles();
  const vehicles = Array.isArray(result) ? result : [];
  const hasError = result?.error;
  const availableCount = vehicles.filter(
    (vehicle) => vehicle.status === "available" || !vehicle.status,
  ).length;
  const regions = new Set(
    vehicles.flatMap((vehicle) =>
      Array.isArray(vehicle.operating_regions) ? vehicle.operating_regions : [],
    ),
  );
  return (
    <>
      <NavBar />
      <main className="">
        <section>
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                <PackageCheck className="h-4 w-4" />
                Agricultural logistics marketplace
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-foreground">
                Move farm produce with verified logistics vehicles.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Browse fleet capacity, cargo type, service regions, and pricing
                from logistics partners listed on Agri-Noria.
              </p>
            </div>

            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between rounded bg-white p-4">
                <span className="text-sm text-slate-500">Listed vehicles</span>
                <strong className="text-2xl text-slate-950">
                  {vehicles.length}
                </strong>
              </div>
              <div className="flex items-center justify-between rounded bg-white p-4">
                <span className="text-sm text-slate-500">Available now</span>
                <strong className="text-2xl text-emerald-700">
                  {availableCount}
                </strong>
              </div>
              <div className="flex items-center justify-between rounded bg-white p-4">
                <span className="text-sm text-slate-500">Service regions</span>
                <strong className="text-2xl text-slate-950">
                  {regions.size}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Listed vehicles
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Capacity and pricing are supplied by each logistics partner.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Available vehicles first
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5">
                <Wrench className="h-3.5 w-3.5 text-slate-500" />
                Status-aware listings
              </span>
            </div>
          </div>

          {hasError ? (
            <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Unable to load logistics vehicles right now. Please try again
              shortly.
            </section>
          ) : vehicles.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
