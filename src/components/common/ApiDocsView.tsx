import React, { useState } from 'react';
import { Code2, Play, Check, Copy, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
  description: string;
  requestBody?: any;
  queryParams?: string;
  sampleResponse: any;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'get-products',
    method: 'GET',
    path: '/api/products',
    category: 'Products',
    description: 'Fetch multi-vendor product catalogue with category & vendor filtering',
    queryParams: '?category=cat_audio&vendorId=usr_seller_01&inStock=true',
    sampleResponse: {
      products: [
        {
          id: 'prod_01',
          title: 'Aura Studio Wireless Headphones',
          price: 249.99,
          stock: 18,
          vendorName: 'Apex Audio & Tech',
          rating: 4.88
        }
      ]
    }
  },
  {
    id: 'post-products',
    method: 'POST',
    path: '/api/products',
    category: 'Products',
    description: 'Create a new product listing (Seller or Admin authenticated)',
    requestBody: {
      title: 'Nordic Walnut Monitor Stand',
      price: 119.00,
      category: 'cat_desk',
      stock: 25,
      sku: 'SKU-WALNUT-01',
      vendorId: 'usr_seller_02'
    },
    sampleResponse: {
      product: {
        id: 'prod_new_99',
        title: 'Nordic Walnut Monitor Stand',
        price: 119.00,
        createdAt: '2026-08-28T12:00:00.000Z'
      }
    }
  },
  {
    id: 'post-payment-intent',
    method: 'POST',
    path: '/api/payments/intent',
    category: 'Payments',
    description: 'Securely create server-side payment intent for Stripe, PayPal, or Simulated Card',
    requestBody: {
      provider: 'stripe',
      amount: 249.99,
      currency: 'USD',
      customerEmail: 'alex.mercer@gmail.com'
    },
    sampleResponse: {
      success: true,
      transactionId: 'txn_sim_1724839200',
      clientSecret: 'pi_sim_secret_998124',
      provider: 'stripe'
    }
  },
  {
    id: 'post-orders',
    method: 'POST',
    path: '/api/orders',
    category: 'Orders',
    description: 'Place new multi-vendor order, decrement stock atomically, generate tracking code',
    requestBody: {
      customerId: 'usr_cust_01',
      items: [{ productId: 'prod_01', quantity: 1, unitPrice: 249.99 }],
      paymentMethod: 'stripe',
      totalAmount: 268.11,
      shippingAddress: { street: '742 Evergreen', city: 'San Francisco' }
    },
    sampleResponse: {
      order: {
        id: 'ord_1003',
        orderNumber: 'ORD-1003',
        status: 'pending',
        trackingNumber: 'TRK-918231',
        totalAmount: 268.11
      }
    }
  },
  {
    id: 'get-tracking',
    method: 'GET',
    path: '/api/orders/tracking/TRK-882194',
    category: 'Orders',
    description: 'Retrieve real-time package status and courier checkpoint history',
    sampleResponse: {
      order: {
        orderNumber: 'ORD-1001',
        status: 'shipped',
        carrier: 'FedEx Express',
        trackingNumber: 'TRK-882194'
      }
    }
  },
  {
    id: 'get-coupons',
    method: 'GET',
    path: '/api/coupons',
    category: 'Coupons',
    description: 'List active promotional discount codes and verification rules',
    sampleResponse: {
      coupons: [
        { code: 'WELCOME10', discountType: 'percentage', discountValue: 10 },
        { code: 'SAVE25', discountType: 'fixed', discountValue: 25 }
      ]
    }
  },
  {
    id: 'get-analytics',
    method: 'GET',
    path: '/api/analytics',
    category: 'Analytics',
    description: 'Executive GMV, Vendor counts, category volume breakdown (Admin only)',
    sampleResponse: {
      analytics: {
        totalRevenue: 1489.96,
        totalOrders: 4,
        categoryBreakdown: []
      }
    }
  }
];

export const ApiDocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestEndpoint = async () => {
    setLoading(true);
    try {
      let url = selectedEndpoint.path;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (selectedEndpoint.requestBody && selectedEndpoint.method !== 'GET') {
        options.body = JSON.stringify(selectedEndpoint.requestBody);
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setLiveResponse(data);
    } catch (err: any) {
      setLiveResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="api-docs-page" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">REST API Specification</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                JSON REST
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Production HTTP Endpoints • Server-Side Payment Gateway Abstraction • Atomic Operations
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
          Base URL: <span className="text-white">http://localhost:3000/api</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Endpoints List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2 pb-1">
            Available Endpoints
          </h3>
          <div className="space-y-1">
            {ENDPOINTS.map(ep => (
              <button
                key={ep.id}
                onClick={() => { setSelectedEndpoint(ep); setLiveResponse(null); }}
                className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all ${
                  selectedEndpoint.id === ep.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    ep.method === 'GET' ? 'bg-blue-500/20 text-blue-500' :
                    ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-500' :
                    ep.method === 'PUT' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="truncate font-mono">{ep.path}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Details & Interactive Playground */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                    selectedEndpoint.method === 'GET' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{selectedEndpoint.description}</p>
              </div>

              <button
                id="api-try-live-btn"
                onClick={handleTestEndpoint}
                disabled={loading}
                className="py-2 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Sending...' : 'Test Live Endpoint'}</span>
              </button>
            </div>

            {/* Request Payload if any */}
            {selectedEndpoint.requestBody && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Request Body (JSON)</span>
                <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 text-xs font-mono overflow-x-auto border border-zinc-800">
                  {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Live Response or Schema */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {liveResponse ? 'Live Server Response (200 OK)' : 'Expected Response Schema'}
              </span>
              <pre className="p-4 rounded-2xl bg-zinc-950 text-indigo-300 text-xs font-mono overflow-x-auto border border-zinc-800 max-h-72">
                {JSON.stringify(liveResponse || selectedEndpoint.sampleResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
