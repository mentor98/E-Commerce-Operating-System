import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Product, ProductCategory, Order, OrderStatus } from '../../types';
import {
  Store, Package, DollarSign, TrendingUp, Plus,
  Edit2, Trash2, CheckCircle2, AlertTriangle, Truck,
  Search, RefreshCw, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SellerDashboardProps {
  onNavigateProduct?: (product: Product) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigateProduct }) => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');

  // Product Add/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formComparePrice, setFormComparePrice] = useState('');
  const [formCategory, setFormCategory] = useState('cat_audio');
  const [formStock, setFormStock] = useState('20');
  const [formSku, setFormSku] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Store settings
  const [storeName, setStoreName] = useState(currentUser?.storeName || 'Apex Audio & Tech');
  const [storeDescription, setStoreDescription] = useState(currentUser?.storeDescription || 'Custom artisan studio acoustic equipment.');

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, orderRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getOrders()
      ]);

      const myVendorId = currentUser?.id || 'usr_seller_01';
      // If current user is seller, filter to their products, otherwise show seller demo products
      const myProds = prodRes.products.filter(p => p.vendorId === myVendorId);
      setProducts(myProds.length > 0 ? myProds : prodRes.products.slice(0, 4));
      setCategories(catRes.categories);

      // Filter orders that have items from this seller
      const sellerOrders = orderRes.orders.filter(o =>
        o.items.some(i => i.vendorId === myVendorId || myProds.some(p => p.id === i.productId))
      );
      setOrders(sellerOrders.length > 0 ? sellerOrders : orderRes.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [currentUser]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormPrice('99.00');
    setFormComparePrice('');
    setFormCategory(categories[0]?.id || 'cat_audio');
    setFormStock('25');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormImages('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
    setFormDescription('High quality handcrafted product built with durable materials.');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormPrice(p.price.toString());
    setFormComparePrice(p.compareAtPrice?.toString() || '');
    setFormCategory(p.category);
    setFormStock(p.stock.toString());
    setFormSku(p.sku);
    setFormImages(p.images.join(', '));
    setFormDescription(p.description);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imgList = formImages.split(',').map(s => s.trim()).filter(Boolean);
      const productPayload = {
        title: formTitle,
        description: formDescription,
        price: parseFloat(formPrice),
        compareAtPrice: formComparePrice ? parseFloat(formComparePrice) : undefined,
        category: formCategory,
        images: imgList.length > 0 ? imgList : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        stock: parseInt(formStock),
        lowStockThreshold: 5,
        sku: formSku,
        vendorId: currentUser?.id || 'usr_seller_01',
        vendorName: currentUser?.storeName || currentUser?.name || 'Apex Audio & Tech',
        isActive: true,
        specifications: {
          'Origin': 'Studio Crafted',
          'Warranty': '2-Year Standard'
        }
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, productPayload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.product : p));
        showToast('success', 'Product Updated', `${res.product.title} has been updated.`);
      } else {
        const res = await api.createProduct(productPayload);
        setProducts(prev => [res.product, ...prev]);
        showToast('success', 'Product Listed', `${res.product.title} is now active in the store.`);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Failed to save product', err.message);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Product Removed', `${title} was deleted from your catalogue.`);
    } catch (err: any) {
      showToast('error', 'Deletion Error', err.message);
    }
  };

  const handleRestock = async (productId: string, quantityToAdd: number) => {
    try {
      const res = await api.updateInventory(productId, quantityToAdd);
      setProducts(prev => prev.map(p => p.id === productId ? res.product : p));
      showToast('success', 'Stock Replenished', `Added +${quantityToAdd} units.`);
    } catch (err: any) {
      showToast('error', 'Restock Error', err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const trackingNumber = status === 'shipped' ? `TRK-${Math.floor(100000 + Math.random() * 900000)}` : undefined;
      const res = await api.updateOrderStatus(orderId, {
        status,
        trackingNumber,
        carrier: 'FedEx Priority'
      });
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      showToast('success', 'Fulfillment Updated', `Order status changed to ${status.toUpperCase()}`);
    } catch (err: any) {
      showToast('error', 'Status Update Error', err.message);
    }
  };

  // Metrics
  const totalGross = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.totalAmount : 0), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  return (
    <div id="seller-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Seller Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {currentUser?.storeName || 'Merchant Operations Hub'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Merchant Level 1
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Vendor: {currentUser?.name} • Multi-vendor Fulfillment Active
              </p>
            </div>
          </div>

          <button
            id="seller-add-product-btn"
            onClick={handleOpenAddModal}
            className="py-2.5 px-5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Sales</span>
            <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              ${totalGross.toFixed(2)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active Listings</span>
            <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {products.length}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Warehouse Inventory</span>
            <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {totalStockUnits} units
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Low Stock Alerts</span>
            <p className="text-2xl font-black font-mono text-amber-500 mt-1">
              {lowStockCount} items
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <button
            id="seller-tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Product Catalogue & Stock ({products.length})
          </button>
          <button
            id="seller-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Customer Orders Fulfillment ({orders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Product Catalogue & Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Active Store Inventory
            </h2>
            <button
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Product
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">SKU / Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Quick Replenish</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {products.map(p => {
                    const isLow = p.stock <= p.lowStockThreshold;
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.title}</h4>
                            <span className="text-[11px] text-zinc-400">{p.rating.toFixed(1)} ★ ({p.reviewCount} reviews)</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-zinc-600 dark:text-zinc-300 block">{p.sku}</span>
                          <span className="text-[10px] text-zinc-400 capitalize">{p.category.replace('cat_', '')}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ${p.price.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono font-bold ${isLow ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {p.stock} units
                            </span>
                            {isLow && (
                              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded">
                                Low
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`restock-10-${p.id}`}
                              onClick={() => handleRestock(p.id, 10)}
                              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                            >
                              +10
                            </button>
                            <button
                              id={`restock-25-${p.id}`}
                              onClick={() => handleRestock(p.id, 25)}
                              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                            >
                              +25
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`edit-prod-${p.id}`}
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`del-prod-${p.id}`}
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Incoming Orders & Shipments
          </h2>

          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">{o.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        o.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'
                      }`}>
                        {o.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Recipient: {o.customerName} ({o.shippingAddress.city}, {o.shippingAddress.state})
                    </p>
                  </div>

                  {/* Status update controls */}
                  <div className="flex items-center gap-2">
                    {o.orderStatus === 'processing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch & Ship
                      </button>
                    )}
                    {o.orderStatus === 'shipped' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                      </button>
                    )}
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 pl-2">
                      ${o.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {o.items.map(it => (
                    <div key={it.productId} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40">
                      <img src={it.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{it.productTitle}</p>
                        <p className="text-[10px] text-zinc-400">Qty: {it.quantity} • Unit: ${it.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {editingProduct ? 'Edit Product Listing' : 'Create New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Product Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Master Wireless ANC Headphones"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Compare At Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formComparePrice}
                    onChange={e => setFormComparePrice(e.target.value)}
                    placeholder="Optional original price"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Image URLs (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formImages}
                  onChange={e => setFormImages(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="seller-save-product-submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
