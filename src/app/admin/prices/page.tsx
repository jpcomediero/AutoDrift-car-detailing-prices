"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  Clock,
  Search,
  Sparkles,
  Tag,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
  Calendar,
  X,
} from "lucide-react";
import { CarSizeType, ServiceType, ComboType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PriceCellState {
  price: number;
  salePrice?: number | null;
  saleStart?: string | null;
  saleEnd?: string | null;
  isDirty?: boolean;
}

export default function PriceMatrixPage() {
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

      setSuccessMessage(`Saved ${result.updatedCount} price updates and recorded audit logs.`);
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
      alert("Failed to save prices. Please verify network connection.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Price Matrix Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Inline editable prices for all car sizes. Changes reflect instantly on the public calculator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Last updated: </span>
            <span className="text-cyan-300 font-semibold">{formatDate(lastUpdated)}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || dirtyCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all active:scale-95"
          >
            <Save className="w-4 h-4 text-black" />
            <span>Save Changes</span>
            {dirtyCount > 0 && (
              <span className="bg-black text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                {dirtyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("SERVICES")}
            className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "SERVICES"
                ? "bg-cyan-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Services Matrix ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("COMBOS")}
            className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "COMBOS"
                ? "bg-cyan-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Combos Matrix ({combos.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* MATRIX TABLE CONTAINER */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0b101d] text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold min-w-[200px]">Item / Package</th>
                {sizes.map((sz) => (
                  <th key={sz.id} className="py-3.5 px-3 font-bold text-center min-w-[140px]">
                    <div className="text-cyan-400 text-xs font-extrabold">{sz.name}</div>
                    <div className="text-[10px] text-slate-400 normal-case font-normal truncate max-w-[130px] mx-auto">
                      {sz.examples.split("(")[0]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {activeTab === "SERVICES" ? (
                filteredServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Item Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{svc.name}</div>
                      <div className="text-[11px] text-slate-400">{svc.durationMinutes} mins</div>
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
                                ? "border-amber-400 bg-amber-950/20"
                                : hasSale
                                ? "border-emerald-500/40 bg-emerald-950/20"
                                : "border-slate-800 bg-slate-900/70 focus-within:border-cyan-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-slate-400 text-xs font-semibold">₱</span>
                              <input
                                type="number"
                                value={cell.price || ""}
                                onChange={(e) => handlePriceChange(key, e.target.value)}
                                className="w-20 bg-transparent text-right font-bold text-white text-xs focus:outline-none"
                              />
                            </div>

                            {/* Promo Tag */}
                            <div className="mt-1 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                              {hasSale ? (
                                <span className="text-emerald-400 font-bold truncate">
                                  Sale: ₱{cell.salePrice}
                                </span>
                              ) : (
                                <span className="text-slate-400">Regular</span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => openPromoModal(key, svc.name, sz.name, e)}
                                title="Configure promo/sale price"
                                className="p-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
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
                  <tr key={combo.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Item Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{combo.name}</div>
                      <div className="text-[11px] text-slate-400">
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
                                ? "border-amber-400 bg-amber-950/20"
                                : hasSale
                                ? "border-emerald-500/40 bg-emerald-950/20"
                                : "border-slate-800 bg-slate-900/70 focus-within:border-cyan-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-slate-400 text-xs font-semibold">₱</span>
                              <input
                                type="number"
                                value={cell.price || ""}
                                onChange={(e) => handlePriceChange(key, e.target.value)}
                                className="w-20 bg-transparent text-right font-bold text-white text-xs focus:outline-none"
                              />
                            </div>

                            {/* Promo Tag */}
                            <div className="mt-1 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                              {hasSale ? (
                                <span className="text-emerald-400 font-bold truncate">
                                  Sale: ₱{cell.salePrice}
                                </span>
                              ) : (
                                <span className="text-slate-400">Regular</span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => openPromoModal(key, combo.name, sz.name, e)}
                                title="Configure promo/sale price"
                                className="p-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Promo / Sale Price</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {itemName} &bull; <span className="text-cyan-400 font-semibold">{sizeName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Regular Price
            </label>
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-400 font-bold border border-slate-800">
              {formatCurrency(currentCell.price)}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Sale Price (₱) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 1200"
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Public page will show the regular price crossed out beside this sale price.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={saleStart}
                onChange={(e) => setSaleStart(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={saleEnd}
                onChange={(e) => setSaleEnd(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearPromo}
            className="text-xs text-red-400 hover:text-red-300 font-medium"
          >
            Remove Promo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
            >
              Apply Promo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
