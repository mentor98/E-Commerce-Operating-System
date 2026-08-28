import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onOpenProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onOpenProduct
}) => {
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  if (!isOpen) return null;

  const handleMoveToCart = (product: Product) => {
    const ok = addToCart(product, 1);
    if (ok) {
      onRemoveFromWishlist(product.id);
      showToast('success', 'Moved to Cart', `${product.title} is now in your shopping cart.`);
    }
  };

  return (
    <AnimatePresence>
      <div id="wishlist-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            id="wishlist-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-white dark:bg-[#0f0f0f] border-l border-zinc-200 dark:border-zinc-800/80 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Saved Wishlist</h3>
                  <p className="text-[11px] text-zinc-500">{wishlistItems.length} curated favorite items</p>
                </div>
              </div>

              <button
                id="wishlist-close-btn"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Your wishlist is empty</h4>
                    <p className="text-xs text-zinc-500 mt-1">Tap the heart icon on any product card to save items</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                wishlistItems.map(item => (
                  <div key={item.id} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      onClick={() => { onClose(); onOpenProduct(item); }}
                      className="w-18 h-18 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => { onClose(); onOpenProduct(item); }}
                            className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:underline"
                          >
                            {item.title}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(item.id)}
                            className="text-zinc-400 hover:text-rose-500 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400 block">{item.vendorName}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          ${item.price.toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[11px] font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                        >
                          <ShoppingBag className="w-3 h-3" /> Move to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {wishlistItems.length > 0 && (
              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => addToCart(item, 1));
                    showToast('success', 'All Items Added', 'All wishlist items were added to your cart.');
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-90"
                >
                  <ShoppingBag className="w-4 h-4" /> Add All to Cart
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
