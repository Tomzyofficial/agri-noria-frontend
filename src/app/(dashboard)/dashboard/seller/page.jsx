'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Package, DollarSign, TrendingUp, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SellerDashboard() {
  const [sellerId, setSellerId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock seller ID - in production, this would come from auth
  useEffect(() => {
    setSellerId('mock-seller-id');
  }, []);

  // Fetch seller orders
  const { data: orders, error: ordersError } = useSWR(
    sellerId ? `/api/orders/seller/${sellerId}` : null,
    fetcher
  );

  // Fetch seller order statistics
  const { data: stats, error: statsError } = useSWR(
    sellerId ? `/api/orders/seller/${sellerId}/stats` : null,
    fetcher
  );

  // Fetch seller payment statistics
  const { data: paymentStats, error: paymentStatsError } = useSWR(
    sellerId ? `/api/payments/seller/${sellerId}/stats` : null,
    fetcher
  );

  // Fetch seller escrow statistics
  const { data: escrowStats, error: escrowStatsError } = useSWR(
    sellerId ? `/api/escrow/seller/${sellerId}/stats` : null,
    fetcher
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      paid: <DollarSign className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      in_transit: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />,
      refunded: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Package className="w-4 h-4" />;
  };

  if (!sellerId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading seller information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your orders and track earnings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_orders || 0}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pending_orders || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats?.total_revenue ? stats.total_revenue.toLocaleString() : '0'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Released Funds</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{escrowStats?.total_released_amount ? escrowStats.total_released_amount.toLocaleString() : '0'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Escrow Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escrow Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Held in Escrow</p>
                <p className="text-xl font-bold text-yellow-700">
                  ₦{paymentStats?.held_escrow ? paymentStats.held_escrow.toLocaleString() : '0'}
                </p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Released to Wallet</p>
                <p className="text-xl font-bold text-green-700">
                  ₦{paymentStats?.released_escrow ? paymentStats.released_escrow.toLocaleString() : '0'}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Pending Release</p>
                <p className="text-xl font-bold text-blue-700">
                  ₦{paymentStats?.pending_release ? paymentStats.pending_release.toLocaleString() : '0'}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Incoming Orders</h2>
        </div>
        <div className="px-6 py-4">
          {ordersError ? (
            <div className="text-red-500">Failed to load orders</div>
          ) : !orders ? (
            <div className="text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-500">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.buyer_name || order.buyer_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{order.total_amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.status === 'paid' && (
                          <button className="text-blue-600 hover:text-blue-900 font-medium">
                            Process Order
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button className="text-blue-600 hover:text-blue-900 font-medium">
                            Arrange Pickup
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
