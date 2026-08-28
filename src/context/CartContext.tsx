import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
  isCartDrawerOpen: boolean;
  isCheckoutOpen: boolean;
  addToCart: (product: Product, quantity?: number, variant?: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  openCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.0725; // 7.25%
const FREE_SHIPPING_THRESHOLD = 100;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ecom_os_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecom_os_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items]);

  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  // Recompute coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon && subtotal > 0) {
      if (subtotal < appliedCoupon.minOrderAmount) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(`Coupon ${appliedCoupon.code} removed (Minimum order $${appliedCoupon.minOrderAmount.toFixed(2)})`);
      } else {
        let disc = 0;
        if (appliedCoupon.discountType === 'percentage') {
          disc = (subtotal * appliedCoupon.discountValue) / 100;
          if (appliedCoupon.maxDiscountAmount && disc > appliedCoupon.maxDiscountAmount) {
            disc = appliedCoupon.maxDiscountAmount;
          }
        } else {
          disc = Math.min(appliedCoupon.discountValue, subtotal);
        }
        setCouponDiscount(parseFloat(disc.toFixed(2)));
      }
    } else if (subtotal === 0) {
      setCouponDiscount(0);
    }
  }, [subtotal, appliedCoupon]);

  const discount = couponDiscount;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableAmount * TAX_RATE).toFixed(2));
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const total = parseFloat((subtotal - discount + tax + shippingFee).toFixed(2));

  const addToCart = (product: Product, quantity = 1, variant?: string): boolean => {
    if (product.stock <= 0) return false;

    setItems(prev => {
      const idx = prev.findIndex(it => it.productId === product.id && it.selectedVariant === variant);
      if (idx >= 0) {
        const currentQty = prev[idx].quantity;
        const newQty = Math.min(currentQty + quantity, product.stock);
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.stock);
        return [...prev, { productId: product.id, product, quantity: initialQty, selectedVariant: variant }];
      }
    });

    setIsCartDrawerOpen(true);
    return true;
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(it => it.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev => {
      return prev.map(it => {
        if (it.productId === productId) {
          const validQty = Math.min(quantity, it.product.stock);
          return { ...it, quantity: validQty };
        }
        return it;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.discountAmount);
        setCouponMessage(res.message);
        return true;
      } else {
        setCouponMessage(res.message || 'Invalid coupon');
        return false;
      }
    } catch (err: any) {
      setCouponMessage(err.message || 'Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const openCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        tax,
        shippingFee,
        total,
        appliedCoupon,
        couponMessage,
        isCartDrawerOpen,
        isCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setIsCartDrawerOpen,
        setIsCheckoutOpen,
        openCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
