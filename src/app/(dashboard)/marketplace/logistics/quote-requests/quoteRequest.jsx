"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/otherUtils";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { quoteRequestDetails } from "../components/QuoteRequestDetails";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card } from "@/components/ui/Card";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
];

const STATUS_BADGES = {
  pending: "bg-yellow-100 text-yellow-800",
  contacted: "bg-green-100 text-green-800",
};

const PAGE_SIZE = 8;

function truncateText(text, limit = 85) {
  if (!text) return "-";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

export function QuoteRequestPage() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/proxy/vendor/logistics/quote-requests",
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch quote requests");
        }

        const data = Array.isArray(payload?.allQuoteRequests)
          ? payload.allQuoteRequests
          : [];

        if (mounted) {
          setRequests(data);
        }
      } catch {
        if (mounted) {
          setError("Unable to load quote requests");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRequests();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizedRequests = useMemo(
    () =>
      requests.map((req) => ({
        quote_request_id: req.quote_request_id,
        full_name: req.full_name || "Unknown customer",
        phone: req.phone || "",
        vehicle_title: req.vehicle_title || "Unknown facility",
        additional_info: req.additional_info || "No message provided",
        status: req.status,
        created_at: req.created_at,
        metadata: req.metadata,
      })),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedRequests.filter((request) => {
      const matchesStatus =
        selectedStatus === "all" || request.status === selectedStatus;

      const matchesSearch =
        !query ||
        [request.full_name, request.vehicle_title, request.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [normalizedRequests, searchTerm, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / PAGE_SIZE),
  );
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const stats = {
    total: normalizedRequests.length,
    pending: normalizedRequests.filter((item) => item.status === "pending")
      .length,
    contacted: normalizedRequests.filter((item) => item.status === "contacted")
      .length,
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Quote Requests</h1>
            <p className="text-sm">Manage all customer storage requests</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by customer or vehicle title"
              className="w-full rounded-full border border-slate bg-slate-50 dark:bg-(--card-dark) px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto] items-start">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="flex gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <>
              <Card className="p-5">
                <p className="text-sm text-slate-500">Total Requests</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {stats.total}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-slate-500">Pending</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {stats.pending}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-slate-500">Contacted</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {stats.contacted}
                </p>
              </Card>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-(--card-dark) p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedStatus === option.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="overflow-x-auto w-full text-left border-collapse rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="">
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                <th className="px-4 py-3 font-medium text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 font-medium text-slate-500">
                  Vehicle
                </th>
                <th className="px-4 py-3 font-medium text-slate-500">
                  Request Note
                </th>
                <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 font-medium text-slate-500">Action</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton />
            ) : (
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No quote requests yet.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((request) => (
                    <tr
                      key={request.quote_request_id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm align-top">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-400">
                          {request.full_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {request.phone || "No contact info"}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-500">
                        {request.vehicle_title}
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-500">
                        {truncateText(request.additional_info)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`rounded-full px-1 py-1 text-xs font-semibold ${STATUS_BADGES[request.status]}`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Button
                          type="button"
                          onClick={() => setSelectedRequest(request)}
                          className="bg-green-100 text-green-900 hover:bg-green-300 px-1 py-1 rounded-lg"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && filteredRequests.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {paginatedRequests.length} of {filteredRequests.length}{" "}
              requests
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 dark:bg-gray-800 p-2">
              <Button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-full p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-full p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(selectedRequest)}
        onClick={() => setSelectedRequest(null)}
      >
        {selectedRequest && quoteRequestDetails(selectedRequest)}
      </Modal>
    </div>
  );
}
