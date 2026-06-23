import {
  Clock,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

export const ORDER_STATUS_CONFIG = [
  {
    key: "pending_orders",
    label: "Pending",
    status: "pending",
    icon: Clock,
    cardClass: "text-yellow-700",
    iconClass: "text-yellow-500",
  },
  {
    key: "paid_orders",
    label: "Paid",
    status: "paid",
    icon: DollarSign,
    cardClass: "text-blue-700",
    iconClass: "text-blue-500",
  },
  {
    key: "processing_orders",
    label: "Processing",
    status: "processing",
    icon: Package,
    cardClass: "text-purple-700",
    iconClass: "text-purple-500",
  },
  {
    key: "in_transit_orders",
    label: "In transit",
    status: "in_transit",
    icon: Truck,
    cardClass: "text-cyan-700",
    iconClass: "text-cyan-500",
  },
  {
    key: "delivered_orders",
    label: "Delivered",
    status: "delivered",
    icon: CheckCircle,
    cardClass: "text-green-700",
    iconClass: "text-green-500",
  },
  {
    key: "completed_orders",
    label: "Completed",
    status: "completed",
    icon: CheckCircle,
    cardClass: "text-emerald-700",
    iconClass: "text-emerald-500",
  },
  {
    key: "declined_orders",
    label: "Declined",
    status: "declined",
    icon: XCircle,
    cardClass: "text-orange-700",
    iconClass: "text-orange-500",
  },
  //   {
  //     key: "cancelled_orders",
  //     label: "Cancelled",
  //     status: "cancelled",
  //     icon: XCircle,
  //     cardClass: "text-red-700",
  //     iconClass: "text-red-500",
  //   },
  {
    key: "refunded_orders",
    label: "Refunded",
    status: "refunded",
    icon: AlertCircle,
    cardClass: "text-gray-700",
    iconClass: "text-gray-500",
  },
];

export function getStatusBadgeClass(status) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    in_transit: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
    declined: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function formatStatusLabel(status) {
  return status?.replace(/_/g, " ") ?? "";
}
