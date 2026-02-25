export interface Category {
  id: number;
  name: string;
  attributes: string[];
}

export interface InventoryItem {
  id: number;
  category_id: number;
  category_name?: string;
  image_data: string;
  attributes: Record<string, string>;
  timestamp: string;
}
