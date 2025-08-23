let products = JSON.parse(localStorage.getItem("products") || "[]");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

window.onload = function() {
  renderProducts();
  updateStats();
  renderCart();
};

function addProduct() {
  const name = document.getElementById("productName").value.trim();
  const price = parseInt(document.getElementById("productPrice").value);

  if(!name || !price) { alert("Vui lòng nhập tên và giá!"); return; }

  const product = { name, price };
  products.push(product);
  cart.push({ ...product, qty: 1 }); // Thêm luôn vào giỏ hàng

  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";

  saveData();
  renderProducts();
  updateStats();
}

function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <div class="product-info">
        <span><b>${p.name}</b></span>
        <span>${p.price} đ</span>
      </div>
      <div class="product-actions">
        <input type="number" id="qty${i}" value="1" min="1">
        <button class="add-cart" onclick="addToCart(${i})">🛒</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function addToCart(index) {
  const qty = parseInt(document.getElementById("qty"+index).value);
  if(qty <= 0) return;
  const product = products[index];
  const item = cart.find(c => c.name===product.name);
  if(item) item.qty += qty;
  else cart.push({ ...product, qty });
  saveData();
}

function renderCart() {
  const cartList = document.getElementById("cartItems");
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.textContent = `${item.name} x ${item.qty} = ${item.price*item.qty} đ`;
    cartList.appendChild(li);
  });
  document.getElementById("totalPrice").textContent = total;
}

function updateStats() {
  document.getElementById("totalProducts").textContent = products.length;
  const totalRev = products.reduce((sum,p)=>sum+p.price,0);
  document.getElementById("totalRevenue").textContent = totalRev;
}

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
}

function toggleCart() {
  const overlay = document.getElementById("cartOverlay");
  if(overlay.style.display === "flex") overlay.style.display = "none";
  else {
    overlay.style.display = "flex";
    renderCart();
  }
}
