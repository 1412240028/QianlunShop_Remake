// =========================
// 💳 CHECKOUT MODULE - QIANLUNSHOP
// Extracted from script.js for better modularity
// =========================
import { Cart } from "./cart.js";
import { CONFIG, Utils } from "./config.js";
import { showToast, Modal } from "./ui.js";

// =========================
// 💳 Checkout Manager Class
// =========================
export class CheckoutManager {
  constructor() {
    this.cart = new Cart();
    this.shippingCost = 0;
    this.discount = 0;
    this.promoCode = '';
    this.init();
  }

  init() {
    this.displayCheckoutItems();
    this.calculateTotals();
    this.setupEventListeners();

    console.log("💳 Enhanced checkout manager initialized");
  }

  displayCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    const placeOrderBtn = document.getElementById('placeOrder');
    if (!checkoutItems) return;

    const items = this.cart.getItems();

    if (items.length === 0) {
      checkoutItems.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h3>Keranjang Kosong</h3>
          <p>Silakan tambahkan produk ke keranjang terlebih dahulu</p>
          <a href="products.html" class="btn btn-primary">Belanja Sekarang</a>
        </div>
      `;

      // Disable the place order button if cart is empty
      if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Keranjang Kosong';
        placeOrderBtn.style.opacity = '0.5';
        placeOrderBtn.style.cursor = 'not-allowed';
      }

      return;
    }

    checkoutItems.innerHTML = items.map(item => `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/sample1.jpg'">
        <div class="item-details">
          <h4>${item.name}</h4>
          <p>${this.formatCategory(item.category)}</p>
          <p>Qty: ${item.quantity}</p>
        </div>
        <div class="item-total">${Utils.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');

    // Enable the place order button if cart has items
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = '🛍️ Bayar Sekarang';
      placeOrderBtn.style.opacity = '';
      placeOrderBtn.style.cursor = '';
    }
  }

