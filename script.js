let products = [];
let cart = [];
let isAdmin = false;

// Hiển thị sản phẩm
function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <b>${p.name}</b> - ${p.price} đ
      <button onclick="addToCart(${index}); event.stopPropagation();">🛒</button>
    `;
    div.onclick = () => showProductDetail(p);
    list.appendChild(div);
  });

  document.getElementById("totalProducts").innerText = products.length;
}

// Thêm sản phẩm
function addProduct() {
  if (!isAdmin) {
    showToast("Bạn cần đăng nhập Admin để thêm sản phẩm!");
    return;
  }
  const name = document.getElementById("productName").value;
  const price = parseInt(document.getElementById("productPrice").value);
  if (!name || isNaN(price)) {
    showToast("Vui lòng nhập đủ thông tin!");
    return;
  }
  products.push({ name, price, desc: "Thông tin chi tiết về " + name });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  renderProducts();
  showToast("Đã thêm sản phẩm!");
}

// Giỏ hàng
function addToCart(index) {
  cart.push(products[index]);
  updateCart();
  showToast("Đã thêm vào giỏ hàng!");
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${c.name} - ${c.price} đ 
      <button onclick="removeFromCart(${i})">❌</button>`;
    cartItems.appendChild(li);
    total += c.price;
  });
  document.getElementById("totalPrice").innerText = total;
}

function removeFromCart(i) {
  cart.splice(i, 1);
  updateCart();
}

function toggleCart() {
  const cartOverlay = document.getElementById("cartOverlay");
  cartOverlay.style.display = cartOverlay.style.display === "block" ? "none" : "block";
}

// Chi tiết sản phẩm
function showProductDetail(p) {
  document.getElementById("detailName").innerText = p.name;
  document.getElementById("detailPrice").innerText = p.price;
  document.getElementById("detailDesc").innerText = p.desc || "Chưa có mô tả";
  document.getElementById("productDetailPopup").style.display = "block";
}
function closeProductDetail() {
  document.getElementById("productDetailPopup").style.display = "none";
}

// Admin login
function showAdminLogin() {
  document.getElementById("adminLoginPopup").style.display = "block";
}
function closeAdminLogin() {
  document.getElementById("adminLoginPopup").style.display = "none";
}
function adminLogin() {
  const pass = document.getElementById("adminPassword").value;
  if (pass === "123") {
    isAdmin = true;
    closeAdminLogin();
    showToast("Đăng nhập thành công!");
  } else {
    showToast("Sai mật khẩu!");
  }
}

// Tìm kiếm
function searchProductList() {
  const keyword = document.getElementById("searchProduct").value.toLowerCase();
  const list = document.getElementById("productList");
  list.innerHTML = "";
  products
    .filter(p => p.name.toLowerCase().includes(keyword))
    .forEach((p, index) => {
      const div = document.createElement("div");
      div.className = "product-item";
      div.innerHTML = `
        <b>${p.name}</b> - ${p.price} đ
        <button onclick="addToCart(${index}); event.stopPropagation();">🛒</button>
      `;
      div.onclick = () => showProductDetail(p);
      list.appendChild(div);
    });
}

// Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
