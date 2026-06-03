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

function addToCart(name, price, image, productId) {

  const cart = getCart();

  // Check if item already exists
  const existingItem = cart.find(item => (productId && item.productId === productId) || item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price: parseFloat(price),
      image,
      productId,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();
  if (typeof eoTrackAddToCart === 'function') {
    eoTrackAddToCart({ name, price: parseFloat(price), image, productId, quantity: 1 });
  }
}

function buyNow(name, price, image, productId) {
  addToCart(name, price, image, productId);
  if (typeof eoTrackBeginCheckout === 'function') {
    eoTrackBeginCheckout(getCart(), parseFloat(price));
  }
  window.location.href = "/checkout";
}

let cartEventsBound = false;

function bindCartButtons() {
  if (cartEventsBound) return;
  cartEventsBound = true;

  document.addEventListener('click', event => {
    const button = event.target.closest('.add-to-cart, .buy-now');
    if (!button) return;

    event.preventDefault();
    if (button.classList.contains('disabled')) return;

    const name = button.dataset.name;
    const price = button.dataset.price;
    const image = button.dataset.image;
    const productId = button.dataset.productId;

    if (button.classList.contains('buy-now')) {
      buyNow(name, price, image, productId);
      return;
    }

    addToCart(name, price, image, productId);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  updateCartCount();
  bindCartButtons();

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
    if (taxDisplay) taxDisplay.innerHTML = '<strong>Tax:</strong> <span class="summary-amount">$0.00</span>';

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
    taxDisplay.innerHTML = `<strong>Tax:</strong> <span class="summary-amount">$${taxAmount.toFixed(2)}</span>`;
  }

  if (typeof eoTrackViewCart === 'function' && /^\/?cart(?:\.html)?$/i.test(window.location.pathname.replace(/^\//, ''))) {
    eoTrackViewCart(cart, finalTotal);
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