  calculateTotals() {
    const subtotal = this.cart.getTotal();
    const tax = subtotal * CONFIG.TAX_RATE;
    const grandTotal = subtotal + this.shippingCost + tax - this.discount;
  
    // Update UI elements
    const elements = {
      'subtotal': subtotal,
      'shippingCost': this.shippingCost,
      'taxAmount': tax,
      'discountAmount': -this.discount,
      'grandTotal': grandTotal
    };
  
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = Utils.formatPrice(value);
      }
    });
    this.updateShippingSelectionOnly(subtotal);
  
    // Update free shipping message
    const freeShippingMsg = document.getElementById('freeShippingMsg');
    if (freeShippingMsg) {
      if (Utils.isFreeShippingEligible(subtotal)) {
        freeShippingMsg.style.display = 'block';
        freeShippingMsg.innerHTML = `🎉 Anda mendapatkan <strong>gratis ongkir</strong>!`;
      } else {
        const needed = CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
        freeShippingMsg.style.display = needed > 0 ? 'block' : 'none';
        freeShippingMsg.innerHTML = `Tambahkan <strong>${Utils.formatPrice(needed)}</strong> lagi untuk gratis ongkir!`;
      }
    }
  }

  updateShippingSelectionOnly(subtotal) {
    const shippingSelect = document.getElementById('shipping');
    if (!shippingSelect) return;

    // Always keep current selection, no auto-switching
    this.updateShippingOptions();
  }

  updateShippingOptions(isEligible) {
    const shippingSelect = document.getElementById('shipping');
    if (!shippingSelect) return;

    // Populate shipping options - always show all options including FREE
    const shippingOptions = Object.entries(CONFIG.SHIPPING);

    shippingSelect.innerHTML = shippingOptions.map(([key, method]) => `
      <option value="${key.toLowerCase()}">
        ${method.name} - ${Utils.formatPrice(method.cost)}
        (${Utils.getEstimatedDelivery(key)})
      </option>
    `).join('');

    // Ensure the current selection is still valid
    const currentValue = shippingSelect.value;
    const validOptions = shippingOptions.map(([key]) => key.toLowerCase());
    if (!validOptions.includes(currentValue)) {
      shippingSelect.value = validOptions[0] || 'regular';
      this.updateShippingCost(shippingSelect.value);
    }
  }

  updateShippingCost(method, preventRecalculation = false) {
    const shipping = CONFIG.SHIPPING[method.toUpperCase()];

    if (!shipping) {
      this.shippingCost = 0;
      return;
    }

    let costChanged = false;
    let oldCost = this.shippingCost;

    // Always set cost based on shipping method - free shipping is always free
    this.shippingCost = shipping.cost;
    costChanged = (oldCost !== this.shippingCost);

    if (costChanged && !preventRecalculation) {
      this.calculateTotals();
    }
  }

  setupEventListeners() {
    // Shipping method selection
    const shippingSelect = document.getElementById('shipping');
    if (shippingSelect) {
      const isEligible = Utils.isFreeShippingEligible(this.cart.getTotal());

      // Populate shipping options - always show all options including FREE
      const shippingOptions = Object.entries(CONFIG.SHIPPING);

      shippingSelect.innerHTML = shippingOptions.map(([key, method]) => `
        <option value="${key.toLowerCase()}">
          ${method.name} - ${Utils.formatPrice(method.cost)}
          (${Utils.getEstimatedDelivery(key)})
        </option>
      `).join('');

      shippingSelect.addEventListener('change', (e) => {
        this.updateShippingCost(e.target.value);
      });

      // Set default to free shipping if eligible, otherwise regular
      shippingSelect.value = isEligible ? 'free' : 'regular';

      // Set initial shipping cost
      this.updateShippingCost(shippingSelect.value);
    }

    // Payment methods
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const creditCardForm = document.getElementById('creditCardForm');

    paymentMethods.forEach(method => {
      method.addEventListener('change', (e) => {
        if (creditCardForm) {
          creditCardForm.style.display = e.target.value === 'creditCard' ? 'block' : 'none';
        }
      });
    });

    // Promo code
    const applyPromoBtn = document.getElementById('applyPromo');
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
    }

    // Place order
    const placeOrderBtn = document.getElementById('placeOrder');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.placeOrder();
      });
    }

    // Form validation
    this.setupFormValidation();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('input, select');
    forms.forEach(form => {
      form.addEventListener('blur', (e) => {
        this.validateField(e.target);
      });
    });
  }

  // ✅ FIX: Improved field validation
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // ✅ Skip validation jika field hidden
    const style = window.getComputedStyle(field);
    const parentStyle = field.parentElement ?
      window.getComputedStyle(field.parentElement) : null;

    if (style.display === 'none' ||
        (parentStyle && parentStyle.display === 'none')) {
      return true; // Field hidden, skip validation
    }

    // Check required first
    if (field.required && !value) {
      isValid = false;
      message = 'Field ini wajib diisi';
      this.updateFieldError(field, isValid, message);
      return isValid;
    }

    // Skip validation if empty and not required
    if (!value && !field.required) {
      this.updateFieldError(field, true, '');
      return true;
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        isValid = Utils.validateEmail(value);
        message = isValid ? '' : 'Format email tidak valid (contoh: nama@email.com)';
        break;

      case 'tel':
        isValid = Utils.validatePhone(value);
        message = isValid ? '' : 'Format nomor telepon tidak valid (contoh: 08123456789)';
        break;

      case 'text':
        // Field-specific validation
        if (field.id === 'postalCode') {
          isValid = /^\d{5}$/.test(value);
          message = isValid ? '' : 'Kode pos harus 5 digit angka';
        } else if (field.id === 'cardNumber') {
          // Credit card Luhn validation
          const cleanNumber = value.replace(/\s/g, '');
          isValid = /^\d{13,19}$/.test(cleanNumber) && this.luhnCheck(cleanNumber);
          message = isValid ? '' : 'Nomor kartu tidak valid';
        } else if (field.id === 'cvv') {
          isValid = /^\d{3,4}$/.test(value);
          message = isValid ? '' : 'CVV harus 3-4 digit';
        } else if (field.id === 'expiryDate') {
          isValid = this.validateExpiryDate(value);
          message = isValid ? '' : 'Format MM/YY, harus masa depan';
        } else if (field.id === 'fullName') {
          isValid = value.length >= 3;
          message = isValid ? '' : 'Nama minimal 3 karakter';
        } else if (field.id === 'address') {
          isValid = value.length >= 10;
          message = isValid ? '' : 'Alamat minimal 10 karakter';
        }
        break;

      case 'select-one':
        isValid = value !== '' && value !== 'null';
        message = isValid ? '' : 'Silakan pilih salah satu';
        break;
    }

    this.updateFieldError(field, isValid, message);
    return isValid;
  }

  // Helper: Update field error display
  updateFieldError(field, isValid, message) {
    field.classList.toggle('error', !isValid);

    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.cssText = `
        color: var(--error);
        font-size: 0.85rem;
        margin-top: 0.3rem;
        display: none;
      `;
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    errorElement.textContent = message;
    errorElement.style.display = message ? 'block' : 'none';
  }

  // Helper: Luhn algorithm for credit card
  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Helper: Validate expiry date
  validateExpiryDate(value) {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiry = new Date(year, month - 1);

    return expiry > now;
  }

  applyPromoCode() {
    const promoCodeEl = document.getElementById('promoCode');
    if (!promoCodeEl) return;

    const promoCode = promoCodeEl.value.trim().toUpperCase();
    const subtotal = this.cart.getTotal();

    this.discount = Utils.calculateDiscount(subtotal, promoCode);

    if (this.discount > 0) {
      this.promoCode = promoCode;
      showToast(CONFIG.MESSAGES.PROMO_APPLIED, 'success');
      this.calculateTotals();

      // Track analytics
      Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.APPLY_PROMO, {
        promo_code: promoCode,
        discount_amount: this.discount
      });
    } else {
      showToast(CONFIG.MESSAGES.PROMO_INVALID, 'error');
      this.promoCode = '';
      this.discount = 0;
      this.calculateTotals();
    }
  }

  async showOrderConfirmation() {
    const subtotal = this.cart.getTotal();
    const discountedSubtotal = subtotal - this.discount;
    const tax = discountedSubtotal * CONFIG.TAX_RATE;
    const grandTotal = discountedSubtotal + this.shippingCost + tax;

    const message = `Apakah data pesanan sudah benar?\n\nTotal: ${Utils.formatPrice(grandTotal)}\n\nKlik OK untuk melanjutkan pembayaran.`;

    return await Modal.confirm(message, 'Konfirmasi Pesanan');
  }

  showPaymentLoading() {
    const overlay = document.createElement('div');
    overlay.id = 'payment-loading';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'loading-title');
    overlay.setAttribute('aria-describedby', 'loading-description');
    overlay.innerHTML = `
      <div class="payment-loading-modal">
        <div class="loading-spinner" aria-hidden="true"></div>
        <h3 id="loading-title">🔄 Memproses Pembayaran</h3>
        <p id="loading-description">Mohon tunggu, jangan tutup halaman ini...</p>
        <div class="payment-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Progress pembayaran">
          <div class="progress-bar"></div>
        </div>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(overlay);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Memproses pembayaran, mohon tunggu sebentar';
    overlay.appendChild(announcement);

    // Animate progress bar
    const progressBar = overlay.querySelector('.progress-bar');
    progressBar.style.cssText = `
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, #007bff, #28a745);
      border-radius: 2px;
      transition: width 2s ease-in-out;
    `;

    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 100);
  }

// =========================
// 💳 FIXED CHECKOUT - QIANLUNSHOP
// Bug fix: Validate hanya field yang visible
// =========================

async placeOrder() {
  console.log("🛍️ Place Order clicked");

  // Check cart
  if (this.cart.getItems().length === 0) {
    showToast('Keranjang belanja kosong', 'error');
    return;
  }

  // ✅ FIX: Validate hanya field yang VISIBLE
  const requiredFields = Array.from(document.querySelectorAll('[required]'));

  // Filter hanya field yang visible
  const visibleFields = requiredFields.filter(field => {
    // Check if field atau parent-nya hidden
    const style = window.getComputedStyle(field);
    const parentStyle = field.parentElement ?
      window.getComputedStyle(field.parentElement) : null;

    return style.display !== 'none' &&
           (!parentStyle || parentStyle.display !== 'none');
  });

  console.log("📋 Validating fields:", visibleFields.length);

  let allValid = true;
  let firstInvalidField = null;

  visibleFields.forEach(field => {
    const isValid = this.validateField(field);
    if (!isValid) {
      allValid = false;
      if (!firstInvalidField) {
        firstInvalidField = field;
      }
    }
  });

  if (!allValid) {
    showToast(CONFIG.MESSAGES.FORM_INCOMPLETE, 'error');

    // Focus ke field pertama yang invalid
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      firstInvalidField.focus();
    }
    return;
  }

  console.log("✅ All fields valid");

  // ✅ FIX: Show confirmation dengan proper error handling
  try {
    const confirmed = await this.showOrderConfirmation();

    if (!confirmed) {
      console.log("❌ User cancelled order");
      return; // User cancel, nothing to do
    }
  } catch (error) {
    console.error("❌ Confirmation modal error:", error);
    showToast("Terjadi kesalahan, silakan coba lagi", "error");
    return;
  }

  // ✅ FIX: Disable button dengan proper state management
  const placeOrderBtn = document.getElementById('placeOrder');
  const originalText = placeOrderBtn ? placeOrderBtn.innerHTML : '';

  try {
    if (placeOrderBtn) {
      placeOrderBtn.innerHTML = '⏳ ' + CONFIG.MESSAGES.PAYMENT_PROCESSING;
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.cursor = 'not-allowed';
      placeOrderBtn.style.opacity = '0.6';
    }

    console.log("💳 Processing payment...");
    await this.processPayment();

    // Calculate totals
    const subtotal = this.cart.getTotal();
    const discountedSubtotal = subtotal - this.discount;
    const tax = discountedSubtotal * CONFIG.TAX_RATE;
    const grandTotal = discountedSubtotal + this.shippingCost + tax;

    const order = {
      id: Utils.generateId('ORD'),
      date: new Date().toISOString(),
      items: this.cart.getItems(),
      customerInfo: this.getCustomerInfo(),
      shipping: this.getShippingInfo(),
      payment: this.getPaymentInfo(),
      promoCode: this.promoCode,
      totals: {
        subtotal: subtotal,
        shipping: this.shippingCost,
        tax: tax,
        discount: this.discount,
        grandTotal: grandTotal
      },
      status: 'completed'
    };

    this.saveOrder(order);

    // ✅ FIX: Clear cart DULU sebelum save order data
    console.log("🗑️ Clearing cart...");
    await this.cart.clear();

    // ✅ Baru save order data untuk confirmation page
    const orderData = {
      orderId: order.id,
      date: new Date().toLocaleDateString('id-ID'),
      customerEmail: order.customerInfo.email,
      paymentMethod: order.payment.methodName,
      shippingAddress: `${order.customerInfo.address}, ${order.customerInfo.city} ${order.customerInfo.postalCode}`,
      total: order.totals.grandTotal
    };

    console.log("💾 Saving order data:", orderData);
    Utils.saveToStorage('qianlunshop_last_order', orderData);

    // Show success notification
    showToast('🎉 Pembayaran berhasil! Mengalihkan...', 'success');

    // Track analytics
    if (typeof Utils !== 'undefined' && Utils.trackEvent) {
      Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.PURCHASE, {
        transaction_id: order.id,
        value: order.totals.grandTotal,
        currency: 'IDR'
      });
    }

    // Redirect dengan delay
    setTimeout(() => {
      console.log("🔄 Redirecting to confirmation...");
      window.location.href = `order-confirmation.html`;
    }, 1500);

  } catch (error) {
    console.error('❌ Order error:', error);
    showToast(CONFIG.MESSAGES.ORDER_FAILED, 'error');

    // ✅ FIX: Reset button state jika error
    if (placeOrderBtn) {
      placeOrderBtn.innerHTML = originalText || '🛍️ Bayar Sekarang';
      placeOrderBtn.disabled = false;
      placeOrderBtn.style.cursor = 'pointer';
      placeOrderBtn.style.opacity = '1';
    }
  }
}

  async processPayment() {
    return new Promise((resolve, reject) => {
      // Simulate payment with random failure (5% chance)
      setTimeout(() => {
        const success = Math.random() > 0.05;

        if (success) {
          resolve({ success: true, transactionId: 'TXN-' + Date.now() });
        } else {
          reject(new Error('Payment gateway timeout'));
        }
      }, 2000);
    });
  }

  getCustomerInfo() {
    return {
      fullName: document.getElementById('fullName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      postalCode: document.getElementById('postalCode')?.value || ''
    };
  }

  getShippingInfo() {
    const shippingSelect = document.getElementById('shipping');
    const method = shippingSelect?.value || 'regular';

    // Map method values to config keys
    const methodKeyMap = {
      'regular': 'REGULAR',
      'express': 'EXPRESS',
      'same-day': 'SAME_DAY',
      'free': 'FREE'
    };

    const configKey = methodKeyMap[method] || method.toUpperCase();
    const shippingConfig = CONFIG.SHIPPING[configKey];

    return {
      method: method,
      methodName: shippingConfig?.name || method,
      cost: this.shippingCost,
      estimatedDelivery: Utils.getEstimatedDelivery(method)
    };
  }

  getPaymentInfo() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    const info = {
      method: paymentMethod?.value || 'unknown',
      methodName: CONFIG.PAYMENT_METHODS[paymentMethod?.value.toUpperCase()]?.name || 'Unknown'
    };

    if (paymentMethod?.value === 'creditCard') {
      const cardNumber = document.getElementById('cardNumber');
      if (cardNumber) {
        info.cardLastFour = cardNumber.value.slice(-4);
      }
    }

    return info;
  }

  saveOrder(order) {
    const orders = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.ORDERS, []);
    orders.push(order);
    Utils.saveToStorage(CONFIG.STORAGE_KEYS.ORDERS, orders);
  }

  formatCategory(category) {
    return CONFIG.CATEGORIES[category.toUpperCase()]?.name || category;
  }
}

// =========================
// 💳 Initialize Checkout Page
// =========================
export function initCheckoutPage() {
  const checkoutContainer = document.querySelector(".checkout-container");
  if (!checkoutContainer) return;

  console.log("💳 Initializing enhanced checkout page...");
  new CheckoutManager();
}
