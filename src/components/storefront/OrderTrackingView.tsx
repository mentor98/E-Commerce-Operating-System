import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import {
  Package, Search, Truck, CheckCircle2, Clock,
  MapPin, ShieldCheck, ArrowRight, Store, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface OrderTrackingViewProps {
  initialTrackingCode?: string;
  onNavigateProduct?: (productId: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialTrackingCode,
  onNavigateProduct
}) => {
  const { showToast } = useNotification();
  const [searchInput, setSearchInput] = useState(initialTrackingCode || 'TRK-882194');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchTracking = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await api.getOrderByTracking(code.trim());
      setOrder(res.order);
    } catch (err: any) {
      setNotFound(true);
      setOrder(null);
      showToast('error', 'Tracking Not Found', 'Could not locate an active shipment with this reference.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingCode) {
      setSearchInput(initialTrackingCode);
      fetchTracking(initialTrackingCode);
    } else {
      fetchTracking('TRK-882194');
    }
  }, [initialTrackingCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchInput);
  };

  const getStepStatus = (step: string, current: string) => {
    const sequence: string[] = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];
    const currentIdx = sequence.indexOf(current);
    const stepIdx = sequence.indexOf(step);

    if (current === 'cancelled') return 'cancelled';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div id="order-tracking-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header & Search */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Courier & Fulfillment Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Track Your Package
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Enter your unique tracking code (e.g. TRK-882194) or order reference number.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              id="tracking-search-input"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value.toUpperCase())}
              placeholder="e.g. TRK-882194 or ORD-1001"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 uppercase"
            />
          </div>
          <button
            type="submit"
            id="tracking-submit-btn"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {/* Demo Quick Chips */}
        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-zinc-500">
          <span>Try quick sample tracking:</span>
          <button
            onClick={() => { setSearchInput('TRK-882194'); fetchTracking('TRK-882194'); }}
            className="font-mono underline hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            TRK-882194 (In-Transit)
          </button>
          <span>•</span>
          <button
            onClick={() => { setSearchInput('TRK-551029'); fetchTracking('TRK-551029'); }}
            className="font-mono underline hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            TRK-551029 (Delivered)
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      {order && (
        <motion.div
          id="tracking-result-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8"
        >
          {/* Header Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {order.orderNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  order.orderStatus === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : order.orderStatus === 'shipped'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-400 block font-mono">Carrier: {order.carrier || 'FedEx Express'}</span>
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {order.trackingNumber}
              </span>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Shipment Progress Timeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'paid', label: 'Order Verified', icon: CheckCircle2, desc: 'Payment Authorized' },
                { key: 'processing', label: 'Merchant Packed', icon: Package, desc: 'Quality Inspected' },
                { key: 'shipped', label: 'In Transit', icon: Truck, desc: 'Courier Dispatched' },
                { key: 'delivered', label: 'Delivered', icon: MapPin, desc: 'Signed & Completed' }
              ].map((st, idx) => {
                const state = getStepStatus(st.key, order.orderStatus);
                const isComplete = state === 'completed' || state === 'active';
                const isActive = state === 'active';

                return (
                  <div
                    key={st.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                        : isComplete
                        ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40'
                        : 'border-zinc-100 dark:border-zinc-800/60 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <st.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isComplete ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{st.label}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Items List & Destination Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Items */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Package Contents ({order.items.length} items)
              </h3>
              <div className="space-y-2.5">
                {order.items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {item.productTitle}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Vendor: {item.vendorName} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Card */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Shipping Destination
              </h3>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{order.shippingAddress.fullName}</span>
                </div>
                <p className="text-zinc-500 leading-relaxed pl-5">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-zinc-400 pl-5 text-[11px] font-mono">
                    Tel: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {notFound && !loading && (
        <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No active tracking record found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Please double-check the tracking code format or test with pre-seeded sample <strong>TRK-882194</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
