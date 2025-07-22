document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('checkout-cart-items');
  
    let total = 0;
  
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      document.getElementById('checkout-form').style.display = 'none';
      return;
    }
  
    cart.forEach(item => {
      total += item.price;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <p><strong>${item.name}</strong> - $${item.price.toFixed(2)}</p>
      `;
      cartContainer.appendChild(itemDiv);
    });
  
    const totalEl = document.createElement('p');
    totalEl.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    cartContainer.appendChild(totalEl);
  });
  
  document.getElementById('checkout-form').addEventListener('submit', function (e) {
    e.preventDefault();
    localStorage.removeItem('cart');
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('checkout-cart-items').innerHTML = '';
    document.getElementById('success-message').style.display = 'block';
  });
  