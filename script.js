// Biến lưu trữ
let products = [
  { name: "Lọc dầu", price: 200000 },
  { name: "Bơm thủy lực", price: 5000000 },
  { name: "Lọc gió", price: 150000 },
  { name: "Xy lanh", price: 2500000 }
];
let cart = [];
let totalRevenue = 0;
let isAdmin = false;

// DOM
const homeBtn = document.getElementById("homeBtn");
const productsBtn = document.getElementById("productsBtn");
const homeSection = document.getElementById("homeSection");
const productsSection = document.getElementById("productsSection");
const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const totalRevenueEl = document.getElementById("totalRevenue");
const clearCartBtn = document.getElementById("clearCartBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchSuggestions = document.getElementById("searchSuggestions");
const adminPassword = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");
const adminSection = document.getElementById("adminSection");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const addProductBtn = document.getElementById("addProductBtn");
const adminProductList = document.getElementById("adminProductList");

// Hiển thị sản phẩm
function renderProducts(list = products) {
  productList.innerHTML = "";
  list.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.price.toLocaleString()} VNĐ</p>
      <button onclick="addToCart(${i})">Thêm vào giỏ</button>
    `;
    productList.appendChild(div);
  });
}

// Thêm vào giỏ
function addToCart(i) {
  cart.push(products[i]);
  renderCart();
}

// Hiển thị giỏ hàng
function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.price.toLocaleString()} VNĐ`;
    cartItems.appendChild(li);
  });
  cartTotal.textContent = total.toLocaleString();
  totalRevenue = total;
  totalRevenueEl.textContent = total.toLocaleString();
}

// Xóa giỏ hàng
clearCartBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
});

// Chuyển trang
homeBtn.addEventListener("click", () => {
  homeSection.classList.remove("hidden");
  productsSection.classList.add("hidden");
});

productsBtn.addEventListener("click", () => {
  homeSection.classList.add("hidden");
  productsSection.classList.remove("hidden");
  renderProducts();
});

// Tìm kiếm
searchBtn.addEventListener("click", searchProduct);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchProduct();
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  searchSuggestions.innerHTML = "";
  if (keyword) {
    const suggestions = products.filter(p => p.name.toLowerCase().includes(keyword));
    suggestions.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.name;
      li.addEventListener("click", () => {
        searchInput.value = p.name;
        searchProduct();
      });
      searchSuggestions.appendChild(li);
    });
  }
});

function searchProduct() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
  renderProducts(filtered);
  searchSuggestions.innerHTML = "";
}

// Admin login
loginBtn.addEventListener("click", () => {
  if (adminPassword.value === "1234") {
    isAdmin = true;
    adminSection.classList.remove("hidden");
    loginStatus.textContent = "Đăng nhập thành công!";
    renderAdminProducts();
  } else {
    loginStatus.textContent = "Sai mật khẩu!";
  }
});

// Admin thêm sản phẩm
addProductBtn.addEventListener("click", () => {
  if (productName.value && productPrice.value) {
    products.push({
      name: productName.value,
      price: parseInt(productPrice.value)
    });
    renderProducts();
    renderAdminProducts();
    productName.value = "";
    productPrice.value = "";
  }
});

function renderAdminProducts() {
  adminProductList.innerHTML = "";
  products.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - ${p.price.toLocaleString()} VNĐ`;
    adminProductList.appendChild(li);
  });
}
