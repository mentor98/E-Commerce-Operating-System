import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { paymentGateway } from './server/payment-gateways';
import { testRunner } from './server/test-runner';
import { User, Product, Order, Coupon, ProductReview, OrderStatus } from './server/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for audit & observability
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      // API Logging
    }
    next();
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      system: 'E-Commerce Operating System (Multi-Vendor)',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
      database: 'persistent_json_store'
    });
  });

  // 1. Auth & Persona Management
  app.get('/api/auth/users', (req: Request, res: Response) => {
    const users = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      storeName: u.storeName,
      isSellerApproved: u.isSellerApproved
    }));
    res.json({ users });
  });

  app.post('/api/auth/switch-demo', (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User persona not found' });
    }
    res.json({ user, token: `demo_jwt_token_${user.id}` });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role } = req.body;
    let user = db.getUserByEmail(email);
    if (!user && role) {
      user = db.getUsers().find(u => u.role === role);
    }
    if (!user) {
      user = db.getUserById('usr_cust_01');
    }
    res.json({ user, token: `jwt_${user?.id}_${Date.now()}` });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, role, storeName, storeDescription, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: (role as any) || 'customer',
      storeName: role === 'seller' ? (storeName || `${name}'s Store`) : undefined,
      storeDescription: role === 'seller' ? storeDescription : undefined,
      isSellerApproved: role === 'seller' ? true : undefined,
      commissionRate: role === 'seller' ? 9.0 : undefined,
      avatarUrl: `https://images.unsplash.com/photo-${role === 'seller' ? '1534528741775-53994a69daeb' : '1535713875002-d1d0cf377fde'}?w=150&auto=format&fit=crop&q=80`,
      phone,
      createdAt: new Date().toISOString()
    };

    const created = db.createUser(newUser);
    res.status(201).json({ user: created, token: `jwt_${created.id}` });
  });

  // 2. Products
  app.get('/api/products', (req: Request, res: Response) => {
    const {
      category,
      vendorId,
      search,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
      limit,
      offset
    } = req.query;

    const result = db.getProducts({
      category: category as string,
      vendorId: vendorId as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      inStockOnly: inStockOnly === 'true',
      sortBy: sortBy as any,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.json(result);
  });

  app.get('/api/products/admin-all', (req: Request, res: Response) => {
    const products = db.getAllProductsAdmin();
    res.json({ products, total: products.length });
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const prod = db.getProductById(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const reviews = db.getReviewsForProduct(prod.id);
    const vendor = db.getUserById(prod.vendorId);
    res.json({ product: prod, reviews, vendor });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const {
      title,
      description,
      price,
      compareAtPrice,
      costPrice,
      sku,
      category,
      tags,
      images,
      stock,
      lowStockThreshold,
      specifications,
      vendorId
    } = req.body;

    if (!title || price === undefined || !category) {
      return res.status(400).json({ error: 'Title, price and category are required' });
    }

    const performer = db.getUserById(vendorId || 'usr_seller_01') || db.getUserById('usr_admin_01')!;

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      vendorId: performer.role === 'seller' ? performer.id : (vendorId || 'usr_seller_01'),
      vendorName: performer.storeName || performer.name,
      vendorRating: 4.9,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description || '',
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((s: string) => s.trim()) : []),
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      stock: parseInt(stock) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      rating: 5.0,
      reviewCount: 0,
      isActive: true,
      specifications: specifications || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = db.createProduct(newProduct, performer);
    res.status(201).json({ product: created });
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { performerId, ...updates } = req.body;
    const performer = db.getUserById(performerId || 'usr_seller_01') || db.getUserById('usr_admin_01')!;
    
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock);
    if (updates.lowStockThreshold !== undefined) updates.lowStockThreshold = parseInt(updates.lowStockThreshold);

    const updated = db.updateProduct(req.params.id, updates, performer);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: updated });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { performerId } = req.query;
    const performer = db.getUserById(performerId as string || 'usr_admin_01')!;
    const success = db.deleteProduct(req.params.id, performer);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  });

  // 3. Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json({ categories: db.getCategories() });
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const { name, description, icon, performerId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const performer = db.getUserById(performerId || 'usr_admin_01')!;
    const newCat = db.createCategory({
      id: `cat_${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || '',
      icon: icon || 'Tag'
    }, performer);
    res.status(201).json({ category: newCat });
  });

  // 4. Reviews
  app.get('/api/reviews/:productId', (req: Request, res: Response) => {
    const reviews = db.getReviewsForProduct(req.params.productId);
    res.json({ reviews });
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const { productId, userId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating and comment are required' });
    }
    const user = db.getUserById(userId || 'usr_cust_01') || db.getUserById('usr_cust_01')!;
    const review: ProductReview = {
      id: `rev_${Date.now()}`,
      productId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString(),
      verifiedPurchase: true
    };
    const created = db.addReview(review);
    res.status(201).json({ review: created });
  });

  // 5. Coupons
  app.get('/api/coupons', (req: Request, res: Response) => {
    res.json({ coupons: db.getCoupons() });
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code required' });
    }

    const coupon = db.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, message: 'This coupon is no longer active' });
    }

    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ valid: false, message: 'This coupon has expired' });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        message: `Order subtotal must be at least $${coupon.minOrderAmount.toFixed(2)} to use this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, orderSubtotal);
    }

    res.json({
      valid: true,
      coupon,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      message: `Coupon ${coupon.code} applied! Saved $${discountAmount.toFixed(2)}`
    });
  });

  app.post('/api/coupons', (req: Request, res: Response) => {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, performerId } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Code and discount value are required' });
    }
    const performer = db.getUserById(performerId || 'usr_admin_01')!;
    const newCoupon: Coupon = {
      id: `cpn_${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
      expiryDate: expiryDate || '2027-12-31T23:59:59.000Z',
      usageLimit: parseInt(usageLimit) || 500,
      usageCount: 0,
      isActive: true
    };
    const created = db.createCoupon(newCoupon, performer);
    res.status(201).json({ coupon: created });
  });

  app.post('/api/coupons/toggle/:id', (req: Request, res: Response) => {
    const { performerId } = req.body;
    const performer = db.getUserById(performerId || 'usr_admin_01')!;
    const toggled = db.toggleCoupon(req.params.id, performer);
    if (!toggled) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ coupon: toggled });
  });

  // 6. Orders & Live Tracking
  app.get('/api/orders', (req: Request, res: Response) => {
    const { customerId, vendorId } = req.query;
    const orders = db.getOrders({
      customerId: customerId as string,
      vendorId: vendorId as string
    });
    res.json({ orders, total: orders.length });
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order });
  });

  app.get('/api/orders/track/:trackingNumber', (req: Request, res: Response) => {
    const order = db.getOrderByTracking(req.params.trackingNumber);
    if (!order) {
      return res.status(404).json({ error: 'No shipment found for this tracking number' });
    }
    res.json({
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier || 'Standard Express',
      status: order.orderStatus,
      statusHistory: order.statusHistory,
      shippingAddress: order.shippingAddress,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      customerId,
      items,
      subtotal,
      discount,
      couponCode,
      tax,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentId,
      shippingAddress
    } = req.body;

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ error: 'Order items and shipping address are required' });
    }

    const customer = db.getUserById(customerId || 'usr_cust_01') || db.getUserById('usr_cust_01')!;

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `TRK-US-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      trackingNumber,
      carrier: 'FedEx Express Direct',
      customerId: customer.id,
      customerName: shippingAddress.fullName || customer.name,
      customerEmail: customer.email,
      items,
      subtotal: parseFloat(subtotal) || 0,
      discount: parseFloat(discount) || 0,
      couponCode: couponCode || undefined,
      tax: parseFloat(tax) || 0,
      shippingFee: parseFloat(shippingFee) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      paymentMethod: paymentMethod || 'simulated',
      paymentStatus: 'completed',
      paymentId: paymentId || `pay_${Date.now()}`,
      orderStatus: 'paid',
      shippingAddress,
      statusHistory: [
        {
          status: 'paid',
          timestamp: new Date().toISOString(),
          note: `Payment verified via ${paymentMethod || 'gateway'}. Order registered into fulfillment queue.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = db.createOrder(newOrder, customer);
    res.status(201).json({ order: created });
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status, note, trackingNumber, carrier, performerId } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'New status is required' });
    }
    const performer = db.getUserById(performerId || 'usr_seller_01') || db.getUserById('usr_admin_01')!;
    const updated = db.updateOrderStatus(
      req.params.id, 
      status as OrderStatus, 
      performer, 
      note, 
      trackingNumber, 
      carrier
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order: updated });
  });

  // 7. Wishlist
  app.get('/api/wishlist/:userId', (req: Request, res: Response) => {
    const products = db.getWishlist(req.params.userId);
    res.json({ products, count: products.length });
  });

  app.post('/api/wishlist/toggle', (req: Request, res: Response) => {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId required' });
    }
    const result = db.toggleWishlist(userId, productId);
    res.json(result);
  });

  // 8. Notifications
  app.get('/api/notifications/:userId', (req: Request, res: Response) => {
    const notifications = db.getNotifications(req.params.userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ notifications, unreadCount });
  });

  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { userId } = req.body;
    const ok = db.markNotificationAsRead(req.params.id, userId || 'usr_cust_01');
    res.json({ success: ok });
  });

  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    const { userId } = req.body;
    const ok = db.markAllNotificationsAsRead(userId || 'usr_cust_01');
    res.json({ success: ok });
  });

  // 9. Audit Logs & RBAC
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = db.getAuditLogs(limit);
    res.json({ logs, total: logs.length });
  });

  // 10. Analytics
  app.get('/api/analytics/platform', (req: Request, res: Response) => {
    const analytics = db.getPlatformAnalytics();
    res.json(analytics);
  });

  app.get('/api/analytics/seller/:vendorId', (req: Request, res: Response) => {
    const analytics = db.getSellerAnalytics(req.params.vendorId);
    res.json(analytics);
  });

  // 11. Payments Integration Endpoints
  app.get('/api/payments/gateways', (req: Request, res: Response) => {
    res.json({ gateways: paymentGateway.getAvailableGateways() });
  });

  app.post('/api/payments/intent', async (req: Request, res: Response) => {
    try {
      const { provider, amount, currency, orderNumber, customerEmail, customerName } = req.body;
      const intent = await paymentGateway.createPaymentIntent(provider || 'simulated', {
        amount: parseFloat(amount) || 0,
        currency: currency || 'USD',
        orderNumber: orderNumber || `TEMP-${Date.now()}`,
        customerEmail: customerEmail || 'guest@example.com',
        customerName: customerName || 'Valued Customer'
      });
      res.json(intent);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Payment intent creation failed' });
    }
  });

  app.post('/api/payments/verify', async (req: Request, res: Response) => {
    try {
      const { provider, transactionId, paymentMethodId, expectedAmount } = req.body;
      const verified = await paymentGateway.verifyAndCapturePayment({
        provider: provider || 'simulated',
        transactionId,
        paymentMethodId
      }, parseFloat(expectedAmount) || 0);
      res.json(verified);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Payment capture failed' });
    }
  });

  // 12. Automated Test Suite Runner
  app.get('/api/tests/run', async (req: Request, res: Response) => {
    const report = await testRunner.runAllTests();
    res.json(report);
  });

  app.post('/api/tests/run', async (req: Request, res: Response) => {
    const report = await testRunner.runAllTests();
    res.json(report);
  });

  // 13. System Reset for Interactive Demos
  app.post('/api/system/reset-demo', (req: Request, res: Response) => {
    db.resetToDefault();
    res.json({ success: true, message: 'Database reset to default seeded state' });
  });

  // --- VITE DEV / PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Commerce Operating System backend active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to boot server:', err);
});
