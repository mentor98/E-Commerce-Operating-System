import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Order, User } from '../../types';
import {
  Package, MapPin, UserCheck, Clock, CheckCircle2,
  Truck, ArrowRight, ExternalLink, ShieldCheck, CreditCard,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerDashboardProps {
  onTrackOrder: (trackingNumber: string) => void;
  onNavigateStorefront: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onTrackOrder,
  onNavigateStorefront
}) => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState(currentUser?.address?.street || '');
  const [city, setCity] = useState(currentUser?.address?.city || '');
  const [state, setState] = useState(currentUser?.address?.state || '');
  const [zip, setZip] = useState(currentUser?.address?.zip || '');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setStreet(currentUser.address?.street || '');
      setCity(currentUser.address?.city || '');
      setState(currentUser.address?.state || '');
      setZip(currentUser.address?.zip || '');
    }
  }, [currentUser]);

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      // Filter to current user orders or show customer demo orders
      const userOrders = currentUser
        ? res.orders.filter(o => o.customerId === currentUser.id)
        : res.orders;
      setOrders(userOrders.length > 0 ? userOrders : res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        phone,
        address: {
          street,
          city,
          state,
          zip,
          country: 'United States'
        }
      });
      showToast('success', 'Profile Updated', 'Your customer account details have been saved.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);

  return (
    <div id="customer-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Hero */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {currentUser?.name || 'Customer Account'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {currentUser?.email} • Member since {new Date(currentUser?.createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Orders</span>
              <span className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">{orders.length}</span>
            </div>
            <div className="border-l border-zinc-200 dark:border-zinc-800 pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Lifetime Spent</span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">${totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <button
            id="cust-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            id="cust-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Account & Security
          </button>
        </div>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Purchases & Invoices
            </h2>
            <button
              onClick={onNavigateStorefront}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
            >
              Shop New Arrivals &rarr;
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-zinc-400">Loading purchase history...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <Package className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No orders placed yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Explore our multi-vendor catalogue to make your first purchase.
              </p>
              <button
                onClick={onNavigateStorefront}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Browse Storefront
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  id={`order-row-${order.id}`}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : order.status === 'shipped'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} • Paid via {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onTrackOrder(order.trackingNumber)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track Package
                      </button>
                      <span className="font-mono font-black text-sm text-zinc-900 dark:text-zinc-100">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items preview in Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map(it => (
                      <div key={it.productId} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                        <img
                          src={it.productImage}
                          alt={it.productTitle}
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">{it.productTitle}</h4>
                          <span className="text-[10px] text-zinc-400">Qty: {it.quantity} • ${it.unitPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-6">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Customer Details</h3>
              <p className="text-xs text-zinc-500">Update your default shipping and contact records.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email (Fixed)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Default Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Zip Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                id="cust-save-profile-btn"
                className="py-2.5 px-6 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs hover:opacity-90 shadow-md transition-opacity"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
