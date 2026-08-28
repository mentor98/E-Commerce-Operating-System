import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Product, Coupon, AuditLog, User, Order } from '../../types';
import {
  LayoutDashboard, ShieldAlert, Tag, Users, Package,
  DollarSign, RefreshCw, Plus, Trash2, CheckCircle2,
  AlertTriangle, Search, Activity, Lock, Cpu, RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  onResetDatabase?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onResetDatabase }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'analytics' | 'vendors' | 'coupons' | 'audit' | 'system'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [minSpend, setMinSpend] = useState('50');
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, couponRes, auditRes, userRes, prodRes] = await Promise.all([
        api.getAnalytics(),
        api.getCoupons(),
        api.getAuditLogs(),
        api.getUsers(),
        api.getProducts()
      ]);
      setAnalytics(analyticsRes.analytics);
      setCoupons(couponRes.coupons);
      setAuditLogs(auditRes.logs);
      setUsers(userRes.users);
      setProducts(prodRes.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minSpend ? parseFloat(minSpend) : 0,
        expiryDate: expiresAt,
        isActive: true
      });
      setCoupons(prev => [res.coupon, ...prev]);
      setIsCouponModalOpen(false);
      showToast('success', 'Coupon Created', `Code ${res.coupon.code} is now active.`);
      setCode('');
    } catch (err: any) {
      showToast('error', 'Coupon Error', err.message);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Deactivate coupon ${code}?`)) return;
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast('success', 'Coupon Removed', `Code ${code} deleted.`);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  return (
    <div id="admin-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Hero */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Marketplace Operations & Governance
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Multi-Tenant Oversight • Atomic DB Integrity • Role Authorization Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onResetDatabase && (
              <button
                id="admin-reset-db-btn"
                onClick={onResetDatabase}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-Seed Demo DB
              </button>
            )}
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create Coupon
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800 relative z-10">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total GMV (Gross)</span>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Platform Orders</span>
            <p className="text-2xl font-black font-mono text-white mt-1">
              {analytics?.totalOrders || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Verified Vendors</span>
            <p className="text-2xl font-black font-mono text-indigo-400 mt-1">
              {users.filter(u => u.role === 'seller').length} Active
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Platform Take (10%)</span>
            <p className="text-2xl font-black font-mono text-amber-400 mt-1">
              ${((analytics?.totalRevenue || 0) * 0.10).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'analytics', label: 'Executive Analytics', icon: Activity },
            { id: 'vendors', label: `Merchants (${users.filter(u => u.role === 'seller').length})`, icon: Users },
            { id: 'coupons', label: `Promotions (${coupons.length})`, icon: Tag },
            { id: 'audit', label: `Security Logs (${auditLogs.length})`, icon: Lock }
          ].map(tab => (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Executive Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" /> Category Volume Distribution
            </h3>
            <div className="space-y-3 pt-2">
              {analytics?.categoryBreakdown?.map((cat: any) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">{cat.categoryName}</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{cat.count} items ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Platform Financial Highlights
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Gross Merchant Volume</span>
                <span className="font-mono font-bold">${analytics?.totalRevenue?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Average Order Value (AOV)</span>
                <span className="font-mono font-bold">
                  ${((analytics?.totalRevenue || 0) / Math.max(1, analytics?.totalOrders || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Discounts Subsidized</span>
                <span className="font-mono font-bold text-rose-500">-$75.00</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm">
                <span>Net Platform Treasury (10% take)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  +${((analytics?.totalRevenue || 0) * 0.10).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vendors List */}
      {activeTab === 'vendors' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {u.storeName || 'Customer Account'}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-zinc-500">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-amber-500/10 text-amber-600' : u.role === 'seller' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Coupons Engine */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Active Promo Codes
            </h3>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              + Create New Code
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-black text-sm tracking-wider border border-zinc-200 dark:border-zinc-700">
                    {c.code}
                  </span>
                  <button onClick={() => handleDeleteCoupon(c.id, c.code)} className="text-zinc-400 hover:text-rose-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-zinc-500">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off Entire Cart` : `$${c.discountValue} Fixed Discount`}
                  </p>
                  <p>Min Spend: ${c.minOrderAmount || 0}</p>
                  <p>Expires: {c.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" /> Immutable Platform Security Audit Trail
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Live Event Stream</span>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{log.action}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {log.actorRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="block text-[9px] font-mono text-zinc-400">{log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Create Promotion Code</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-zinc-400">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($ USD)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Min Spend ($)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={e => setMinSpend(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Expiry Date</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
