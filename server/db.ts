import fs from 'fs';
import path from 'path';
import { 
  User, Product, ProductCategory, ProductReview, Coupon, 
  Order, AuditLog, NotificationItem, OrderStatus 
} from './types';

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: ProductCategory[];
  reviews: ProductReview[];
  coupons: Coupon[];
  orders: Order[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  wishlists: Record<string, string[]>; // userId -> array of productIds
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'ecommerce_db.json');

const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Sarah Jenkins (Marketplace Admin)',
    email: 'admin@ecom-os.dev',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z',
    phone: '+1 (555) 019-2831'
  },
  {
    id: 'usr_seller_01',
    name: 'Apex Gear (Marcus Vance)',
    email: 'seller@apexgear.com',
    role: 'seller',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    storeName: 'Apex Audio & Tech',
    storeDescription: 'Premier manufacturer of audiophile hardware, titanium acoustic monitors, and workspace gear.',
    storeLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
    isSellerApproved: true,
    commissionRate: 8.5,
    createdAt: '2026-01-15T10:30:00.000Z',
    phone: '+1 (555) 482-9102'
  },
  {
    id: 'usr_seller_02',
    name: 'Lumina Living (Elena Rostova)',
    email: 'seller@luminaliving.com',
    role: 'seller',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    storeName: 'Lumina Living Design',
    storeDescription: 'Minimalist Scandinavian home decor, ergonomic task lamps, and smart ceramic wares.',
    storeLogo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80',
    isSellerApproved: true,
    commissionRate: 10.0,
    createdAt: '2026-01-20T12:00:00.000Z',
    phone: '+1 (555) 391-7721'
  },
  {
    id: 'usr_cust_01',
    name: 'Alex Mercer (Customer)',
    email: 'alex.mercer@gmail.com',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T14:20:00.000Z',
    phone: '+1 (555) 723-9014',
    address: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States'
    }
  }
];

