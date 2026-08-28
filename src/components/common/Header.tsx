import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { PersonaSwitcherModal } from './PersonaSwitcherModal';
import { ActiveAppView, UserRole } from '../../types';
import {
  ShoppingBag, Heart, Sun, Moon, Bell, Search,
  Package, LayoutDashboard, ShieldAlert, Cpu, Code2,
  Store, User, ChevronDown, RotateCcw, Sparkles, Tag
} from 'lucide-react';

interface HeaderProps {
  currentView: ActiveAppView;
  onNavigate: (view: ActiveAppView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onResetDatabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenWishlist,
  wishlistCount = 0,
  onResetDatabase
}) => {
  const { currentUser, hasRole } = useAuth();
  const { itemCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();

  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Admin
          </span>
        );
      case 'seller':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Seller
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Customer
          </span>
        );
    }
  };

  return (
    <>
      <header id="app-header" className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors">
        {/* Top promo bar */}
        <div id="promo-announcement-bar" className="bg-zinc-900 text-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Multi-Vendor Live OS
            </span>
            <span className="text-zinc-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-300">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Use code <strong className="text-white bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[11px]">WELCOME10</strong> for 10% off or <strong className="text-white bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[11px]">SAVE25</strong> over $150
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-persona-switcher-bar-btn"
              onClick={() => setIsPersonaModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-white bg-zinc-800/90 hover:bg-zinc-700/90 px-2.5 py-0.5 rounded-full transition-colors border border-zinc-700"
            >
              <span>Persona:</span>
              <strong className="text-white capitalize">{currentUser?.role || 'Guest'}</strong>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {onResetDatabase && (
              <button
                id="header-reset-db-btn"
                onClick={onResetDatabase}
                title="Reset sample database to default seed state"
                className="hidden md:inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset Demo
              </button>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <button
                id="brand-logo-btn"
                onClick={() => onNavigate('storefront')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                  E
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                      NEXUS<span className="text-zinc-500 font-light">OS</span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      Multi-Vendor
                    </span>
                  </div>
                </div>
              </button>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
                <button
                  id="nav-storefront-btn"
                  onClick={() => onNavigate('storefront')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currentView === 'storefront'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Storefront
                </button>

                <button
                  id="nav-tracking-btn"
                  onClick={() => onNavigate('tracking')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'tracking'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" /> Track Package
                </button>

                <button
                  id="nav-customer-dashboard-btn"
                  onClick={() => onNavigate('customer-dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currentView === 'customer-dashboard'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Customer Hub
                </button>

                {/* Seller Portal Link */}
                <button
                  id="nav-seller-dashboard-btn"
                  onClick={() => onNavigate('seller-dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'seller-dashboard'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> Seller Hub
                </button>

                {/* Admin Portal Link */}
                <button
                  id="nav-admin-dashboard-btn"
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin-dashboard'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Admin OS
                </button>

                {/* Test Runner View */}
                <button
                  id="nav-tests-btn"
                  onClick={() => onNavigate('test-runner')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'test-runner'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-500" /> Automated Tests
                </button>

                {/* API Reference */}
                <button
                  id="nav-api-docs-btn"
                  onClick={() => onNavigate('api-docs')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'api-docs'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" /> REST API
                </button>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar */}
              <div className="relative hidden md:block w-44 lg:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Search products, SKU..."
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Wishlist Button */}
              {onOpenWishlist && (
                <button
                  id="header-wishlist-btn"
                  onClick={onOpenWishlist}
                  title="Wishlist"
                  className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  id="header-notification-btn"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  title="Notifications"
                  className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-950" />
                  )}
                </button>
                <NotificationDropdown
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                  onNavigateView={onNavigate}
                />
              </div>

              {/* Dark/Light Mode Toggle */}
              <button
                id="header-theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                id="header-cart-btn"
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity font-medium text-xs shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-bold">{itemCount}</span>
                <span className="hidden sm:inline border-l border-zinc-700 dark:border-zinc-300 pl-2 font-mono">
                  ${subtotal.toFixed(2)}
                </span>
              </button>

              {/* User Persona Profile Pill */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  id="header-user-avatar-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser?.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
                  />
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold leading-none text-zinc-900 dark:text-zinc-100 truncate max-w-[90px]">
                      {currentUser?.name.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isProfileMenuOpen && (
                  <div
                    id="header-profile-menu-dropdown"
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentUser?.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{currentUser?.email}</p>
                      <div className="mt-1.5">{getRoleBadge(currentUser?.role)}</div>
                    </div>

                    <div className="py-1">
                      <button
                        id="menu-switch-persona-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsPersonaModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between"
                      >
                        <span>Switch Persona</span>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      </button>

                      <button
                        id="menu-customer-hub-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate('customer-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        Customer Orders & Profile
                      </button>

                      <button
                        id="menu-seller-hub-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate('seller-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        Seller Product & Inventory
                      </button>

                      <button
                        id="menu-admin-hub-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate('admin-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        Admin OS & Audit Logs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Persona Switcher Modal */}
      <PersonaSwitcherModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSelectRoleView={(role) => {
          if (role === 'seller') onNavigate('seller-dashboard');
          else if (role === 'admin') onNavigate('admin-dashboard');
          else onNavigate('storefront');
        }}
      />
    </>
  );
};
