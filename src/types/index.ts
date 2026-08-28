export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  isSellerApproved?: boolean;
  commissionRate?: number;
  createdAt: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorRating?: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  category: string;
  tags: string[];
  images: string[];
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isActive: boolean;
  specifications: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  carrier?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'stripe' | 'paypal' | 'simulated' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  orderStatus: OrderStatus;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: 'product' | 'order' | 'coupon' | 'vendor' | 'user' | 'system' | 'payment';
  entityId?: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'promotion' | 'system' | 'payout';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface TestResultItem {
  id: string;
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: string;
}

export interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  totalDurationMs: number;
  suites: {
    name: string;
    tests: TestResultItem[];
  }[];
}

export interface PaymentGatewayInfo {
  id: 'stripe' | 'paypal' | 'simulated';
  name: string;
  description: string;
  isConfigured: boolean;
  isDefault: boolean;
}

export type ActiveAppView = 
  | 'storefront' 
  | 'product-detail'
  | 'cart'
  | 'tracking'
  | 'customer-dashboard'
  | 'seller-dashboard'
  | 'admin-dashboard'
  | 'test-runner'
  | 'api-docs';
