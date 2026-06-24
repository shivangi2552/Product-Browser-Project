const express = require("express");
const path = require("path");

const productRoutes = require("./routes/products");

const app = express();

app.use(express.json());

app.use("/products", productRoutes);
app.use(express.static(path.join(__dirname, "../public")));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});