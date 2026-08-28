import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import {
  X, Trash2, ShoppingBag, ArrowRight, Tag,
  CheckCircle2, AlertCircle, Truck, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    tax,
    shippingFee,
    total,
    appliedCoupon,
    couponMessage,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    openCheckout
  } = useCart();

  const { showToast } = useNotification();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 100;
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);

    if (success) {
      showToast('success', 'Coupon Applied!', `Promo code ${couponInput.toUpperCase()} activated.`);
      setCouponInput('');
    } else {
      showToast('error', 'Coupon Error', couponMessage || 'Invalid coupon code');
    }
  };

  return (
    <AnimatePresence>
      <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={() => setIsCartDrawerOpen(false)} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            id="cart-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-white dark:bg-[#0f0f0f] border-l border-zinc-200 dark:border-zinc-800/80 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Shopping Cart</h3>
                  <p className="text-[11px] text-zinc-500">{itemCount} items reserved in cart</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    id="cart-clear-all-btn"
                    onClick={clearCart}
                    className="text-xs text-zinc-400 hover:text-rose-500 px-2 py-1 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  id="cart-drawer-close-btn"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Free Shipping Meter */}
            <div className="px-5 py-3 bg-zinc-100/70 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <Truck className="w-3.5 h-3.5 text-indigo-500" />
                  {remainingForFreeShipping > 0 ? (
                    <span>Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more for free express shipping</span>
                  ) : (
                    <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">🎉 You unlocked Free Express Shipping!</strong>
                  )}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Your cart is empty</h4>
                    <p className="text-xs text-zinc-500 mt-1">Explore our verified artisan & tech collections</p>
                  </div>
                  <button
                    id="empty-cart-shop-now-btn"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.productId} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-18 h-18 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                            {item.product.title}
                          </h4>
                          <button
                            id={`cart-remove-${item.productId}`}
                            onClick={() => removeFromCart(item.productId)}
                            className="text-zinc-400 hover:text-rose-500 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400 block">{item.product.vendorName}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-xs font-mono text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-6 h-6 flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
                {/* Coupon input */}
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Coupon (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Tag className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="font-bold font-mono">{appliedCoupon.code}</span>
                        <span className="text-[10px] block opacity-80">Saved ${discount.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-zinc-400 hover:text-rose-500 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Subtotals breakdown */}
                <div className="space-y-1.5 text-xs text-zinc-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Promo Discount</span>
                      <span className="font-mono font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Tax (7.25%)</span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    <span>Total</span>
                    <span className="font-mono text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  id="cart-checkout-btn"
                  onClick={openCheckout}
                  className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-98 transition-all"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
