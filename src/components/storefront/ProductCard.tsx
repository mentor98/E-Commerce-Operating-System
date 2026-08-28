import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { Star, ShoppingBag, Heart, Check, Store } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  isInWishlist = false,
  onToggleWishlist
}) => {
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock <= 0;

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const added = addToCart(product, 1);
    if (added) {
      showToast('success', 'Added to Cart', `${product.title} has been added.`);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 hover:dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Wrap */}
      <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-zinc-950 shadow-sm animate-pulse">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            id={`wishlist-btn-${product.id}`}
            onClick={handleWishlistClick}
            aria-label="Wishlist"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-500 shadow-md transition-all hover:scale-110 z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isInWishlist ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Vendor Tag */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            <Store className="w-3 h-3" />
            <span className="truncate">{product.vendorName}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-zinc-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through font-mono">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Free Express Shipping
            </span>
          </div>

          <button
            id={`quick-add-btn-${product.id}`}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl font-semibold transition-all ${
              isOutOfStock
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-95 shadow-sm'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Quick Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
