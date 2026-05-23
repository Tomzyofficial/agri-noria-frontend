"use client";

import { useEffect, useState } from "react";
import {
  X,
  User,
  Store,
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import {
  logisticsFetcher,
  formatStatusLabel,
  getStatusBadgeClass,
} from "./BuyerOrderUtils";

export function BuyerOrderDetailModal({ orderId, open, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !orderId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await logisticsFetcher(
          `/api/proxy/buyer/orders/${orderId}`,
        );
        setDetail(data.data);
      } catch (err) {
        setError(err.message || "Failed to load order");
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, orderId]);

  if (!open) return null;

  const metadata = detail?.metadata || {};
  const buyerInfo = metadata.buyer_info || {};
  const vendorInfo = metadata.vendor_info || {};
  const logisticsInfo = metadata.logistics_provider || {};
  const itemBreakdown = Array.isArray(metadata.item_breakdown)
    ? metadata.item_breakdown
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-(--card-dark)">
          <h2 className="text-lg font-semibold">Order details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <p className="text-center text-gray-500 py-8">Loading order...</p>
          )}
          {error && <p className="text-center text-red-600 py-8">{error}</p>}

          {detail && !loading && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm text-gray-600">
                  {detail.id}
                </span>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(detail.status)}`}
                >
                  {formatStatusLabel(detail.status)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <section className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Buyer
                  </h3>
                  <p className="text-sm">
                    <span className="text-gray-500">Name: </span>
                    {buyerInfo.fname || detail.buyer_name || "—"}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {buyerInfo.phone || "—"}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {buyerInfo.email || detail.buyer_email || "—"}
                  </p>
                  <p className="text-sm flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>
                      <span className="text-gray-500">Delivery: </span>
                      {detail.delivery_address || "—"}
                    </span>
                  </p>
                </section>

                <section className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Seller (pickup)
                  </h3>
                  <p className="text-sm">
                    <span className="text-gray-500">Name: </span>
                    {[
                      vendorInfo.seller_fname || detail.seller_fname,
                      vendorInfo.seller_lname || detail.seller_lname,
                    ]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {vendorInfo.seller_phone || detail.seller_phone || "—"}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {vendorInfo.seller_email || detail.seller_email || "—"}
                  </p>
                  <p className="text-sm flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>
                      <span className="text-gray-500">Pickup: </span>
                      {itemBreakdown?.[0]?.listing_location ||
                        vendorInfo.pickup_address ||
                        "—"}
                    </span>
                  </p>
                </section>
              </div>

              <section className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Logistics Partner
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Driver: </span>
                      {[
                        logisticsInfo.logistics_fname,
                        logisticsInfo.logistics_lname,
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {logisticsInfo.logistics_partner_phone || "—"}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {logisticsInfo.logistics_provider_email || "—"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Vehicle: </span>
                      {logisticsInfo.vehicle_title ||
                        logisticsInfo.vehicle_type ||
                        "—"}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Rate: </span>₦
                      {Number(logisticsInfo.rate_amount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Status: </span>
                      <span className="capitalize font-medium">
                        {logisticsInfo.status || "pending"}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4" />
                  Products ({itemBreakdown.length})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-left">Qty</th>
                        <th className="px-3 py-2 text-left">Unit price</th>
                        <th className="px-3 py-2 text-left">Line total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {itemBreakdown.length > 0 ? (
                        itemBreakdown.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                {item.listing_image && (
                                  <img
                                    src={item.listing_image}
                                    alt={item.listing_name || "Product"}
                                    width={40}
                                    height={40}
                                    className="rounded object-cover w-10 h-10"
                                  />
                                )}
                                <span>{item.listing_name || "—"}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">{item.quantity}</td>
                            <td className="px-3 py-3">
                              ₦{Number(item.unit_price || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-3">
                              ₦
                              {(
                                Number(item.unit_price || 0) *
                                Number(item.quantity || 0)
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-3 py-4 text-center text-gray-500"
                          >
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="flex justify-end gap-2 text-sm text-gray-600 pt-4 border-t">
                <span>
                  Subtotal: ₦
                  {Number(
                    metadata.amount_breakdown?.subtotal || 0,
                  ).toLocaleString()}
                </span>
                <span>·</span>
                <span>
                  Delivery fee: ₦
                  {Number(
                    metadata.amount_breakdown?.delivery_fee ||
                      detail.delivery_fee ||
                      0,
                  ).toLocaleString()}
                </span>
                <span>·</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Total: ₦
                  {Number(
                    metadata.amount_breakdown?.total_amount ||
                      detail.total_amount ||
                      0,
                  ).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
