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
        div.innerHTML = `
            <div>
                <strong>${p.name}</strong><br>
                <small>${p.price} VND</small>
            </div>
            <button onclick="removeProduct(${i})">Xóa</button>
        `;
        list.appendChild(div);
    });
    document.getElementById('total').innerText = products.length;
}

function removeProduct(index) {
    if(confirm("Bạn có chắc muốn xóa sản phẩm này?")){
        products.splice(index,1);
        renderProducts();
    }
}
