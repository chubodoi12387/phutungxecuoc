let products = [];

function addProduct() {
    let name = prompt("Tên sản phẩm:");
    let price = prompt("Giá (VND):");
    if(name && price){
        products.push({name, price});
        renderProducts();
    }
}

function renderProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = '';
    products.forEach((p,i)=>{
        const div = document.createElement('div');
        div.innerHTML = `<strong>${p.name}</strong> - ${p.price} VND <button onclick="removeProduct(${i})">Xóa</button>`;
        list.appendChild(div);
    });
    document.getElementById('total').innerText = products.length;
}

function removeProduct(index) {
    products.splice(index,1);
    renderProducts();
}
