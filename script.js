let products = [];
let cart = [];
const ADMIN_PASSWORD = "1234";
let isAdmin = false;

window.onload = function() {
  const pass = prompt("Nhập mật khẩu admin (bỏ qua nếu là khách):");
  if(pass === ADMIN_PASSWORD) isAdmin = true;
  if(!isAdmin) document.getElementById("adminPanel").style.display = "none";
  renderProducts();
};

function addProduct() {
  const pass = document.getElementById("adminPass").value;
  if(pass !== ADMIN_PASSWORD) { alert("Sai mật khẩu admin!"); return; }

  const name = document.getElementById("productName").value.trim();
  const price = parseInt(document.getElementById("productPrice").value);

  if(!name || !price) { alert("Vui lòng nhập tên và giá!"); return; }

  products.push({ name, price });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  renderProducts();
  updateStats();
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
        ${isAdmin ? `<button class="delete" onclick="deleteProduct(${i})">❌</button>` : ""}
      </div>
    `;
    list.appendChild(div);
  });
}

function deleteProduct(index) {
  products.splice(index, 1);
  renderProducts();
  updateStats();
}

function updateStats() {
  document.getElementById("totalProducts").textContent = products.length;
  const totalRev = products.reduce((sum,p)=>sum+p.price,0);
  document.getElementById("totalRevenue").textContent = totalRev;
}

function addToCart(index) {
  const qty = parseInt(document.getElementById("qty"+index).value);
  if(qty <= 0) return;
  const product = products[index];
  const item = cart.find(c => c.name===product.name);
  if(item) item.qty += qty;
  else cart.push({ ...product, qty });
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cartItems");
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.textContent = `${item.name} x ${item.qty} = ${item.price*item.qty} đ`;
    cartList.appendChild(li);
  });
  document.getElementById("totalPrice").textContent = total;
}
