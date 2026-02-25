import { Category, InventoryItem } from "../types";

export async function getCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function addCategory(name: string, attributes: string[]): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, attributes }),
  });
  if (!res.ok) throw new Error("Failed to add category");
  return res.json();
}

export async function updateCategory(id: number, attributes: string[]): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attributes }),
  });
  if (!res.ok) throw new Error("Failed to update category");
}

export async function getInventory(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory");
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

export async function addInventoryItem(item: Omit<InventoryItem, "id" | "timestamp">): Promise<{ id: number }> {
  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to add inventory item");
  return res.json();
}
