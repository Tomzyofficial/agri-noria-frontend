"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Box, Package, FileText, CheckCircle } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function StorageDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_capacity: 0,
    active_tickets: 0,
    stored_inventory: 0,
    expected_arrivals: 0
  });
  const [tickets, setTickets] = useState([]);

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/storage/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/storage/tickets")
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);
    } catch (error) {
      console.error("Error fetching storage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptTicket = async (ticketId) => {
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/storage/tickets/${ticketId}/accept`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error("Error accepting ticket:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-(--greenish-color)" />
      </div>
    );
  }

  const utilization = stats.total_capacity > 0 ? ((stats.stored_inventory / stats.total_capacity) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Storage Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Manage warehouse capacity, active storage tickets, and incoming batches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Capacity
            </CardTitle>
            <Box className="w-5 h-5 text-(--greenish-color)" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{Number(stats.total_capacity).toLocaleString()} MT</div>
            <p className="text-xs font-medium text-green-600 mt-1">{utilization}% Utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Tickets
            </CardTitle>
            <FileText className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.active_tickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Expected Arrivals
            </CardTitle>
            <Package className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.expected_arrivals}</div>
            <p className="text-xs font-medium text-orange-600 mt-1">Pending Check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Stored Inventory
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{Number(stats.stored_inventory).toLocaleString()} MT</div>
            <p className="text-xs font-medium text-gray-500 mt-1">Currently verified</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-(--background) border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-(--foreground)">Storage Requests & Active Tickets</h2>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No storage tickets currently assigned to your facility.</p>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{ticket.ticket_number}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${ticket.status === 'reserved' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {ticket.entity_name} ({ticket.entity_role})
                  </p>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Produce</p>
                    <p className="font-semibold">{ticket.crop}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Volume</p>
                    <p className="font-semibold">{ticket.reserved_volume_mt} MT</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Duration</p>
                    <p className="font-semibold">{ticket.storage_duration_days} Days</p>
                  </div>
                </div>

                <div>
                  {ticket.status === 'reserved' && (
                    <button 
                      onClick={() => handleAcceptTicket(ticket.ticket_id)}
                      className="px-4 py-2 bg-(--greenish-color) text-white font-bold rounded-lg hover:opacity-90 transition"
                    >
                      Verify & Accept Batch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
