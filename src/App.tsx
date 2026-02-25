/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CaptureScreen } from "./components/CaptureScreen";
import { ValidationScreen } from "./components/ValidationScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { InventoryList } from "./components/InventoryList";
import { Category, InventoryItem } from "./types";
import { getCategories, addCategory, updateCategory, getInventory, addInventoryItem } from "./services/api";
import { identifyObject } from "./services/ai";
import { Camera, List, Settings, Loader2 } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"capture" | "validation" | "inventory" | "settings">("capture");
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ categoryName: string; attributes: Record<string, string> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, items] = await Promise.all([getCategories(), getInventory()]);
      setCategories(cats);
      setInventory(items);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async (imageSrc: string, manualCategory?: Category) => {
    setCapturedImage(imageSrc);
    setView("validation");
    setIsAiLoading(true);
    setAiResult(null);

    try {
      const result = await identifyObject(imageSrc, categories, manualCategory);
      setAiResult(result);
    } catch (error) {
      console.error("AI Identification failed", error);
      // Fallback or error state
      setAiResult({ categoryName: manualCategory?.name || "Unknown", attributes: {} });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveItem = async (item: Omit<InventoryItem, "id" | "timestamp">) => {
    try {
      await addInventoryItem(item);
      await loadData(); // Refresh list
      setView("inventory");
    } catch (error) {
      console.error("Failed to save item", error);
    }
  };

  const handleAddCategory = async (name: string, attributes: string[]) => {
    try {
      await addCategory(name, attributes);
      await loadData();
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  const handleUpdateCategory = async (id: number, attributes: string[]) => {
    try {
      await updateCategory(id, attributes);
      await loadData();
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-100 overflow-hidden">
      <main className="flex-1 overflow-y-auto relative">
        {view === "capture" && (
          <CaptureScreen categories={categories} onCapture={handleCapture} />
        )}
        {view === "validation" && capturedImage && (
          <ValidationScreen
            imageSrc={capturedImage}
            initialData={aiResult}
            categories={categories}
            onSave={handleSaveItem}
            onCancel={() => setView("capture")}
            isLoading={isAiLoading}
          />
        )}
        {view === "inventory" && <InventoryList items={inventory} />}
        {view === "settings" && (
          <SettingsScreen
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {view !== "validation" && (
        <nav className="bg-white border-t border-zinc-200 px-6 py-3 flex justify-between items-center shrink-0 z-50 safe-area-pb">
          <button
            onClick={() => setView("inventory")}
            className={`flex flex-col items-center gap-1 ${
              view === "inventory" ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <List size={24} />
            <span className="text-xs font-medium">Inventory</span>
          </button>

          <button
            onClick={() => setView("capture")}
            className={`flex flex-col items-center gap-1 -mt-8 p-4 rounded-full shadow-lg border-4 border-zinc-100 ${
              view === "capture" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            <Camera size={28} />
          </button>

          <button
            onClick={() => setView("settings")}
            className={`flex flex-col items-center gap-1 ${
              view === "settings" ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Settings size={24} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
}

