import React, { useState, useEffect } from 'react';
import { Product, ProductReview, User } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import {
  X, Star, ShoppingBag, Heart, ShieldCheck, Truck,
  RotateCcw, Store, Check, AlertTriangle, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isInWishlist = false,
  onToggleWishlist
}) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [vendor, setVendor] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImageIdx(0);
    setQuantity(1);
    setActiveTab('details');

    const loadExtraData = async () => {
      try {
        const res = await api.getProductById(product.id);
        setReviews(res.reviews || []);
        if (res.vendor) setVendor(res.vendor);
      } catch (err) {
        console.error('Failed to load product details:', err);
      }
    };
    loadExtraData();
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(product, quantity);
    if (ok) {
      showToast('success', 'Added to Cart', `${quantity}x ${product.title} added.`);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview({
        productId: product.id,
        userId: currentUser?.id || 'usr_cust_01',
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews(prev => [res.review, ...prev]);
      setNewComment('');
      showToast('success', 'Review Published', 'Thank you for your feedback!');
    } catch (err: any) {
      showToast('error', 'Failed to submit review', err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="product-detail-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          id="product-detail-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            id="product-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
                  <img
                    src={product.images[activeImageIdx] || product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover object-center"
                  />
                  {isLowStock && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 shadow-md">
                      ⚠️ Only {product.stock} units left
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        id={`product-thumb-${idx}`}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeImageIdx === idx
                            ? 'border-zinc-900 dark:border-zinc-100 scale-105 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Verified Seller Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={vendor?.storeLogo || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80'}
                      alt={product.vendorName}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{product.vendorName}</h4>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">Fast 24-Hour Dispatch • 99.4% Fulfillment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Product Info & Actions */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* SKU & Category */}
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono uppercase font-semibold">SKU: {product.sku}</span>
                    <span className="capitalize">{product.category.replace('cat_', '')}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {product.title}
                  </h2>

                  {/* Rating & Reviews counter */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(product.rating) ? 'fill-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{product.rating.toFixed(2)}</span>
                    <span className="text-xs text-zinc-400">({reviews.length || product.reviewCount} customer reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-base text-zinc-400 line-through font-mono">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity & Add to Cart Controls */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1">
                      <button
                        id="modal-qty-minus-btn"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm font-mono text-zinc-900 dark:text-zinc-100">
                        {quantity}
                      </span>
                      <button
                        id="modal-qty-plus-btn"
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs text-zinc-500">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-bold">Currently Sold Out</span>
                      ) : (
                        <span><strong className="text-zinc-900 dark:text-zinc-100">{product.stock} units</strong> in warehouse</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="modal-add-to-cart-btn"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isOutOfStock
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                          : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-98'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {isOutOfStock ? 'Sold Out' : `Add to Cart • $${(product.price * quantity).toFixed(2)}`}
                    </button>

                    {onToggleWishlist && (
                      <button
                        id="modal-wishlist-toggle-btn"
                        onClick={() => onToggleWishlist(product)}
                        className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tabs: Specs & Reviews */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <button
                  id="tab-specs-btn"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 text-sm font-bold transition-colors relative ${
                    activeTab === 'specs'
                      ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Technical Specifications
                </button>
                <button
                  id="tab-reviews-btn"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-bold transition-colors relative ${
                    activeTab === 'reviews'
                      ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Customer Reviews ({reviews.length})
                </button>
              </div>

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications || {}).map(([key, val]) => (
                    <div key={key} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">{key}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{val}</span>
                    </div>
                  ))}
                  {Object.keys(product.specifications || {}).length === 0 && (
                    <p className="text-xs text-zinc-500">Standard specifications apply.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Write a Review */}
                  <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Write a Customer Review
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewRating(s)}
                            className="p-0.5 text-amber-400"
                          >
                            <Star className={`w-4 h-4 ${s <= newRating ? 'fill-amber-400' : 'text-zinc-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Share your experience with this item..."
                      className="w-full p-3 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Review
                      </button>
                    </div>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews.map(rev => (
                      <div key={rev.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={rev.userName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{rev.userName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                    Verified Buyer
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-zinc-200 dark:text-zinc-700'}`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-9">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
