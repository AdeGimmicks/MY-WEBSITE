const DEFAULT_PRODUCTS = [
  {
    id: "samsung-smart-remote",
    name: "Samsung Smart TV Remote",
    description: "Compatible with most Samsung smart TVs.",
    price: 0.99,
    image: "Product images/Samsung Remote Pix/14.png",
    page: "samsung-remote.html",
    category: "Samsung",
    stock: 25,
    active: true,
    featured: true
  },
  {
    id: "samsung-solar-remote",
    name: "Samsung Solar TV Remote Replacement",
    description: "BN59-01455A Solar Voice Remote Replacement.",
    price: 18.99,
    image: "Product images/Samsung Solar Remotes/1.png",
    page: "samsungSolar-remote Replacement.html",
    category: "Samsung",
    stock: 20,
    active: true,
    featured: true
  },
  {
    id: "roku-streaming-remote",
    name: "Roku Streaming Remote",
    description: "Works with all Roku streaming devices.",
    price: 12.49,
    image: "Product images/Roku Remote control/26.png",
    page: "Roku-remote.html",
    category: "Roku",
    stock: 20,
    active: true,
    featured: true
  },
  {
    id: "fire-tv-voice-remote",
    name: "Fire TV Voice Remote",
    description: "Alexa-enabled with voice control features.",
    price: 18.99,
    image: "Product images/Alexa Remote Pix/1.png",
    page: "Alexatv-remote.html",
    category: "Amazon Fire TV",
    stock: 18,
    active: true,
    featured: true
  },
  {
    id: "vizio-tv-remote",
    name: "Vizio TV Replacement Remote",
    description: "Ready to use out of the box, no setup required.",
    price: 16.50,
    image: "Product images/Visio TV Remote/8.png",
    page: "vizio-remote.html",
    category: "Vizio",
    stock: 18,
    active: true,
    featured: true
  },
  {
    id: "lg-magic-remote",
    name: "LG Magic Remote",
    description: "Smart pointer remote compatible with LG Smart TV.",
    price: 16.50,
    image: "Product images/LG Remotes Pix/1.png",
    page: "lg tv-remote.html",
    category: "LG",
    stock: 20,
    active: true,
    featured: true
  },
  {
    id: "philips-tv-remote",
    name: "Philips TV Remote Replacement",
    description: "Compatible with Philips Smart TV.",
    price: 13.99,
    image: "Product images/Philip TV remote/22.png",
    page: "philips tv-remote.html",
    category: "Philips",
    stock: 16,
    active: true,
    featured: true
  }
];

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('API unavailable');
    return await response.json();
  } catch (error) {
    try {
      const fallback = await fetch('data/products.json');
      if (!fallback.ok) throw new Error('Fallback unavailable');
      return await fallback.json();
    } catch (fallbackError) {
      return DEFAULT_PRODUCTS;
    }
  }
}

function renderProductCard(product) {
  const price = Number(product.price || 0).toFixed(2);
  const stock = Number(product.stock || 0);
  const stockText = stock > 0 ? `${stock} in stock` : 'Out of stock';
  const disabledClass = stock > 0 ? '' : ' disabled';
  const productUrl = product.page || `product.html?id=${encodeURIComponent(product.id)}`;

  return `
    <div class="product-card">
      <a href="${productUrl}" class="product-link">
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <p><strong>$${price}</strong></p>
        <p class="stock-note">${stockText}</p>
      </a>
      <div class="buy-btn">
        <a href="#" class="btn small buy-now${disabledClass}"
          data-name="${product.name}"
          data-price="${price}"
          data-image="${product.image}"
          data-product-id="${product.id}">
          Buy Now
        </a>
        <a href="#" class="btn small add-to-cart${disabledClass}"
          data-name="${product.name}"
          data-price="${price}"
          data-image="${product.image}"
          data-product-id="${product.id}">
          Add to Cart
        </a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.querySelector('[data-product-list]');
  const productId = document.body.dataset.productId;
  const existingProductMarkup = productList ? productList.innerHTML : '';

  if (!productList && !productId) return;

  try {
    const products = await loadProducts();

    if (productId) {
      const product = products.find(item => item.id === productId);
      if (product) updateProductDetail(product);
    }

    if (!productList) return;

    const mode = productList.dataset.productList;
    const visibleProducts = products
      .filter(product => product.active !== false)
      .filter(product => mode !== 'featured' || product.featured !== false);

    if (visibleProducts.length === 0) {
      if (!existingProductMarkup.trim()) {
        productList.innerHTML = '<p>No products are available right now.</p>';
      }
      return;
    }

    productList.innerHTML = visibleProducts.map(renderProductCard).join('');

    if (typeof bindCartButtons === 'function') {
      bindCartButtons();
    }
  } catch (error) {
    if (productList && existingProductMarkup.trim()) {
      productList.innerHTML = existingProductMarkup;
    } else if (productList) {
      productList.innerHTML = '<p>Products could not be loaded right now.</p>';
    }
    console.error('Product loading error:', error);
  }
});

function updateProductDetail(product) {
  const price = Number(product.price || 0).toFixed(2);
  const title = document.querySelector('.product-info h2');
  const summary = document.querySelector('.product-info > p');
  const priceLine = Array.from(document.querySelectorAll('.product-info > p'))
    .find(paragraph => paragraph.textContent.includes('Price:'));
  const mainImage = document.getElementById('mainProductImage');

  if (title) title.textContent = product.name;
  if (summary) summary.textContent = product.description;
  if (priceLine) priceLine.innerHTML = `<strong>Price:</strong> $${price}`;
  if (mainImage) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  const gallery = Array.isArray(product.gallery) && product.gallery.length
    ? product.gallery
    : [product.image].filter(Boolean);
  const thumbnailWrap = document.querySelector('.thumbnails');
  if (thumbnailWrap && gallery.length) {
    thumbnailWrap.innerHTML = gallery.slice(0, 6).map(image => `
      <img src="${image}" alt="${product.name}" onclick="changeImage(this.src)">
    `).join('');
  }

  document.querySelectorAll('.buy-now, .add-to-cart').forEach(button => {
    button.dataset.name = product.name;
    button.dataset.price = price;
    button.dataset.image = product.image;
    button.dataset.productId = product.id;
    button.classList.toggle('disabled', Number(product.stock || 0) <= 0 || product.active === false);
  });

  const existingStock = document.querySelector('.product-stock-note');
  if (existingStock) existingStock.remove();

  const stockNote = document.createElement('p');
  stockNote.className = 'stock-note product-stock-note';
  stockNote.textContent = Number(product.stock || 0) > 0
    ? `${Number(product.stock || 0)} in stock`
    : 'Out of stock';

  const buyButtons = document.querySelector('.product-info .buy-btn');
  if (buyButtons) buyButtons.before(stockNote);

  if (typeof bindCartButtons === 'function') {
    bindCartButtons();
  }
}
