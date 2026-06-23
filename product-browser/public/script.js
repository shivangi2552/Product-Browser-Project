let cursor = null;

const productsDiv =
  document.getElementById("products");

const categorySelect =
  document.getElementById("category");

async function loadProducts() {

  let url = "/products";

  const category =
    categorySelect.value;

  const params = new URLSearchParams();

  if (cursor) {
    params.append("cursor", cursor);
  }

  if (category) {
    params.append("category", category);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response =
    await fetch(url);

  const data =
    await response.json();

  data.products.forEach(product => {

    const div =
      document.createElement("div");

    div.className = "product";

    div.innerHTML = `
      <strong>${product.name}</strong><br>
      Category: ${product.category}<br>
      ID: ${product.id}
    `;

    productsDiv.appendChild(div);
  });

  cursor = data.nextCursor;
}

document
  .getElementById("loadBtn")
  .addEventListener(
    "click",
    loadProducts
  );

categorySelect.addEventListener(
  "change",
  () => {
    cursor = null;
    productsDiv.innerHTML = "";
    loadProducts();
  }
);

loadProducts();