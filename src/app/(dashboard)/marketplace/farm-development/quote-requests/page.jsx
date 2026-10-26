"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";
import { Search, MessageSquare, Eye } from "lucide-react";
import { fetcher, formatDate } from "@/utils/otherUtils";
import { Modal } from "@/components/ui/Modal";

const STATUS_BADGES = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  contacted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

export default function FarmDevQuoteRequestsPage() {
  const [search, setSearch] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const { data, error, isLoading } = useSWR("/api/proxy/farm-development/quote-requests", fetcher);

  const quotes = Array.isArray(data?.allQuoteRequests) ? data.allQuoteRequests : [];

  const filteredQuotes = quotes.filter((q) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(q.full_name || "").toLowerCase().includes(term) ||
      String(q.listing_name || "").toLowerCase().includes(term) ||
      String(q.status || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 my-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-(--foreground) tracking-tight">
            Farm Development Quote Requests
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Client inquiries for land clearing, surveying, irrigation, and development services.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" /> All Inquiries ({quotes.length})
          </CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Client or Service..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-rose-500">
              Failed to load quote requests. Please try again later.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Service / Listing</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No quote requests received yet.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((q) => {
                      const st = (q.status || "pending").toLowerCase();
                      const badgeClass = STATUS_BADGES[st] || STATUS_BADGES.pending;

                      return (
                        <tr key={q.quote_request_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                            {q.full_name || "Client"}
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">
                            {q.phone || "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {q.listing_name || "Farm Development Service"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${badgeClass}`}>
                              {st}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                            {formatDate(q.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedQuote(q)}
                              className="text-xs font-semibold rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <Modal
          isOpen={Boolean(selectedQuote)}
          onClick={() => setSelectedQuote(null)}
          title="Quote Request Details"
        >
          <div className="space-y-4 text-sm text-left">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2">
              <p><strong>Client:</strong> {selectedQuote.full_name}</p>
              <p><strong>Phone:</strong> {selectedQuote.phone}</p>
              <p><strong>Service:</strong> {selectedQuote.listing_name}</p>
              <p><strong>Additional Info:</strong> {selectedQuote.additional_info || "None"}</p>
              <p><strong>Status:</strong> <span className="capitalize font-bold">{selectedQuote.status}</span></p>
              <p><strong>Date:</strong> {new Date(selectedQuote.created_at).toLocaleString()}</p>
            </div>
            <Button onClick={() => setSelectedQuote(null)} className="w-full rounded-xl">
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
