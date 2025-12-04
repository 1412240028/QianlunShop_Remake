// =========================
// 🏪 QIANLUNSHOP - MAIN SCRIPT
// Modular architecture with imported components
// =========================
import { Cart } from "./cart.js";
import { CONFIG, Utils } from "./config.js";
import { showToast, updateCartCount, flyToCart, loadingState, errorDisplay, toastManager } from "./ui.js";
import { initCartPage } from "./cart.js";
import { initProductFilters, initDiscoverMore, initProductAddToCart } from "./products.js";
import { initCheckoutPage } from "./checkout.js";
import { errorHandler } from "./error-handler.js";
import { apiRateLimiter, userActionLimiter, inputSanitizer } from "./security.js";

// =========================
// 🎯 Global Cart Instance
// =========================
const cart = new Cart();

// =========================
// 📦 Order Confirmation Page - ENHANCED
// =========================
function initOrderConfirmation() {
  const confirmationContainer = document.querySelector(".order-confirmation");
  if (!confirmationContainer) return;

  console.log("📦 Initializing enhanced order confirmation...");

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (!orderId) {
    confirmationContainer.innerHTML = Sanitizer.sanitizeHTML(`
      <div class="empty-cart">
        <div class="empty-cart-icon">⚠️</div>
        <h3>Pesanan Tidak Ditemukan</h3>
        <p>Sepertinya Anda membuka halaman ini tanpa menyelesaikan transaksi.</p>
        <div class="confirmation-actions">
          <a href="products.html" class="btn btn-primary">🛍️ Belanja Sekarang</a>
          <a href="../index.html" class="btn btn-secondary">🏠 Kembali ke Beranda</a>
        </div>
      </div>
    `);
    return;
  }

  const orders = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.ORDERS, []);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    confirmationContainer.innerHTML = Sanitizer.sanitizeHTML(`
      <div class="empty-cart">
        <div class="empty-cart-icon">❌</div>
        <h3>Data Pesanan Tidak Ditemukan</h3>
        <p>Kami tidak dapat menemukan pesanan dengan ID tersebut.</p>
        <div class="confirmation-actions">
          <a href="checkout.html" class="btn btn-primary">🛒 Kembali ke Checkout</a>
          <a href="products.html" class="btn btn-secondary">🛍️ Lanjutkan Belanja</a>
        </div>
      </div>
    `);
    return;
  }

  // Render complete order confirmation
  confirmationContainer.innerHTML = `
    <div class="confirmation-icon">🎉</div>
    <h2>Pesanan Berhasil!</h2>
    <p class="order-id">Order ID: <span>${order.id}</span></p>
    <p class="confirmation-message">Terima kasih telah berbelanja di QianlunShop. Pesanan Anda sedang diproses dengan aman.</p>

    <div class="confirmation-details">
      <div class="detail-section">
        <h4>📦 Detail Pesanan</h4>
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/sample1.jpg'">
            <div class="item-info">
              <strong>${item.name}</strong>
              <span>${Utils.formatPrice(item.price)} × ${item.quantity}</span>
            </div>
            <div class="item-total">${Utils.formatPrice(item.price * item.quantity)}</div>
          </div>
        `).join('')}
      </div>

      <div class="detail-section">
        <h4>📋 Ringkasan Pembayaran</h4>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${Utils.formatPrice(order.totals.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Ongkos Kirim:</span>
          <span>${Utils.formatPrice(order.totals.shipping)}</span>
        </div>
        <div class="summary-row">
          <span>Pajak (${(CONFIG.TAX_RATE * 100)}%):</span>
          <span>${Utils.formatPrice(order.totals.tax)}</span>
        </div>
        ${order.totals.discount > 0 ? `
          <div class="summary-row discount">
            <span>Diskon:</span>
            <span>- ${Utils.formatPrice(order.totals.discount)}</span>
          </div>
        ` : ''}
        <div class="summary-row grand-total">
          <span>Total:</span>
          <span>${Utils.formatPrice(order.totals.grandTotal)}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4>🚚 Informasi Pengiriman</h4>
        <div class="detail-item">
          <strong>Metode:</strong>
          <span>${order.shipping.methodName || order.shipping.method}</span>
        </div>
        <div class="detail-item">
          <strong>Estimasi Tiba:</strong>
          <span>${order.shipping.estimatedDelivery}</span>
        </div>
        <div class="detail-item">
          <strong>Alamat:</strong>
          <span>${order.customerInfo.address}, ${order.customerInfo.city} ${order.customerInfo.postalCode}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4>💳 Informasi Pembayaran</h4>
        <div class="detail-item">
          <strong>Metode:</strong>
          <span>${order.payment.methodName || order.payment.method}</span>
        </div>
        ${order.payment.cardLastFour ? `
          <div class="detail-item">
            <strong>Kartu:</strong>
            <span>•••• ${order.payment.cardLastFour}</span>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="confirmation-actions">
      <a href="products.html" class="btn btn-primary">🛍️ Lanjutkan Belanja</a>
      <a href="../index.html" class="btn btn-secondary">🏠 Kembali ke Beranda</a>
      <button class="btn btn-outline" id="printReceipt">🖨️ Cetak Struk</button>
    </div>

    <div class="confirmation-security">
      <p>🔒 Transaksi Anda aman dan terlindungi</p>
      <small>Jika ada pertanyaan, hubungi customer service kami</small>
    </div>
  `;

  // Print receipt functionality
  document.getElementById('printReceipt')?.addEventListener('click', () => {
    window.print();
  });

  // Track successful purchase
  Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.PURCHASE, {
    transaction_id: order.id,
    value: order.totals.grandTotal,
    currency: 'IDR'
  });
}

// =========================
// 📱 MOBILE MENU HANDLER
// =========================
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.navbar ul');

  if (!menuBtn || !navLinks) return;

  // Create overlay
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    document.body.appendChild(overlay);
  }

  // Cleanup function for event listeners
  const cleanup = () => {
    menuBtn.removeEventListener('click', toggleMenu);
    overlay.removeEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(link => {
      link.removeEventListener('click', closeMenu);
    });
    document.removeEventListener('keydown', handleEscape);
  };

  // Store cleanup function globally for page navigation
  window.mobileMenuCleanup = cleanup;

  const toggleMenu = (e) => {
    e.stopPropagation();
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');

    const isActive = navLinks.classList.contains('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
    overlay.style.opacity = isActive ? '1' : '0';
    overlay.style.visibility = isActive ? 'visible' : 'hidden';
  };

  const closeMenu = () => {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  };

  // Toggle menu
  menuBtn.addEventListener('click', toggleMenu);

  // Close on overlay click
  overlay.addEventListener('click', closeMenu);

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC key
  document.addEventListener('keydown', handleEscape);

  console.log('✅ Mobile menu initialized');
}

// =========================
// 🎯 Initialize All Features
// =========================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 QianlunShop Modular Version Initializing...");

  // Initialize cart count on all pages
  updateCartCount(cart);

  // Initialize all page-specific features
  initMobileMenu(); // ✅ Add mobile menu handler
  initCartPage();
  initProductFilters();
  initDiscoverMore();
  initProductAddToCart();
  initCheckoutPage();
  initOrderConfirmation();

  // Listen for cart updates from other tabs
  cart.on('cart-synced', () => {
    console.log("🔄 Cart synced across tabs");
    updateCartCount(cart);

    // Re-render cart page if needed
    if (document.querySelector('.cart-container')) {
      initCartPage();
    }
  });

  console.log("✅ QianlunShop Modular Version Ready!");
});

// =========================
// 🎯 Global Exports for Interoperability
// =========================
window.QianlunShop = {
  cart,
  showToast,
  updateCartCount,
  flyToCart,
  Utils,
  CONFIG,
  loadingState,
  errorDisplay,
  toastManager,
  apiRateLimiter,
  userActionLimiter,
  inputSanitizer,
  errorHandler
};
