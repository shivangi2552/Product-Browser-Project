const express = require("express");
const path = require("path");

const productRoutes = require("./routes/products");

const app = express();

app.use(express.json());

app.use("/products", productRoutes);
app.use(express.static(path.join(__dirname, "../public")));
app.listen(3000, () => {
  console.log("Server running on port 3000");
});