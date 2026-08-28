import React from 'react';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Tag } from 'lucide-react';
import { ProductCategory } from '../../types';

interface HeroBannerProps {
  categories: ProductCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onApplyCouponCode: (code: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onApplyCouponCode
}) => {
  return (
    <div id="storefront-hero-banner" className="relative overflow-hidden rounded-3xl bg-[#0d0d0d] text-white border border-zinc-800/80 shadow-2xl my-6">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-10 lg:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-200 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Generation Multi-Vendor Commerce Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Curated Artisans & High-Performance Hardware.
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
            Direct-from-maker studio audio, handcrafted walnut ergonomics, Japanese cold-mist diffusers, and weatherproof commute gear with verified vendor warranties.
          </p>

          {/* Quick Coupons bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="hero-coupon-welcome10-btn"
              onClick={() => onApplyCouponCode('WELCOME10')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 text-xs font-medium text-zinc-200 transition-all hover:scale-105"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Use <strong className="text-emerald-400 font-mono">WELCOME10</strong> for 10% Off</span>
            </button>

            <button
              id="hero-coupon-save25-btn"
              onClick={() => onApplyCouponCode('SAVE25')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 text-xs font-medium text-zinc-200 transition-all hover:scale-105"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Use <strong className="text-amber-400 font-mono">SAVE25</strong> on Orders &gt; $150</span>
            </button>
          </div>
        </div>

        {/* Category fast filters bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            id="cat-chip-all"
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-zinc-950 shadow-md font-bold'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
            }`}
          >
            All Collections
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              id={`cat-chip-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-zinc-950 shadow-md font-bold'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-700 text-zinc-300'
                }`}>
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
