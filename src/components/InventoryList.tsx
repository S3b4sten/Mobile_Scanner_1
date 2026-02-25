import React from "react";
import { InventoryItem } from "../types";
import { Package, Calendar } from "lucide-react";

interface InventoryListProps {
  items: InventoryItem[];
}

export function InventoryList({ items }: InventoryListProps) {
  return (
    <div className="p-6 bg-zinc-50 min-h-full pb-24">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Inventory</h1>

      <div className="grid grid-cols-1 gap-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No items yet. Start scanning!</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden flex">
              <div className="w-24 h-24 bg-zinc-100 shrink-0">
                <img src={item.image_data} alt={item.category_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-zinc-900 truncate">{item.category_name || "Unknown"}</h3>
                  <span className="text-xs text-zinc-400 flex items-center gap-1 shrink-0">
                    <Calendar size={10} />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(item.attributes).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                      {key}: {value}
                    </span>
                  ))}
                  {Object.keys(item.attributes).length > 3 && (
                    <span className="text-xs text-zinc-400 px-1">+{Object.keys(item.attributes).length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
