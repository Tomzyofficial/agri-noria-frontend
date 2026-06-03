"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaTimes,
  FaUserTie,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import InputRequestModal from "@/app/components/dashboard/InputRequestModal";

export default function ClusterManagementPage() {
  const [clusters, setClusters] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(null);
  const [showMembers, setShowMembers] = useState(null);
  const [eligibleFarmers, setEligibleFarmers] = useState([]);
  const [clusterMembers, setClusterMembers] = useState([]);
  const [isRequestingFunding, setIsRequestingFunding] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectingForRequest, setSelectingForRequest] = useState(null);
  const [selectedClusterFunds, setSelectedClusterFunds] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    gps_latitude: 0,
    gps_longitude: 0,
    program_id: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clustersRes, programsRes] = await Promise.all([
        fetch("/api/proxy/pipeline/clusters"),
        fetch("/api/proxy/programs"),
      ]);

      if (clustersRes.ok) {
        const data = await clustersRes.json();
        setClusters(data?.data || []);
      }
      if (programsRes.ok) {
        const data = await programsRes.json();
        setPrograms(data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching aggregator clusters:", err);
      toast.error("Failed to load clusters or programs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchClusterMembers = async (cluster) => {
    try {
      const res = await fetch(`/api/proxy/pipeline/clusters/${cluster.id}/members`);
      const json = await res.json();
      if (json.success) setClusterMembers(json.data || []);
      else toast.error(json.error || "Failed to fetch members");
    } catch {
      toast.error("Failed to fetch members");
    }
  };

  const fetchEligibleFarmers = async (programId, clusterId) => {
    try {
      const params = new URLSearchParams({
        cluster_id: clusterId,
        program_id: programId || "",
      });
      const res = await fetch(`/api/proxy/pipeline/clusters/eligible-farmers?${params}`);
      const json = await res.json();
      if (json.success) setEligibleFarmers(json.data || []);
      else toast.error(json.error || "Failed to fetch eligible farmers");
    } catch {
      toast.error("Failed to fetch eligible farmers");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Cluster name is required");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        ...formData,
        gps_latitude: Number(formData.gps_latitude) || 0,
        gps_longitude: Number(formData.gps_longitude) || 0,
        program_id: formData.program_id || null,
      };

      const res = await fetch("/api/proxy/pipeline/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Cluster created successfully!");
        setShowModal(false);
        setFormData({
          name: "",
          region: "",
          gps_latitude: 0,
          gps_longitude: 0,
          program_id: "",
        });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create cluster");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignFarmer = async (clusterId, farmerId) => {
    try {
      const res = await fetch("/api/proxy/pipeline/clusters/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cluster_id: clusterId, farmer_id: farmerId }),
      });

      if (res.ok) {
        toast.success("Farmer assigned to cluster successfully!");
        setShowAddMember(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Assignment failed");
      }
    } catch {
      toast.error("Assignment network error");
    }
  };

  const handleRemoveFarmer = async (clusterId, farmerId) => {
    try {
      const res = await fetch(
        `/api/proxy/pipeline/clusters/${clusterId}/members/${farmerId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        toast.success("Farmer removed from cluster");
        if (showMembers) fetchClusterMembers(showMembers);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Removal failed");
      }
    } catch {
      toast.error("Removal network error");
    }
  };

  const handleRequestFunding = async (clusterId) => {
    setIsRequestingFunding(clusterId);
    try {
      const res = await fetch("/api/proxy/pipeline/inputs/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cluster_id: clusterId,
          input_items: [],
          is_cluster_request: true,
          requester_type: "aggregator",
        }),
      });

      if (res.ok) {
        toast.success("Funding request submitted to Finance!");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to request funding");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsRequestingFunding(null);
    }
  };

  const getClusterButtonState = (cluster) => {
    if (cluster.request_status === "approved" && cluster.request_items_status !== "pending") {
      return "completed";
    }
    if (cluster.request_status === "items_selected") return "items_selected";
    if (cluster.request_funds_status === "approved" && cluster.request_items_status === "pending") {
      return "select_inputs";
    }
    if (cluster.has_pending_request) return "awaiting_approval";
    return "request_funding";
  };

  if (loading && !clusters.length) {
    return <div className="p-8 text-center animate-pulse">Loading clusters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
            Cluster Management
          </h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
            Create clusters, assign farmers, and request input funding
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <FaPlus /> Create New Cluster
        </Button>
      </div>

      {clusters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl border border-gray-100 dark:border-gray-700 text-center">
          <FaMapMarkerAlt className="text-5xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold">No Clusters Defined</h3>
          <p className="text-gray-500 mb-6">
            Clusters help with efficient input distribution and monitoring.
          </p>
          <Button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white">
            Create First Cluster
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((cluster) => {
            const btnState = getClusterButtonState(cluster);
            const lockedBalance = Number(cluster.wallet_locked_balance || 0);

            return (
              <Card
                key={cluster.id}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6 flex flex-col h-full justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl">
                        <FaUsers className="text-2xl text-emerald-600" />
                      </div>
                      <div className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {btnState === "select_inputs"
                          ? "Awaiting Selection"
                          : btnState === "items_selected"
                            ? "Awaiting Distribution"
                            : btnState === "awaiting_approval"
                              ? "Funding Requested"
                              : btnState === "completed"
                                ? "Active"
                                : "No Request"}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{cluster.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{cluster.region || "No region"}</p>
                    <p className="text-xs text-gray-400 font-medium">
                      Program: {cluster.program_name || "-"}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-sm text-gray-500 font-semibold">
                      <span>{cluster.farmer_count || 0} Farmers Assigned</span>
                      <span>{Number(cluster.total_hectares || 0).toFixed(2)} Ha</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="flex items-center gap-1 text-gray-500">
                        <FaWallet size={12} /> Locked Funds
                      </span>
                      <span className="text-emerald-600 font-bold">
                        NGN {lockedBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          setShowAddMember(cluster.id);
                          fetchEligibleFarmers(cluster.program_id, cluster.id);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition"
                      >
                        Add Farmers
                      </Button>
                      <Button
                        onClick={() => {
                          setShowMembers(cluster);
                          fetchClusterMembers(cluster);
                        }}
                        variant="ghost"
                        className="text-emerald-600 border border-emerald-200 hover:bg-emerald-50 font-bold text-xs py-2 rounded-xl transition"
                      >
                        Members
                      </Button>
                    </div>

                    {btnState === "select_inputs" ? (
                      <Button
                        onClick={() => {
                          setSelectingForRequest(cluster.pending_request_id);
                          setSelectedClusterFunds(cluster.wallet_locked_balance || 0);
                          setShowRequestModal(true);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl"
                      >
                        Select Inputs
                      </Button>
                    ) : btnState === "items_selected" ? (
                      <Button disabled className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl opacity-80">
                        Items Selected
                      </Button>
                    ) : btnState === "awaiting_approval" ? (
                      <Button disabled className="w-full bg-gray-400 text-white font-bold text-xs py-2.5 rounded-xl opacity-60">
                        Funding Awaiting Approval
                      </Button>
                    ) : btnState === "completed" ? (
                      <Button disabled className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl opacity-80">
                        Distribution Processing
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRequestFunding(cluster.id)}
                        disabled={isRequestingFunding === cluster.id}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl"
                      >
                        {isRequestingFunding === cluster.id ? "Processing..." : "Request Funding"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <InputRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectingForRequest(null);
          setSelectedClusterFunds(null);
          fetchData();
        }}
        requestId={selectingForRequest}
        isClusterRequest={true}
        lockedFunds={selectedClusterFunds}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md rounded-3xl shadow-2xl">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-black">Create Cluster</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Cluster Name</Label>
                  <Input
                    placeholder="e.g. North Maize Cluster A"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Program</Label>
                  <select
                    value={formData.program_id}
                    onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 font-bold text-sm"
                  >
                    <option value="">No Program (Independent)</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input
                    placeholder="e.g. Kaduna, Nigeria"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.gps_latitude}
                      onChange={(e) => setFormData({ ...formData, gps_latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.gps_longitude}
                      onChange={(e) => setFormData({ ...formData, gps_longitude: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold"
                >
                  {submitting ? "Creating..." : "Create Cluster"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black">Recruit Farmers</CardTitle>
              <button onClick={() => setShowAddMember(null)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
              {eligibleFarmers.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserTie className="text-4xl text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">No eligible farmers found</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {eligibleFarmers.map((farmer) => (
                    <div
                      key={farmer.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {farmer.fname} {farmer.lname}
                        </p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          {farmer.farm_size_hectares || 0} Ha - {farmer.commodity || "No commodity"}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAssignFarmer(showAddMember, farmer.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl"
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showMembers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black">{showMembers.name}</CardTitle>
              <button onClick={() => setShowMembers(null)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
              {clusterMembers.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserTie className="text-4xl text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">No members assigned yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {clusterMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {member.fname} {member.lname}
                        </p>
                        <p className="text-[10px] text-gray-400 font-black uppercase">
                          {member.farm_size_hectares || 0} Ha - {member.commodity || "No commodity"}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRemoveFarmer(showMembers.id, member.farmer_id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl border border-red-100"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
