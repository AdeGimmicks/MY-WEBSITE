const GA_MEASUREMENT_ID = 'G-RZLCQBJB3E';
const META_PIXEL_ID = '457800017160804';

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

(function loadMetaPixel() {
  if (window.fbq) return;

  window._fbq = window._fbq || [];
  const fbq = window.fbq = function() {
    fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
  };

  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
})();

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

function eoVisitorId() {
  const key = 'eoVisitorId';
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = `eo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
}

function eoSessionId() {
  const key = 'eoSessionId';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `eos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

function eoTrackManagerVisit(event, params = {}) {
  const payload = {
    visitorId: eoVisitorId(),
    sessionId: eoSessionId(),
    event,
    page: window.location.pathname.split('/').pop() || 'index.html',
    title: document.title,
    referrer: document.referrer || 'Direct',
    ...params
  };

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/visitor-event', new Blob([body], { type: 'application/json' }));
    return;
  }

  fetch('/api/visitor-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

function eoTrackWebsiteVisit() {
  const key = 'eoManagerVisitTracked';
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  eoTrackManagerVisit('visit');
}

function eoTrackEvent(eventName, params = {}) {
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, params);
}

function eoTrackMeta(eventName, params = {}) {
  if (typeof fbq !== 'function') return;
  fbq('track', eventName, params);
}

function eoTrackProductView(product) {
  if (!product) return;
  const price = Number(product.price || 0);
  const itemId = product.id || product.name;

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

  eoTrackMeta('ViewContent', {
    content_ids: [itemId],
    content_name: product.name,
    content_type: 'product',
    currency: 'USD',
    value: price
  });

}

function eoTrackAddToCart(item) {
  if (!item) return;
  const price = Number(item.price || 0);
  const itemId = item.productId || item.id || item.name;

  eoTrackEvent('add_to_cart', {
    currency: 'USD',
    value: price,
    items: [eoAnalyticsItem(item)]
  });

  eoTrackMeta('AddToCart', {
    content_ids: [itemId],
    content_name: item.name,
    content_type: 'product',
    currency: 'USD',
    value: price
  });

}

function eoTrackBeginCheckout(cart, total) {
  const items = Array.isArray(cart) ? cart : [];

  eoTrackEvent('begin_checkout', {
    currency: 'USD',
    value: Number(total || 0),
    items: items.map(eoAnalyticsItem)
  });

  eoTrackMeta('InitiateCheckout', {
    content_ids: items.map(item => item.productId || item.id || item.name),
    content_type: 'product',
    currency: 'USD',
    num_items: items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    value: Number(total || 0)
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
  const items = Array.isArray(order.items) ? order.items : [];
  const value = Number(order.total || 0);

  eoTrackEvent('purchase', {
    transaction_id: order.orderNumber || order.paymentId || `EO-${Date.now()}`,
    currency: 'USD',
    value,
    tax: Number(order.tax || 0),
    shipping: Number(order.shipping || 0),
    items: items.map(eoAnalyticsItem)
  });

  eoTrackMeta('Purchase', {
    content_ids: items.map(item => item.productId || item.id || item.name),
    content_type: 'product',
    currency: 'USD',
    num_items: items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    value
  });

}

window.eoTrackEvent = eoTrackEvent;
window.eoTrackProductView = eoTrackProductView;
window.eoTrackAddToCart = eoTrackAddToCart;
window.eoTrackBeginCheckout = eoTrackBeginCheckout;
window.eoTrackViewCart = eoTrackViewCart;
window.eoTrackPurchase = eoTrackPurchase;
window.eoVisitorId = eoVisitorId;

if (!document.body?.dataset || document.body.dataset.page !== 'manager') {
  eoTrackWebsiteVisit();
}
