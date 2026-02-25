import React, { useState } from "react";
import { Category } from "../types";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface SettingsScreenProps {
  categories: Category[];
  onAddCategory: (name: string, attributes: string[]) => void;
  onUpdateCategory: (id: number, attributes: string[]) => void;
}

export function SettingsScreen({ categories, onAddCategory, onUpdateCategory }: SettingsScreenProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newAttributes, setNewAttributes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAttributes, setEditAttributes] = useState<string[]>([]);

  const handleAddAttribute = () => {
    setNewAttributes([...newAttributes, ""]);
  };

  const handleNewAttributeChange = (index: number, value: string) => {
    const updated = [...newAttributes];
    updated[index] = value;
    setNewAttributes(updated);
  };

  const saveNewCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName, newAttributes.filter((a) => a.trim()));
      setIsAdding(false);
      setNewCategoryName("");
      setNewAttributes([]);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditAttributes([...category.attributes]);
  };

  const saveEdit = (id: number) => {
    onUpdateCategory(id, editAttributes.filter((a) => a.trim()));
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-zinc-50 min-h-full pb-24">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Settings</h1>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-zinc-800">{category.name}</h3>
              {editingId === category.id ? (
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(category.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full">
                    <Check size={20} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button onClick={() => startEditing(category)} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {editingId === category.id ? (
                <div className="w-full space-y-2">
                  {editAttributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={attr}
                        onChange={(e) => {
                          const updated = [...editAttributes];
                          updated[idx] = e.target.value;
                          setEditAttributes(updated);
                        }}
                        className="flex-1 p-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          const updated = editAttributes.filter((_, i) => i !== idx);
                          setEditAttributes(updated);
                        }}
                        className="text-red-500 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditAttributes([...editAttributes, ""])}
                    className="text-sm text-indigo-600 font-medium flex items-center gap-1 mt-2"
                  >
                    <Plus size={16} /> Add Attribute
                  </button>
                </div>
              ) : (
                category.attributes.map((attr, idx) => (
                  <span key={idx} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium border border-zinc-200">
                    {attr}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}

        {isAdding ? (
          <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 ring-2 ring-indigo-500/20">
            <input
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-2 mb-3 border-b border-zinc-200 font-semibold focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="space-y-2 mb-4">
              {newAttributes.map((attr, idx) => (
                <input
                  key={idx}
                  placeholder="Attribute (e.g. Size)"
                  value={attr}
                  onChange={(e) => handleNewAttributeChange(idx, e.target.value)}
                  className="w-full p-2 bg-zinc-50 rounded-lg text-sm border border-transparent focus:bg-white focus:border-indigo-300 focus:outline-none"
                />
              ))}
              <button onClick={handleAddAttribute} className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                <Plus size={16} /> Add Attribute
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={saveNewCategory} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm">
                Save
              </button>
              <button onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-medium text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-400 font-medium flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"
          >
            <Plus size={20} /> Add New Category
          </button>
        )}
      </div>
    </div>
  );
}
