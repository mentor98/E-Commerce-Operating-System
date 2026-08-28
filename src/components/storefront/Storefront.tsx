import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory } from '../../types';
import { api } from '../../services/api';
import { HeroBanner } from './HeroBanner';
import { ProductFilter } from './ProductFilter';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { Sparkles, PackageSearch, AlertCircle } from 'lucide-react';

interface StorefrontProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onTrackOrder: (trackingNumber: string) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  searchQuery,
  onSearchChange,
  onTrackOrder,
  wishlist,
  onToggleWishlist
}) => {
  const { applyCoupon, setIsCartDrawerOpen } = useCart();
  const { showToast } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(400);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedVendor, setSelectedVendor] = useState<string>('');

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadStorefrontData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(prodRes.products);
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load store catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStorefrontData();
  }, []);

  const handleApplyHeroCoupon = async (code: string) => {
    const ok = await applyCoupon(code);
    if (ok) {
      showToast('success', 'Coupon Activated!', `Code ${code} applied to your cart.`);
      setIsCartDrawerOpen(true);
    } else {
      showToast('info', 'Coupon Ready', `Add items to cart to activate ${code}.`);
      setIsCartDrawerOpen(true);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(400);
    setInStockOnly(false);
    setSortBy('featured');
    setSelectedVendor('');
    onSearchChange('');
  };

  // Filter & Sorting Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // Vendor
        if (selectedVendor && p.vendorId !== selectedVendor) return false;
        // Price
        if (p.price < minPrice || p.price > maxPrice) return false;
        // Stock
        if (inStockOnly && p.stock <= 0) return false;
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchVendor = p.vendorName.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSku && !matchVendor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0; // featured default
      });
  }, [products, selectedCategory, selectedVendor, minPrice, maxPrice, inStockOnly, searchQuery, sortBy]);

  const wishlistMap = useMemo(() => {
    return new Set(wishlist.map(p => p.id));
  }, [wishlist]);

  return (
    <div id="storefront-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {/* Hero Banner with Promos & Category Chips */}
      <HeroBanner
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onApplyCouponCode={handleApplyHeroCoupon}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar Filter */}
        <div className="lg:col-span-1">
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }}
            inStockOnly={inStockOnly}
            onInStockToggle={setInStockOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {selectedCategory === 'all'
                  ? 'All Marketplace Collections'
                  : categories.find(c => c.id === selectedCategory)?.name || 'Filtered Products'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Showing {filteredProducts.length} verified artisan & tech products
              </p>
            </div>

            {searchQuery && (
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                Search: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <PackageSearch className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No products match criteria</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try loosening your price filters or search terms.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                  isInWishlist={wishlistMap.has(product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isInWishlist={selectedProduct ? wishlistMap.has(selectedProduct.id) : false}
        onToggleWishlist={onToggleWishlist}
      />
    </div>
  );
};
