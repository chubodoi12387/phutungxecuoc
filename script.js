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
const ADMIN_PASSWORD = "123456"; 
const userId = "demoUser"; 
let allProducts = []; 
const lat = 10.7769; // Vĩ độ của Thành phố Hồ Chí Minh
const lon = 106.7019; // Kinh độ của Thành phố Hồ Chí Minh

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
    updateDateTime();
    fetchWeather();
    setInterval(updateDateTime, 1000); // Cập nhật ngày giờ mỗi giây
    setInterval(fetchWeather, 900000); // Cập nhật thời tiết mỗi 15 phút (900000 ms)
}

function setupEventListeners() {
    document.getElementById("searchProduct").addEventListener("input", searchProductList);
}

// ==== TOAST (Sử dụng SweetAlert2) ====
function showToast(message, type = 'success') {
    const icon = type === 'success' ? 'success' : 'error';
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: icon,
        title: message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}

// ==== ADMIN LOGIN ====
function showAdminPanel() { 
    document.getElementById("adminLoginPopup").style.display = "flex"; 
}
function closeAdminLogin() { 
    document.getElementById("adminLoginPopup").style.display = "none"; 
}
function adminLogin() {
    const pwd = document.getElementById("adminPassword").value;
    if (pwd === ADMIN_PASSWORD) {
        isAdmin = true;
        closeAdminLogin();
        document.querySelector('nav .admin-btn').textContent = '🚪 Admin (Đã Đăng Nhập)';
        showToast("Đăng nhập admin thành công!");
        showAdminDashboard();
        listenForNewOrders(); // Bắt đầu lắng nghe đơn hàng
    } else {
        showToast("Mật khẩu sai!", "error");
    }
}

function showAdminDashboard() {
    hideAllSections();
    document.querySelector('.stats').style.display = 'block';
    document.querySelector('.add-product').style.display = 'block';
    document.getElementById('orders-section').style.display = 'block';
}

function hideAllSections() {
    document.querySelector('.stats').style.display = 'none';
    document.querySelector('.add-product').style.display = 'none';
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.search').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';
}


// ==== THÊM SẢN PHẨM ====
async function addProduct() {
    if (!isAdmin) { showToast("Bạn không có quyền admin!", "error"); return; }
    const name = document.getElementById("productName").value.trim();
    const price = parseInt(document.getElementById("productPrice").value);
    const desc = document.getElementById("productDesc").value.trim();
    if (!name || isNaN(price) || price <= 0) { showToast("Vui lòng nhập tên và giá hợp lệ!", "error"); return; }

    const newProduct = { name, price, desc };
    const docRef = await db.collection("products").add(newProduct);
    
    allProducts.push({ id: docRef.id, ...newProduct });
    renderProducts();

    showToast("Đã thêm sản phẩm thành công!");
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productDesc").value = "";
}

