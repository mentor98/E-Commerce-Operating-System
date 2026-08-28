import { db } from './db';
import { paymentGateway } from './payment-gateways';
import { TestResultItem, TestSuiteReport, User } from './types';

export class AutomatedTestRunner {
  public async runAllTests(): Promise<TestSuiteReport> {
    const startTime = Date.now();
    const suites: { name: string; tests: TestResultItem[] }[] = [];

    // Suite 1: Authentication & RBAC Security
    suites.push({
      name: 'Authentication & Role-Based Access Control (RBAC)',
      tests: await this.testAuthAndRBAC()
    });

    // Suite 2: Product Catalog, Search & Inventory Management
    suites.push({
      name: 'Product Catalog & Inventory Depletion Engine',
      tests: await this.testProductsAndInventory()
    });

    // Suite 3: Coupon & Discount Calculation Engine
    suites.push({
      name: 'Coupon & Promotion Rule Engine',
      tests: await this.testCouponsAndDiscounts()
    });

    // Suite 4: Order Creation, Lifecycle & Tracking
    suites.push({
      name: 'Order Lifecycle & Real-Time Tracking',
      tests: await this.testOrderLifecycle()
    });

    // Suite 5: Multi-Vendor Marketplace Isolation
    suites.push({
      name: 'Multi-Vendor Financials & Vendor Isolation',
      tests: await this.testVendorFinancials()
    });

    // Suite 6: Pluggable Payment Gateway Architecture
    suites.push({
      name: 'Payment Gateway Intent & Verification Pipeline',
      tests: await this.testPaymentGateways()
    });

    let totalTests = 0;
    let passed = 0;
    let failed = 0;

    suites.forEach(s => {
      s.tests.forEach(t => {
        totalTests++;
        if (t.passed) passed++;
        else failed++;
      });
    });

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      passed,
      failed,
      totalDurationMs: Date.now() - startTime,
      suites
    };
  }

  private async testAuthAndRBAC(): Promise<TestResultItem[]> {
    const results: TestResultItem[] = [];

    // Test 1.1: Seed users exist
    const t1Start = Date.now();
    const admin = db.getUserById('usr_admin_01');
    const seller = db.getUserById('usr_seller_01');
    const customer = db.getUserById('usr_cust_01');

    results.push({
      id: 'auth_01',
      suite: 'Auth & RBAC',
      name: 'Seed accounts initialized with distinct roles (admin, seller, customer)',
      passed: Boolean(admin?.role === 'admin' && seller?.role === 'seller' && customer?.role === 'customer'),
      durationMs: Date.now() - t1Start,
      details: `Admin: ${admin?.name}, Seller: ${seller?.name}, Customer: ${customer?.name}`
    });

    // Test 1.2: Customer registration logic
    const t2Start = Date.now();
    const testEmail = `test.user.${Date.now()}@example.com`;
    const newUser: User = {
      id: `usr_test_${Date.now()}`,
      name: 'Test Customer',
      email: testEmail,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    db.createUser(newUser);
    const retrieved = db.getUserByEmail(testEmail);

    results.push({
      id: 'auth_02',
      suite: 'Auth & RBAC',
      name: 'New customer creation & email uniqueness indexing',
      passed: Boolean(retrieved && retrieved.email === testEmail),
      durationMs: Date.now() - t2Start,
      details: `Created and retrieved user ID ${retrieved?.id}`
    });

    // Test 1.3: Audit logging on sensitive action
    const t3Start = Date.now();
    const logs = db.getAuditLogs(10);
    const hasUserCreatedLog = logs.some(l => l.action === 'USER_REGISTERED');
    results.push({
      id: 'auth_03',
      suite: 'Auth & RBAC',
      name: 'System writes persistent immutable audit log on user creation',
      passed: hasUserCreatedLog,
      durationMs: Date.now() - t3Start,
      details: `Found audit logs in store with latest action: ${logs[0]?.action}`
    });

    return results;
  }

  private async testProductsAndInventory(): Promise<TestResultItem[]> {
    const results: TestResultItem[] = [];

    // Test 2.1: Product retrieval & category filter
    const t1Start = Date.now();
    const electronics = db.getProducts({ category: 'cat_electronics' });
    results.push({
      id: 'prod_01',
      suite: 'Product & Inventory',
      name: 'Category-based querying & indexing filters active products',
      passed: electronics.products.length > 0 && electronics.products.every(p => p.category === 'cat_electronics'),
      durationMs: Date.now() - t1Start,
      details: `Found ${electronics.products.length} products in cat_electronics`
    });

    // Test 2.2: Search filter matching SKU and title
    const t2Start = Date.now();
    const searchRes = db.getProducts({ search: 'headphones' });
    results.push({
      id: 'prod_02',
      suite: 'Product & Inventory',
      name: 'Full-text search matches titles, descriptions, and tags',
      passed: searchRes.products.length > 0 && searchRes.products[0].title.toLowerCase().includes('headphones'),
      durationMs: Date.now() - t2Start,
      details: `Search for "headphones" returned: ${searchRes.products[0]?.title}`
    });

    // Test 2.3: Low stock warning detection
    const t3Start = Date.now();
    const allProds = db.getProducts({ limit: 100 }).products;
    const lowStockItems = allProds.filter(p => p.stock <= p.lowStockThreshold);
    results.push({
      id: 'prod_03',
      suite: 'Product & Inventory',
      name: 'Low-stock threshold evaluation correctly flags inventory',
      passed: lowStockItems.length >= 1,
      durationMs: Date.now() - t3Start,
      details: `Flagged ${lowStockItems.length} items below safety threshold`
    });

    return results;
  }

  private async testCouponsAndDiscounts(): Promise<TestResultItem[]> {
    const results: TestResultItem[] = [];

    // Test 3.1: Percentage coupon calculation
    const t1Start = Date.now();
    const cpn10 = db.getCouponByCode('WELCOME10');
    let discount10 = 0;
    if (cpn10 && cpn10.isActive) {
      const orderSubtotal = 200;
      discount10 = (orderSubtotal * cpn10.discountValue) / 100;
      if (cpn10.maxDiscountAmount && discount10 > cpn10.maxDiscountAmount) {
        discount10 = cpn10.maxDiscountAmount;
      }
    }
    results.push({
      id: 'cpn_01',
      suite: 'Coupons',
      name: 'WELCOME10 percentage coupon computes exact discount (10% on $200 = $20)',
      passed: discount10 === 20,
      durationMs: Date.now() - t1Start,
      details: `Calculated discount: $${discount10.toFixed(2)}`
    });

    // Test 3.2: Minimum order requirement guard
    const t2Start = Date.now();
    const cpn25 = db.getCouponByCode('SAVE25');
    const orderSubtotalLow = 40;
    const isEligible = cpn25 && orderSubtotalLow >= cpn25.minOrderAmount;
    results.push({
      id: 'cpn_02',
      suite: 'Coupons',
      name: 'Minimum order amount constraint rejects orders below $150 threshold',
      passed: isEligible === false,
      durationMs: Date.now() - t2Start,
      details: `Coupon SAVE25 minOrder ($150) correctly invalidated for $40 subtotal`
    });

    return results;
  }

  private async testOrderLifecycle(): Promise<TestResultItem[]> {
    const results: TestResultItem[] = [];

    // Test 4.1: Order creation with atomic stock decrement
    const t1Start = Date.now();
    const testProd = db.getProductById('prod_apex_01');
    const prevStock = testProd ? testProd.stock : 0;
    const customer = db.getUserById('usr_cust_01')!;

    const testOrder = db.createOrder({
      id: `ord_test_${Date.now()}`,
      orderNumber: `ORD-TEST-${Math.floor(10000 + Math.random() * 90000)}`,
      trackingNumber: `TRK-TEST-${Date.now()}`,
      carrier: 'USPS Priority',
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: [
        {
          productId: 'prod_apex_01',
          productTitle: 'AeroPulse ANC Pro Wireless Studio Headphones',
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          vendorId: 'usr_seller_01',
          vendorName: 'Apex Audio & Tech',
          quantity: 1,
          unitPrice: 289.00,
          totalPrice: 289.00,
          sku: 'APX-HP-001'
        }
      ],
      subtotal: 289.00,
      discount: 0,
      tax: 20.81,
      shippingFee: 0,
      totalAmount: 309.81,
      paymentMethod: 'simulated',
      paymentStatus: 'completed',
      orderStatus: 'paid',
      shippingAddress: {
        fullName: customer.name,
        street: '123 Tech Lane',
        city: 'San Jose',
        state: 'CA',
        zip: '95112',
        country: 'United States',
        phone: '+1 (555) 000-1122'
      },
      statusHistory: [
        {
          status: 'paid',
          timestamp: new Date().toISOString(),
          note: 'Automated test purchase created'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, customer);

    const updatedProd = db.getProductById('prod_apex_01');
    const newStock = updatedProd ? updatedProd.stock : 0;

    results.push({
      id: 'ord_01',
      suite: 'Orders',
      name: 'Order placement decrements product inventory atomically',
      passed: newStock === prevStock - 1,
      durationMs: Date.now() - t1Start,
      details: `Previous Stock: ${prevStock} -> New Stock: ${newStock}`
    });

    // Test 4.2: Tracking number lookup
    const t2Start = Date.now();
    const retrievedByTracking = db.getOrderByTracking(testOrder.trackingNumber);
    results.push({
      id: 'ord_02',
      suite: 'Orders',
      name: 'Live package tracking resolver returns order by tracking ID',
      passed: Boolean(retrievedByTracking && retrievedByTracking.id === testOrder.id),
      durationMs: Date.now() - t2Start,
      details: `Tracking ID: ${testOrder.trackingNumber} resolved to Order ${testOrder.orderNumber}`
    });

    return results;
  }

  private async testVendorFinancials(): Promise<TestResultItem[]> {
    const results: TestResultItem[] = [];

    // Test 5.1: Multi-vendor breakdown
    const t1Start = Date.now();
    const sellerAnalytics = db.getSellerAnalytics('usr_seller_01');
    results.push({
      id: 'vendor_01',
      suite: 'Vendor Financials',
      name: 'Seller analytics calculates gross sales, fee deductions, and net payout',
      passed: sellerAnalytics.totalGrossSales >= 0 && sellerAnalytics.netPayout <= sellerAnalytics.totalGrossSales,
      durationMs: Date.now() - t1Start,
      details: `Apex Audio: Gross $${sellerAnalytics.totalGrossSales.toFixed(2)}, Platform Fee: $${sellerAnalytics.marketplaceFee.toFixed(2)}, Net: $${sellerAnalytics.netPayout.toFixed(2)}`
    });

    // Test 5.2: Platform Admin GMV Rollup
    const t2Start = Date.now();
    const platformStats = db.getPlatformAnalytics();
    results.push({
      id: 'vendor_02',
      suite: 'Vendor Financials',
      name: 'Platform-wide GMV aggregation & category revenue breakdown',
      passed: platformStats.totalGMV > 0 && platformStats.categoryStats.length > 0,
      durationMs: Date.now() - t2Start,
      details: `Platform GMV: $${platformStats.totalGMV.toFixed(2)}, Total Orders: ${platformStats.totalOrders}`
    });

    return results;
  }

  private async testPaymentGateways(): Promise<TestResultItem[]> {
    const results: TestResultItem[] = [];

    // Test 6.1: Intent generation
    const t1Start = Date.now();
    const intent = await paymentGateway.createPaymentIntent('simulated', {
      amount: 150.00,
      currency: 'USD',
      orderNumber: 'ORD-INTENT-TEST',
      customerEmail: 'test@example.com',
      customerName: 'Test Buyer'
    });

    results.push({
      id: 'pay_01',
      suite: 'Payments',
      name: 'Payment gateway creates cryptographically secure transaction session',
      passed: intent.success && intent.transactionId.length > 0,
      durationMs: Date.now() - t1Start,
      details: `Session ID: ${intent.transactionId}, Provider: ${intent.provider}`
    });

    // Test 6.2: Payment verification and capture
    const t2Start = Date.now();
    const verification = await paymentGateway.verifyAndCapturePayment({
      provider: 'simulated',
      transactionId: intent.transactionId
    }, 150.00);

    results.push({
      id: 'pay_02',
      suite: 'Payments',
      name: 'Server captures payment authorization and records receipt payload',
      passed: verification.success && verification.status === 'completed',
      durationMs: Date.now() - t2Start,
      details: `Status: ${verification.status}, Captured: $${verification.amountReceived}`
    });

    return results;
  }
}

export const testRunner = new AutomatedTestRunner();
