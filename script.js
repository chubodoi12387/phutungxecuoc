let products = JSON.parse(localStorage.getItem("products") || "[]");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

window.onload = function() {
  renderProducts();
  updateStats();
  renderCart();
};

// Hiển thị toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

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

  showToast("Đã thêm sản phẩm thành công!");
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
        <button class="delete" onclick="deleteProduct(${i})">❌</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function deleteProduct(index) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách không?")) {
    const removed = products.splice(index,1)[0];
    cart = cart.filter(item => item.name !==
