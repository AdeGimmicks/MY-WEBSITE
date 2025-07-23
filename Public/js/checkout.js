console.log("Welcome to ElectronicsOnly.com!");

// Initialize Stripe with your real publishable key
const stripe = Stripe("pk_live_51O5HvsG4lCkKqAxdeefJRoaHWQ1vzAJlOJvZCAMsorL3J3pSyD1cqomDKW4P2PTbXKMih08ej613DJ6JtslJmt6900OjlCC376");

function addToCart(name, price, image) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ name, price: parseFloat(price), image });
  localStorage.setItem('cart', JSON.stringify(cart));

  // Update cart icon count
  const count = document.getElementById('cart-count');
  if (count) {
    count.textContent = cart.length;
  }
}

function buyNow(name, price, image) {
  const product = {
    name,
    price: parseFloat(price),
    image
  };
  localStorage.setItem('checkoutItem', JSON.stringify(product)); // Not "cart"
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

  // Load cart items if on checkout.html
  const cartItemsDiv = document.getElementById('checkout-items');
  const cartTotalSpan = document.getElementById('heckout-total');

  if (cartItemsDiv && cartTotalSpan) {
    const cart = JSON.parse(localStorage.getItem('checkout')) || [];
    let total = 0;

    cartItemsDiv.innerHTML = '';

    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
      cartTotalSpan.textContent = '0.00';
    } else {
      cart.forEach((item, index) => {
        total += item.price;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
          <button class="cart-item-remove" onclick="removeItem(${index})">Remove</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
      });

      cartTotalSpan.textContent = total.toFixed(2);
    }
  }

  // Stripe payment: trigger checkout session
  const checkoutButton = document.getElementById("checkout-button");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", async () => {
      try {
        const response = await fetch("http://localhost:4242/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items: JSON.parse(localStorage.getItem("checkoutItem")) || []
          })
        });

        const session = await response.json();

        if (session.id) {
          const result = await stripe.redirectToCheckout({
            sessionId: session.id
          });

          if (result.error) {
            alert(result.error.message);
          }
        } else {
          alert("Error: Unable to create Stripe session.");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  }
});

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  location.reload();
}
