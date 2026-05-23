'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Package, Truck, CheckCircle, Clock, DollarSign, AlertCircle } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BuyerDashboard() {
  const [buyerId, setBuyerId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Mock buyer ID - in production, this would come from auth
  useEffect(() => {
    setBuyerId('mock-buyer-id');
  }, []);

  // Fetch buyer orders
  const { data: orders, error: ordersError } = useSWR(
    buyerId ? `/api/orders/buyer/${buyerId}` : null,
    fetcher
  );

  // Fetch buyer order statistics
  const { data: stats, error: statsError } = useSWR(
    buyerId ? `/api/orders/buyer/${buyerId}/stats` : null,
    fetcher
  );

  // Fetch buyer payment statistics
  const { data: paymentStats, error: paymentStatsError } = useSWR(
    buyerId ? `/api/payments/payer/${buyerId}/stats` : null,
    fetcher
  );

  const handleConfirmDelivery = async (orderId) => {
    try {
      const response = await fetch('/api/escrow/delivery-confirmation/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Delivery confirmed successfully!');
        setShowDeliveryModal(false);
        setOtpCode('');
        // Refresh orders
        window.location.reload();
      } else {
        alert(data.message || 'Failed to confirm delivery');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Failed to confirm delivery');
    }
  };

  const handleRequestOTP = async (orderId) => {
    try {
      const response = await fetch('/api/escrow/delivery-confirmation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          buyer_id: buyerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`OTP Code: ${data.data.otp_code}\nExpires at: ${new Date(data.data.expires_at).toLocaleString()}`);
        setSelectedOrder(orderId);
        setShowDeliveryModal(true);
      } else {
        alert(data.message || 'Failed to generate OTP');
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      alert('Failed to generate OTP');
    }
  };

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

  if (!buyerId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading buyer information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your orders and track deliveries</p>
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
              <p className="text-gray-500 text-sm">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.pending_orders || 0) + (stats?.paid_orders || 0) + (stats?.processing_orders || 0)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.in_transit_orders || 0}</p>
            </div>
            <Truck className="w-8 h-8 text-cyan-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats?.total_spent ? stats.total_spent.toLocaleString() : '0'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Orders</h2>
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
                      Seller
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
                        {order.seller_fname} {order.seller_lname}
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
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleRequestOTP(order.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Confirm Delivery
                          </button>
                        )}
                        {order.status === 'in_transit' && (
                          <button className="text-blue-600 hover:text-blue-900 font-medium">
                            Track Shipment
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

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delivery</h3>
            <p className="text-gray-600 mb-4">Enter the OTP code sent to you to confirm delivery.</p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter OTP code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setOtpCode('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelivery(selectedOrder)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
