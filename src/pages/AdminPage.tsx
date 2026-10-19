import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Download,
  Search,
  Filter,
  Banknote,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  UtensilsCrossed,
  ArrowUpDown,
  Check,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import {
  AdminStats,
  AdminAnalytics,
  Order,
  FoodItem,
  OrderStatus,
  PaymentStatus,
  FoodCategory,
} from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const AdminPage: React.FC = () => {
  const { isAdmin, adminToken, loginAdmin, logoutAdmin } = useAuth();

  // Admin login screen state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active admin tab: 'analytics' | 'orders' | 'menu'
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'orders' | 'menu'>('analytics');

  // Dashboard stats & analytics
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default October 2026
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [statsLoading, setStatsLoading] = useState(false);

  // Orders table state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('All');
  const [orderSortBy, setOrderSortBy] = useState<string>('date-desc');

  // Menu management state
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<FoodItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Action feedback message
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const showFeedback = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(passwordInput.trim());
      if (!res.success) {
        setLoginError(res.error || 'Incorrect admin password');
      } else {
        setPasswordInput('');
      }
    } catch {
      setLoginError('Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch Stats and Analytics
  const fetchDashboardData = async () => {
    if (!adminToken) return;
    setStatsLoading(true);
    try {
      const headers = { 'x-admin-token': adminToken };

      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch(`/api/admin/analytics?month=${selectedMonth}&year=${selectedYear}`, { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    if (!adminToken) return;
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'All') params.append('status', orderStatusFilter);
      if (paymentStatusFilter !== 'All') params.append('paymentStatus', paymentStatusFilter);
      if (orderSearch.trim()) params.append('search', orderSearch.trim());
      params.append('sortBy', orderSortBy);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Menu
  const fetchMenu = async () => {
    if (!adminToken) return;
    setMenuLoading(true);
    try {
      const res = await fetch('/api/menu?sortBy=popularity', {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminToken) {
      fetchDashboardData();
      fetchOrders();
      fetchMenu();
    }
  }, [isAdmin, adminToken, selectedMonth, selectedYear]);

  useEffect(() => {
    if (isAdmin && adminToken) {
      fetchOrders();
    }
  }, [orderStatusFilter, paymentStatusFilter, orderSearch, orderSortBy]);

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`Order #${orderId} marked as ${status}`);
        fetchOrders();
        fetchDashboardData();
      } else {
        showFeedback(data.error || 'Failed to update order status', true);
      }
    } catch {
      showFeedback('Server error while updating status', true);
    }
  };

  // Payment status update (COD collection)
  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`Order #${orderId} payment marked as ${paymentStatus}`);
        fetchOrders();
        fetchDashboardData();
      } else {
        showFeedback(data.error || 'Failed to update payment status', true);
      }
    } catch {
      showFeedback('Server error while updating payment', true);
    }
  };

  // Toggle dish availability
  const handleToggleDishAvailability = async (dishId: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/menu/${dishId}/toggle-availability`, {
        method: 'PATCH',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message);
        fetchMenu();
      }
    } catch {
      showFeedback('Failed to toggle availability', true);
    }
  };

  // Delete dish
  const handleDeleteDish = async (dishId: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/menu/${dishId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        showFeedback('Dish removed from menu');
        setDeleteConfirmId(null);
        fetchMenu();
      }
    } catch {
      showFeedback('Failed to delete dish', true);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!adminToken) return;
    window.location.href = `/api/admin/export-csv?token=${encodeURIComponent(adminToken)}`;
  };

  // Reset to seeds
  const handleResetSeeds = async () => {
    if (!adminToken) return;
    if (!window.confirm('Reset database to default demo seeds? (Reverts all test data)')) return;

    try {
      const res = await fetch('/api/admin/reset-seeds', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        showFeedback('Database reset to initial demo seeds');
        fetchDashboardData();
        fetchOrders();
        fetchMenu();
      }
    } catch {
      showFeedback('Failed to reset seeds', true);
    }
  };

  // ==========================================
  // VIEW 1: ADMIN LOGIN SCREEN (LOCKED)
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-stone-200/90 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-orange-500 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 block">
              Staff &amp; Command Portal
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
              Admin Authorization
            </h1>
            <p className="text-xs text-stone-500">
              Enter the server-configured administrator password to unlock financial metrics, order tracking, and restaurant menu controls.
            </p>
          </div>
          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-orange-600 text-white font-extrabold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying Authorization...' : 'Authenticate & Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-stone-900 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-heading font-black shadow-md">
            FX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
                FoodExpress Central Command
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                Active Session
              </span>
            </div>
            <p className="text-stone-400 text-xs">
              Live database synchronization • Real-time order processing &amp; monthly tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 cursor-pointer"
            title="Download full database orders in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleResetSeeds}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all border border-stone-700 cursor-pointer"
            title="Reset database to seed dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seeds</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all ${
            feedback.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Admin Tab Switching Navigation */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'analytics'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard &amp; Monthly Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'orders'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Management ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('menu')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'menu'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food Menu Management ({menuItems.length})</span>
        </button>
      </div>

      {/* ========================================================
          SUBTAB 1: DASHBOARD & MONTHLY ANALYTICS
         ======================================================== */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-8">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Orders"
              value={stats?.totalOrders ?? '...'}
              subtitle="All-time database count"
              icon={ShoppingBag}
              color="text-stone-900"
              bg="bg-stone-100"
            />
            <SummaryCard
              title="Orders Today"
              value={stats?.ordersToday ?? '...'}
              subtitle="Received today"
              icon={Clock}
              color="text-orange-600"
              bg="bg-orange-50"
            />
            <SummaryCard
              title="Orders This Month"
              value={stats?.ordersThisMonth ?? '...'}
              subtitle="Current calendar month"
              icon={Calendar}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <SummaryCard
              title="Pending Orders"
              value={stats?.pendingOrders ?? '...'}
              subtitle="Kitchen or delivery route"
              icon={AlertCircle}
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <SummaryCard
              title="Delivered Orders"
              value={stats?.deliveredOrders ?? '...'}
              subtitle="Fulfilled orders"
              icon={CheckCircle}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <SummaryCard
              title="Cancelled Orders"
              value={stats?.cancelledOrders ?? '...'}
              subtitle="Customer / kitchen voided"
              icon={XCircle}
              color="text-red-600"
              bg="bg-red-50"
            />
            <SummaryCard
              title="Month Revenue"
              value={`₹${stats?.totalMonthRevenue?.toFixed(0) ?? '0'}`}
              subtitle="Order value this month"
              icon={Banknote}
              color="text-emerald-700"
              bg="bg-emerald-50"
            />
            <SummaryCard
              title="Pending COD Collection"
              value={`₹${stats?.pendingCodAmount?.toFixed(0) ?? '0'}`}
              subtitle="Cash with riders to collect"
              icon={TrendingUp}
              color="text-amber-700"
              bg="bg-amber-50"
            />
          </div>

          {/* Monthly Order Analytics & Month/Year Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-heading font-black text-xl text-stone-900">
                  Monthly Orders &amp; Revenue Analytics
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Day-by-day order counts and Cash on Delivery revenue for the chosen month.
                </p>
              </div>

              {/* Month & Year Selectors */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>

                <button
                  onClick={fetchDashboardData}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                  title="Refresh charts"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Daily Chart for Month */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Daily Orders for Selected Month</span>
                {analytics && (
                  <span className="text-orange-600">
                    Month Total: {analytics.summary.totalOrders} orders (₹{analytics.summary.revenue.toFixed(0)})
                  </span>
                )}
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                {analytics?.dailyChart ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          color: '#fff',
                          borderRadius: '12px',
                          fontSize: '12px',
                          border: 'none',
                        }}
                      />
                      <Bar dataKey="orders" name="Orders" fill="#ea580c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    Loading analytics chart...
                  </div>
                )}
              </div>
            </div>

            {/* Month-by-Month Comparison Chart */}
            <div className="pt-6 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Month-by-Month Trend Comparison ({selectedYear})</span>
                <span className="text-stone-400 text-[11px]">Orders vs Gross Revenue (₹)</span>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                {analytics?.monthlyComparison ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          color: '#fff',
                          borderRadius: '12px',
                          fontSize: '12px',
                          border: 'none',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="orders"
                        name="Orders Count"
                        stroke="#ea580c"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (₹)"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    Loading monthly comparison...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: ORDERS MANAGEMENT
         ======================================================== */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Search & Filters */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ID, customer, phone..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs outline-hidden"
                />
              </div>

              {/* Order Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-600">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* COD Payment Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-600">COD Payment:</span>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                >
                  <option value="All">All Payment States</option>
                  <option value="Pending - Cash on Delivery">Pending Collection</option>
                  <option value="Collected - Cash on Delivery">Collected</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchOrders}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            {ordersLoading ? (
              <div className="py-16 text-center text-xs text-stone-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-xs">
                No orders match your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3.5">Order ID &amp; Time</th>
                      <th className="p-3.5">Customer &amp; Contact</th>
                      <th className="p-3.5">Dishes Ordered</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Order Status</th>
                      <th className="p-3.5">COD Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-black text-stone-900 block">{o.id}</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(o.createdAt).toLocaleDateString()}{' '}
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-stone-900 block">{o.customerName}</span>
                          <span className="text-stone-500 block">{o.customerPhone}</span>
                          <span className="text-[11px] text-stone-400 truncate max-w-[180px] block" title={o.deliveryAddress}>
                            {o.deliveryAddress}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-[220px]">
                          <div className="space-y-1">
                            {o.items.map((i, idx) => (
                              <div key={idx} className="truncate text-stone-700 text-[11px]">
                                <strong>{i.quantity}x</strong> {i.name}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-black text-stone-950 text-sm">
                          ₹{o.totalAmount.toFixed(0)}
                        </td>

                        {/* Order status selector */}
                        <td className="p-3.5">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs border outline-hidden ${
                              o.orderStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : o.orderStatus === 'Cancelled'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-orange-50 text-orange-800 border-orange-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Payment Status (Cash on Delivery) */}
                        <td className="p-3.5">
                          {o.paymentStatus === 'Collected - Cash on Delivery' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Collected</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUpdatePaymentStatus(o.id, 'Collected - Cash on Delivery')}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-emerald-600 hover:text-white text-amber-900 font-extrabold text-[11px] border border-amber-300 transition-all cursor-pointer flex items-center gap-1"
                              title="Click to mark COD payment as collected"
                            >
                              <span>Mark Collected</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 3: FOOD MENU MANAGEMENT
         ======================================================== */}
      {activeAdminTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-xl text-stone-900">
                Menu Items Management
              </h3>
              <p className="text-xs text-stone-500">
                Add new food dishes, edit prices, descriptions, categories, or toggle immediate availability.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingDish(null);
                setIsDishModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            {menuLoading ? (
              <div className="py-16 text-center text-xs text-stone-400">Loading dishes...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3.5">Dish</th>
                      <th className="p-3.5">Restaurant</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Diet</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Prep Time</th>
                      <th className="p-3.5">Availability</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {menuItems.map((dish) => (
                      <tr key={dish.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                          />
                          <div className="max-w-[200px]">
                            <span className="font-bold text-stone-900 block truncate">{dish.name}</span>
                            <span className="text-[11px] text-stone-400 truncate block">
                              {dish.description}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 text-stone-800 font-semibold max-w-[140px] truncate" title={dish.restaurant}>
                          {dish.restaurant || 'FoodExpress Kitchen'}
                        </td>

                        <td className="p-3.5 font-semibold text-stone-700">{dish.category}</td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              dish.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {dish.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono font-black text-stone-900 text-sm">
                          ₹{dish.price}
                        </td>

                        <td className="p-3.5 text-stone-500 font-medium">{dish.prepTimeMinutes} mins</td>

                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleDishAvailability(dish.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              dish.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {dish.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{dish.isAvailable ? 'Available' : 'Sold Out'}</span>
                          </button>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingDish(dish);
                              setIsDishModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Edit Dish"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(dish.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dish Add/Edit Modal */}
      {isDishModalOpen && (
        <DishFormModal
          dish={editingDish}
          adminToken={adminToken!}
          onClose={() => setIsDishModalOpen(false)}
          onSuccess={() => {
            setIsDishModalOpen(false);
            fetchMenu();
            showFeedback(editingDish ? 'Dish updated successfully' : 'Dish added to menu');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
            <h3 className="font-heading font-black text-lg text-stone-900">
              Delete This Dish?
            </h3>
            <p className="text-xs text-stone-500">
              This will permanently remove this item from the FoodExpress customer menu.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDish(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Metric Card Component
interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  bg: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon: Icon, color, bg }) => (
  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{title}</span>
      <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>
    <div className={`text-xl sm:text-2xl font-black font-heading ${color}`}>{value}</div>
    <p className="text-[10px] text-stone-400 font-medium truncate">{subtitle}</p>
  </div>
);

// Dish Add/Edit Form Modal
interface DishFormModalProps {
  dish: FoodItem | null;
  adminToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DishFormModal: React.FC<DishFormModalProps> = ({ dish, adminToken, onClose, onSuccess }) => {
  const isEditing = !!dish;
  const [name, setName] = useState(dish?.name || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [price, setPrice] = useState(dish?.price?.toString() || '');
  const [category, setCategory] = useState<FoodCategory>(dish?.category || 'Pizza');
  const [isVeg, setIsVeg] = useState<boolean>(dish?.isVeg ?? true);
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl || '');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(dish?.prepTimeMinutes?.toString() || '15');
  const [isAvailable, setIsAvailable] = useState<boolean>(dish?.isAvailable ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      setError('Name, description, and price are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name,
      description,
      price: parseFloat(price),
      category,
      isVeg,
      imageUrl: imageUrl.trim() || undefined,
      prepTimeMinutes: parseInt(prepTimeMinutes, 10) || 15,
      isAvailable,
    };

    try {
      const url = isEditing ? `/api/admin/menu/${dish.id}` : '/api/admin/menu';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save dish');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error saving dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 my-8">
        <h3 className="font-heading font-black text-xl text-stone-900 mb-1">
          {isEditing ? 'Edit Dish' : 'Add New Dish to Menu'}
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          Enter dish parameters, pricing, and dietary classification.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Garlic Butter Lobster Roll"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredients and culinary preparation details..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14.99"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-hidden bg-white"
              >
                <option value="Pizza">Pizza</option>
                <option value="Burger">Burger</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Snacks">Snacks</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Prep Time (Mins)
              </label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(e.target.value)}
                placeholder="15"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Dietary Type
              </label>
              <select
                value={isVeg ? 'veg' : 'non-veg'}
                onChange={(e) => setIsVeg(e.target.value === 'veg')}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-hidden bg-white"
              >
                <option value="veg">Vegetarian 🥗</option>
                <option value="non-veg">Non-Vegetarian 🍗</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Food Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailableCheckbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="accent-orange-600 w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="isAvailableCheckbox" className="font-semibold text-stone-800 cursor-pointer">
              Dish is currently available to customers
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Dish...' : isEditing ? 'Update Dish' : 'Add Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
