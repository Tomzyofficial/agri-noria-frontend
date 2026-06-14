"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Sprout, Plus, Search, MapPin, Truck, ShieldCheck, Box, X } from "lucide-react";

export default function FarmerHarvestPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produces, setProduces] = useState([
    { crop: "Maize", quantity_mt: "", location: "" }
  ]);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/batches");
      const data = await res.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleDeclare = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/declare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produces }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Harvest declared successfully!");
        setIsModalOpen(false);
        setProduces([{ crop: "Maize", quantity_mt: "", location: "" }]);
        fetchBatches();
      } else {
        toast.error(data.error || "Failed to declare harvest");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const requestStorage = async (batch_id) => {
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id, storage_duration_days: 30, storage_fee: 50000 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Storage requested! Risk Request sent to Insurers.");
        fetchBatches();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to request storage");
    }
  };

  const requestLogistics = async (batch_id) => {
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id, destination: "Designated Warehouse/Buyer", logistics_fee: 15000 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Logistics requested successfully!");
        fetchBatches();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to request logistics");
    }
  };

  const acceptInsurance = async (policy_id) => {
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/insurance/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy_id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Insurance Quote accepted! Premium deducted from operations wallet.");
        fetchBatches();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to accept insurance");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-6 h-6 text-(--greenish-color)" />
            Harvest & Operations
          </h1>
          <p className="text-gray-500">Manage your harvest declarations, storage, and insurance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-(--greenish-color) text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Declare Harvest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Box className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Total Batches</h3>
          </div>
          <p className="text-3xl font-bold">{batches.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Truck className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">In Storage</h3>
          </div>
          <p className="text-3xl font-bold">{batches.filter(b => b.status === 'stored').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Insured Batches</h3>
          </div>
          <p className="text-3xl font-bold">{batches.filter(b => b.insurance_status === 'active').length}</p>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : batches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border">
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No Harvests Declared</h3>
            <p className="text-gray-500">Declare your harvest to begin the operations pipeline.</p>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.batch_id} className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{batch.batch_number}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {batch.status.replace("_", " ").toUpperCase()}
                    </span>
                    {batch.insurance_status === 'active' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Insured
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1"><Sprout className="w-4 h-4" /> {batch.crop}</span>
                    <span className="flex items-center gap-1"><Box className="w-4 h-4" /> {batch.quantity_mt} MT</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {batch.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {batch.status === 'harvest_declared' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => requestStorage(batch.batch_id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                      >
                        Request Storage
                      </button>
                      <button
                        onClick={() => requestLogistics(batch.batch_id)}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
                      >
                        Request Logistics
                      </button>
                    </div>
                  )}
                  {batch.status === 'stored' && batch.insurance_status === 'quoted' && (
                    <button
                      onClick={() => acceptInsurance(batch.policy_id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
                    >
                      Accept Insurance Quote
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Operations Wallet Balance: ₦{Number(batch.wallet_balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Declare Harvest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Declare Harvest</h2>
            <form onSubmit={handleDeclare} className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                {produces.map((prod, index) => (
                  <div key={index} className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 relative">
                    {produces.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newProduces = [...produces];
                          newProduces.splice(index, 1);
                          setProduces(newProduces);
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <h4 className="text-sm font-bold text-gray-500 mb-3">Item #{index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Crop</label>
                        <select 
                          className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                          value={prod.crop}
                          onChange={e => {
                            const newProduces = [...produces];
                            newProduces[index].crop = e.target.value;
                            setProduces(newProduces);
                          }}
                          required
                        >
                          <option value="Maize">Maize</option>
                          <option value="Rice">Rice</option>
                          <option value="Soybeans">Soybeans</option>
                          <option value="Wheat">Wheat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity (Metric Tons)</label>
                        <input 
                          type="number"
                          className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                          value={prod.quantity_mt}
                          onChange={e => {
                            const newProduces = [...produces];
                            newProduces[index].quantity_mt = e.target.value;
                            setProduces(newProduces);
                          }}
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input 
                          type="text"
                          className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                          value={prod.location}
                          onChange={e => {
                            const newProduces = [...produces];
                            newProduces[index].location = e.target.value;
                            setProduces(newProduces);
                          }}
                          required
                          placeholder="e.g. Kano, Nigeria"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => setProduces([...produces, { crop: "Maize", quantity_mt: "", location: "" }])}
                className="text-(--greenish-color) font-semibold flex items-center gap-1 text-sm hover:underline"
              >
                <Plus className="w-4 h-4" /> Add another crop
              </button>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-(--greenish-color) text-white font-bold rounded-lg hover:opacity-90"
                >
                  Declare Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
