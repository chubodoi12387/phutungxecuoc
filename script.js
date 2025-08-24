// ==== CẤU HÌNH FIREBASE ====
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

// ==== BIẾN TOÀN CỤC & TRẠNG THÁI ====
let isAdmin = false;
const ADMIN_PASSWORD = "123456"; // LƯU Ý: NÊN SỬ DỤNG FIREBASE AUTH CHO BẢO MẬT
const userId = "demoUser"; 
let allProducts = []; // Lưu trữ tất cả sản phẩm để tìm kiếm mà không cần tải lại

// ==== KHỞI TẠO ====
window.onload = function() {
    initApp();
};

async function initApp() {
    await fetchAndRenderProducts();
    await renderCart();
    updateStats();
    showHome();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById("searchProduct").addEventListener("input", searchProductList);
}

// ==== TOAST (Cải tiến với màu sắc) ====
function showToast(message, type = 'success') {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `show ${type}`;
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 2000);
}

// ==== ADMIN LOGIN (Cải tiến UX) ====
function showAdminLogin() { document.getElementById("adminLoginPopup").style.display = "flex"; }
function closeAdminLogin() { document.getElementById("adminLoginPopup").style.display = "none"; }
function adminLogin() {
    const pwd = document.getElementById("adminPassword").value;
    if (pwd === ADMIN_PASSWORD) {
        isAdmin = true;
        closeAdminLogin();
        document.querySelector('.add-product').style.display = 'block';
        document.querySelector('nav .admin-btn').textContent = '🚪 Admin (Đã Đăng Nhập)';
        showToast("Đăng nhập admin thành công!");
        renderProducts();
    } else {
        showToast("Mật khẩu sai!", "error");
    }
}

// ==== THÊM SẢN PHẨM (Cải tiến) ====
async function addProduct() {
    if (!isAdmin) { showToast("Bạn không có quyền admin!", "error"); return; }
    const name = document.getElementById("productName").value.trim();
    const price = parseInt(document.getElementById("productPrice").value);
    const desc = document.getElementById("productDesc").value.trim();
    if (!name || isNaN(price) || price <= 0) { showToast("Vui lòng nhập tên và giá hợp lệ!", "error"); return; }

    const newProduct = { name, price, desc };
    const docRef = await db.collection("products").add(newProduct);
    
    // Cập nhật DOM mà không tải lại toàn bộ
    allProducts.push({ id: docRef.id, ...newProduct });
    renderProducts();

    showToast("Đã thêm sản phẩm thành công!");
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productDesc").value = "";
}

// ==== HIỂN THỊ SẢN PHẨM (Cải tiến) ====
async function fetchAndRenderProducts() {
    const snapshot = await db.collection("products").get();
    allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts();
}

function renderProducts(keyword = "") {
    const list = document.getElementById("productList");
    list.innerHTML = "";
    
    let filteredProducts = allProducts;
    if (keyword) {
        filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    }

    filteredProducts.forEach(p => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <div class="product-info">
                <h4>${p.name}</h4>
                <p class="product-price">${p.price.toLocaleString()} đ</p>
                <small class="product-desc">${p.desc || ""}</small>
            </div>
            <div class="product-actions">
                <input type="number" id="qty-${p.id}" value="1" min="1">
                <button class="add-cart" onclick="addToCart('${p.id}', ${p.price}, '${p.name}')">🛒</button>
                ${isAdmin ? `<button class="delete" onclick="deleteProduct('${p.id}')">❌</button>` : ''}
            </div>
        `;
        list.appendChild(div);
    });

    updateStats();
}

// ==== XÓA SẢN PHẨM (Cải tiến) ====
async function deleteProduct(id) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        await db.collection("products").doc(id).delete();
        
        // Cập nhật mảng sản phẩm mà không tải lại
        allProducts = allProducts.filter(p => p.id !== id);
        renderProducts();

        showToast("Đã xóa sản phẩm!");
    }
}

// ==== GIỎ HÀNG (Cải tiến) ====
async function getCart() {
    const doc = await db.collection("carts").doc(userId).get();
    return doc.exists ? doc.data().items : [];
}

async function saveCart(cart) {
    await db.collection("carts").doc(userId).set({ items: cart });
}

async function addToCart(productId, price, name) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    let qty = parseInt(qtyInput.value) || 1;

    let cart = await getCart();
    const index = cart.findIndex(c => c.productId === productId);
    if (index >= 0) {
        cart[index].qty += qty;
    } else {
        cart.push({ productId, name, price, qty });
    }

    await saveCart(cart);
    renderCart();
    showToast("Đã thêm vào giỏ hàng!");
}

async function renderCart() {
    const ul = document.getElementById("cartItems");
    ul.innerHTML = "";
    const cart = await getCart();
    let total = 0;

    cart.forEach((c, i) => {
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
    if (confirm("Bạn có chắc muốn xóa sản phẩm trong giỏ hàng?")) {
        let cart = await getCart();
        cart.splice(index, 1);
        await saveCart(cart);
        renderCart();
        showToast("Đã xóa sản phẩm khỏi giỏ hàng!");
    }
}

function toggleCart() {
    const overlay = document.getElementById("cartOverlay");
    overlay.classList.toggle("show-flex");
}

// ==== THỐNG KÊ (Cải tiến) ====
async function updateStats() {
    const totalProducts = allProducts.length;
    const cart = await getCart();
    const totalRevenue = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();
}

// ==== TÌM KIẾM (Cải tiến) ====
function searchProductList() {
    const keyword = this.value.toLowerCase().trim();
    renderProducts(keyword);
}

// ==== ẨN/HIỆN DANH SÁCH SẢN PHẨM ====
function showHome() { 
    document.querySelector('.stats').style.display = 'block';
    document.querySelector('.add-product').style.display = isAdmin ? 'block' : 'none';
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.search').style.display = 'none';
}

function showProductList() { 
    document.querySelector('.stats').style.display = 'none';
    document.querySelector('.add-product').style.display = 'none';
    document.querySelector('.products').style.display = 'block';
    document.querySelector('.search').style.display = 'block';
}
