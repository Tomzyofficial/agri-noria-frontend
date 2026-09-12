"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  Users, Plus, MapPin, Globe, Activity, ShieldCheck, 
  Coins, Loader2, X, CheckCircle2, ChevronRight, UserPlus, Building, ArrowRight, Layers
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ProducerGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewMembers, setShowViewMembers] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [availableFarmers, setAvailableFarmers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [assigningId, setAssigningId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    total_hectares: "",
    program_id: "",
    commodity: "Cassava",
    season: "2026 Wet Season",
    lead_cooperative: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsRes, programsRes, coopsRes] = await Promise.all([
        fetch("/api/proxy/admin/institution/groups?group_type=PRODUCER_GROUP"),
        fetch("/api/proxy/programs"),
        fetch("/api/proxy/admin/institution/affiliations"),
      ]);

      if (groupsRes.ok) {
        const json = await groupsRes.json();
        setGroups(json.data || []);
      }
      if (programsRes.ok) {
        const json = await programsRes.json();
        setPrograms(json.data || []);
      }
      if (coopsRes.ok) {
        const json = await coopsRes.json();
        setCooperatives(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching producer groups:", err);
      toast.error("Failed to load producer groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Producer group name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          region: formData.region,
          group_type: "PRODUCER_GROUP",
          total_hectares: Number(formData.total_hectares) || 0,
          program_id: formData.program_id || null,
          metadata: {
            commodity: formData.commodity,
            season: formData.season,
            lead_cooperative: formData.lead_cooperative,
          },
        }),
      });

      if (res.ok) {
        toast.success("Producer Group created successfully!");
        setShowCreateModal(false);
        setFormData({
          name: "",
          region: "",
          total_hectares: "",
          program_id: "",
          commodity: "Cassava",
          season: "2026 Wet Season",
          lead_cooperative: "",
        });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create producer group");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMembers = async (group) => {
    setShowViewMembers(group);
    setShowAddMember(false);
    setMemberSearch("");
    try {
      const [membersRes, farmersRes] = await Promise.all([
        fetch(`/api/proxy/pipeline/clusters/${group.id}/members`),
        fetch("/api/proxy/admin/institution/members"),
      ]);
      const membersJson = await membersRes.json();
      if (membersJson.success) setSelectedGroupMembers(membersJson.data || []);
      else setSelectedGroupMembers([]);

      const farmersJson = await farmersRes.json();
      if (farmersJson.success) setAvailableFarmers(farmersJson.data || []);
      else setAvailableFarmers([]);
    } catch {
      setSelectedGroupMembers([]);
      setAvailableFarmers([]);
    }
  };

  const handleAssignFarmer = async (farmerId) => {
    if (!showViewMembers) return;
    setAssigningId(farmerId);
    try {
      const res = await fetch("/api/proxy/admin/institution/groups/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: showViewMembers.id, farmerId, role: "PRODUCER" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Farmer added to group!");
        // Refresh members
        fetchMembers(showViewMembers);
        fetchData();
      } else {
        toast.error(json.error || "Failed to add farmer");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-950 to-gray-950 p-8 rounded-3xl border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
              Producer Association Network
            </span>
          </div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight mt-2">
            Producer Group Management
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Coordinate regional producer networks, manage multi-cooperative groups, and unlock institutional off-take.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-6 py-6 flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
        >
          <Plus size={20} /> Create Producer Group
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Producer Groups</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{groups.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                <Layers size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Affiliated Coops</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{cooperatives.length}</h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                <Building size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Network Producers</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {groups.reduce((acc, g) => acc + Number(g.member_count || 0), 0)}
                </h3>
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
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Network Acreage</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {groups.reduce((acc, g) => acc + Number(g.calculated_hectares || g.total_hectares || 0), 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">ha</span>
                </h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                <Globe size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-gray-950 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-900 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Layers size={32} />
          </div>
          <h3 className="text-xl font-black text-(--foreground)">No Producer Groups Created</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Group your regional commodity producers across member cooperatives into strategic production and off-take cohorts.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3"
          >
            Create Producer Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="border-none shadow-sm bg-white dark:bg-gray-950 hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-full">
                      Producer Group
                    </span>
                    <h3 className="text-xl font-black text-(--foreground) mt-1">{group.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {group.region || "Regional Group"} • {group.metadata?.commodity || "Cassava"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Producers</span>
                    <p className="text-2xl font-black text-(--foreground)">{group.member_count || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-xs font-bold">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Season</p>
                    <p className="text-(--foreground) truncate mt-0.5">{group.metadata?.season || "2026 Wet Season"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Total Hectares</p>
                    <p className="text-(--foreground) mt-0.5">{Number(group.calculated_hectares || group.total_hectares || 0).toLocaleString()} ha</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Programme</p>
                    <p className="text-(--foreground) truncate mt-0.5">{group.program_name || "Association Core"}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-900">
                  <Button
                    onClick={() => fetchMembers(group)}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-10"
                  >
                    <Users size={14} /> View Members ({group.member_count || 0})
                  </Button>
                  <Link href="/ecosystem/institution/programs" className="flex-1">
                    <Button className="w-full rounded-xl text-xs font-bold gap-1.5 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Activity size={14} /> Assign Programme
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Producer Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Create Producer Group</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Organize regional commodity producers</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Group Name</Label>
                <Input
                  placeholder="e.g. Anambra Central Cassava Producers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Commodity</Label>
                  <Input
                    placeholder="e.g. Cassava, Maize, Cocoa"
                    value={formData.commodity}
                    onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Region / LGAs</Label>
                  <Input
                    placeholder="e.g. Awka North, Orumba"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Target Area (ha)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.total_hectares}
                    onChange={(e) => setFormData({ ...formData, total_hectares: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Production Season</Label>
                  <Input
                    placeholder="e.g. 2026 Wet Season"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Assign Programme (Optional)</Label>
                <select
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 text-sm font-semibold"
                >
                  <option value="">-- Direct Association Network --</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.commodity})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Group"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showViewMembers && (() => {
        const memberIds = new Set(selectedGroupMembers.map(m => m.id || m.farmer_id || m.vendor_id));
        const filteredFarmers = availableFarmers
          .filter(f => !memberIds.has(f.id) && !memberIds.has(f.vendor_id) && !memberIds.has(f.farmer_id))
          .filter(f =>
            !memberSearch ||
            `${f.fname || ''} ${f.lname || ''} ${f.email || ''} ${f.phone || ''}`.toLowerCase().includes(memberSearch.toLowerCase())
          );

        return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">{showViewMembers.name} — Producers</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Farmers participating in this producer group</p>
              </div>
              <button onClick={() => { setShowViewMembers(null); setShowAddMember(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {/* Toggle: Current Members / Add Producer */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAddMember(false)}
                variant={!showAddMember ? "default" : "outline"}
                className={`rounded-xl text-xs font-bold flex-1 ${!showAddMember ? 'bg-blue-600 text-white' : ''}`}
              >
                <Users size={14} className="mr-1.5" /> Members ({selectedGroupMembers.length})
              </Button>
              <Button
                onClick={() => setShowAddMember(true)}
                variant={showAddMember ? "default" : "outline"}
                className={`rounded-xl text-xs font-bold flex-1 ${showAddMember ? 'bg-green-600 text-white hover:bg-green-700' : ''}`}
              >
                <UserPlus size={14} className="mr-1.5" /> Add Producer
              </Button>
            </div>

            {!showAddMember ? (
              /* Current members list */
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {selectedGroupMembers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-3">
                    <Users className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="font-bold">No producers enrolled yet.</p>
                    <p className="text-xs">Click &quot;Add Producer&quot; to assign farmers from your organization to this group.</p>
                  </div>
                ) : (
                  selectedGroupMembers.map((member) => (
                    <div key={member.id || member.farmer_id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm font-black text-(--foreground)">{member.fname} {member.lname}</p>
                        <p className="text-xs text-gray-400 font-semibold">{member.phone || member.email}</p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
                        {member.role || "Producer"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Add producer view */
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <div className="relative">
                  <Input
                    placeholder="Search farmers by name, email, phone..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="h-10 rounded-xl pl-3 text-sm"
                  />
                </div>
                {filteredFarmers.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <p className="text-sm font-semibold">{availableFarmers.length === 0 ? "No farmers registered under your organization yet." : "All registered farmers are already in this group."}</p>
                  </div>
                ) : (
                  filteredFarmers.map((farmer) => (
                    <div key={farmer.id || farmer.vendor_id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm font-black text-(--foreground)">{farmer.fname} {farmer.lname}</p>
                        <p className="text-xs text-gray-400 font-semibold">{farmer.phone || farmer.email || '—'}</p>
                      </div>
                      <Button
                        onClick={() => handleAssignFarmer(farmer.farmer_id || farmer.id || farmer.vendor_id)}
                        disabled={assigningId === (farmer.farmer_id || farmer.id || farmer.vendor_id)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold px-4 h-9"
                      >
                        {assigningId === (farmer.farmer_id || farmer.id || farmer.vendor_id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus size={14} className="mr-1" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
