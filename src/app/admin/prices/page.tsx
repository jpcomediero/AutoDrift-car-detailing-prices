"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  Clock,
  Search,
  Sparkles,
  Tag,
  Check,
  RefreshCw,
  Layers,
  X,
} from "lucide-react";
import { CarSizeType, ServiceType, ComboType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

interface PriceCellState {
  price: number;
  salePrice?: number | null;
  saleStart?: string | null;
  saleEnd?: string | null;
  isDirty?: boolean;
}

export default function PriceMatrixPage() {
  const toast = useToast();
  const [sizes, setSizes] = useState<CarSizeType[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [combos, setCombos] = useState<ComboType[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"SERVICES" | "COMBOS">("SERVICES");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Matrix state: key is `${itemType}:${itemId}:${sizeId}`
  const [matrix, setMatrix] = useState<Record<string, PriceCellState>>({});
  const [initialMatrix, setInitialMatrix] = useState<Record<string, PriceCellState>>({});

  // Promo modal state
  const [editingPromoCellKey, setEditingPromoCellKey] = useState<string | null>(null);
  const [editingPromoItemName, setEditingPromoItemName] = useState<string>("");
  const [editingPromoSizeName, setEditingPromoSizeName] = useState<string>("");

  const loadMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/prices");
      if (!res.ok) throw new Error("Failed to fetch price matrix");
      const data = await res.json();

      setSizes(data.sizes || []);
      setServices(data.services || []);
      setCombos(data.combos || []);
      setLastUpdated(data.lastUpdated || new Date().toISOString());

      // Initialize matrix state
      const initialMap: Record<string, PriceCellState> = {};

      // Services
      data.services?.forEach((svc: ServiceType) => {
        data.sizes?.forEach((sz: CarSizeType) => {
          const rec = svc.prices?.find((p) => p.carSizeId === sz.id);
          const key = `SERVICE:${svc.id}:${sz.id}`;
          initialMap[key] = {
            price: rec?.price ?? 0,
            salePrice: rec?.salePrice ?? null,
            saleStart: rec?.saleStart ? new Date(rec.saleStart).toISOString().split("T")[0] : null,
            saleEnd: rec?.saleEnd ? new Date(rec.saleEnd).toISOString().split("T")[0] : null,
            isDirty: false,
          };
        });
      });

      // Combos
      data.combos?.forEach((c: ComboType) => {
        data.sizes?.forEach((sz: CarSizeType) => {
          const rec = c.prices?.find((p) => p.carSizeId === sz.id);
          const key = `COMBO:${c.id}:${sz.id}`;
          initialMap[key] = {
            price: rec?.price ?? 0,
            salePrice: rec?.salePrice ?? null,
            saleStart: rec?.saleStart ? new Date(rec.saleStart).toISOString().split("T")[0] : null,
            saleEnd: rec?.saleEnd ? new Date(rec.saleEnd).toISOString().split("T")[0] : null,
            isDirty: false,
          };
        });
      });

      setMatrix(initialMap);
      setInitialMatrix(JSON.parse(JSON.stringify(initialMap)));
    } catch (err) {
      console.error("Error loading matrix:", err);
      toast.error("Matrix Load Failed", "Unable to retrieve price matrix data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  // Update cell price
  const handlePriceChange = (key: string, newPriceStr: string) => {
    const val = parseFloat(newPriceStr) || 0;
    setMatrix((prev) => {
      const orig = initialMatrix[key];
      const isDirty =
        val !== orig?.price ||
        prev[key]?.salePrice !== orig?.salePrice ||
        prev[key]?.saleStart !== orig?.saleStart ||
        prev[key]?.saleEnd !== orig?.saleEnd;

      return {
        ...prev,
        [key]: {
          ...(prev[key] || { price: 0 }),
          price: val,
          isDirty,
        },
      };
    });
  };

  // Open Promo Modal
  const openPromoModal = (
    key: string,
    itemName: string,
    sizeName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingPromoCellKey(key);
    setEditingPromoItemName(itemName);
    setEditingPromoSizeName(sizeName);
  };

  // Update Promo Sale State
  const updatePromoForCell = (
    salePrice: number | null,
    saleStart: string | null,
    saleEnd: string | null
  ) => {
    if (!editingPromoCellKey) return;
    setMatrix((prev) => {
      const current = prev[editingPromoCellKey] || { price: 0 };
      const orig = initialMatrix[editingPromoCellKey];
      const isDirty =
        current.price !== orig?.price ||
        salePrice !== orig?.salePrice ||
        saleStart !== orig?.saleStart ||
        saleEnd !== orig?.saleEnd;

      return {
        ...prev,
        [editingPromoCellKey]: {
          ...current,
          salePrice,
          saleStart,
          saleEnd,
          isDirty,
        },
      };
    });
    toast.info("Promo Configured", `Discount set for ${editingPromoItemName} (${editingPromoSizeName}). Click 'Save Changes' to apply.`);
    setEditingPromoCellKey(null);
  };

  // Count modified cells
  const dirtyCount = useMemo(() => {
    return Object.values(matrix).filter((cell) => cell.isDirty).length;
  }, [matrix]);

  // Save all modified changes
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);

    const updates = Object.entries(matrix)
      .filter(([, cell]) => cell.isDirty)
      .map(([key, cell]) => {
        const [type, itemId, carSizeId] = key.split(":");
        return {
          type: type as "SERVICE" | "COMBO",
          itemId,
          carSizeId,
          price: cell.price,
          salePrice: cell.salePrice,
          saleStart: cell.saleStart,
          saleEnd: cell.saleEnd,
        };
      });

    if (updates.length === 0) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error("Save failed");
      const result = await res.json();

      const msg = `Saved ${result.updatedCount} price update${result.updatedCount === 1 ? "" : "s"} across catalog.`;
      setSuccessMessage(msg);
      toast.success("Prices Saved", msg);
      setLastUpdated(result.lastUpdated);

      // Reset dirty state
      const updatedInitial = JSON.parse(JSON.stringify(matrix));
      Object.keys(updatedInitial).forEach((k) => {
        updatedInitial[k].isDirty = false;
      });
      setInitialMatrix(updatedInitial);
      setMatrix(updatedInitial);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Save Failed", "Failed to save prices. Please verify your connection.");
    } finally {
      setSaving(false);
    }
  };

  // Filter items
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCombos = combos.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Price Matrix Editor
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Inline editable prices for all car sizes. Changes reflect instantly on the public calculator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span className="text-zinc-400">Last updated: </span>
            <span className="text-red-400 font-bold">{formatDate(lastUpdated)}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || dirtyCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save Changes</span>
            {dirtyCount > 0 && (
              <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                {dirtyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-red-500/50 text-white text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-red-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-black/90 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("SERVICES")}
            className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "SERVICES"
                ? "bg-red-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Services Matrix ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("COMBOS")}
            className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "COMBOS"
                ? "bg-red-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Combos Matrix ({combos.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* MATRIX TABLE CONTAINER */}
      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e0e0e] text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 font-bold min-w-[200px]">Item / Package</th>
                {sizes.map((sz) => (
                  <th key={sz.id} className="py-3.5 px-3 font-bold text-center min-w-[140px]">
                    <div className="text-red-500 text-xs font-extrabold">{sz.name}</div>
                    <div className="text-[10px] text-zinc-400 normal-case font-normal truncate max-w-[130px] mx-auto">
                      {sz.examples.split("(")[0]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-black/40">
              {activeTab === "SERVICES" ? (
                filteredServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Item Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{svc.name}</div>
                      <div className="text-[11px] text-zinc-400">{svc.durationMinutes} mins</div>
                    </td>

                    {/* Per-size inputs */}
                    {sizes.map((sz) => {
                      const key = `SERVICE:${svc.id}:${sz.id}`;
                      const cell = matrix[key] || { price: 0 };
                      const hasSale = !!cell.salePrice;

                      return (
                        <td key={sz.id} className="py-2.5 px-2 text-center">
                          <div
                            className={`p-1.5 rounded-xl border transition-all ${
                              cell.isDirty
                                ? "border-red-500 bg-red-950/40"
                                : hasSale
                                ? "border-red-500/60 bg-red-950/30"
                                : "border-zinc-800 bg-zinc-900/70 focus-within:border-red-500"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-zinc-400 text-xs font-semibold">₱</span>
                              <input
                                type="number"
                                value={cell.price || ""}
                                onChange={(e) => handlePriceChange(key, e.target.value)}
                                className="w-20 bg-transparent text-right font-bold text-white text-xs focus:outline-none"
                              />
                            </div>

                            {/* Promo Tag */}
                            <div className="mt-1 pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                              {hasSale ? (
                                <span className="text-red-400 font-bold truncate">
                                  Sale: ₱{cell.salePrice}
                                </span>
                              ) : (
                                <span className="text-zinc-500">Regular</span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => openPromoModal(key, svc.name, sz.name, e)}
                                title="Configure promo/sale price"
                                className="p-0.5 text-zinc-400 hover:text-red-400 transition-colors"
                              >
                                <Tag className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                filteredCombos.map((combo) => (
                  <tr key={combo.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Item Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{combo.name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {combo.services?.length || 0} services included
                      </div>
                    </td>

                    {/* Per-size inputs */}
                    {sizes.map((sz) => {
                      const key = `COMBO:${combo.id}:${sz.id}`;
                      const cell = matrix[key] || { price: 0 };
                      const hasSale = !!cell.salePrice;

                      return (
                        <td key={sz.id} className="py-2.5 px-2 text-center">
                          <div
                            className={`p-1.5 rounded-xl border transition-all ${
                              cell.isDirty
                                ? "border-red-500 bg-red-950/40"
                                : hasSale
                                ? "border-red-500/60 bg-red-950/30"
                                : "border-zinc-800 bg-zinc-900/70 focus-within:border-red-500"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-zinc-400 text-xs font-semibold">₱</span>
                              <input
                                type="number"
                                value={cell.price || ""}
                                onChange={(e) => handlePriceChange(key, e.target.value)}
                                className="w-20 bg-transparent text-right font-bold text-white text-xs focus:outline-none"
                              />
                            </div>

                            {/* Promo Tag */}
                            <div className="mt-1 pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                              {hasSale ? (
                                <span className="text-red-400 font-bold truncate">
                                  Sale: ₱{cell.salePrice}
                                </span>
                              ) : (
                                <span className="text-zinc-500">Regular</span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => openPromoModal(key, combo.name, sz.name, e)}
                                title="Configure promo/sale price"
                                className="p-0.5 text-zinc-400 hover:text-red-400 transition-colors"
                              >
                                <Tag className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROMO / DISCOUNT MODAL */}
      {editingPromoCellKey && (
        <PromoModal
          cellKey={editingPromoCellKey}
          itemName={editingPromoItemName}
          sizeName={editingPromoSizeName}
          currentCell={matrix[editingPromoCellKey] || { price: 0 }}
          onSave={updatePromoForCell}
          onClose={() => setEditingPromoCellKey(null)}
        />
      )}
    </div>
  );
}

interface PromoModalProps {
  cellKey: string;
  itemName: string;
  sizeName: string;
  currentCell: PriceCellState;
  onSave: (salePrice: number | null, saleStart: string | null, saleEnd: string | null) => void;
  onClose: () => void;
}

function PromoModal({
  itemName,
  sizeName,
  currentCell,
  onSave,
  onClose,
}: PromoModalProps) {
  const [salePrice, setSalePrice] = useState<string>(
    currentCell.salePrice ? String(currentCell.salePrice) : ""
  );
  const [saleStart, setSaleStart] = useState<string>(currentCell.saleStart || "");
  const [saleEnd, setSaleEnd] = useState<string>(currentCell.saleEnd || "");

  const handleSave = () => {
    const numericSale = salePrice.trim() ? parseFloat(salePrice) : null;
    onSave(numericSale, saleStart.trim() || null, saleEnd.trim() || null);
  };

  const handleClearPromo = () => {
    onSave(null, null, null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-zinc-700 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              <span>Promo / Sale Price</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {itemName} &bull; <span className="text-red-400 font-bold">{sizeName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Regular Price
            </label>
            <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-300 font-bold border border-zinc-800">
              {formatCurrency(currentCell.price)}
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Sale Price (₱) <span className="text-zinc-500 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 1200"
              className="w-full p-2.5 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500 font-bold"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Public page will show the regular price crossed out beside this sale price.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={saleStart}
                onChange={(e) => setSaleStart(e.target.value)}
                className="w-full p-2 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={saleEnd}
                onChange={(e) => setSaleEnd(e.target.value)}
                className="w-full p-2 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearPromo}
            className="text-xs text-red-500 hover:text-red-400 font-semibold"
          >
            Remove Promo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            >
              Apply Promo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
