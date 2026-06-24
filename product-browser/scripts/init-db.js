const db = require("../src/db");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  );
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_created_id
  ON products(created_at DESC, id DESC);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_category_created_id
  ON products(category, created_at DESC, id DESC);
`);

console.log("Database initialized successfully");