const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat_electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'High-fidelity headphones, mechanical keyboards, and precision desk peripherals.',
    icon: 'Headphones',
    productCount: 4
  },
  {
    id: 'cat_workspace',
    name: 'Ergonomic Workspace',
    slug: 'workspace',
    description: 'Solid walnut desk risers, ambient LED bars, and acoustic felt mats.',
    icon: 'Laptop',
    productCount: 3
  },
  {
    id: 'cat_living',
    name: 'Home & Living',
    slug: 'living',
    description: 'Artisan ceramic vessels, geometric aroma diffusers, and warm linen throws.',
    icon: 'Home',
    productCount: 3
  },
  {
    id: 'cat_apparel',
    name: 'Minimalist Apparel',
    slug: 'apparel',
    description: 'Weatherproof commute jackets, merino wool overshirts, and modular daypacks.',
    icon: 'Shirt',
    productCount: 2
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_apex_01',
    vendorId: 'usr_seller_01',
    vendorName: 'Apex Audio & Tech',
    vendorRating: 4.9,
    title: 'AeroPulse ANC Pro Wireless Studio Headphones',
    slug: 'aeropulse-anc-pro-headphones',
    description: 'Mastered for pure acoustic accuracy. Featuring 45mm beryllium drivers, active hybrid noise cancellation with transparency mode, 40-hour battery life, and plush memory foam leatherette ear cushions.',
    price: 289.00,
    compareAtPrice: 349.00,
    costPrice: 140.00,
    sku: 'APX-HP-001',
    category: 'cat_electronics',
    tags: ['wireless', 'anc', 'audio', 'studio', 'bluetooth'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    lowStockThreshold: 10,
    rating: 4.85,
    reviewCount: 38,
    isFeatured: true,
    isActive: true,
    specifications: {
      'Driver Size': '45mm Custom Beryllium',
      'Battery Life': '40 Hours (ANC ON)',
      'Connectivity': 'Bluetooth 5.3 / 3.5mm Aux / USB-C Lossless',
      'Weight': '248g'
    },
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-02-15T12:00:00.000Z'
  },
  {
    id: 'prod_apex_02',
    vendorId: 'usr_seller_01',
    vendorName: 'Apex Audio & Tech',
    vendorRating: 4.9,
    title: 'Titanium CNC Custom 75% Mechanical Keyboard',
    slug: 'titanium-cnc-mechanical-keyboard',
    description: 'Precision milled solid aluminum-titanium chassis with gasket mounting, factory-lubed linear switches, hot-swappable PCB, and double-shot PBT keycaps with custom sound dampening silicon pads.',
    price: 195.00,
    compareAtPrice: 229.00,
    costPrice: 95.00,
    sku: 'APX-KB-750',
    category: 'cat_electronics',
    tags: ['keyboard', 'mechanical', 'custom', 'titanium', 'desk'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    lowStockThreshold: 5,
    rating: 4.92,
    reviewCount: 44,
    isFeatured: true,
    isActive: true,
    specifications: {
      'Layout': '75% Compact (82 Keys)',
      'Switches': 'Gateron Oil King (Factory Lubed)',
      'Plate Material': 'FR4 / Polycarbonate',
      'Backlight': 'South-Facing Per-Key RGB'
    },
    createdAt: '2026-01-22T14:30:00.000Z',
    updatedAt: '2026-02-18T09:15:00.000Z'
  },
  {
    id: 'prod_apex_03',
    vendorId: 'usr_seller_01',
    vendorName: 'Apex Audio & Tech',
    vendorRating: 4.9,
    title: 'AuraBeam Pro Smart Monitor Light Bar',
    slug: 'aurabeam-pro-monitor-light-bar',
    description: 'Asymmetric optical design prevents screen glare while bathing your desktop in natural 95+ CRI warm to cool white illumination. Includes wireless rotary desktop controller with ambient sensor.',
    price: 89.00,
    compareAtPrice: 110.00,
    costPrice: 40.00,
    sku: 'APX-LT-100',
    category: 'cat_workspace',
    tags: ['lighting', 'desk', 'workspace', 'eyecare'],
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 8, // Low stock demo!
    lowStockThreshold: 10,
    rating: 4.78,
    reviewCount: 29,
    isFeatured: false,
    isActive: true,
    specifications: {
      'CRI Rating': 'Ra ≥ 95',
      'Color Temperature': '2700K - 6500K Stepless',
      'Controller': '2.4GHz Wireless Dial Controller',
      'Mounting': 'Gravity pivot for flat/curved monitors'
    },
    createdAt: '2026-01-25T11:00:00.000Z',
    updatedAt: '2026-02-20T16:00:00.000Z'
  },
  {
    id: 'prod_lumina_01',
    vendorId: 'usr_seller_02',
    vendorName: 'Lumina Living Design',
    vendorRating: 4.8,
    title: 'Solid American Walnut Dual-Tier Desk Shelf Riser',
    slug: 'american-walnut-desk-shelf-riser',
    description: 'Handcrafted from single-origin sustainably harvested American black walnut with brushed anodized aluminum structural legs. Elevates dual 27-inch monitors with built-in storage tray.',
    price: 168.00,
    compareAtPrice: 199.00,
    costPrice: 75.00,
    sku: 'LUM-DS-W46',
    category: 'cat_workspace',
    tags: ['wood', 'walnut', 'ergonomic', 'desk setup', 'scandinavian'],
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 24,
    lowStockThreshold: 5,
    rating: 4.95,
    reviewCount: 52,
    isFeatured: true,
    isActive: true,
    specifications: {
      'Wood Species': '100% Solid American Black Walnut',
      'Dimensions': '46" L x 9" D x 4.2" H',
      'Max Load Capacity': '120 lbs (54 kg)',
      'Finish': 'Natural Matte Plant-Based Oil'
    },
    createdAt: '2026-01-28T09:00:00.000Z',
    updatedAt: '2026-02-22T10:30:00.000Z'
  },
  {
    id: 'prod_lumina_02',
    vendorId: 'usr_seller_02',
    vendorName: 'Lumina Living Design',
    vendorRating: 4.8,
    title: 'Kyoto Ceramic Ultrasonic Cold-Mist Aroma Diffuser',
    slug: 'kyoto-ceramic-ultrasonic-diffuser',
    description: 'Matte hand-turned speckled ceramic shell inspired by Japanese tea-house aesthetics. Quiet 2.4MHz ultrasonic oscillation with 8-hour continuous mist and subtle warm LED base glow.',
    price: 64.00,
    compareAtPrice: 78.00,
    costPrice: 26.00,
    sku: 'LUM-DF-08',
    category: 'cat_living',
    tags: ['aromatherapy', 'ceramic', 'decor', 'zen', 'living'],
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    lowStockThreshold: 15,
    rating: 4.81,
    reviewCount: 31,
    isFeatured: false,
    isActive: true,
    specifications: {
      'Water Reservoir': '220 ml',
      'Coverage Area': '350 sq. ft.',
      'Auto Shut-off': 'Yes, on water depletion',
      'Sound Level': '< 20 dB Whisper Quiet'
    },
    createdAt: '2026-02-01T15:00:00.000Z',
    updatedAt: '2026-02-24T11:00:00.000Z'
  },
  {
    id: 'prod_lumina_03',
    vendorId: 'usr_seller_02',
    vendorName: 'Lumina Living Design',
    vendorRating: 4.8,
    title: 'Nordic Organic Felt Desk Mat & Magnetic Cable Rail',
    slug: 'nordic-felt-desk-mat',
    description: 'Premium dense non-fray wool felt desk pad offering pleasant tactile resting, thermal isolation, and an integrated hidden neodymium magnetic channel for cable docking.',
    price: 42.00,
    compareAtPrice: 50.00,
    costPrice: 16.00,
    sku: 'LUM-MT-GRY',
    category: 'cat_workspace',
    tags: ['felt', 'desk pad', 'cable management', 'minimal'],
    images: [
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 75,
    lowStockThreshold: 10,
    rating: 4.74,
    reviewCount: 22,
    isFeatured: false,
    isActive: true,
    specifications: {
      'Dimensions': '36" x 16" x 0.16" (90 x 40 x 0.4 cm)',
      'Material': 'High-Density Australian Merino Wool Felt',
      'Anti-Slip Base': 'Natural Rubberized Grid'
    },
    createdAt: '2026-02-05T12:00:00.000Z',
    updatedAt: '2026-02-23T14:00:00.000Z'
  },
  {
    id: 'prod_apex_04',
    vendorId: 'usr_seller_01',
    vendorName: 'Apex Audio & Tech',
    vendorRating: 4.9,
    title: 'Apex SoundSphere True-Spatial Desktop Monitors',
    slug: 'soundsphere-spatial-desktop-monitors',
    description: 'Compact nearfield reference studio monitors equipped with custom DSP acoustic correction, Kevlar woofer cones, and lossless USB-C 24-bit/192kHz DAC streaming.',
    price: 320.00,
    compareAtPrice: 380.00,
    costPrice: 160.00,
    sku: 'APX-SPK-200',
    category: 'cat_electronics',
    tags: ['speakers', 'monitors', 'audio', 'hifi', 'desk'],
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    lowStockThreshold: 4,
    rating: 4.88,
    reviewCount: 19,
    isFeatured: true,
    isActive: true,
    specifications: {
      'Frequency Response': '48Hz - 22,000Hz',
      'Total Output Power': '120W Peak (60W RMS Class D)',
      'Inputs': 'USB-C Lossless, RCA, Bluetooth 5.3 AptX HD'
    },
    createdAt: '2026-02-08T11:45:00.000Z',
    updatedAt: '2026-02-25T17:20:00.000Z'
  },
  {
    id: 'prod_lumina_04',
    vendorId: 'usr_seller_02',
    vendorName: 'Lumina Living Design',
    vendorRating: 4.8,
    title: 'Vanguard Weatherproof Urban Commute Daypack 22L',
    slug: 'vanguard-commute-daypack',
    description: 'Constructed with recycled 840D ballistic nylon and YKK AquaGuard zippers. Features dedicated padded 16" laptop suspend cradle, quick-access passport pocket, and magnetic sternum buckle.',
    price: 135.00,
    compareAtPrice: 160.00,
    costPrice: 58.00,
    sku: 'LUM-BP-22L',
    category: 'cat_apparel',
    tags: ['backpack', 'commute', 'weatherproof', 'travel', 'minimal'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    lowStockThreshold: 8,
    rating: 4.91,
    reviewCount: 27,
    isFeatured: false,
    isActive: true,
    specifications: {
      'Volume': '22 Liters',
      'Laptop Sleeve': 'Fits up to 16" MacBook Pro',
      'Waterproof Rating': 'IPX4 Splash & Rain Resistant'
    },
    createdAt: '2026-02-12T09:30:00.000Z',
    updatedAt: '2026-02-26T10:00:00.000Z'
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn_01',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 40,
    expiryDate: '2027-12-31T23:59:59.000Z',
    usageLimit: 1000,
    usageCount: 142,
    isActive: true
  },
  {
    id: 'cpn_02',
    code: 'SAVE25',
    discountType: 'fixed',
    discountValue: 25,
    minOrderAmount: 150,
    expiryDate: '2027-06-30T23:59:59.000Z',
    usageLimit: 500,
    usageCount: 89,
    isActive: true
  },
  {
    id: 'cpn_03',
    code: 'VIP50',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 200,
    maxDiscountAmount: 100,
    expiryDate: '2027-09-30T23:59:59.000Z',
    usageLimit: 100,
    usageCount: 23,
    isActive: true
  }
];

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev_01',
    productId: 'prod_apex_01',
    userId: 'usr_cust_01',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'The soundstage is breathtaking. ANC easily silences the HVAC and open office chatter. Battery life easily lasted me a full work week on one charge.',
    createdAt: '2026-02-18T14:20:00.000Z',
    verifiedPurchase: true
  },
  {
    id: 'rev_02',
    productId: 'prod_apex_02',
    userId: 'usr_cust_01',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'The typing sound profile is deep and creamy straight out of the box. Extremely solid titanium build quality.',
    createdAt: '2026-02-20T16:45:00.000Z',
    verifiedPurchase: true
  },
  {
    id: 'rev_03',
    productId: 'prod_lumina_01',
    userId: 'usr_cust_01',
    userName: 'Jordan Lee',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Stunning walnut grain. Fits my 34-inch ultrawide monitor and audio interface underneath seamlessly. Elevates the whole room aesthetic.',
    createdAt: '2026-02-22T08:15:00.000Z',
    verifiedPurchase: true
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_demo_101',
    orderNumber: 'ORD-98421',
    trackingNumber: 'TRK-US-88492014',
    carrier: 'FedEx Express',
    customerId: 'usr_cust_01',
    customerName: 'Alex Mercer',
    customerEmail: 'alex.mercer@gmail.com',
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
    discount: 28.90,
    couponCode: 'WELCOME10',
    tax: 20.81,
    shippingFee: 0.00,
    totalAmount: 280.91,
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    paymentId: 'pi_3MtwxL2eZvKYlo2C19s83910',
    orderStatus: 'shipped',
    shippingAddress: {
      fullName: 'Alex Mercer',
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
      phone: '+1 (555) 723-9014'
    },
    statusHistory: [
      {
        status: 'paid',
        timestamp: '2026-02-25T10:14:00.000Z',
        note: 'Payment authorized and verified via Stripe checkout.'
      },
      {
        status: 'processing',
        timestamp: '2026-02-25T11:30:00.000Z',
        note: 'Apex Audio warehouse picked and verified serial number.'
      },
      {
        status: 'shipped',
        timestamp: '2026-02-26T08:45:00.000Z',
        note: 'Package handed over to carrier (FedEx Express).'
      }
    ],
    createdAt: '2026-02-25T10:14:00.000Z',
    updatedAt: '2026-02-26T08:45:00.000Z'
  },
  {
    id: 'ord_demo_102',
    orderNumber: 'ORD-98422',
    trackingNumber: 'TRK-US-77319402',
    carrier: 'UPS Ground',
    customerId: 'usr_cust_01',
    customerName: 'Alex Mercer',
    customerEmail: 'alex.mercer@gmail.com',
    items: [
      {
        productId: 'prod_lumina_01',
        productTitle: 'Solid American Walnut Dual-Tier Desk Shelf Riser',
        productImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
        vendorId: 'usr_seller_02',
        vendorName: 'Lumina Living Design',
        quantity: 1,
        unitPrice: 168.00,
        totalPrice: 168.00,
        sku: 'LUM-DS-W46'
      },
      {
        productId: 'prod_lumina_02',
        productTitle: 'Kyoto Ceramic Ultrasonic Cold-Mist Aroma Diffuser',
        productImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
        vendorId: 'usr_seller_02',
        vendorName: 'Lumina Living Design',
        quantity: 1,
        unitPrice: 64.00,
        totalPrice: 64.00,
        sku: 'LUM-DF-08'
      }
    ],
    subtotal: 232.00,
    discount: 25.00,
    couponCode: 'SAVE25',
    tax: 16.56,
    shippingFee: 0.00,
    totalAmount: 223.56,
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    paymentId: 'PAYID-MT1990234',
    orderStatus: 'processing',
    shippingAddress: {
      fullName: 'Alex Mercer',
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
      phone: '+1 (555) 723-9014'
    },
    statusHistory: [
      {
        status: 'paid',
        timestamp: '2026-02-27T14:00:00.000Z',
        note: 'Payment captured via PayPal.'
      },
      {
        status: 'processing',
        timestamp: '2026-02-27T15:20:00.000Z',
        note: 'Order currently packing at Lumina Living Workshop.'
      }
    ],
    createdAt: '2026-02-27T14:00:00.000Z',
    updatedAt: '2026-02-27T15:20:00.000Z'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    timestamp: '2026-02-25T10:14:00.000Z',
    userId: 'usr_cust_01',
    userName: 'Alex Mercer',
    userRole: 'customer',
    action: 'ORDER_CREATED',
    entity: 'order',
    entityId: 'ord_demo_101',
    details: 'Customer placed order ORD-98421 with total $280.91 (Coupon: WELCOME10)',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log_02',
    timestamp: '2026-02-26T08:45:00.000Z',
    userId: 'usr_seller_01',
    userName: 'Marcus Vance',
    userRole: 'seller',
    action: 'ORDER_SHIPPED',
    entity: 'order',
    entityId: 'ord_demo_101',
    details: 'Dispatched with FedEx tracking TRK-US-88492014',
    ipAddress: '192.168.1.88'
  },
  {
    id: 'log_03',
    timestamp: '2026-02-27T09:00:00.000Z',
    userId: 'usr_admin_01',
    userName: 'Sarah Jenkins',
    userRole: 'admin',
    action: 'VENDOR_APPROVED',
    entity: 'vendor',
    entityId: 'usr_seller_02',
    details: 'Approved seller onboarding for Lumina Living Design with commission 10.0%',
    ipAddress: '10.0.0.12'
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    userId: 'usr_cust_01',
    title: 'Package On The Way 📦',
    message: 'Your order ORD-98421 has shipped via FedEx Express! Tracking: TRK-US-88492014',
    type: 'order',
    isRead: false,
    createdAt: '2026-02-26T08:45:00.000Z',
    link: '/customer/orders'
  },
  {
    id: 'notif_02',
    userId: 'usr_seller_01',
    title: 'Low Inventory Alert ⚠️',
    message: 'AuraBeam Pro Smart Monitor Light Bar has only 8 units left in stock.',
    type: 'inventory',
    isRead: false,
    createdAt: '2026-02-27T06:00:00.000Z',
    link: '/seller/products'
  },
  {
    id: 'notif_03',
    userId: 'usr_admin_01',
    title: 'New High Volume Order 💰',
    message: 'Order ORD-98422 processed ($223.56 GMV). Commission logged.',
    type: 'system',
    isRead: true,
    createdAt: '2026-02-27T14:05:00.000Z',
    link: '/admin/orders'
  }
];

class StoreDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrCreate();
  }

  private loadOrCreate(): DatabaseSchema {
    try {
      if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
        fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing seeded state:', err);
    }

    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      orders: INITIAL_ORDERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
      wishlists: {
        'usr_cust_01': ['prod_apex_02', 'prod_lumina_04']
      }
    };

    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
        fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetToDefault() {
    this.data = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
      reviews: JSON.parse(JSON.stringify(INITIAL_REVIEWS)),
      coupons: JSON.parse(JSON.stringify(INITIAL_COUPONS)),
      orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      wishlists: {
        'usr_cust_01': ['prod_apex_02', 'prod_lumina_04']
      }
    };
    this.persist();
    return true;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entity: 'user',
      entityId: user.id,
      details: `New ${user.role} user created: ${user.email}`
    });
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Products
  public getProducts(params?: {
    category?: string;
    vendorId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
    limit?: number;
    offset?: number;
  }): { products: Product[]; total: number } {
    let result = [...this.data.products.filter(p => p.isActive)];

    if (params?.category && params.category !== 'all') {
      result = result.filter(p => p.category === params.category);
    }

    if (params?.vendorId) {
      result = result.filter(p => p.vendorId === params.vendorId);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined) {
      result = result.filter(p => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      result = result.filter(p => p.price <= params.maxPrice!);
    }

    if (params?.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    if (params?.sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (params?.sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (params?.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (params?.sortBy === 'popular') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = result.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;

    return {
      products: result.slice(offset, offset + limit),
      total
    };
  }

  public getAllProductsAdmin(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(product: Product, performer: User): Product {
    this.data.products.unshift(product);
    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'PRODUCT_CREATED',
      entity: 'product',
      entityId: product.id,
      details: `Product "${product.title}" created with stock ${product.stock} and price $${product.price}`
    });
    this.persist();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>, performer: User): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { 
      ...this.data.products[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'PRODUCT_UPDATED',
      entity: 'product',
      entityId: id,
      details: `Updated product "${this.data.products[idx].title}"`
    });
    this.persist();
    return this.data.products[idx];
  }

  public deleteProduct(id: string, performer: User): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const title = this.data.products[idx].title;
    this.data.products.splice(idx, 1);
    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'PRODUCT_DELETED',
      entity: 'product',
      entityId: id,
      details: `Deleted product "${title}"`
    });
    this.persist();
    return true;
  }

  // Categories
  public getCategories(): ProductCategory[] {
    return this.data.categories.map(cat => ({
      ...cat,
      productCount: this.data.products.filter(p => p.category === cat.id && p.isActive).length
    }));
  }

  public createCategory(cat: ProductCategory, performer: User): ProductCategory {
    this.data.categories.push(cat);
    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'CATEGORY_CREATED',
      entity: 'system',
      entityId: cat.id,
      details: `New category "${cat.name}" added.`
    });
    this.persist();
    return cat;
  }

  // Reviews
  public getReviewsForProduct(productId: string): ProductReview[] {
    return this.data.reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addReview(review: ProductReview): ProductReview {
    this.data.reviews.unshift(review);
    // Recalculate product rating
    const pReviews = this.data.reviews.filter(r => r.productId === review.productId);
    const avg = pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length;
    const prod = this.getProductById(review.productId);
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(2));
      prod.reviewCount = pReviews.length;
    }
    this.persist();
    return review;
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
  }

  public createCoupon(coupon: Coupon, performer: User): Coupon {
    this.data.coupons.push(coupon);
    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'COUPON_CREATED',
      entity: 'coupon',
      entityId: coupon.id,
      details: `Coupon ${coupon.code} created (${coupon.discountType}: ${coupon.discountValue})`
    });
    this.persist();
    return coupon;
  }

  public toggleCoupon(id: string, performer: User): Coupon | undefined {
    const cpn = this.data.coupons.find(c => c.id === id);
    if (!cpn) return undefined;
    cpn.isActive = !cpn.isActive;
    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'COUPON_TOGGLED',
      entity: 'coupon',
      entityId: id,
      details: `Coupon ${cpn.code} isActive changed to ${cpn.isActive}`
    });
    this.persist();
    return cpn;
  }

  // Orders
  public getOrders(filter?: { customerId?: string; vendorId?: string }): Order[] {
    let list = [...this.data.orders];
    if (filter?.customerId) {
      list = list.filter(o => o.customerId === filter.customerId);
    }
    if (filter?.vendorId) {
      list = list.filter(o => o.items.some(it => it.vendorId === filter.vendorId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public getOrderByTracking(trackingNumber: string): Order | undefined {
    return this.data.orders.find(o => o.trackingNumber.toLowerCase() === trackingNumber.toLowerCase().trim());
  }

  public createOrder(order: Order, customer: User): Order {
    // Deplete stock atomically
    for (const item of order.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        // If stock is below threshold, trigger notification to seller
        if (prod.stock <= prod.lowStockThreshold) {
          this.createNotification({
            userId: prod.vendorId,
            title: 'Low Stock Alert',
            message: `Product "${prod.title}" is running low (${prod.stock} left).`,
            type: 'inventory',
            link: '/seller/products'
          });
        }
      }
    }

    // Increment coupon count if used
    if (order.couponCode) {
      const cpn = this.getCouponByCode(order.couponCode);
      if (cpn) {
        cpn.usageCount += 1;
      }
    }

    this.data.orders.unshift(order);

    // Notify customer
    this.createNotification({
      userId: customer.id,
      title: 'Order Confirmed 🎉',
      message: `Your order ${order.orderNumber} ($${order.totalAmount.toFixed(2)}) has been placed.`,
      type: 'order',
      link: '/customer/orders'
    });

    // Notify sellers
    const vendorIds = Array.from(new Set(order.items.map(i => i.vendorId)));
    for (const vid of vendorIds) {
      this.createNotification({
        userId: vid,
        title: 'New Order Received 🚀',
        message: `Order ${order.orderNumber} contains items for your store.`,
        type: 'order',
        link: '/seller/orders'
      });
    }

    // Audit log
    this.logAudit({
      userId: customer.id,
      userName: customer.name,
      userRole: customer.role,
      action: 'ORDER_PLACED',
      entity: 'order',
      entityId: order.id,
      details: `Placed order ${order.orderNumber} for $${order.totalAmount.toFixed(2)} with ${order.items.length} items.`
    });

    this.persist();
    return order;
  }

  public updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    performer: User, 
    note?: string, 
    trackingNumber?: string, 
    carrier?: string
  ): Order | undefined {
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    order.orderStatus = newStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    order.updatedAt = new Date().toISOString();

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus}`,
      updatedBy: performer.name
    });

    // Notify customer of shipment or delivery
    this.createNotification({
      userId: order.customerId,
      title: `Order Update: ${newStatus.toUpperCase()}`,
      message: `Order ${order.orderNumber} status changed to ${newStatus.replace('_', ' ')}. ${note || ''}`,
      type: 'order',
      link: '/customer/orders'
    });

    this.logAudit({
      userId: performer.id,
      userName: performer.name,
      userRole: performer.role,
      action: 'ORDER_STATUS_CHANGED',
      entity: 'order',
      entityId: order.id,
      details: `Order ${order.orderNumber} status updated to ${newStatus}`
    });

    this.persist();
    return order;
  }

  // Wishlist
  public getWishlist(userId: string): Product[] {
    const ids = this.data.wishlists[userId] || [];
    return this.data.products.filter(p => ids.includes(p.id) && p.isActive);
  }

  public toggleWishlist(userId: string, productId: string): { isInWishlist: boolean; count: number } {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }
    const list = this.data.wishlists[userId];
    const idx = list.indexOf(productId);
    let isInWishlist = false;

    if (idx >= 0) {
      list.splice(idx, 1);
      isInWishlist = false;
    } else {
      list.push(productId);
      isInWishlist = true;
    }
    this.persist();
    return { isInWishlist, count: list.length };
  }

  // Audit Logs
  public getAuditLogs(limit: number = 100): AuditLog[] {
    return [...this.data.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    return log;
  }

  // Notifications
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(item: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): NotificationItem {
    const notif: NotificationItem = {
      id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...item
    };
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.persist();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): boolean {
    let updated = false;
    this.data.notifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) this.persist();
    return true;
  }

  // Analytics
  public getPlatformAnalytics() {
    const orders = this.data.orders;
    const paidOrders = orders.filter(o => o.paymentStatus === 'completed' && o.orderStatus !== 'cancelled');
    const totalGMV = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const totalProducts = this.data.products.length;
    const totalCustomers = this.data.users.filter(u => u.role === 'customer').length;
    const totalSellers = this.data.users.filter(u => u.role === 'seller').length;

    // Platform Commission (avg 8.5%)
    const platformNetRevenue = totalGMV * 0.085;

    // Sales over last 7 days calculation
    const daysMap: Record<string, { date: string; gmv: number; orders: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      daysMap[key] = { date: label, gmv: 0, orders: 0 };
    }

    paidOrders.forEach(o => {
      const key = o.createdAt.split('T')[0];
      if (daysMap[key]) {
        daysMap[key].gmv += o.totalAmount;
        daysMap[key].orders += 1;
      }
    });

    const revenueTimeline = Object.values(daysMap);

    // Category breakdown
    const categoryStats = this.data.categories.map(c => {
      const prods = this.data.products.filter(p => p.category === c.id);
      const prodIds = prods.map(p => p.id);
      let catRevenue = 0;
      paidOrders.forEach(o => {
        o.items.forEach(it => {
          if (prodIds.includes(it.productId)) {
            catRevenue += it.totalPrice;
          }
        });
      });
      return {
        id: c.id,
        name: c.name,
        productCount: prods.length,
        revenue: catRevenue
      };
    });

    return {
      totalGMV,
      platformNetRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      totalSellers,
      revenueTimeline,
      categoryStats
    };
  }

  public getSellerAnalytics(vendorId: string) {
    const allOrders = this.data.orders;
    const sellerOrders = allOrders.filter(o => o.items.some(i => i.vendorId === vendorId));
    const paidOrders = sellerOrders.filter(o => o.paymentStatus === 'completed' && o.orderStatus !== 'cancelled');

    let totalGrossSales = 0;
    let totalUnitsSold = 0;

    paidOrders.forEach(o => {
      o.items.filter(i => i.vendorId === vendorId).forEach(item => {
        totalGrossSales += item.totalPrice;
        totalUnitsSold += item.quantity;
      });
    });

    const vendor = this.getUserById(vendorId);
    const commRate = (vendor?.commissionRate || 8.5) / 100;
    const marketplaceFee = totalGrossSales * commRate;
    const netPayout = totalGrossSales - marketplaceFee;

    const vendorProducts = this.data.products.filter(p => p.vendorId === vendorId);
    const lowStockCount = vendorProducts.filter(p => p.stock <= p.lowStockThreshold).length;

    return {
      totalGrossSales,
      marketplaceFee,
      netPayout,
      totalOrders: sellerOrders.length,
      totalUnitsSold,
      totalProducts: vendorProducts.length,
      lowStockCount
    };
  }
}

export const db = new StoreDatabase();
