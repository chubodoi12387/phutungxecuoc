let products = [];
let cart = [];

function addProduct() {
    let name = prompt("Tên sản phẩm:");
    let price = prompt("Giá (VND):");
    if(name && price){
        products.push({name, price: Number(price)});
        renderProducts();
    }
}

function renderProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = '';
    products.forEach((p,i)=>{
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="product-info">
                <span class="product-name">${p.name}</span>
                <span class="product-price">${p.price} VND</span>
            </div>
            <div class="product-actions">
                <input type="number" id="qty-${i}" value="1" min="1" style="width:50px;">
                <button onclick="addToCart(${i})">Thêm vào giỏ</button>
                <button onclick="removeProduct(${i})">Xóa</button>
            </div>
        `;
        list.appendChild(div);
    });
    document.getElementById('total').innerText = products.length;
    renderCart();
}

function removeProduct(index) {
    if(confirm("Bạn có chắc muốn xóa sản phẩm này?")){
        products.splice(index,1);
        renderProducts();
    }
}

function addToCart(index) {
    let qty = Number(document.getElementById(`qty-${index}`).value);
    if(qty < 1) qty = 1;

    const product = products[index];
    // Kiểm tra sản phẩm đã có trong giỏ
    const cartItem = cart.find(item => item.name === product.name);
    if(cartItem){
        cartItem.qty += qty;
    } else {
        cart.push({name: product.name, price: product.price, qty: qty});
    }
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';
    let total = 0;
    if(cart.length === 0){
        cartList.innerHTML = '<li>Không có sản phẩm</li>';
    } else {
        cart.forEach((item,i)=>{
            const li = document.createElement('li');
            li.innerHTML = `${item.name} x ${item.qty} = ${item.price * item.qty} VND 
                            <button onclick="removeFromCart(${i})">Xóa</button>`;
            cartList.appendChild(li);
            total += item.price * item.qty;
        });
    }
    document.getElementById('cart-total').innerText = total;
}

function removeFromCart(index){
    cart.splice(index,1);
    renderCart();
}
