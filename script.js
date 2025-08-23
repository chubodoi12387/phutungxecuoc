let products = JSON.parse(localStorage.getItem("products") || "[]");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let isAdmin = false;
const ADMIN_PASSWORD = "123456"; // đổi mật khẩu admin

window.onload = function() {
  renderProducts();
  updateStats();
  renderCart();
};

// Toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 2000);
}

// Admin login
function showAdminLogin() {
  document.getElementById("adminLoginPopup").style.display = "flex";
}
function closeAdminLogin() {
  document.getElementById("adminLoginPopup").style.display = "none";
}
function adminLogin() {
  const pwd = document.getElementById("adminPassword").value;
  if(pwd === ADMIN_PASSWORD){
    isAdmin = true;
    closeAdminLogin();
    showToast("Đăng nhập admin thành công!");
    renderProducts();
  } else {
    alert("Mật khẩu sai!");
  }
}

// Add product
function addProduct() {
  if(!isAdmin) { alert("Bạn không có quyền admin!"); return; }

  const name = document.getElementById("productName").value.trim();
  const price = parseInt(document.getElementById("productPrice").value);
  if(!name || !price) { alert("Vui lòng nhập tên và giá!"); return; }

  products.push({ name, price });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";

  saveData();
  renderProducts();
  updateStats();
  showToast("Đã thêm sản phẩm thành công!");
}

// Render products
function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "product-card";
    let actionsHTML = `<input type="number" id="qty${i}" value="1" min="1">
                       <button class="add-cart" onclick="addToCart(${i})">🛒</button>`;
    if(isAdmin){
      actionsHTML += `<button class="delete" onclick="deleteProduct(${i})">❌</button>`;
    }
    div.innerHTML = `
      <div class="product-info">
        <span><b>${p.name}</b></span>
        <span>${p.price} đ</span>
      </div>
      <div class="product-actions">
        ${actionsHTML}
      </div>
    `;
    list.appendChild(div);
  });
}

// Delete product
function deleteProduct(index) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách không?")) {
    const removed = products.splice(index,1)[0];
    cart = cart.filter(item => item.name !== removed.name);
    saveData();
    renderProducts();
    renderCart();
    updateStats();
  }
}

// Add to cart
function addToCart(index) {
  const qty = parseInt(document.getElementById("qty"+index).value);
  if(qty <= 0) return;
  const product = products[index];
  const item = cart.find(c => c.name===product.name);
  if(item) item.qty += qty;
  else cart.push({ ...product, qty });
  saveData();
  renderCart();
  showToast(`Đã thêm ${qty} "${product.name}" vào giỏ hàng!`);
}

// Render cart
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

// Delete item from cart
function deleteCartItem(index) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
    cart.splice(index,1);
    saveData();
    renderCart();
    updateStats();
  }
}

// Update stats
function updateStats() {
  document.getElementById("totalProducts").textContent = products.length;
  const totalRev = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("totalRevenue").textContent = totalRev;
}

// Save localStorage
function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Toggle cart overlay
function toggleCart() {
  const overlay = document.getElementById("cartOverlay");
  if(overlay.style.display === "flex") overlay.style.display = "none";
  else {
    overlay.style.display = "flex";
    renderCart();
  }
}
