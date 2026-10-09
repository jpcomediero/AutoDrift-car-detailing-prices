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
  X,
  Search,
} from "lucide-react";
import { ServiceType, CarSizeType } from "@/types";
import { formatDuration } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

export default function AdminServicesPage() {
  const toast = useToast();
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
      toast.error("Failed to load services", "Could not fetch service catalog from database.");
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
        toast.success("Service Updated!", `Changes to "${name}" have been successfully saved.`);
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
        toast.success("Service Created!", `"${name}" is now live in the catalog.`);
      }

      setIsModalOpen(false);
      loadServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save service.";
      console.error("Error saving service:", err);
      toast.error("Failed to Save Service", msg);
    }
  };

  // Toggle active status
  const handleToggleActive = async (svc: ServiceType) => {
    try {
      const newStatus = !svc.active;
      await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: svc.id,
          active: newStatus,
        }),
      });

      setServices((prev) =>
        prev.map((item) =>
          item.id === svc.id ? { ...item, active: newStatus } : item
        )
      );

      if (newStatus) {
        toast.success("Service Published", `"${svc.name}" is now visible to customers.`);
      } else {
        toast.info("Service Hidden", `"${svc.name}" is hidden from customer view.`);
      }
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Status Update Failed", "Could not toggle service visibility.");
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
      toast.success("Service Deleted", `"${svcName}" was successfully removed.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete service.";
      console.error("Delete error:", err);
      toast.error("Deletion Failed", msg);
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
      toast.success("Order Updated", "Service display priority saved.");
    } catch (err) {
      console.error("Reorder failed:", err);
      toast.error("Reorder Failed", "Could not update service display order.");
      loadServices();
    }
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Services Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Add, edit, toggle visibility, and order services. The first 5 items appear publicly by default.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white stroke-[3]" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Search & Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Badges 1-5 show on public page before search</span>
        </div>
      </div>

      {/* Services List Table */}
      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e0e0e] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-3 text-center w-14">Order</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-black/40">
              {filteredServices.map((svc, idx) => {
                const isPublicTop5 = idx < 5;

                return (
                  <tr key={svc.id} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Reorder Buttons & Position */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isPublicTop5
                              ? "bg-red-600/20 text-red-400 border border-red-500/40"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleMoveOrder(idx, "UP")}
                            disabled={idx === 0}
                            className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-20"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(idx, "DOWN")}
                            disabled={idx === services.length - 1}
                            className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-20"
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
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30">
                            Top 5 Featured
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs line-clamp-2 max-w-xl">
                        {svc.description}
                      </p>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
                        <Clock className="w-3 h-3 text-red-400" />
                        {formatDuration(svc.durationMinutes)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(svc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          svc.active
                            ? "bg-red-600/20 text-red-400 border border-red-500/40"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
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
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id, svc.name)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-zinc-700 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>{editingService ? "Edit Service" : "Add New Service"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paint Correction 1-Step"
                  required
                  className="w-full p-2.5 rounded-xl bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Estimated Duration (Minutes) *
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                  min="5"
                  step="5"
                  className="w-full p-2.5 rounded-xl bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  What&apos;s Included (Description) *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe step-by-step what is included in this treatment..."
                  className="w-full p-2.5 rounded-xl bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500 text-xs leading-relaxed"
                />
              </div>

              {/* Initial Pricing per size if creating new */}
              {!editingService && sizes.length > 0 && (
                <div>
                  <label className="block text-zinc-300 font-semibold mb-2">
                    Initial Prices per Car Size (₱)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sizes.map((sz) => (
                      <div key={sz.id} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <span className="text-[11px] font-bold text-red-400 block mb-1">
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
                          className="w-full bg-black p-1.5 rounded border border-zinc-700 text-white text-xs font-semibold focus:outline-none"
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
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-black border-zinc-700"
                />
                <label htmlFor="active-toggle" className="text-xs text-zinc-300 font-semibold cursor-pointer">
                  Active (Visible on public quote builder)
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.4)]"
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
