// =========================
// 💳 CHECKOUT MODULE - QIANLUNSHOP
// Extracted from script.js for better modularity
// =========================
import { Cart } from "./cart.js";
import { CONFIG, Utils } from "./config.js";
import { showToast } from "./ui.js";

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
  
    const isEligible = Utils.isFreeShippingEligible(subtotal);
    const currentValue = shippingSelect.value;

    if (isEligible && currentValue !== 'free') {
      shippingSelect.value = 'free';
      this.shippingCost = 0;
    } else if (!isEligible && currentValue === 'free') {
      shippingSelect.value = 'regular';
      this.shippingCost = CONFIG.SHIPPING.REGULAR.cost;
    }
    this.updateShippingOptions(isEligible);
  }

  updateShippingOptions(isEligible) {
    const shippingSelect = document.getElementById('shipping');
    if (!shippingSelect) return;

    // Populate shipping options - only show FREE if eligible
    const shippingOptions = Object.entries(CONFIG.SHIPPING).filter(([key]) => key !== 'FREE' || isEligible);

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
    const subtotal = this.cart.getTotal();
    const shipping = CONFIG.SHIPPING[method.toUpperCase()];
    
    if (!shipping) {
      this.shippingCost = 0;
      return;
    }
    
    let costChanged = false;
    let oldCost = this.shippingCost;
    
    // Auto-apply free shipping if eligible
    if (method === 'free' && subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD) {
      this.shippingCost = 0;
      if (oldCost !== 0) {
        this.showToast('🎉 Gratis ongkir!', 'success');
        costChanged = true;
      }
    } else if (method === 'free' && subtotal < CONFIG.FREE_SHIPPING_THRESHOLD) {
      // Switch back to regular if no longer eligible
      const needed = CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
      this.shippingCost = CONFIG.SHIPPING.REGULAR.cost;
      
      if (oldCost !== this.shippingCost) {
        this.showToast(`Tambah ${Utils.formatPrice(needed)} untuk gratis ongkir`, 'info');
        costChanged = true;
      }
      
      const shippingSelect = document.getElementById('shipping');
      if (shippingSelect && shippingSelect.value !== 'regular') {
        shippingSelect.value = 'regular';
      }
    } else {
      this.shippingCost = shipping.cost;
      costChanged = (oldCost !== this.shippingCost);
    }
    if (costChanged && !preventRecalculation) {
      this.calculateTotals();
    }
  }

  setupEventListeners() {
    // Shipping method selection
    const shippingSelect = document.getElementById('shipping');
    if (shippingSelect) {
      const isEligible = Utils.isFreeShippingEligible(this.cart.getTotal());

      // Populate shipping options - only show FREE if eligible
      const shippingOptions = Object.entries(CONFIG.SHIPPING).filter(([key]) => key !== 'FREE' || isEligible);

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

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

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
          message = isValid ? '' : 'Format: MM/YY dan harus di masa depan';
        } else if (field.id === 'fullName') {
          isValid = value.length >= 3;
          message = isValid ? '' : 'Nama minimal 3 karakter';
        } else if (field.id === 'address') {
          isValid = value.length >= 10;
          message = isValid ? '' : 'Alamat minimal 10 karakter';
        } else if (field.required) {
          isValid = value.length > 0;
          message = isValid ? '' : 'Field ini wajib diisi';
        }
        break;

      case 'select-one':
        isValid = value !== '' && value !== 'null';
        message = isValid ? '' : 'Silakan pilih salah satu';
        break;

      default:
        if (field.required) {
          isValid = value.length > 0;
          message = isValid ? '' : 'Field ini wajib diisi';
        }
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
      this.showToast(CONFIG.MESSAGES.PROMO_APPLIED, 'success');
      this.calculateTotals();

      // Track analytics
      Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.APPLY_PROMO, {
        promo_code: promoCode,
        discount_amount: this.discount
      });
    } else {
      this.showToast(CONFIG.MESSAGES.PROMO_INVALID, 'error');
      this.promoCode = '';
      this.discount = 0;
      this.calculateTotals();
    }
  }

  async placeOrder() {
    if (this.cart.getItems().length === 0) {
      this.showToast('Keranjang belanja kosong', 'error');
      return;
    }

    // Validate form
    const requiredFields = document.querySelectorAll('[required]');
    let allValid = true;

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        allValid = false;
      }
    });

    if (!allValid) {
      this.showToast(CONFIG.MESSAGES.FORM_INCOMPLETE, 'error');
      return;
    }

    try {
      const placeOrderBtn = document.getElementById('placeOrder');
      if (placeOrderBtn) {
        placeOrderBtn.innerHTML = CONFIG.MESSAGES.PAYMENT_PROCESSING;
        placeOrderBtn.disabled = true;
      }

      await this.processPayment();

      // Calculate totals with correct discount application (discount applied before tax)
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
      await this.cart.clear();
      this.showToast(CONFIG.MESSAGES.ORDER_SUCCESS, 'success');

      // Track analytics
      Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.PURCHASE, {
        transaction_id: order.id,
        value: order.totals.grandTotal,
        currency: 'IDR',
        items: order.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      // Redirect immediately to order confirmation
      window.location.href = `order-confirmation.html?orderId=${order.id}`;

    } catch (error) {
      console.error('Order error:', error);
      this.showToast(CONFIG.MESSAGES.ORDER_FAILED, 'error');

      const placeOrderBtn = document.getElementById('placeOrder');
      if (placeOrderBtn) {
        placeOrderBtn.innerHTML = '🛍️ Bayar Sekarang';
        placeOrderBtn.disabled = false;
      }
    }
  }

  async processPayment() {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
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

    return {
      method: method,
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