// ==== HIỂN THỊ SẢN PHẨM ====
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
            <div class="product-info" onclick="showProductDetail('${p.id}')">
                <h4>${p.name}</h4>
                <p class="product-price">${p.price.toLocaleString()} đ</p>
                <small class="product-desc">${p.desc || ""}</small>
            </div>
            <div class="product-actions">
                <input type="number" id="qty-${p.id}" value="1" min="1">
                <button class="add-cart" onclick="addToCart('${p.id}', ${p.price}, '${p.name}')">🛒</button>
                ${isAdmin ? `<button class="edit" onclick="editProduct('${p.id}')">✏️</button><button class="delete" onclick="deleteProduct('${p.id}')">❌</button>` : ''}
            </div>
        `;
        list.appendChild(div);
    });

    updateStats();
}

// ==== SỬA SẢN PHẨM ====
function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDesc').value = product.desc;
    document.getElementById('editProductOverlay').style.display = "flex";
}

function closeEditProduct() {
    document.getElementById('editProductOverlay').style.display = "none";
}

async function saveEditedProduct() {
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value.trim();
    const price = parseInt(document.getElementById('editProductPrice').value);
    const desc = document.getElementById('editProductDesc').value.trim();
    
    if (!name || isNaN(price) || price <= 0) {
        showToast("Vui lòng nhập tên và giá hợp lệ!", "error");
        return;
    }

    const updateData = { name, price, desc };
    await db.collection("products").doc(id).update(updateData);
    
    const index = allProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        allProducts[index] = { id, name, price, desc };
    }
    
    renderProducts();
    closeEditProduct();
    showToast("Đã sửa sản phẩm thành công!");
}

// ==== XÓA SẢN PHẨM (Đã dùng SweetAlert2) ====
async function deleteProduct(id) {
    const result = await Swal.fire({
        title: "Bạn có chắc muốn xóa?",
        text: "Bạn sẽ không thể hoàn tác hành động này!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy"
    });
    
    if (result.isConfirmed) {
        await db.collection("products").doc(id).delete();
        allProducts = allProducts.filter(p => p.id !== id);
        renderProducts();
        showToast("Đã xóa sản phẩm!");
    }
}

// ==== HIỂN THỊ CHI TIẾT SẢN PHẨM ====
function showProductDetail(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailPrice').textContent = product.price.toLocaleString();
    document.getElementById('detailDesc').textContent = product.desc;
    document.getElementById('productDetailOverlay').style.display = "flex";
}

function closeProductDetail() {
    document.getElementById('productDetailOverlay').style.display = "none";
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
    const result = await Swal.fire({
        title: "Bạn có chắc muốn xóa?",
        text: "Sản phẩm sẽ bị xóa khỏi giỏ hàng!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy"
    });

    if (result.isConfirmed) {
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

// ==== THANH TOÁN ====
async function showPaymentPopup() {
    const cart = await getCart();
    if (cart.length === 0) {
        showToast("Giỏ hàng của bạn đang trống!", "error");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orderCode = 'DH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    document.getElementById('paymentAmount').textContent = total.toLocaleString();
    document.getElementById('paymentCode').textContent = orderCode;
    document.getElementById('paymentOverlay').style.display = "flex";
}

function closePaymentPopup() {
    document.getElementById('paymentOverlay').style.display = "none";
}

async function confirmPayment() {
    const cart = await getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orderCode = document.getElementById('paymentCode').textContent;

    const orderData = {
        userId: userId,
        items: cart,
        total: total,
        orderCode: orderCode,
        status: 'Chờ xác nhận',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection("orders").add(orderData);
    await saveCart([]); // Xóa giỏ hàng sau khi tạo đơn
    
    renderCart();
    closePaymentPopup();
    
    Swal.fire({
        title: "Đơn hàng đã được tạo!",
        html: `Vui lòng chuyển khoản với nội dung: <b>${orderCode}</b><br>Chúng tôi sẽ xác nhận sớm nhất có thể.`,
        icon: "success"
    });
}

// ==== QUẢN LÝ ĐƠN HÀNG (Dành cho Admin) ====
function listenForNewOrders() {
    if (!isAdmin) return;
    db.collection("orders").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                const newOrder = change.doc.data();
                if (newOrder.status === 'Chờ xác nhận') {
                    // Hiển thị thông báo khi có đơn hàng mới
                    Swal.fire({
                        title: "Đơn hàng mới!",
                        text: `Có đơn hàng mới với mã ${newOrder.orderCode} cần xác nhận.`,
                        icon: "info",
                        timer: 5000,
                        timerProgressBar: true
                    });
                }
            }
        });
        renderOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
}

function renderOrders(orders) {
    const list = document.getElementById("ordersList");
    list.innerHTML = "";
    if (orders.length === 0) {
        list.innerHTML = "<p>Chưa có đơn hàng nào.</p>";
        return;
    }

    orders.forEach(order => {
        const orderDiv = document.createElement("div");
        orderDiv.className = "order-card";
        const itemsHtml = order.items.map(item => `<li>${item.name} x ${item.qty}</li>`).join('');
        const statusClass = order.status === 'Đã xác nhận' ? 'confirmed' : '';

        orderDiv.innerHTML = `
            <h4>Mã ĐH: ${order.orderCode}</h4>
            <p>Tổng tiền: <b>${order.total.toLocaleString()} đ</b></p>
            <p>Trạng thái: <span class="status ${statusClass}">${order.status}</span></p>
            <p>Sản phẩm:</p>
            <ul>${itemsHtml}</ul>
            <p>Thời gian: ${order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString('vi-VN') : 'N/A'}</p>
            ${order.status === 'Chờ xác nhận' ? `<button class="confirm-btn" onclick="confirmOrder('${order.id}')">Xác nhận</button>` : ''}
        `;
        list.appendChild(orderDiv);
    });
}

async function confirmOrder(orderId) {
    const result = await Swal.fire({
        title: "Xác nhận đơn hàng?",
        text: "Đơn hàng này sẽ được chuyển sang trạng thái Đã xác nhận.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy"
    });

    if (result.isConfirmed) {
        await db.collection("orders").doc(orderId).update({ status: 'Đã xác nhận' });
        showToast("Đã xác nhận đơn hàng!", "success");
    }
}

// ==== THỐNG KÊ ====
async function updateStats() {
    const totalProducts = allProducts.length;
    const cart = await getCart();
    const totalRevenue = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();
}

// ==== TÌM KIẾM ====
function searchProductList() {
    const keyword = this.value.toLowerCase().trim();
    renderProducts(keyword);
}

// ==== ẨN/HIỆN CÁC PHẦN ====
function showHome() { 
    hideAllSections();
    document.querySelector('.stats').style.display = 'block';
    document.querySelector('.add-product').style.display = isAdmin ? 'block' : 'none';
}

function showProductList() { 
    hideAllSections();
    document.querySelector('.stats').style.display = 'none';
    document.querySelector('.add-product').style.display = 'none';
    document.querySelector('.products').style.display = 'block';
    document.querySelector('.search').style.display = 'block';
}

// ==== NGÀY GIỜ & THỜI TIẾT ====
function updateDateTime() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    document.getElementById('datetime').textContent = `${formattedDate} ${formattedTime}`;
}

async function fetchWeather() {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error("Không thể lấy dữ liệu thời tiết");
        const data = await response.json();
        
        const weatherCode = data.current.weather_code;
        const temperature = data.current.temperature_2m;
        
        const weatherText = getWeatherText(weatherCode);
        const emoji = getWeatherEmoji(weatherCode);
        
        document.getElementById('weather').innerHTML = `
            <span>${emoji} ${temperature}°C</span>
            <small>${weatherText}</small>
        `;
    } catch (error) {
        console.error("Lỗi khi lấy thời tiết:", error);
        document.getElementById('weather').innerHTML = `<span>Lỗi thời tiết</span>`;
    }
}

function getWeatherText(code) {
    const descriptions = {
        0: 'Trời quang đãng', 1: 'Chủ yếu trong xanh', 2: 'Có mây rải rác', 3: 'Trời nhiều mây',
        45: 'Sương mù', 48: 'Sương mù đóng băng', 
        51: 'Mưa phùn nhẹ', 53: 'Mưa phùn vừa', 55: 'Mưa phùn nặng',
        61: 'Mưa nhẹ', 63: 'Mưa vừa', 65: 'Mưa nặng hạt',
        66: 'Mưa đá nhẹ', 67: 'Mưa đá nặng', 
        71: 'Tuyết rơi nhẹ', 73: 'Tuyết rơi vừa', 75: 'Tuyết rơi nặng',
        77: 'Hạt tuyết', 80: 'Mưa rào nhẹ', 81: 'Mưa rào vừa', 82: 'Mưa rào nặng',
        85: 'Mưa tuyết nhẹ', 86: 'Mưa tuyết nặng',
        95: 'Giông bão', 96: 'Giông bão kèm mưa đá nhẹ', 99: 'Giông bão kèm mưa đá nặng'
    };
    return descriptions[code] || 'Không xác định';
}

function getWeatherEmoji(code) {
    switch (code) {
        case 0:
            return '☀️'; // Clear sky
        case 1:
        case 2:
            return '⛅'; // Mostly clear / partly cloudy
        case 3:
            return '☁️'; // Overcast
        case 45:
        case 48:
            return '🌫️'; // Fog
        case 51:
        case 53:
        case 55:
            return '🌧️'; // Drizzle
        case 61:
        case 63:
        case 65:
            return '🌦️'; // Rain
        case 66:
        case 67:
            return '🌨️'; // Freezing rain
        case 71:
        case 73:
        case 75:
        case 77:
            return '❄️'; // Snow
        case 80:
        case 81:
        case 82:
            return '🌧️'; // Showers
        case 85:
        case 86:
            return '🌨️'; // Snow showers
        case 95:
        case 96:
        case 99:
            return '⛈️'; // Thunderstorm
        default:
            return '❓'; // Unknown
    }
}
