import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Initialize Database
const db = new Database("inventory.db");
db.pragma("journal_mode = WAL");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    attributes TEXT NOT NULL -- JSON array of strings
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    image_data TEXT, -- Base64 string (or path if we stored files)
    attributes TEXT, -- JSON object { "Brand": "X", "Size": "Y" }
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );
`);

// Seed default categories if empty
const count = db.prepare("SELECT count(*) as c FROM categories").get() as { c: number };
if (count.c === 0) {
  const insert = db.prepare("INSERT INTO categories (name, attributes) VALUES (?, ?)");
  insert.run("Electronics", JSON.stringify(["Brand", "Model", "Serial Number", "Condition"]));
  insert.run("Clothing", JSON.stringify(["Brand", "Size", "Material", "Color", "Gender"]));
  insert.run("Furniture", JSON.stringify(["Type", "Material", "Dimensions", "Color"]));
  insert.run("Books", JSON.stringify(["Title", "Author", "ISBN", "Genre"]));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/categories", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM categories");
      const categories = stmt.all().map((cat: any) => ({
        ...cat,
        attributes: JSON.parse(cat.attributes),
      }));
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/categories", (req, res) => {
    try {
      const { name, attributes } = req.body;
      const stmt = db.prepare("INSERT INTO categories (name, attributes) VALUES (?, ?)");
      const info = stmt.run(name, JSON.stringify(attributes));
      res.json({ id: info.lastInsertRowid, name, attributes });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/categories/:id", (req, res) => {
    try {
      const { attributes } = req.body;
      const stmt = db.prepare("UPDATE categories SET attributes = ? WHERE id = ?");
      stmt.run(JSON.stringify(attributes), req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/inventory", (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT i.*, c.name as category_name 
        FROM inventory i 
        LEFT JOIN categories c ON i.category_id = c.id 
        ORDER BY i.timestamp DESC
      `);
      const items = stmt.all().map((item: any) => ({
        ...item,
        attributes: JSON.parse(item.attributes),
      }));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/inventory", (req, res) => {
    try {
      const { category_id, image_data, attributes } = req.body;
      const stmt = db.prepare("INSERT INTO inventory (category_id, image_data, attributes) VALUES (?, ?, ?)");
      const info = stmt.run(category_id, image_data, JSON.stringify(attributes));
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
