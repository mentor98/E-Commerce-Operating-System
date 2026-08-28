import React from 'react';
import { ActiveAppView } from '../../types';
import { ShieldCheck, Truck, RefreshCw, Lock, Sparkles, Code2, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ActiveAppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="app-footer" className="bg-zinc-100 dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-xs transition-colors">
      {/* Guarantees Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 py-8 bg-white/50 dark:bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Express Fulfillment</h4>
                <p className="text-[11px] text-zinc-500">Free courier on orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Zero-Exposure Payments</h4>
                <p className="text-[11px] text-zinc-500">Server-side Stripe & PayPal routing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Verified Multi-Vendor</h4>
                <p className="text-[11px] text-zinc-500">Curated artisan & tech brands</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Atomic Inventory</h4>
                <p className="text-[11px] text-zinc-500">Real-time stock reservation engine</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm">
                E
              </div>
              <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                E-Commerce Operating System
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Enterprise multi-vendor e-commerce platform orchestrating customer journeys, merchant inventory fulfillment, automated security audit trails, and pluggable payment gateway adapters.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> REST API Active: Port 3000
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                v2.4.0
              </span>
            </div>
          </div>

          {/* Storefront & Buyer Links */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Buyer Portal
            </h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('storefront')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Product Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Live Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('customer-dashboard')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Customer Account Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Merchant & Admin Links */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Merchant & Admin
            </h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('seller-dashboard')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Seller Fulfillment Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Admin OS & Audit Trails
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Coupon & Promotion Engine
                </button>
              </li>
            </ul>
          </div>

          {/* System & Architecture Links */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Architecture & QA
            </h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('test-runner')}
                  className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-500" /> Automated Test Suite
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('api-docs')}
                  className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" /> REST API Docs
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© 2026 Multi-Vendor E-Commerce Operating System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Stripe Ready</span>
            <span>•</span>
            <span>PayPal Sandbox</span>
            <span>•</span>
            <span>RBAC Security</span>
            <span>•</span>
            <span>Zero-Hassle Persistence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
