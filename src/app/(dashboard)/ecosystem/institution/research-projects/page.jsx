"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  FileText, Plus, MapPin, Globe, Activity, ShieldCheck, 
  Coins, Loader2, X, CheckCircle2, ChevronRight, UserPlus, Layers, Microscope, FlaskConical, Sparkles
} from "lucide-react";
import { toast } from "react-toastify";

export default function ResearchProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(null);
  const [showFundingModal, setShowFundingModal] = useState(null);
  const [showObservationModal, setShowObservationModal] = useState(null);
  const [showViewObservations, setShowViewObservations] = useState(null);
  const [observations, setObservations] = useState([]);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: "",
    objectives: "",
    commodity: "Cassava",
    region: "National / South-East",
    principal_investigator: "",
    sample_size: 50,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  const [cohortForm, setCohortForm] = useState({
    name: "",
    region: "",
    total_hectares: 20,
    cohort_type: "Treatment Group A",
  });

  const [fundingForm, setFundingForm] = useState({
    amount: "",
    notes: "",
  });

  const [obsForm, setObsForm] = useState({
    observation_type: "Disease Incidence",
    notes: "",
    metrics: { severity_score: "Low", yield_forecast_mt: "" },
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/research-projects");
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
      }
    } catch (err) {
      console.error("Error loading research projects:", err);
      toast.error("Failed to load research projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/research-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        toast.success("Research project created successfully!");
        setShowCreateModal(false);
        setProjectForm({
          title: "",
          objectives: "",
          commodity: "Cassava",
          region: "National / South-East",
          principal_investigator: "",
          sample_size: 50,
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
        });
        fetchProjects();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to create project");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCohort = async (e) => {
    e.preventDefault();
    if (!cohortForm.name.trim()) {
      toast.error("Cohort name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cohortForm.name,
          region: cohortForm.region,
          group_type: "RESEARCH_COHORT",
          project_id: showCohortModal.id,
          total_hectares: Number(cohortForm.total_hectares) || 0,
          metadata: { cohort_type: cohortForm.cohort_type },
        }),
      });

      if (res.ok) {
        toast.success("Research Cohort created!");
        setShowCohortModal(null);
        setCohortForm({ name: "", region: "", total_hectares: 20, cohort_type: "Treatment Group A" });
        fetchProjects();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to create cohort");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestFunding = async (e) => {
    e.preventDefault();
    if (!fundingForm.amount || Number(fundingForm.amount) <= 0) {
      toast.error("Please enter a valid grant request amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/research-projects/funding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: showFundingModal.id,
          amount: Number(fundingForm.amount),
          notes: fundingForm.notes,
        }),
      });

      if (res.ok) {
        toast.success("Research Grant Funding requested successfully!");
        setShowFundingModal(null);
        setFundingForm({ amount: "", notes: "" });
        fetchProjects();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to request grant funding");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogObservation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/research-observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: showObservationModal.id,
          observation_type: obsForm.observation_type,
          notes: obsForm.notes,
          metrics: obsForm.metrics,
        }),
      });

      if (res.ok) {
        toast.success("Scientific observation recorded!");
        setShowObservationModal(null);
        setObsForm({ observation_type: "Disease Incidence", notes: "", metrics: {} });
        fetchProjects();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to log observation");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const viewObservations = async (project) => {
    setShowViewObservations(project);
    try {
      const res = await fetch(`/api/proxy/admin/institution/research-observations?projectId=${project.id}`);
      if (res.ok) {
        const json = await res.json();
        setObservations(json.data || []);
      }
    } catch {
      setObservations([]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-900/40 via-indigo-950 to-gray-950 p-8 rounded-3xl border border-purple-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
              Scientific Research Workspace
            </span>
          </div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight mt-2">
            Research Programme Management
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Manage scientific research projects, trial cohorts (treatment/control), and field observations.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl px-6 py-6 flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
        >
          <Plus size={20} /> Create Research Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Research Projects</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{projects.length}</h3>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl">
                <Microscope size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Research Cohorts</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {projects.reduce((acc, p) => acc + Number(p.cohort_count || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                <FlaskConical size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trial Participants</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {projects.reduce((acc, p) => acc + Number(p.participant_count || 0), 0)}
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
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recorded Observations</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">
                  {projects.reduce((acc, p) => acc + Number(p.observations_count || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                <Activity size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-950 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-900 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/30 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Microscope size={32} />
          </div>
          <h3 className="text-xl font-black text-(--foreground)">No Research Projects</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Create structured agricultural research projects with experimental treatment cohorts and scientific observation logs.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-6 py-3"
          >
            Create Research Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="border-none shadow-sm bg-white dark:bg-gray-950 hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/30 text-purple-600 rounded-full">
                      Research Project
                    </span>
                    <h3 className="text-xl font-black text-(--foreground) mt-1">{project.title}</h3>
                    <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {project.region || "National"} • {project.commodity} • PI: {project.principal_investigator}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Cohorts</span>
                    <p className="text-2xl font-black text-(--foreground)">{project.cohort_count || 0}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {project.objectives || "Evaluating cultivar disease resistance and agronomic yield response under variable input treatments."}
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-xs font-bold">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Sample Size</p>
                    <p className="text-(--foreground) mt-0.5">{project.sample_size || 50} farmers</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Observations</p>
                    <p className="text-(--foreground) mt-0.5">{project.observations_count || 0} logs</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Grant Funding</p>
                    <p className="text-(--foreground) mt-0.5">
                      {project.funding_status === "requested" ? `₦${Number(project.funding_requested).toLocaleString()}` : "Not Requested"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-gray-900">
                  <Button
                    onClick={() => setShowCohortModal(project)}
                    variant="outline"
                    className="rounded-xl text-[11px] font-bold h-9 border-gray-200 dark:border-gray-800"
                  >
                    + Cohort
                  </Button>
                  <Button
                    onClick={() => setShowObservationModal(project)}
                    variant="outline"
                    className="rounded-xl text-[11px] font-bold h-9 border-gray-200 dark:border-gray-800"
                  >
                    + Log Trial
                  </Button>
                  <Button
                    onClick={() => viewObservations(project)}
                    variant="outline"
                    className="rounded-xl text-[11px] font-bold h-9 border-gray-200 dark:border-gray-800"
                  >
                    View Logs
                  </Button>
                  <Button
                    onClick={() => setShowFundingModal(project)}
                    className="rounded-xl text-[11px] font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    Grant Fund
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Create Research Project</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Define experimental study and target parameters</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Project Title</Label>
                <Input
                  placeholder="e.g. Cassava Bacterial Blight Resistance Evaluation 2026"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Objectives & Hypothesis</Label>
                <Input
                  placeholder="e.g. Assessing yield performance of TME 419 vs Control under biological pest control"
                  value={projectForm.objectives}
                  onChange={(e) => setProjectForm({ ...projectForm, objectives: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Commodity</Label>
                  <Input
                    value={projectForm.commodity}
                    onChange={(e) => setProjectForm({ ...projectForm, commodity: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Target Sample Size</Label>
                  <Input
                    type="number"
                    value={projectForm.sample_size}
                    onChange={(e) => setProjectForm({ ...projectForm, sample_size: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Principal Investigator</Label>
                  <Input
                    placeholder="e.g. Dr. Ngozi Okonjo"
                    value={projectForm.principal_investigator}
                    onChange={(e) => setProjectForm({ ...projectForm, principal_investigator: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Geography / Region</Label>
                  <Input
                    value={projectForm.region}
                    onChange={(e) => setProjectForm({ ...projectForm, region: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Research Cohort Modal */}
      {showCohortModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Add Research Cohort</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Project: {showCohortModal.title}</p>
              </div>
              <button onClick={() => setShowCohortModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cohort Name</Label>
                <Input
                  placeholder="e.g. Treatment Group A (Bio-Fertilizer)"
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cohort Type</Label>
                  <select
                    value={cohortForm.cohort_type}
                    onChange={(e) => setCohortForm({ ...cohortForm, cohort_type: e.target.value })}
                    className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 text-sm font-semibold"
                  >
                    <option value="Treatment Group A">Treatment Group A</option>
                    <option value="Treatment Group B">Treatment Group B</option>
                    <option value="Control Group">Control Group</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Trial Area (ha)</Label>
                  <Input
                    type="number"
                    value={cohortForm.total_hectares}
                    onChange={(e) => setCohortForm({ ...cohortForm, total_hectares: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowCohortModal(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Cohort"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Project Grant Funding Modal */}
      {showFundingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Request Project Grant Funding</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{showFundingModal.title}</p>
              </div>
              <button onClick={() => setShowFundingModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestFunding} className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-800 dark:text-purple-300">
                This project-level grant proposal is submitted to institutional research funders (DFIs, Federal Ministry of Agriculture, Foundations) to support sample inputs and laboratory trials.
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Requested Grant Amount (NGN)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 15000000"
                  value={fundingForm.amount}
                  onChange={(e) => setFundingForm({ ...fundingForm, amount: e.target.value })}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Funding Proposal Summary</Label>
                <Input
                  placeholder="e.g. Multi-location trial input kits and soil sampling equipment"
                  value={fundingForm.notes}
                  onChange={(e) => setFundingForm({ ...fundingForm, notes: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowFundingModal(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Grant Proposal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Trial Observation Modal */}
      {showObservationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Record Trial Observation</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{showObservationModal.title}</p>
              </div>
              <button onClick={() => setShowObservationModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogObservation} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Observation Type</Label>
                <select
                  value={obsForm.observation_type}
                  onChange={(e) => setObsForm({ ...obsForm, observation_type: e.target.value })}
                  className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 text-sm font-semibold"
                >
                  <option value="Disease Incidence">Disease Incidence & Pest Scouting</option>
                  <option value="Soil Health">Soil Nitrogen / pH Analysis</option>
                  <option value="Growth Rate">Plant Height & Phenotypic Stage</option>
                  <option value="Harvest Yield">Yield (Metric Tonnes / ha)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Scientific Notes & Findings</Label>
                <Input
                  placeholder="e.g. Zero symptoms observed in Treatment A; Control showing 15% leaf chlorosis"
                  value={obsForm.notes}
                  onChange={(e) => setObsForm({ ...obsForm, notes: e.target.value })}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                <Button type="button" variant="ghost" onClick={() => setShowObservationModal(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Observation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Observations Modal */}
      {showViewObservations && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Scientific Observation Logs</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{showViewObservations.title}</p>
              </div>
              <button onClick={() => setShowViewObservations(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {observations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No observations recorded for this project yet.</p>
                </div>
              ) : (
                observations.map((obs) => (
                  <div key={obs.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full">
                        {obs.observation_type}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(obs.recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-(--foreground)">{obs.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
