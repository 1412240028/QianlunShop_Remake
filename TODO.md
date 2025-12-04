# Update Cart Count Automatically

## Tasks
- [ ] Import `updateCartCount` in `js/cart.js`
- [ ] Add `updateCartCount(cart)` calls after cart operations in cart page event handlers
- [ ] Test cart functionality to verify count updates correctly

## Information Gathered
- Cart count displayed via `.cart-count` elements in navbar and cart page
- `updateCartCount(cart)` in `ui.js` updates these elements with `cart.getItemCount()`
- After `cart.add` in products.js, `updateCartCount(cart)` is called ✅
- After `cart.update` and `cart.remove` in cart.js, only `updateCartDisplay()` is called, missing `updateCartCount(cart)` ❌

## Dependent Files to be edited
- `js/cart.js`: Add import and update event handlers
