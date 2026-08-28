import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Storefront } from './components/storefront/Storefront';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { WishlistDrawer } from './components/storefront/WishlistDrawer';
import { OrderTrackingView } from './components/storefront/OrderTrackingView';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TestRunnerView } from './components/common/TestRunnerView';
import { ApiDocsView } from './components/common/ApiDocsView';
import { ActiveAppView, Product, Order } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { showToast } = useNotification();
  const [currentView, setCurrentView] = useState<ActiveAppView>('storefront');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrackingCode, setActiveTrackingCode] = useState<string>('TRK-882194');

  // Wishlist State (Local persistence)
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast('info', 'Wishlist Updated', `Removed ${product.title}`);
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast('success', 'Saved to Wishlist', `Added ${product.title}`);
        return [...prev, product];
      }
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const handleNavigate = (view: ActiveAppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrder = (trackingNumber: string) => {
    setActiveTrackingCode(trackingNumber);
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database to clean seed state? All test orders and products will be refreshed.')) return;
    try {
      await api.resetDatabase();
      showToast('success', 'Database Reset', 'Default multi-vendor seed state restored.');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
    }
  };

  return (
    <div id="nexus-os-root" className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-800 dark:selection:text-white">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        wishlistCount={wishlist.length}
        onResetDatabase={handleResetDatabase}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'storefront' && (
          <Storefront
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onTrackOrder={handleTrackOrder}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingView
            initialTrackingCode={activeTrackingCode}
          />
        )}

        {currentView === 'customer-dashboard' && (
          <CustomerDashboard
            onTrackOrder={handleTrackOrder}
            onNavigateStorefront={() => handleNavigate('storefront')}
          />
        )}

        {currentView === 'seller-dashboard' && (
          <SellerDashboard />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onResetDatabase={handleResetDatabase}
          />
        )}

        {currentView === 'test-runner' && (
          <TestRunnerView />
        )}

        {currentView === 'api-docs' && (
          <ApiDocsView />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal & Payment Intent Capture */}
      <CheckoutModal
        onOrderPlaced={(order: Order) => {
          // Handled inside checkout modal
        }}
        onTrackOrder={handleTrackOrder}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onOpenProduct={() => {
          setCurrentView('storefront');
        }}
      />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Universal Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
