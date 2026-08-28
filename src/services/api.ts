import {
  Product, ProductCategory, ProductReview, Order, Coupon, 
  User, AuditLog, NotificationItem, TestSuiteReport, PaymentGatewayInfo
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error || body.message) {
        errorMsg = body.error || body.message;
      }
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth & Personas
  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/auth/users');
    return handleResponse(res);
  },

  async switchDemoPersona(userId: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/switch-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return handleResponse(res);
  },

  async login(email: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return handleResponse(res);
  },

  async register(data: Partial<User>): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Products
  async getProducts(params?: {
    category?: string;
    vendorId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.vendorId) query.set('vendorId', params.vendorId);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params?.inStockOnly) query.set('inStockOnly', 'true');
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());

    const res = await fetch(`/api/products?${query.toString()}`);
    return handleResponse(res);
  },

  async getAllProductsAdmin(): Promise<{ products: Product[]; total: number }> {
    const res = await fetch('/api/products/admin-all');
    return handleResponse(res);
  },

  async getProductById(id: string): Promise<{ product: Product; reviews: ProductReview[]; vendor?: User }> {
    const res = await fetch(`/api/products/${id}`);
    return handleResponse(res);
  },

  async createProduct(data: Partial<Product>, vendorId?: string): Promise<{ product: Product }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, vendorId })
    });
    return handleResponse(res);
  },

  async updateProduct(id: string, updates: Partial<Product>, performerId?: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, performerId })
    });
    return handleResponse(res);
  },

  async deleteProduct(id: string, performerId?: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/products/${id}?performerId=${performerId || ''}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Categories
  async getCategories(): Promise<{ categories: ProductCategory[] }> {
    const res = await fetch('/api/categories');
    return handleResponse(res);
  },

  async createCategory(data: Partial<ProductCategory>, performerId?: string): Promise<{ category: ProductCategory }> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, performerId })
    });
    return handleResponse(res);
  },

  // Reviews
  async getReviews(productId: string): Promise<{ reviews: ProductReview[] }> {
    const res = await fetch(`/api/reviews/${productId}`);
    return handleResponse(res);
  },

  async submitReview(data: { productId: string; userId: string; rating: number; comment: string }): Promise<{ review: ProductReview }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Coupons
  async getCoupons(): Promise<{ coupons: Coupon[] }> {
    const res = await fetch('/api/coupons');
    return handleResponse(res);
  },

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount: number;
    message: string;
  }> {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return handleResponse(res);
  },

  async createCoupon(data: Partial<Coupon>, performerId?: string): Promise<{ coupon: Coupon }> {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, performerId })
    });
    return handleResponse(res);
  },

  async toggleCoupon(id: string, performerId?: string): Promise<{ coupon: Coupon }> {
    const res = await fetch(`/api/coupons/toggle/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ performerId })
    });
    return handleResponse(res);
  },

  // Orders & Live Tracking
  async getOrders(filter?: { customerId?: string; vendorId?: string }): Promise<{ orders: Order[]; total: number }> {
    const query = new URLSearchParams();
    if (filter?.customerId) query.set('customerId', filter.customerId);
    if (filter?.vendorId) query.set('vendorId', filter.vendorId);
    const res = await fetch(`/api/orders?${query.toString()}`);
    return handleResponse(res);
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${id}`);
    return handleResponse(res);
  },

  async trackOrderByNumber(trackingNumber: string): Promise<any> {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(trackingNumber)}`);
    return handleResponse(res);
  },

  async createOrder(orderData: any): Promise<{ order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },

  async updateOrderStatus(
    orderId: string, 
    data: { status: string; note?: string; trackingNumber?: string; carrier?: string; performerId?: string }
  ): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Wishlist
  async getWishlist(userId: string): Promise<{ products: Product[]; count: number }> {
    const res = await fetch(`/api/wishlist/${userId}`);
    return handleResponse(res);
  },

  async toggleWishlist(userId: string, productId: string): Promise<{ isInWishlist: boolean; count: number }> {
    const res = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId })
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(userId: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await fetch(`/api/notifications/${userId}`);
    return handleResponse(res);
  },

  async markNotificationRead(id: string, userId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(userId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return handleResponse(res);
  },

  // Audit Logs
  async getAuditLogs(limit?: number): Promise<{ logs: AuditLog[]; total: number }> {
    const res = await fetch(`/api/audit-logs?limit=${limit || 100}`);
    return handleResponse(res);
  },

  // Analytics
  async getPlatformAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics/platform');
    return handleResponse(res);
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics/platform');
    return handleResponse(res);
  },

  async getSellerAnalytics(vendorId: string): Promise<any> {
    const res = await fetch(`/api/analytics/seller/${vendorId}`);
    return handleResponse(res);
  },

  // Inventory Replenishment
  async updateInventory(productId: string, quantityToAdd: number): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${productId}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantityToAdd })
    });
    return handleResponse(res);
  },

  async deleteCoupon(id: string, performerId?: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/coupons/${id}?performerId=${performerId || ''}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async getOrderByTracking(trackingNumber: string): Promise<any> {
    return this.trackOrderByNumber(trackingNumber);
  },

  // Payments
  async getPaymentGateways(): Promise<{ gateways: PaymentGatewayInfo[] }> {
    const res = await fetch('/api/payments/gateways');
    return handleResponse(res);
  },

  async createPaymentIntent(payload: any): Promise<any> {
    const res = await fetch('/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async verifyPayment(payload: any): Promise<any> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Automated Tests
  async runAutomatedTests(): Promise<TestSuiteReport> {
    const res = await fetch('/api/tests/run', { method: 'POST' });
    return handleResponse(res);
  },

  // Reset Demo DB
  async resetDemoDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/system/reset-demo', { method: 'POST' });
    return handleResponse(res);
  },

  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    return this.resetDemoDatabase();
  }
};
