let products = [];
let cart = [];
let adminLoggedIn = false;

function showAdminLogin() {
  document.getElementById("adminLoginPopup").style.display = "flex";
}
function closeAdminLogin() {
  document.getElementById("adminLoginPopup").style.display = "none";
}
function adminLogin() {
  const pass = document.getElementById("adminPassword").value;
  if (pass === "123") {
    adminLoggedIn = true;
    showToast("✅ Đăng nhập thành công!");
    closeAdminLogin();
  } else {
    showToast("❌ Sai mật khẩu!");
  }
}

function addProduct() {
  if (!adminLoggedIn) { showToast("🔒 Bạn phải đăng nhập Admin!"); return; }
  const name = document.getElementById("productName").value;
  const price = parseInt(document.getElementById("productPrice").value);
  const desc = document.getElementById("productDesc").value;

  if (!name || !price) { showToast("⚠️ Vui lòng nhập đầy đủ!"); return; }

  products.push({ name, price, desc });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDesc").value = "";

  showToast("➕ Đã thêm sản phẩm!");
  updateProductList();
}

function updateProductList() {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const item = document.createElement("div");
    item.innerHTML = `<b>${p.name}</b> - ${p.price} đ`;
    item.onclick = () => showProductDetail(i);
    list.appendChild(item);
  });
  document.getElementById("totalProducts").innerText = products.length;
}

function searchProductList() {
  const keyword = document.getElementById("searchProduct").value.toLowerCase();
  const list = document.getElementById("productList");
  list.innerHTML = "";
  products.filter(p => p.name.toLowerCase().includes(keyword)).forEach((p,i) => {
    const item = document.createElement("div");
    item.innerHTML = `<b>${p.name}</b> - ${p.price} đ`;
    item.onclick = () => showProductDetail(i);
    list.appendChild(item);
  });
}

function toggleCart() {
  const cartOverlay = document.getElementById("cartOverlay");
  cartOverlay.style.display = cartOverlay.style.display === "flex" ? "none" : "flex";
  renderCart();
}

function renderCart() {
  const ul = document.getElementById("cartItems");
  ul.innerHTML = "";
  let total = 0;
  cart.forEach((c,i) => {
    const li = document.createElement("li");
    li.innerHTML = `${c.name} - ${c.price} đ <button onclick="removeFromCart(${i})">❌</button>`;
    ul.appendChild(li);
    total += c.price;
  });
  document.getElementById("totalPrice").innerText = total;
  document.getElementById("totalRevenue").innerText = total;
}

function removeFromCart(i) {
  cart.splice(i,1);
  renderCart();
}

function showProductDetail(i) {
  const p = products[i];
  document.getElementById("detailName").innerText = p.name;
  document.getElementById("detailPrice").innerText = p.price;
  document.getElementById("detailDesc").innerText = p.desc || "Không có mô tả";
  document.getElementById("productDetailPopup").style.display = "flex";
}

function closeProductDetail() {
  document.getElementById("productDetailPopup").style.display = "none";
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.className = "toast show";
  setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
}
