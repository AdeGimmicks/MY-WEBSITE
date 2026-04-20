console.log("Welcome to ElectronicsOnly!");

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = document.getElementById('cart-count');

  if (count) {
    let totalItems = 0;
    cart.forEach(item => {
      totalItems += item.quantity || 1;
    });

    count.textContent = totalItems;
  }
}

function addToCart(name, price, image) {

  const cart = getCart();

  // Check if item already exists
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price: parseFloat(price),
      image,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();
}

function buyNow(name, price, image) {
  addToCart(name, price, image);
  window.location.href = "checkout.html";
}

document.addEventListener('DOMContentLoaded', () => {

  updateCartCount();

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

  // Load Cart Items
  const cartItemsDiv = document.getElementById('cart-items');
  const cartTotalSpan = document.getElementById('cart-total');

  if (!cartItemsDiv || !cartTotalSpan) return;

  const cart = getCart();

  let subtotal = 0;
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {

    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalSpan.textContent = '0.00';

    const taxDisplay = document.getElementById('cart-tax');
    if (taxDisplay) taxDisplay.textContent = 'Tax: $0.00';

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

      <button class="cart-item-remove" onclick="removeItem(${index})">
        Remove
      </button>
    `;

    cartItemsDiv.appendChild(itemDiv);

  });

  // Tax and totals
  const taxRate = 0.075;

  const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));

  const finalTotal = parseFloat((subtotal + taxAmount).toFixed(2));

  cartTotalSpan.textContent = finalTotal.toFixed(2);

  const taxDisplay = document.getElementById('cart-tax');

  if (taxDisplay) {
    taxDisplay.textContent = `Tax: $${taxAmount.toFixed(2)}`;
  }

  // Save cart summary for checkout page
  localStorage.setItem('cartSummary', JSON.stringify({

    subtotal: subtotal.toFixed(2),
    tax: taxAmount.toFixed(2),
    total: finalTotal.toFixed(2)

  }));

});

function removeItem(index) {

  const cart = getCart();

  cart.splice(index, 1);

  saveCart(cart);

  location.reload();
}

function changeQuantity(index, value) {

  const cart = getCart();

  if (!cart[index]) return;

  cart[index].quantity = parseInt(value);

  saveCart(cart);

  location.reload();
}