const db = require("../src/db");

const categories = [
  "Electronics",
  "Books",
  "Fashion",
  "Sports",
  "Home"
];

const insert = db.prepare(`
  INSERT INTO products
  (name, category, created_at, updated_at)
  VALUES (?, ?, ?, ?)
`);

const insertMany = db.transaction(() => {
  for (let i = 1; i <= 200000; i++) {
    const now = new Date().toISOString();

    insert.run(
      `Product ${i}`,
      categories[Math.floor(Math.random() * categories.length)],
      now,
      now
    );
  }
});
const count = db
  .prepare("SELECT COUNT(*) as count FROM products")
  .get();

console.log(count);
insertMany();

console.log("200000 products inserted");