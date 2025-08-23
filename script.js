let products = [];
let cart = [];
let totalRevenue = 0;
let selectedProduct = null; // sản phẩm đang xem chi tiết

function showHome(){
  document.getElementById("productList").innerHTML = "<p>Chào mừng đến với cửa hàng phụ tùng xe cuốc 🚜</p>";
}

function showProductList(){
  renderProductList(products);
}

function addProduct(){
  let name = document.getElementById("productName").value;
  let price = parseInt(document.getElementById("productPrice").value);
  let desc = document.getElementById("productDesc").value || "Không có mô tả";

  if(!name || !price){
    showToast("⚠️ Vui lòng nhập đủ tên và giá!");
    return;
  }

  let product = {name, price, desc};
  products.push(product);
  renderProductList(products);
  updateStats();

  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDesc").value = "";

  showToast("✅ Đã thêm sản phẩm!");
}

function renderProductList(list){
  let html = "";
  list.forEach((p, index) => {
    html += `<div class="product-item" onclick="showProductDetail(${index})">
              <b>${p.name}</b> - ${p.price} đ
            </div>`;
  });
  document.getElementById("productList").innerHTML = html || "<p>Chưa có sản phẩm</p>";
}

function updateStats(){
  document.getElementById("totalProducts").innerText = products.length;
  document.getElementById("totalRevenue").innerText = totalRevenue;
}

function toggleCart(){
  let overlay = document.getElementById("cartOverlay");
  overlay.style.display = (overlay.style.display === "flex") ? "none" : "flex";
}

function addToCart(index){
  cart.push(products[index]);
  updateCart();
  showToast("🛒 Đã thêm vào giỏ!");
}

function updateCart(){
  let html = "";
  let total = 0;
  cart.forEach((item, i) => {
    html += `<li>${item.name} - ${item.price} đ</li>`;
    total += item.price;
  });
  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("totalPrice").innerText = total;
  totalRevenue = total;
  updateStats();
}

function searchProductList(){
  let keyword = document.getElementById("searchProduct").value.toLowerCase();
  let filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
  renderProductList(filtered);
}

function showAdminLogin(){
  document.getElementById("adminLoginPopup").style.display = "flex";
}

function closeAdminLogin(){
  document.getElementById("adminLoginPopup").style.display = "none";
}

function adminLogin(){
  let pass = document.getElementById("adminPassword").value;
  if(pass === "123"){
    document.getElementById("adminLoginPopup").style.display = "none";
    showToast("🔓 Đăng nhập thành công!");
  } else {
    showToast("❌ Sai mật khẩu!");
  }
}

// ================== PRODUCT DETAIL ==================
function showProductDetail(index){
  selectedProduct = products[index];
  document.getElementById("detailName").innerText = selectedProduct.name;
  document.getElementById("detailPrice").innerText = selectedProduct.price;
  document.getElementById("detailDesc").innerText = selectedProduct.desc;

  document.getElementById("productDetailOverlay").style.display = "flex";
}

function closeProductDetail(){
  document.getElementById("productDetailOverlay").style.display = "none";
}

function addDetailToCart(){
  if(selectedProduct){
    cart.push(selectedProduct);
    updateCart();
    showToast("🛒 Đã thêm vào giỏ!");
    closeProductDetail();
  }
}

// ================== TOAST ==================
function showToast(msg){
  let toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show",""); }, 3000);
}
