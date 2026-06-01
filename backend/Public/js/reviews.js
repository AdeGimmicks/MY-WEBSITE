const DEFAULT_REVIEWS = [
  {
    name: "Recent customer",
    text: "Checkout was simple, and I found the right Samsung remote without stress.",
    rating: 5
  },
  {
    name: "TV remote buyer",
    text: "The product page made it easy to compare the remote pictures before ordering.",
    rating: 5
  },
  {
    name: "Online shopper",
    text: "Clear pricing, easy cart, and the order receipt showed everything I needed.",
    rating: 5
  }
];

function starText(rating) {
  const count = Math.min(5, Math.max(1, Number(rating || 5)));
  return "&#9733;".repeat(count) + "&#9734;".repeat(5 - count);
}

function escapeReviewText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reviewCard(review) {
  const rating = Math.min(5, Math.max(1, Number(review.rating || 5)));
  return `
    <article class="review-card">
      <div class="review-stars" aria-label="${rating} out of 5 stars">${starText(rating)}</div>
      <p>"${escapeReviewText(review.text)}"</p>
      <strong>${escapeReviewText(review.name)}</strong>
    </article>
  `;
}

async function loadPublicReviews() {
  const reviewLists = document.querySelectorAll("[data-review-list]");
  if (!reviewLists.length) return;

  try {
    const response = await fetch("/api/reviews", { cache: "no-store" });
    if (!response.ok) throw new Error("Reviews unavailable");
    const reviews = await response.json();
    const activeReviews = (Array.isArray(reviews) && reviews.length ? reviews : DEFAULT_REVIEWS).slice(0, 6);
    reviewLists.forEach(list => {
      list.innerHTML = activeReviews.map(reviewCard).join("");
    });
  } catch {
    reviewLists.forEach(list => {
      if (!list.children.length) {
        list.innerHTML = DEFAULT_REVIEWS.map(reviewCard).join("");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadPublicReviews);
