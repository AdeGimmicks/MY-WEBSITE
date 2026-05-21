async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('API unavailable');
    return await response.json();
  } catch (error) {
    const fallback = await fetch('data/products.json');
    return fallback.json();
  }
}

function renderProductCard(product) {
  const price = Number(product.price || 0).toFixed(2);
  const stock = Number(product.stock || 0);
  const stockText = stock > 0 ? `${stock} in stock` : 'Out of stock';
  const disabledClass = stock > 0 ? '' : ' disabled';

  return `
    <div class="product-card">
      <a href="${product.page}" class="product-link">
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

  if (!productList && !productId) return;

  try {
    const products = await loadProducts();

    if (productId) {
      const product = products.find(item => item.id === productId);
      if (product) updateProductDetail(product);
    }

    if (!productList) return;

    productList.innerHTML = '<p>Loading products...</p>';
    const mode = productList.dataset.productList;
    const visibleProducts = products
      .filter(product => product.active !== false)
      .filter(product => mode !== 'featured' || product.featured !== false);

    if (visibleProducts.length === 0) {
      productList.innerHTML = '<p>No products are available right now.</p>';
      return;
    }

    productList.innerHTML = visibleProducts.map(renderProductCard).join('');

    if (typeof bindCartButtons === 'function') {
      bindCartButtons();
    }
  } catch (error) {
    if (productList) {
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
