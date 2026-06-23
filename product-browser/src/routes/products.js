const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100
    );

    const cursor = req.query.cursor;
    const category = req.query.category;

    let products;

    // First page
    if (!cursor) {
      if (category) {
        products = db.prepare(`
          SELECT *
          FROM products
          WHERE category = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `).all(category, limit);
      } else {
        products = db.prepare(`
          SELECT *
          FROM products
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `).all(limit);
      }
    } else {
      let decoded;

      try {
        decoded = JSON.parse(
          Buffer.from(cursor, "base64").toString()
        );
      } catch {
        return res.status(400).json({
          error: "Invalid cursor"
        });
      }

      if (!decoded.created_at || !decoded.id) {
        return res.status(400).json({
          error: "Invalid cursor"
        });
      }

      if (category) {
        products = db.prepare(`
          SELECT *
          FROM products
          WHERE category = ?
          AND (
            created_at < ?
            OR (
              created_at = ?
              AND id < ?
            )
          )
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `).all(
          category,
          decoded.created_at,
          decoded.created_at,
          decoded.id,
          limit
        );
      } else {
        products = db.prepare(`
          SELECT *
          FROM products
          WHERE (
            created_at < ?
            OR (
              created_at = ?
              AND id < ?
            )
          )
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `).all(
          decoded.created_at,
          decoded.created_at,
          decoded.id,
          limit
        );
      }
    }

    const lastProduct = products[products.length - 1];

    let nextCursor = null;

    if (lastProduct) {
      nextCursor = Buffer.from(
        JSON.stringify({
          created_at: lastProduct.created_at,
          id: lastProduct.id
        })
      ).toString("base64");
    }

    return res.json({
      products,
      nextCursor
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

module.exports = router;