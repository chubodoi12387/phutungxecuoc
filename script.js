const firebaseConfig = {
  apiKey: "AIzaSyAeCt8rpatQv2ZHAbBwY3QC1W4o_qekTag",
  authDomain: "projectmananger-2dc9f.firebaseapp.com",
  projectId: "projectmananger-2dc9f",
  storageBucket: "projectmananger-2dc9f.firebasestorage.app",
  messagingSenderId: "77995469141",
  appId: "1:77995469141:web:fd4239a48d3ff9897ce7dc",
  measurementId: "G-8JBLPVKDYT"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==== Biến toàn cục ====
let isAdmin = false;
const ADMIN_PASSWORD = "123456";
const userId = "demoUser"; // user mặc định đồng bộ giỏ hàng

// ==== Khởi tạo ====
window.onload = function() {
  renderProducts();
  renderCart();
  updateStats();
  showHome();
};

// ==== TOAST ====
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 2000);
}

// ==== ADMIN LOGIN ====
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

// ==== THÊM SẢN PHẨM ====
async function addProduct() {
  if(!isAdmin) { alert("Bạn không có quyền admin!"); return; }
  const name = document.getElementById("productName").value.trim();
  const price = parseInt(document.getElementById("productPrice").value);
  const desc = document.getElementById("productDesc").value.trim();
  if(!name || isNaN(price) || price <= 0) { alert("Vui lòng nhập tên và giá hợp lệ!"); return; }

  await db.collection("products").add({ name, price, desc });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDesc").value = "";
  showToast("Đã thêm sản phẩm thành công!");
  renderProducts();
}

// ==== HIỂN THỊ SẢN PHẨM ====
async function renderProducts(keyword="") {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  const snapshot = await db.collection("products").get();
  let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if(keyword) products = products.filter(p => p.name.toLowerCase().includes(keyword));

  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "product-card";

    let actionsHTML = `
      <input type="number" id="qty${p.id}" value="1" min="1" style="width:60px; padding:4px; border-radius:4px; border:1px solid #ccc;">
      <button class="add-cart" onclick="addToCart('${p.id}', ${p.price}, '${p.name}')">🛒</button>
    `;
    if(isAdmin) actionsHTML += `<button class="delete" onclick="deleteProduct('${p.id}')">❌</button>`;

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

  updateStats();
}

// ==== XÓA SẢN PHẨM ====
async function deleteProduct(id) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    await db.collection("products").doc(id).delete();
    showToast("Đã xóa sản phẩm!");
    renderProducts();
  }
}

// ==== GIỎ HÀNG ====
async function getCart() {
  const doc = await db.collection("carts").doc(userId).get();
  return doc.exists ? doc.data().items : [];
}

async function saveCart(cart) {
  await db.collection("carts").doc(userId).set({ items: cart });
}

async function addToCart(productId, price, name) {
  const qtyInput = document.getElementById(`qty${productId}`);
  let qty = parseInt(qtyInput.value);
  if(isNaN(qty) || qty <= 0) qty = 1;
  qtyInput.value = qty;

  let cart = await getCart();
  const index = cart.findIndex(c => c.productId === productId);
  if(index >= 0) cart[index].qty += qty;
  else cart.push({ productId, name, price, qty });

  await saveCart(cart);
  renderCart();
  showToast("Đã thêm vào giỏ hàng!");
}

async function renderCart() {
  const ul = document.getElementById("cartItems");
  ul.innerHTML = "";
  const cart = await getCart();
  let total = 0;

  cart.forEach((c,i)=>{
    total += c.price * c.qty;
    const li = document.createElement("li");
    li.innerHTML = `${c.name} - ${c.price.toLocaleString()} đ x ${c.qty} 
      <button class="cart-item-delete" onclick="deleteCartItem(${i})">❌</button>`;
    ul.appendChild(li);
  });

  document.getElementById("totalPrice").textContent = total.toLocaleString();
  updateStats();
}

async function deleteCartItem(index) {
  if(confirm("Bạn có chắc muốn xóa sản phẩm trong giỏ hàng?")) {
    let cart = await getCart();
    cart.splice(index,1);
    await saveCart(cart);
    renderCart();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng!");
  }
}

function toggleCart() {
  const overlay = document.getElementById("cartOverlay");
  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";
}

// ==== THỐNG KÊ ====
async function updateStats() {
  const snapshot = await db.collection("products").get();
  const totalProducts = snapshot.size;

  const cart = await getCart();
  const totalRevenue = cart.reduce((sum,c) => sum + c.price * c.qty, 0);

  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();
}

// ==== TÌM KIẾM ====
function searchProductList() {
  const keyword = document.getElementById("searchProduct").value.toLowerCase().trim();
  renderProducts(keyword);
}

// ==== ẨN/HIỆN DANH SÁCH SẢN PHẨM ====
const productPanel = document.getElementById("productList").parentElement;
function showHome() { productPanel.style.display = "none"; }
function showProductList() { productPanel.style.display = "block"; renderProducts(); }

