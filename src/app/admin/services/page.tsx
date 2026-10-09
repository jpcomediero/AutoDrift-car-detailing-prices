"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  X,
  Check,
  Search,
} from "lucide-react";
import { ServiceType, CarSizeType } from "@/types";
import { formatDuration } from "@/lib/utils";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [sizes, setSizes] = useState<CarSizeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [active, setActive] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const loadServices = async () => {
    try {
      setLoading(true);
      const [svcRes, szRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/sizes"),
      ]);
      const svcData = await svcRes.json();
      const szData = await szRes.json();

      setServices(Array.isArray(svcData) ? svcData : []);
      setSizes(Array.isArray(szData) ? szData : []);
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setDurationMinutes(60);
    setActive(true);

    const initialPrices: Record<string, number> = {};
    sizes.forEach((s) => {
      initialPrices[s.id] = 1000;
    });
    setPrices(initialPrices);
    setIsModalOpen(true);
  };

  const openEditModal = (svc: ServiceType) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description);
    setDurationMinutes(svc.durationMinutes);
    setActive(svc.active);

    const priceMap: Record<string, number> = {};
    svc.prices?.forEach((p) => {
      priceMap[p.carSizeId] = p.price;
    });
    setPrices(priceMap);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingService) {
        // Edit existing
        const res = await fetch("/api/admin/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingService.id,
            name,
            description,
            durationMinutes,
            active,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        // Add new
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            durationMinutes,
            active,
            prices,
          }),
        });
        if (!res.ok) throw new Error("Creation failed");
      }

      setIsModalOpen(false);
      loadServices();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Failed to save service.");
    }
  };

  // Toggle active status
  const handleToggleActive = async (svc: ServiceType) => {
    try {
      await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: svc.id,
          active: !svc.active,
        }),
      });

      setServices((prev) =>
        prev.map((item) =>
          item.id === svc.id ? { ...item, active: !item.active } : item
        )
      );
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Delete service
  const handleDeleteService = async (id: string, svcName: string) => {
    if (!confirm(`Are you sure you want to delete service "${svcName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete service.");
    }
  };

  // Move item up / down to control order
  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const updated = [...services];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update sortOrder numbers
    const reorderPayload = updated.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    setServices(updated);

    try {
      await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
    } catch (err) {
      console.error("Reorder failed:", err);
      loadServices();
    }
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Services Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add, edit, toggle visibility, and order services. The first 5 items appear publicly by default.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Search & Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Badges 1-5 show on public page before search</span>
        </div>
      </div>

      {/* Services List Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0b101d] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center w-14">Order</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredServices.map((svc, idx) => {
                const isPublicTop5 = idx < 5;

                return (
                  <tr key={svc.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Reorder Buttons & Position */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isPublicTop5
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleMoveOrder(idx, "UP")}
                            disabled={idx === 0}
                            className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(idx, "DOWN")}
                            disabled={idx === services.length - 1}
                            className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{svc.name}</span>
                        {isPublicTop5 && (
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                            Top 5 Featured
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 max-w-xl">
                        {svc.description}
                      </p>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {formatDuration(svc.durationMinutes)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(svc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          svc.active
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {svc.active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(svc)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id, svc.name)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{editingService ? "Edit Service" : "Add New Service"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paint Correction 1-Step"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Estimated Duration (Minutes) *
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                  min="5"
                  step="5"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  What&apos;s Included (Description) *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe step-by-step what is included in this treatment..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
                />
              </div>

              {/* Initial Pricing per size if creating new */}
              {!editingService && sizes.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Initial Prices per Car Size (₱)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sizes.map((sz) => (
                      <div key={sz.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[11px] font-bold text-cyan-400 block mb-1">
                          {sz.name}
                        </span>
                        <input
                          type="number"
                          value={prices[sz.id] || ""}
                          onChange={(e) =>
                            setPrices({
                              ...prices,
                              [sz.id]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-slate-950 p-1.5 rounded border border-slate-700 text-white text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <label htmlFor="active-toggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Active (Visible on public quote builder)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs"
                >
                  {editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
