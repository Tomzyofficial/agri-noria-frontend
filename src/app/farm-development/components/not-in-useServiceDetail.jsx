import Image from "next/image";
import Link from "next/link";
import { FaLocationDot } from "react-icons/fa6";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { formatLabel } from "@/utils/otherUtils";
import { formatPrice } from "@/utils/formatPrice";

export default async function ServiceDetailsPage({ service, portfolio }) {
  const serviceDetail = {
    id: service.id,
    slug: service.slug,
    title: service.title,
    category: service.category,
    description: service.description,
    location: service.location,
    featured_image: service.featured_image,
    gallery_images: service.gallery_images,
    price_type: service.price_type,

    provider: {
      company_name: service.businesss_name || service.fname + " " + service.lname,
      bio: service.business_desc,
      location: service.address,
    },
  };

  return (
    <main className="bg-gray-50">
      {/* Breadcrumb */}

      <div className="pl-4 border border-gray-200">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Farm Development", href: "/farm-development" },
            { label: serviceDetail.title, href: `/farm-development/services/${serviceDetail.slug}/${serviceDetail.id}`, active: true },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-10">
          <div>
            <Image src={serviceDetail.featured_image} alt={serviceDetail.title} width={1200} height={800} className="rounded-2xl w-full h-70 lg:h-[500px] object-cover" />
          </div>

          <div>
            <span className="inline-flex bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{serviceDetail.category}</span>
            <h1 className="text-4xl font-bold mt-5">{serviceDetail.title}</h1>
            <p className="mt-4 text-gray-600 leading-8">{serviceDetail.description}</p>
            <div className="flex items-center">
              <FaLocationDot size="16" /> {serviceDetail.location}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">Request Quote</button>

              <Link href={`/farm-development/providers/${serviceDetail.provider.id}`} className="border px-6 py-3 rounded-lg font-medium">
                View Provider
              </Link>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mt-20">
          <h2 className="text-2xl font-semibold mb-8">Service Gallery</h2>
          <div className="overflow-x-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">{serviceDetail.gallery_images.length > 0 ? serviceDetail.gallery_images.map((image) => <Image key={image} src={image} alt="" width={200} height={200} className="rounded-xl h-48 object-cover w-full" />) : <p>Not specified</p>}</div>
        </section>

        {/* Service Details */}

        <section className="mt-20">
          <div className="bg-white border border-gray-200 shadow rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-8">Service Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Category</p>

                <p className="font-medium">{serviceDetail.category}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Pricing</p>

                <p className="font-medium">{formatLabel(serviceDetail.price_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Minimum price</p>
                <p className="font-medium">{serviceDetail.min_budget || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maximum price</p>
                <p> {serviceDetail.max_budget || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{serviceDetail.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Scope</p>
                <div className="grid grid-cols-2">{service.scope.length > 0 ? service.scope.map((s) => <p key={s}>{s}</p>) : <p>N/A</p>}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Provider Card */}
        <section className="mt-20 mx-10">
          <div className="bg-white border border-gray-200 shadow rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-8">Service Provider</h2>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">{serviceDetail.provider.company_name.charAt(0).toUpperCase()}</p>
                <div>
                  <h3 className="text-xl font-semibold">{serviceDetail.provider.company_name}</h3>
                  <p className="text-gray-500">{serviceDetail.provider.address || "N/A"}</p>
                </div>
              </div>
              <div>
                <p>Completed project</p>
                <p className="font-semibold text-lg text-center">{portfolio.map((p) => p.total_portfolio)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p>Company Bio</p>
              <p>{serviceDetail.provider.business_desc || "N/A"}</p>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}

        <section className="mt-20">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Previous Projects</h2>

            <Link href={`/farm-development/providers/${serviceDetail.id}/portfolio`} className="text-green-600 font-medium">
              View All Projects
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {portfolio.map((project) => (
              <Link href={`/farm-development/portfolio/${project.id}`} key={project.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition">
                <Image src={project.featured_image} alt={project.title} width={800} height={500} className="h-64 object-cover w-full" />

                <div className="p-5">
                  <h3 className="font-semibold text-lg">{project.title}</h3>

                  <p className="text-gray-500 mt-2">{project.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}

        <section className="mt-24">
          <div className="bg-green-600 rounded-3xl p-10 text-white text-center">
            <h2 className="text-4xl font-bold">Ready to Start Your Project?</h2>

            <p className="mt-4 max-w-2xl mx-auto text-green-50">Contact this service provider and receive a customized quote tailored to your farm development needs.</p>

            <div className="mt-8 flex justify-center gap-4">
              <button className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold">Request Quote</button>

              <Link href={`/farm-development/providers/${serviceDetail.provider.id}/portfolio`} className="border border-white px-6 py-3 rounded-lg font-semibold">
                View Portfolio
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
