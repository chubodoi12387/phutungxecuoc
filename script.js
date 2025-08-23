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

  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";

  saveData();
  renderProducts();
  updateStats();
}

// Render sản phẩm + nút xóa cho admin
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
        <button class="delete" onclick="deleteProduct(${i})">❌</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// Xóa sản phẩm khỏi danh sách (Admin)
function deleteProduct(index) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách không?")) {
    const removed = products.splice(index,1)[0];
    cart = cart.filter(item => item.name !== removed.name); // Xóa trong giỏ hàng nếu muốn
    saveData();
    renderProducts();
    renderCart();
    updateStats();
  }
}

// Thêm sản phẩm vào giỏ hàng (khách)
function addToCart(index) {
  const qty = parseInt(document.getElementById("qty"+index).value);
  if(qty <= 0) return;
  const product = products[index];
  const item = cart.find(c => c.name===product.name);
  if(item) item.qty += qty;
  else cart.push({ ...product, qty });
  saveData();
  renderCart();
}

// Render giỏ hàng
function renderCart() {
  const cartList = document.getElementById("cartItems");
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `${item.name} x ${item.qty} = ${item.price*item.qty} đ 
      <button class="cart-item-delete" onclick="deleteCartItem(${idx})">❌</button>`;
    cartList.appendChild(li);
  });
  document.getElementById("totalPrice").textContent = total;
}

// Xóa sản phẩm khỏi giỏ hàng (khách)
function deleteCartItem(index) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
    cart.splice(index,1);
    saveData();
    renderCart();
  }
}

// Cập nhật thống kê
function updateStats() {
  document.getElementById("totalProducts").textContent = products.length;
  const totalRev = products.reduce((sum,p)=>sum+p.price,0);
  document.getElementById("totalRevenue").textContent = totalRev;
}

// Lưu dữ liệu
function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Hiện/ẩn giỏ hàng overlay
function toggleCart() {
  const overlay = document.getElementById("cartOverlay");
  if(overlay.style.display === "flex") overlay.style.display = "none";
  else {
    overlay.style.display = "flex";
    renderCart();
  }
}
