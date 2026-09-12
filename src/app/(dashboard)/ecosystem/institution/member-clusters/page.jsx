"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  Users, Plus, MapPin, Globe, Activity, ShieldCheck, 
  Coins, Loader2, X, CheckCircle2, ChevronRight, UserPlus, FileText, ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function MemberClustersPage() {
  const [clusters, setClusters] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [coopMembers, setCoopMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(null);
  const [showViewMembers, setShowViewMembers] = useState(null);
  const [selectedClusterMembers, setSelectedClusterMembers] = useState([]);
  const [showFundingModal, setShowFundingModal] = useState(null);
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingNotes, setFundingNotes] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    total_hectares: "",
    program_id: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clustersRes, programsRes, membersRes] = await Promise.all([
        fetch("/api/proxy/admin/institution/groups?group_type=MEMBER_CLUSTER"),
        fetch("/api/proxy/programs"),
        fetch("/api/proxy/admin/institution/members"),
      ]);

      if (clustersRes.ok) {
        const json = await clustersRes.json();
        setClusters(json.data || []);
      }
      if (programsRes.ok) {
        const json = await programsRes.json();
        setPrograms(json.data || []);
      }
      if (membersRes.ok) {
        const json = await membersRes.json();
        setCoopMembers(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching member clusters:", err);
      toast.error("Failed to load member clusters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCluster = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Member cluster name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          group_type: "MEMBER_CLUSTER",
          total_hectares: Number(formData.total_hectares) || 0,
          program_id: formData.program_id || null,
        }),
      });

      if (res.ok) {
        toast.success("Member Cluster created successfully!");
        setShowCreateModal(false);
        setFormData({ name: "", region: "", total_hectares: "", program_id: "" });
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

  const handleAssignMember = async (clusterId, farmerId) => {
    try {
      const res = await fetch("/api/proxy/admin/institution/groups/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: clusterId, farmerId, role: "member" }),
      });

      if (res.ok) {
        toast.success("Farmer assigned to member cluster!");
        setShowAddMember(null);
        fetchData();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to assign member");
      }
    } catch {
      toast.error("Failed to assign member");
    }
  };

  const fetchMembers = async (cluster) => {
    setShowViewMembers(cluster);
    try {
      const res = await fetch(`/api/proxy/pipeline/clusters/${cluster.id}/members`);
      const json = await res.json();
      if (json.success) setSelectedClusterMembers(json.data || []);
      else setSelectedClusterMembers([]);
    } catch {
      setSelectedClusterMembers([]);
    }
  };

  const handleRequestFunding = async (e) => {
    e.preventDefault();
    if (!fundingAmount || Number(fundingAmount) <= 0) {
      toast.error("Please enter a valid financing amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/pipeline/input-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cluster_id: showFundingModal.id,
          is_cluster_request: true,
          total_value: Number(fundingAmount),
          input_items: ["Seeds", "Fertilizer", "Mechanization"],
          notes: fundingNotes || "Cooperative Member Cluster Programme Request",
        }),
      });

      if (res.ok) {
        toast.success("Programme & financing request submitted successfully!");
        setShowFundingModal(null);
        setFundingAmount("");
        setFundingNotes("");
        fetchData();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to submit financing request");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900/40 via-gray-950 to-gray-950 p-8 rounded-3xl border border-emerald-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              Cooperative Management
            </span>
          </div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight mt-2">
            Member Cluster Management
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Organize verified members, manage collective acreage, and access institutional financing.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-6 py-6 flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <Plus size={20} /> Create Member Cluster
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Member Clusters</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{clusters.length}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Organized Members</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {clusters.reduce((acc, c) => acc + Number(c.member_count || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Cultivated Area</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {clusters.reduce((acc, c) => acc + Number(c.calculated_hectares || c.total_hectares || 0), 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">ha</span>
                </h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                <Globe size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clusters List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : clusters.length === 0 ? (
        <div className="bg-white dark:bg-gray-950 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-900 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-black text-(--foreground)">No Member Clusters Yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Organize your cooperative farmers into geographical or commodity clusters to request programme financing and inputs.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-3"
          >
            Create Your First Cluster
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="border-none shadow-sm bg-white dark:bg-gray-950 hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full">
                      Member Cluster
                    </span>
                    <h3 className="text-xl font-black text-(--foreground) mt-1">{cluster.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {cluster.region || "Regional Cluster"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Members</span>
                    <p className="text-2xl font-black text-(--foreground)">{cluster.member_count || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Programme</p>
                    <p className="text-xs font-bold text-(--foreground) truncate mt-0.5">
                      {cluster.program_name || "Self-Managed (No Programme)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Hectares</p>
                    <p className="text-xs font-bold text-(--foreground) mt-0.5">
                      {Number(cluster.calculated_hectares || cluster.total_hectares || 0).toLocaleString()} ha
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-900">
                  <Button
                    onClick={() => setShowAddMember(cluster)}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-10 border-gray-200 dark:border-gray-800"
                  >
                    <UserPlus size={14} /> Add Members
                  </Button>
                  <Button
                    onClick={() => fetchMembers(cluster)}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-10 border-gray-200 dark:border-gray-800"
                  >
                    <Users size={14} /> View ({cluster.member_count || 0})
                  </Button>
                  <Button
                    onClick={() => setShowFundingModal(cluster)}
                    className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <Coins size={14} /> Request Financing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Cluster Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Create Member Cluster</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Group your cooperative farmers for collective services</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCluster} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cluster Name</Label>
                <Input
                  placeholder="e.g. Awa North Cassava Cluster"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Region / LGA</Label>
                  <Input
                    placeholder="e.g. Awka North"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Target Area (Hectares)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    value={formData.total_hectares}
                    onChange={(e) => setFormData({ ...formData, total_hectares: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Assign Institutional Programme (Optional)</Label>
                <select
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 text-sm font-semibold"
                >
                  <option value="">-- Standalone Cooperative Cluster --</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.commodity})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Cluster"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Add Members to {showAddMember.name}</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Select from your cooperative's verified farmers</p>
              </div>
              <button onClick={() => setShowAddMember(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {coopMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No registered members found.</p>
                  <Link href="/ecosystem/institution/farmers" className="text-emerald-500 underline text-xs font-bold mt-2 block">
                    Add farmers to cooperative directory first
                  </Link>
                </div>
              ) : (
                coopMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all border border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-sm font-black text-(--foreground)">{member.fname} {member.lname}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {member.commodity || "Cassava"} • {member.farm_size_hectares || 2} ha • {member.phone || "No phone"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignMember(showAddMember.id, member.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Assign
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showViewMembers && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">{showViewMembers.name} — Members</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Assigned farmers in this cluster</p>
              </div>
              <button onClick={() => setShowViewMembers(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {selectedClusterMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No farmers assigned to this cluster yet.</p>
                </div>
              ) : (
                selectedClusterMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-sm font-black text-(--foreground)">{member.fname} {member.lname}</p>
                      <p className="text-xs text-gray-400 font-semibold">{member.phone || member.email}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full">
                      {member.role || "Member"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Programme Financing Modal */}
      {showFundingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Request Programme Financing</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Cluster: {showFundingModal.name}</p>
              </div>
              <button onClick={() => setShowFundingModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestFunding} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
                This request will be routed to the Programme Sponsor (Government/DFI/Bank) for input and capital disbursement directly to this cluster.
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Requested Amount (NGN)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Notes / Input Requirements</Label>
                <Input
                  placeholder="e.g. High-yield cassava stems, mechanized clearing for 80 hectares"
                  value={fundingNotes}
                  onChange={(e) => setFundingNotes(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowFundingModal(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
