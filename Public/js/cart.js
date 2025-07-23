console.log("Welcome to KingsArena!");

function addToCart(name, price, image) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ name, price: parseFloat(price), image, quantity: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));

  const count = document.getElementById('cart-count');
  if (count) {
    count.textContent = cart.length;
  }
}

function buyNow(name, price, image) {
  addToCart(name, price, image);
  window.location.href = "checkout.html";
}

document.addEventListener('DOMContentLoaded', () => {
  // Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function () {
      const name = this.dataset.name;
      const price = this.dataset.price;
      const image = this.dataset.image;
      addToCart(name, price, image);
    });
  });

  // Buy Now buttons
  document.querySelectorAll('.buy-now').forEach(button => {
    button.addEventListener('click', function () {
      const name = this.dataset.name;
      const price = this.dataset.price;
      const image = this.dataset.image;
      buyNow(name, price, image);
    });
  });

  // Load Cart Items if on cart or checkout page
  const cartItemsDiv = document.getElementById('cart-items');
  const cartTotalSpan = document.getElementById('cart-total');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (!cartItemsDiv || !cartTotalSpan) return;

  let subtotal = 0;
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalSpan.textContent = '0.00';
    return;
  }

  cart.forEach((item, index) => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    subtotal += itemTotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';

    let options = '';
    for (let i = 1; i <= 20; i++) {
      options += `<option value="${i}" ${i === quantity ? 'selected' : ''}>${i}</option>`;
    }

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">
          $${item.price.toFixed(2)}
          <select onchange="changeQuantity(${index}, this.value)">
            ${options}
          </select>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeItem(${index})">Remove</button>
    `;

    cartItemsDiv.appendChild(itemDiv);
  });

  const taxRate = 0.075;
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + taxAmount;

  cartTotalSpan.textContent = subtotal.toFixed(2);

  const taxDisplay = document.getElementById('cart-tax');
  if (taxDisplay) {
    taxDisplay.textContent = `Tax: $${taxAmount.toFixed(2)}`;
  }

  // On checkout.html, we show finalTotal (subtotal + tax + shipping) via that page’s script
});

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  location.reload();
}

function changeQuantity(index, value) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (!cart[index]) return;

  cart[index].quantity = parseInt(value);
  localStorage.setItem('cart', JSON.stringify(cart));
  location.reload();
}
