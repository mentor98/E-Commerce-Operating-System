import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Order, OrderItem } from '../../types';
import {
  X, ShieldCheck, Lock, CreditCard, CheckCircle2,
  Truck, ArrowRight, ArrowLeft, Loader2, Sparkles,
  Package, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  onOrderPlaced: (order: Order) => void;
  onTrackOrder: (trackingNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOrderPlaced, onTrackOrder }) => {
  const {
    items,
    subtotal,
    discount,
    tax,
    shippingFee,
    total,
    appliedCoupon,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart
  } = useCart();

  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal' | 'simulated'>('simulated');

  // Shipping Form State
  const [fullName, setFullName] = useState(currentUser?.name || 'Alex Mercer');
  const [email, setEmail] = useState(currentUser?.email || 'alex.mercer@gmail.com');
  const [street, setStreet] = useState(currentUser?.address?.street || '742 Evergreen Terrace');
  const [city, setCity] = useState(currentUser?.address?.city || 'San Francisco');
  const [state, setState] = useState(currentUser?.address?.state || 'CA');
  const [zip, setZip] = useState(currentUser?.address?.zip || '94107');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (555) 723-9014');

  // Card Simulation Details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isCheckoutOpen) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !street || !city || !zip) {
      showToast('error', 'Incomplete Address', 'Please fill in all required shipping fields.');
      return;
    }
    setStep('payment');
  };

  const handleAuthorizeAndPlaceOrder = async () => {
    setStep('processing');
    try {
      // 1. Initialize Payment Intent via server API
      const intent = await api.createPaymentIntent({
        provider: selectedGateway,
        amount: total,
        currency: 'USD',
        customerEmail: email,
        customerName: fullName
      });

      // 2. Verify and capture payment
      const verification = await api.verifyPayment({
        provider: selectedGateway,
        transactionId: intent.transactionId,
        expectedAmount: total
      });

      if (!verification.success) {
        throw new Error('Payment gateway declined transaction');
      }

      // 3. Transform cart items to Order Items
      const orderItems: OrderItem[] = items.map(it => ({
        productId: it.productId,
        productTitle: it.product.title,
        productImage: it.product.images[0],
        vendorId: it.product.vendorId,
        vendorName: it.product.vendorName,
        quantity: it.quantity,
        unitPrice: it.product.price,
        totalPrice: it.product.price * it.quantity,
        sku: it.product.sku
      }));

      // 4. Create Order in Database
      const orderRes = await api.createOrder({
        customerId: currentUser?.id || 'usr_cust_01',
        items: orderItems,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        tax,
        shippingFee,
        totalAmount: total,
        paymentMethod: selectedGateway,
        paymentId: verification.transactionId,
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zip,
          country: 'United States',
          phone
        }
      });

      setPlacedOrder(orderRes.order);
      clearCart();
      setStep('success');
      onOrderPlaced(orderRes.order);
      showToast('success', 'Order Confirmed!', `Order ${orderRes.order.orderNumber} placed successfully.`);
    } catch (err: any) {
      setStep('payment');
      showToast('error', 'Checkout Error', err.message || 'Payment processing failed.');
    }
  };

  return (
    <AnimatePresence>
      <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          id="checkout-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#161616]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Secure Order Checkout</h3>
                <p className="text-[11px] text-zinc-500">256-Bit Encrypted Multi-Vendor Processing</p>
              </div>
            </div>

            {step !== 'processing' && step !== 'success' && (
              <button
                id="checkout-close-btn"
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-6 sm:p-8">
            {/* Step 1: Shipping Info */}
            {step === 'shipping' && (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-500" /> Step 1 of 2: Shipping Destination
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    Total: ${total.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address (for order receipts & tracking)</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Zip Code</label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={e => setZip(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    id="checkout-to-payment-btn"
                    className="py-3 px-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-md"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Provider Selection & Authorization */}
            {step === 'payment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-500" /> Step 2 of 2: Payment Provider
                  </span>
                  <button
                    onClick={() => setStep('shipping')}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Edit Shipping
                  </button>
                </div>

                {/* Gateway Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('simulated')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedGateway === 'simulated'
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        1-Click
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-2">Instant Simulator</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Zero-latency sandbox test</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('stripe')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedGateway === 'stripe'
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      <span className="text-[10px] font-mono text-zinc-400">Card API</span>
                    </div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-2">Stripe Card</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">PaymentIntent API</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('paypal')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedGateway === 'paypal'
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-blue-600 font-sans italic">P</span>
                      <span className="text-[10px] font-mono text-zinc-400">Wallet</span>
                    </div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-2">PayPal</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Express Sandbox</p>
                  </button>
                </div>

                {/* Simulated Payment Card Form */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Virtual Test Card</span>
                    <span className="font-mono text-[10px] text-zinc-400">Visa Verified</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Expiry</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={e => setCardExp(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/40 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Items ({items.length})</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Promo Coupon</span>
                      <span className="font-mono">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax & Express Delivery</span>
                    <span className="font-mono">${(tax + shippingFee).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    <span>Authorized Charge</span>
                    <span className="font-mono text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="py-3 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    id="checkout-authorize-btn"
                    onClick={handleAuthorizeAndPlaceOrder}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm shadow-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay ${total.toFixed(2)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Server Processing animation */}
            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-10 h-10 text-zinc-900 dark:text-zinc-100 animate-spin" />
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Authorizing Payment & Reserving Inventory...
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Communicating with server REST endpoints and dispatching merchant fulfillment notifications.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Success Receipt */}
            {step === 'success' && placedOrder && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
                    Payment Successful & Order Confirmed!
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Thank you, {placedOrder.customerName}. Your receipt has been logged.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">Order Reference</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{placedOrder.orderNumber}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">Tracking Code</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{placedOrder.trackingNumber}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Total Charged</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">${placedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    id="receipt-track-btn"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      onTrackOrder(placedOrder.trackingNumber);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-md"
                  >
                    <Package className="w-4 h-4" />
                    <span>Track Live Package Status</span>
                  </button>

                  <button
                    id="receipt-continue-shopping-btn"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="py-3 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
