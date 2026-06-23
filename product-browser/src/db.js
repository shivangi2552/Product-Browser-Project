const Database = require("better-sqlite3");

const db = new Database("products.db");

module.exports = db;