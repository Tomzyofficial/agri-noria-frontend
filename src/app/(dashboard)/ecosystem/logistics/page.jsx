"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Truck, MapPin, CheckCircle, Clock } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function LogisticsDashboard() {
  const [stats, setStats] = useState({
    active_transit: 0,
    pending_dispatches: 0,
    total_volume_moved: 0,
    success_rate: 0
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/logistics/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/logistics/tickets")
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load logistics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptTicket = async (ticket_id) => {
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/logistics/tickets/${ticket_id}/accept`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Fleet Dispatched & Fee Deducted!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to dispatch fleet");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-(--greenish-color)" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Logistics Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Track transit status, fleet availability, and dispatch requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Transit
            </CardTitle>
            <Truck className="w-5 h-5 text-(--greenish-color)" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.active_transit}</div>
            <p className="text-xs font-medium text-green-600 mt-1">Vehicles En Route</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Pending Dispatches
            </CardTitle>
            <Clock className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.pending_dispatches}</div>
            <p className="text-xs font-medium text-orange-600 mt-1">Requires assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Volume Moved
            </CardTitle>
            <MapPin className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.total_volume_moved} MT</div>
            <p className="text-xs font-medium text-blue-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Successful Deliveries
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.success_rate}%</div>
            <p className="text-xs font-medium text-gray-500 mt-1">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Pending Dispatches & Active Transit</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No logistics tickets available.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                  <th className="p-4 font-bold text-sm text-gray-600">Ticket #</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Entity Details</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Route & Cargo</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Status</th>
                  <th className="p-4 font-bold text-sm text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="p-4 font-mono text-sm">{ticket.ticket_number}</td>
                    <td className="p-4">
                      <p className="font-bold">{ticket.entity_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{ticket.entity_role?.replace('_', ' ')}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-sm">{ticket.crop} ({ticket.quantity_mt} MT)</p>
                      <p className="text-xs text-gray-500">From: {ticket.origin} &rarr; To: {ticket.destination}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        ticket.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {ticket.status === 'pending' && (
                        <button
                          onClick={() => acceptTicket(ticket.ticket_id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700"
                        >
                          Accept & Dispatch Fleet
                        </button>
                      )}
                      {ticket.status === 'in_transit' && (
                        <span className="text-gray-500 text-sm italic">In Transit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
