import React from 'react';
import { ProductCategory } from '../../types';
import { Filter, RotateCcw, Star, Check } from 'lucide-react';

interface ProductFilterProps {
  categories: ProductCategory[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  inStockOnly: boolean;
  onInStockToggle: (checked: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedVendor: string;
  onVendorChange: (v: string) => void;
  onResetFilters: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onInStockToggle,
  sortBy,
  onSortChange,
  selectedVendor,
  onVendorChange,
  onResetFilters
}) => {
  return (
    <div id="product-filter-sidebar" className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Filters</h3>
        </div>
        <button
          id="filter-reset-btn"
          onClick={onResetFilters}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sort Option */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Sort By
        </label>
        <select
          id="filter-sort-select"
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium"
        >
          <option value="featured">Featured Picks</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Customer Rating</option>
          <option value="popular">Most Reviewed</option>
          <option value="newest">Newest Releases</option>
        </select>
      </div>

      {/* Category List */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] opacity-70">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Price Range
          </label>
          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            ${minPrice} - ${maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={400}
          step={10}
          value={maxPrice}
          onChange={e => onPriceChange(minPrice, parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
        />
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span>$0</span>
          <span>$200</span>
          <span>$400+</span>
        </div>
      </div>

      {/* Verified Vendors */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Vendor Store
        </label>
        <select
          value={selectedVendor}
          onChange={e => onVendorChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium"
        >
          <option value="">All Verified Sellers</option>
          <option value="usr_seller_01">Apex Audio & Tech</option>
          <option value="usr_seller_02">Lumina Living Design</option>
        </select>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
            In-Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => onInStockToggle(e.target.checked)}
            className="w-4 h-4 rounded text-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-zinc-900 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
