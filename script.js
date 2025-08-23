let products = JSON.parse(localStorage.getItem("products") || "[]");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let isAdmin = false;
const ADMIN_PASSWORD = "123456";

window.onload = function() {
  renderProducts();
  updateStats();
  renderCart();
  showHome(); 
};

// Toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 2000);
}

// Admin login
function showAdminLogin() { document.getElementById("adminLoginPopup").style.display = "flex"; }
function closeAdminLogin() { document.getElementById("adminLoginPopup").style.display = "none"; }
function adminLogin() {
  const pwd = document.getElementById("adminPassword").value;
  if(pwd === ADMIN_PASSWORD){
    isAdmin = true;
    closeAdminLogin();
    showToast("Đăng nhập admin thành công!");
    renderProducts();
  } else { alert("Mật khẩu sai!"); }
}

// Add product
function addProduct() {
  if(!isAdmin) { alert("Bạn không có quyền admin!"); return; }
  const name = document.getElementById("productName").value.trim();
  const price = parseInt(document.getElementById("productPrice").value);
  const desc = document.getElementById("productDesc").value.trim();
  if(!name || isNaN(price) || price <= 0) { alert("Vui lòng nhập tên và giá hợp lệ!"); return; }
  products.push({ name, price, desc });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDesc").value = "";
  saveData();
  renderProducts();
  updateStats();
  showToast("Đã thêm sản phẩm thành công!");
}

// Render products
function renderProducts(keyword="") {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  let filtered = products;
  if(keyword) filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
  filtered.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "product-card";

    let actionsHTML = `
      <input type="number" id="qty${i}" value="1" min="1" style="width:60px; padding:4px; border-radius:4px; border:1px solid #ccc;">
      <button class="add-cart" onclick="addToCart(${i})">🛒</button>
    `;
    if(isAdmin){ actionsHTML += `<button class="delete" onclick="deleteProduct(${i})">❌</button>`; }

    div.innerHTML = `
      <div class="product-info">
        <span><b>${p.name}</b></span>
        <span>${p.price.toLocaleString()} đ</span>
        <small>${p.desc || ""}</small>
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
  if(confirm("Bạn có chắc muốn xóa sản phẩm này?")){
    products.splice(index,1);
    saveData();
    renderProducts();
    updateStats();
    showToast("Đã xóa sản phẩm!");
  }
}

// Save to localStorage
function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Add to cart
function addToCart(index){
  const qtyInput = document.getElementById(`qty${index}`);
  let qty = parseInt(qtyInput.value);
  if(isNaN(qty) || qty <= 0) qty = 1;
  qtyInput.value = qty;

  const product = products[index];
  const cartItem = cart.find(c => c.name === product.name);
  if(cartItem) cartItem.qty += qty;
  else cart.push({ name: product.name, price: product.price, qty });
  saveData();
  renderCart();
  updateStats();
  showToast("Đã thêm vào giỏ hàng!");
}

// Render cart
function renderCart() {
  const ul = document.getElementById("cartItems");
  ul.innerHTML = "";
  let total = 0;
  cart.forEach((c,i)=>{
    total += c.price * c.qty;
    let li = document.createElement("li");
    li.innerHTML = `${c.name} - ${c.price.toLocaleString()} đ x ${c.qty} 
      <button class="cart-item-delete" onclick="deleteCartItem(${i})">❌</button>`;
    ul.appendChild(li);
  });
  document.getElementById("totalPrice").textContent = total.toLocaleString();
}

// Delete cart item
function deleteCartItem(index){
  if(confirm("Bạn có chắc muốn xóa sản phẩm trong giỏ hàng?")){
    cart.splice(index,1);
    saveData();
    renderCart();
    updateStats();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng!");
  }
}

// Toggle cart visibility
function toggleCart(){
  const overlay = document.getElementById("cartOverlay");
  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";
}

// Update stats
function updateStats(){
  document.getElementById("totalProducts").textContent = products.length;
  let totalRevenue = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();
}

// Search products
function searchProductList() {
  const keyword = document.getElementById("searchProduct").value.toLowerCase().trim();
  renderProducts(keyword);
}

// Ẩn/hiện danh sách sản phẩm
const productPanel = document.getElementById("productList").parentElement;
function showHome() { productPanel.style.display = "none"; }
function showProductList() { productPanel.style.display = "block"; renderProducts(); }
