let products = [];
let cart = [];

function addProduct() {
  const name = document.getElementById("product-name").value.trim();
  const price = parseFloat(document.getElementById("product-price").value);

  if (!name || isNaN(price)) {
    alert("Vui lòng nhập tên và giá sản phẩm hợp lệ!");
    return;
  }

  products.push({ name, price });
  document.getElementById("product-name").value = "";
  document.getElementById("product-price").value = "";

  renderProducts();
  updateStats();
}

function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <span>${p.name}</span>
      <span>${p.price.toLocaleString()} VND</span>
      <input type="number" id="qty-${index}" value="1" min="1">
      <button onclick="addToCart(${index})">🛒 Thêm</button>
      <button onclick="removeProduct(${index})">❌ Xóa</button>
    `;
    list.appendChild(div);
  });
}

function removeProduct(index) {
  products.splice(index, 1);
  renderProducts();
  updateStats();
}

function updateStats() {
  document.getElementById("total-products").textContent = products.length;
  const totalRevenue = products.reduce((sum, p) => sum + p.price, 0);
  document.getElementById("total-revenue").textContent = totalRevenue.toLocaleString();
}

function addToCart(index) {
  const qty = parseInt(document.getElementById(`qty-${index}`).value);
  if (qty <= 0) return;

  const product = products[index];
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }

  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";

  if (cart.length === 0) {
    document.getElementById("cart").innerHTML = `
      <p>Không có sản phẩm</p>
      <ul id="cart-list"></ul>
      <p>Tổng: <span id="cart-total">0</span> VND</p>
    `;
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ${item.qty} x ${item.price.toLocaleString()} VND
      <button onclick="removeFromCart(${index})">❌</button>
    `;
    cartList.appendChild(li);
  });

  document.getElementById("cart-total").textContent = total.toLocaleString();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}
