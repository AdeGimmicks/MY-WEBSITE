const GA_MEASUREMENT_ID = 'G-RZLCQBJ3E';

window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}

(function loadGoogleTag() {
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
})();

gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID);

function eoAnalyticsItem(item) {
  const quantity = Number(item.quantity || 1);
  const price = Number(item.price || item.value || 0);

  return {
    item_id: item.productId || item.id || item.name,
    item_name: item.name,
    price,
    quantity
  };
}

function eoTrackEvent(eventName, params = {}) {
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, params);
}

function eoTrackProductView(product) {
  if (!product) return;
  const price = Number(product.price || 0);

  eoTrackEvent('view_item', {
    currency: 'USD',
    value: price,
    items: [eoAnalyticsItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price,
      quantity: 1
    })]
  });
}

function eoTrackAddToCart(item) {
  if (!item) return;
  const price = Number(item.price || 0);

  eoTrackEvent('add_to_cart', {
    currency: 'USD',
    value: price,
    items: [eoAnalyticsItem(item)]
  });
}

function eoTrackBeginCheckout(cart, total) {
  eoTrackEvent('begin_checkout', {
    currency: 'USD',
    value: Number(total || 0),
    items: (Array.isArray(cart) ? cart : []).map(eoAnalyticsItem)
  });
}

function eoTrackViewCart(cart, total) {
  eoTrackEvent('view_cart', {
    currency: 'USD',
    value: Number(total || 0),
    items: (Array.isArray(cart) ? cart : []).map(eoAnalyticsItem)
  });
}

function eoTrackPurchase(order) {
  if (!order) return;

  eoTrackEvent('purchase', {
    transaction_id: order.orderNumber || order.paymentId || `EO-${Date.now()}`,
    currency: 'USD',
    value: Number(order.total || 0),
    tax: Number(order.tax || 0),
    shipping: Number(order.shipping || 0),
    items: (Array.isArray(order.items) ? order.items : []).map(eoAnalyticsItem)
  });
}
