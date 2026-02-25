import React, { useState, useEffect } from "react";
import { Category, InventoryItem } from "../types";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

interface ValidationScreenProps {
  imageSrc: string;
  initialData: { categoryName: string; attributes: Record<string, string> } | null;
  categories: Category[];
  onSave: (data: Omit<InventoryItem, "id" | "timestamp">) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ValidationScreen({
  imageSrc,
  initialData,
  categories,
  onSave,
  onCancel,
  isLoading,
}: ValidationScreenProps) {
  const [categoryName, setCategoryName] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.categoryName);
      setAttributes(initialData.attributes || {});
    }
  }, [initialData]);

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Find category ID if it exists, or we might need to create it (logic handled by parent or backend)
    // For now, let's assume we map to existing or just store the name if we can't find ID.
    // But our DB requires category_id. 
    // If the category doesn't exist, we should probably prompt to create it or map to "Uncategorized".
    // For simplicity, let's try to match by name.
    
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    const categoryId = category ? category.id : 0; // 0 or null for unknown? DB schema allows null? No, let's check schema.
    // Schema: category_id INTEGER. It can be null.
    
    onSave({
      category_id: categoryId || 0, // 0 as fallback
      category_name: categoryName,
      image_data: imageSrc,
      attributes,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-zinc-400 animate-pulse">Analyzing object with Gemini...</p>
        <img src={imageSrc} alt="Analyzing" className="w-48 h-48 object-cover rounded-xl opacity-50 mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 text-zinc-900 overflow-y-auto">
      <div className="relative h-64 bg-black shrink-0">
        <img src={imageSrc} alt="Captured" className="w-full h-full object-contain" />
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-500 mb-1">Category</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-3 rounded-xl border border-zinc-200 bg-white text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Attributes</h3>
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{key}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          ))}
          
          {/* Allow adding new attributes manually? Maybe later. */}
        </div>

        <button
          onClick={handleSave}
          className="mt-4 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Save className="w-6 h-6" />
          Save to Inventory
        </button>
      </div>
    </div>
  );
}
