"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Flame,
  Check,
  X,
  Search,
} from "lucide-react";
import { ComboType, ServiceType, CarSizeType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

export default function AdminCombosPage() {
  const toast = useToast();
  const [combos, setCombos] = useState<ComboType[]>([]);
  const [allServices, setAllServices] = useState<ServiceType[]>([]);
  const [sizes, setSizes] = useState<CarSizeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboType | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [comboPrices, setComboPrices] = useState<Record<string, number>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [comboRes, svcRes, szRes] = await Promise.all([
        fetch("/api/admin/combos"),
        fetch("/api/admin/services"),
        fetch("/api/admin/sizes"),
      ]);
      const comboData = await comboRes.json();
      const svcData = await svcRes.json();
      const szData = await szRes.json();

      setCombos(Array.isArray(comboData) ? comboData : []);
      setAllServices(Array.isArray(svcData) ? svcData : []);
      setSizes(Array.isArray(szData) ? szData : []);
    } catch (err) {
      console.error("Error loading combo data:", err);
      toast.error("Failed to load packages", "Could not fetch combo packages from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCombo(null);
    setName("");
    setDescription("");
    setSelectedServiceIds(allServices.slice(0, 3).map((s) => s.id));
    setActive(true);

    const priceMap: Record<string, number> = {};
    sizes.forEach((sz) => {
      priceMap[sz.id] = 3000;
    });
    setComboPrices(priceMap);
    setIsModalOpen(true);
  };

  const openEditModal = (combo: ComboType) => {
    setEditingCombo(combo);
    setName(combo.name);
    setDescription(combo.description);
    setSelectedServiceIds(combo.services?.map((s) => s.id) || []);
    setActive(combo.active);

    const priceMap: Record<string, number> = {};
    combo.prices?.forEach((p) => {
      priceMap[p.carSizeId] = p.price;
    });
    sizes.forEach((sz) => {
      if (priceMap[sz.id] === undefined) priceMap[sz.id] = 0;
    });
    setComboPrices(priceMap);
    setIsModalOpen(true);
  };

  // Toggle included service
  const toggleService = (svcId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(svcId) ? prev.filter((id) => id !== svcId) : [...prev, svcId]
    );
  };

  // Live calculation of regular total for a specific car size based on selected services
  const calculateRegularTotalForSize = (carSizeId: string): number => {
    let sum = 0;
    selectedServiceIds.forEach((svcId) => {
      const svc = allServices.find((s) => s.id === svcId);
      if (svc) {
        const pRec = svc.prices?.find((p) => p.carSizeId === carSizeId);
        sum += pRec?.price ?? 0;
      }
    });
    return sum;
  };

  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Validation Error", "Please provide a combo package name.");
      return;
    }

    try {
      if (editingCombo) {
        // Edit
        const res = await fetch("/api/admin/combos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCombo.id,
            name,
            description,
            serviceIds: selectedServiceIds,
            active,
          }),
        });
        if (!res.ok) throw new Error("Update failed");

        // Save combo prices
        const priceUpdates = sizes.map((sz) => ({
          type: "COMBO",
          itemId: editingCombo.id,
          carSizeId: sz.id,
          price: comboPrices[sz.id] || 0,
        }));
        await fetch("/api/admin/prices", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: priceUpdates }),
        });

        toast.success("Combo Package Updated", `"${name}" has been saved successfully.`);
      } else {
        // Create new
        const res = await fetch("/api/admin/combos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            serviceIds: selectedServiceIds,
            active,
            prices: comboPrices,
          }),
        });
        if (!res.ok) throw new Error("Creation failed");

        toast.success("Combo Package Created", `"${name}" has been added to the catalog.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Error saving combo:", err);
      toast.error("Failed to Save Combo", "An error occurred while saving the package.");
    }
  };

  const handleToggleActive = async (combo: ComboType) => {
    const nextActive = !combo.active;
    try {
      await fetch("/api/admin/combos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: combo.id,
          active: nextActive,
        }),
      });

      setCombos((prev) =>
        prev.map((c) => (c.id === combo.id ? { ...c, active: nextActive } : c))
      );

      toast.info(
        nextActive ? "Package Published" : "Package Hidden",
        `"${combo.name}" is now ${nextActive ? "visible" : "hidden"} on the public calculator.`
      );
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Status Update Failed", "Could not toggle combo active status.");
    }
  };

  const handleDeleteCombo = async (id: string, comboName: string) => {
    if (!confirm(`Are you sure you want to delete combo package "${comboName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/combos?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCombos((prev) => prev.filter((c) => c.id !== id));
      toast.success("Combo Deleted", `"${comboName}" has been removed.`);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete Failed", "Could not delete the combo package.");
    }
  };

  // Reorder
  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= combos.length) return;

    const updated = [...combos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reorderPayload = updated.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    setCombos(updated);

    try {
      await fetch("/api/admin/combos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      toast.info("Package Order Updated", `Moved "${temp.name}" ${direction.toLowerCase()}.`);
    } catch (err) {
      console.error("Reorder failed:", err);
      toast.error("Reorder Failed", "Could not update package ordering.");
      loadData();
    }
  };

  const filteredCombos = combos.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Combo Package Builder
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Build bundled packages with live auto-computed savings per car size.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white stroke-[3]" />
          <span>Create New Combo</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search combos..."
            className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Combos Table */}
      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e0e0e] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-3 text-center w-14">Order</th>
                <th className="py-3 px-4">Combo Details</th>
                <th className="py-3 px-3">Included Services</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-black/40">
              {filteredCombos.map((combo, idx) => (
                <tr key={combo.id} className="hover:bg-zinc-900/50 transition-colors">
                  {/* Order */}
                  <td className="py-3 px-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleMoveOrder(idx, "UP")}
                          disabled={idx === 0}
                          className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(idx, "DOWN")}
                          disabled={idx === combos.length - 1}
                          className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm mb-1">{combo.name}</div>
                    <p className="text-zinc-400 text-xs line-clamp-2 max-w-md">
                      {combo.description}
                    </p>
                  </td>

                  {/* Included Services */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {combo.services?.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] font-medium bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 truncate"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggleActive(combo)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        combo.active
                          ? "bg-red-600/20 text-red-400 border border-red-500/40"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      }`}
                    >
                      {combo.active ? (
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
                        onClick={() => openEditModal(combo)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit Combo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCombo(combo.id, combo.name)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Combo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMBO BUILDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-2xl w-full p-6 border border-zinc-700 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>{editingCombo ? "Edit Combo Package" : "Create New Combo Package"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCombo} className="py-4 space-y-5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Signature Paint Correction & Ceramic Armor"
                  required
                  className="w-full p-2.5 rounded-xl bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Description / Package Summary *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Why should customers choose this package?..."
                  className="w-full p-2.5 rounded-xl bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              {/* Multi-select Included Services */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-zinc-300 font-semibold">
                    Select Included Services ({selectedServiceIds.length} selected) *
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Check the services included in this package
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-black rounded-xl border border-zinc-800">
                  {allServices.map((svc) => {
                    const isChecked = selectedServiceIds.includes(svc.id);
                    return (
                      <div
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 border transition-colors ${
                          isChecked
                            ? "bg-red-950/40 border-red-500/50 text-red-200"
                            : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-red-600 text-white" : "border border-zinc-600"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate text-xs">{svc.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE SAVINGS & PRICING TABLE PER SIZE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-zinc-300 font-semibold">
                    Pricing &amp; Live Computed Savings per Size
                  </label>
                  <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-red-400" />
                    <span>Auto-computed live</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {sizes.map((sz) => {
                    const regularTotal = calculateRegularTotalForSize(sz.id);
                    const currentComboPrice = comboPrices[sz.id] || 0;
                    const savings = Math.max(0, regularTotal - currentComboPrice);

                    return (
                      <div
                        key={sz.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/80 border border-zinc-800"
                      >
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <span className="text-xs font-bold text-red-400">{sz.name}</span>
                        </div>

                        <div className="flex items-center gap-4 flex-1 justify-end">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block">
                              Regular Individual Total:
                            </span>
                            <span className="text-xs text-zinc-300 font-semibold">
                              {formatCurrency(regularTotal)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 block font-medium">
                              Combo Price (₱):
                            </span>
                            <input
                              type="number"
                              value={comboPrices[sz.id] || ""}
                              onChange={(e) =>
                                setComboPrices({
                                  ...comboPrices,
                                  [sz.id]: parseFloat(e.target.value) || 0,
                                 })
                              }
                              className="w-24 bg-zinc-900 border border-zinc-700 p-1.5 rounded-lg text-right text-xs font-bold text-white focus:outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="min-w-[110px] text-right">
                            <span className="text-[10px] text-zinc-500 block">Customer Savings:</span>
                            {savings > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-red-600 px-2.5 py-0.5 rounded-full border border-red-400/40">
                                Save {formatCurrency(savings)}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-500">₱0 savings</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active-combo-toggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-black border-zinc-700"
                />
                <label
                  htmlFor="active-combo-toggle"
                  className="text-xs text-zinc-300 font-semibold cursor-pointer"
                >
                  Active (Display on public combo selection)
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
                  {editingCombo ? "Save Combo" : "Create Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
