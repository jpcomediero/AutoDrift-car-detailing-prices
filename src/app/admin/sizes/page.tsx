"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertCircle,
  Loader2,
  ImageIcon,
  Check,
} from "lucide-react";
import { CarSizeType } from "@/types";

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<CarSizeType[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<CarSizeType | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [examples, setExamples] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadSizes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sizes");
      if (!res.ok) throw new Error("Failed to load sizes");
      const data = await res.json();
      setSizes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading sizes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSizes();
  }, []);

  const openAddModal = () => {
    setEditingSize(null);
    setName("");
    setExamples("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sz: CarSizeType) => {
    setEditingSize(sz);
    setName(sz.name);
    setExamples(sz.examples);
    setSelectedFile(null);
    setPreviewUrl(sz.imageUrl || null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Handle client file selection with strict validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 1. Validate MIME Type: JPG, PNG, WebP only
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Invalid format. Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    // 2. Validate Size: max 2 MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("Image file exceeds the 2 MB maximum size limit.");
      return;
    }

    setSelectedFile(file);
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setUploadError(null);

    try {
      let uploadedUrl: string | null = editingSize?.imageUrl || null;
      let uploadedPath: string | null = editingSize?.imagePath || null;

      // 1. If new file selected, upload to Supabase Storage first
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (editingSize?.imagePath) {
          formData.append("oldImagePath", editingSize.imagePath);
        }

        const uploadRes = await fetch("/api/admin/sizes/upload-image", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Image upload failed");
        }

        uploadedUrl = uploadData.publicUrl;
        uploadedPath = uploadData.imagePath;
      }

      // 2. Create or update size record
      if (editingSize) {
        const res = await fetch("/api/admin/sizes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingSize.id,
            name,
            examples,
            imageUrl: uploadedUrl,
            imagePath: uploadedPath,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch("/api/admin/sizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            examples,
            imageUrl: uploadedUrl,
            imagePath: uploadedPath,
          }),
        });
        if (!res.ok) throw new Error("Creation failed");
      }

      setIsModalOpen(false);
      loadSizes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setUploadError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Remove image from size
  const handleRemoveImage = async (sz: CarSizeType) => {
    if (!confirm(`Remove photo for ${sz.name}? It will be deleted from storage.`)) return;

    try {
      const res = await fetch(
        `/api/admin/sizes/upload-image?sizeId=${sz.id}&imagePath=${encodeURIComponent(
          sz.imagePath || ""
        )}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove image");
      loadSizes();
    } catch (err) {
      console.error("Remove image error:", err);
      alert("Failed to remove image.");
    }
  };

  // Delete size
  const handleDeleteSize = async (id: string, sizeName: string) => {
    if (!confirm(`Are you sure you want to delete size "${sizeName}"? This will delete associated prices.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sizes?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSizes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete size error:", err);
      alert("Failed to delete size.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Manage Car Sizes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rename sizes, update vehicle examples, upload images (JPG/PNG/WebP max 2MB) stored in Supabase Storage.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Add New Size</span>
        </button>
      </div>

      {/* Sizes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sizes.map((sz) => (
          <div
            key={sz.id}
            className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              {/* Image Preview Container */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-4 flex items-center justify-center">
                {sz.imageUrl ? (
                  <Image
                    src={sz.imageUrl}
                    alt={sz.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 p-4 text-center">
                    <ImageIcon className="w-10 h-10 text-slate-700 mb-1" />
                    <span className="text-[11px] text-slate-500">No Image Uploaded</span>
                  </div>
                )}

                {/* Storage badge */}
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300 border border-white/10">
                  {sz.imagePath ? "Supabase Storage" : "Placeholder"}
                </span>

                {sz.imageUrl && (
                  <button
                    onClick={() => handleRemoveImage(sz)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 transition-colors"
                    title="Remove image from storage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Title & Examples */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{sz.name}</h3>
                <span className="text-xs text-slate-500 font-semibold">Tier #{sz.sortOrder}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">
                  Car Size Guide Examples:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{sz.examples}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => openEditModal(sz)}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit / Replace Image</span>
              </button>

              <button
                onClick={() => handleDeleteSize(sz.id, sz.name)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                title="Delete car size"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT SIZE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>{editingSize ? `Edit Size: ${editingSize.name}` : "Add New Car Size"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSize} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Size Name * (e.g. Small, Medium, Large, XL, XXL, XXXL)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. XXXL"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Car Size Guide Examples *
                </label>
                <textarea
                  value={examples}
                  onChange={(e) => setExamples(e.target.value)}
                  rows={3}
                  placeholder="e.g. Extended wheel-base vans, heavy commercial buses (e.g., Coaster, Sprinter 4x4)"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
                />
              </div>

              {/* Image Upload with Preview */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Size Guide Photo (JPG, PNG, WebP only, Max 2 MB)
                </label>

                {/* Live Preview */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-2.5 flex items-center justify-center">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-500 text-xs p-4">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                      <span>Select an image below to preview</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{previewUrl ? "Replace Image File" : "Choose Image File"}</span>
                  </button>

                  {selectedFile && (
                    <span className="text-[11px] text-emerald-400 truncate max-w-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSize ? "Save Changes" : "Create Car Size"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
