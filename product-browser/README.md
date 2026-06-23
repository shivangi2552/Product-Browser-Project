# Product Browser Backend

A backend service that allows users to browse a large product catalog (~200,000 products) with:

- Newest-first ordering
- Category filtering
- Cursor-based pagination
- Consistent results while data changes
- Fast query performance using indexes

---

## Tech Stack

- Node.js
- Express.js
- SQLite
- better-sqlite3

---

## Project Structure

```text
project/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── src/
│   ├── db.js
│   ├── server.js
│   └── routes/
│       └── products.js
│
├── scripts/
│   ├── init-db.js
│   └── seed.js
│
├── products.db
├── package.json
└── README.md
```

---

## Installation

Install dependencies:

```bash
npm install
```

Create database and indexes:

```bash
node scripts/init-db.js
```

Seed sample data (~200,000 products):

```bash
node scripts/seed.js
```

Start the server:

```bash
node src/server.js
```

Application:

```text
http://localhost:3000
```

---

## API Endpoints

### Get Products

```http
GET /products
```

Returns the first page of products.

Example:

```http
GET /products
```

---

### Pagination

```http
GET /products?cursor=<cursor>
```

Returns the next page using cursor pagination.

Example:

```http
GET /products?cursor=eyJjcmVhdGVkX2F0Ijoi...
```

---

### Category Filter

```http
GET /products?category=Books
```

Returns only products from the specified category.

---

### Category Filter + Pagination

```http
GET /products?category=Books&cursor=<cursor>
```

Returns the next page of products within the selected category.

---

### Limit

```http
GET /products?limit=10
```

Controls page size.

Allowed range:

```text
1 - 100
```

Default:

```text
20
```

---

## Example Response

```json
{
  "products": [
    {
      "id": 399981,
      "name": "Product 199981",
      "category": "Books",
      "created_at": "2026-06-23T16:41:00.980Z",
      "updated_at": "2026-06-23T16:41:00.980Z"
    }
  ],
  "nextCursor": "eyJjcmVhdGVkX2F0IjoiMjAyNi0wNi0yM1QxNjo0MTowMC45ODBaIiwiaWQiOjM5OTk4MX0="
}
```

---

## Database Schema

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

---

## Indexes

```sql
CREATE INDEX idx_products_created_id
ON products(created_at DESC, id DESC);
```

```sql
CREATE INDEX idx_products_category_created_id
ON products(category, created_at DESC, id DESC);
```

### Why These Indexes?

The indexes support:

- Newest-first sorting
- Category filtering
- Cursor-based pagination

This allows queries to remain efficient even with large datasets.

---

## Pagination Strategy

### Why Not OFFSET Pagination?

Traditional pagination:

```sql
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 100000;
```

Problems:

1. Performance degrades as OFFSET grows.
2. New inserts can cause duplicate or skipped records.
3. Large offsets require scanning many rows.

---

## Cursor-Based Pagination

This implementation uses a cursor built from:

```text
(created_at, id)
```

Example:

```json
{
  "created_at": "2026-06-23T16:41:00.980Z",
  "id": 399981
}
```

Encoded as Base64 and returned as:

```json
{
  "nextCursor": "..."
}
```

The next page query fetches records older than the last record seen:

```sql
WHERE (
  created_at < ?
  OR (
    created_at = ?
    AND id < ?
  )
)
```

---

## Handling Concurrent Inserts

Requirement:

> If new products are added while a user is browsing, they should not see duplicates or miss products.

### Example

1. User loads page 1.
2. New products are inserted.
3. User requests page 2 using the cursor from page 1.

Since pagination is based on the last visible product:

```text
(created_at, id)
```

the next query only returns products older than that cursor.

Result:

- No duplicate products
- No skipped products
- Stable browsing experience

---

## Error Handling

Invalid cursor:

```http
GET /products?cursor=abc
```

Response:

```json
{
  "error": "Invalid cursor"
}
```

Status:

```http
400 Bad Request
```

---

## Frontend

A lightweight frontend is included to demonstrate:

- Product browsing
- Category filtering
- Cursor pagination
- Load More functionality

Available at:

```text
http://localhost:3000
```

---

## Future Improvements

- PostgreSQL for production deployment
- Cursor signing/encryption
- Search functionality
- Infinite scrolling
- Product update endpoints
- Automated tests

---

## Design Decisions

1. Cursor pagination was chosen over offset pagination for scalability and consistency.
2. Composite ordering `(created_at, id)` guarantees deterministic results.
3. Database indexes are aligned with filtering and sorting patterns.
4. SQLite was selected for simplicity and easy local setup while preserving the same pagination strategy used in larger relational databases.