import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Truck,
  CookingPot,
  Ban,
  Search,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Banknote,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface MyOrdersPageProps {
  onNavigateToMenu: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'Pending', label: 'Order Received', icon: Clock },
  { status: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'Preparing', label: 'In Kitchen', icon: CookingPot },
  { status: 'Out for Delivery', label: 'Rider on Way', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: Package },
];

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigateToMenu }) => {
  const { user, token, openAuthModal } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, token]);

  const handleTrackSingleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;

    setTrackingError(null);
    setTrackedOrder(null);

    try {
      const formatted = searchOrderId.trim().toUpperCase();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${formatted}`, { headers });
      const data = await res.json();
      if (!res.ok) {
        setTrackingError(data.error || 'Order not found');
        return;
      }
      setTrackedOrder(data.order);
    } catch {
      setTrackingError('Failed to lookup order');
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      // Create minimal FoodItem structure to add to cart
      addToCart(
        {
          id: item.foodId,
          name: item.name,
          description: '',
          price: item.price,
          category: 'Burger', // Default placeholder
          isVeg: item.isVeg,
          imageUrl: item.imageUrl,
          isAvailable: true,
          popularity: 90,
          rating: 4.8,
          prepTimeMinutes: 15,
          createdAt: '',
        },
        item.quantity
      );
    });
    setIsCartOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrderId) return;
    setCancelLoading(true);
    setCancelMessage(null);

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${cancelModalOrderId}/cancel`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelMessage({ text: data.error || 'Failed to cancel order', isError: true });
        return;
      }

      setCancelMessage({ text: 'Order successfully cancelled.', isError: false });
      setCancelModalOrderId(null);
      fetchOrders();
      if (trackedOrder && trackedOrder.id === cancelModalOrderId) {
        setTrackedOrder(data.order);
      }
    } catch {
      setCancelMessage({ text: 'Failed to process cancellation.', isError: true });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStepProgressIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Preparing':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-orange-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
            Order Status &amp; History
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
            My Orders &amp; Live Tracking
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track your freshly prepared meals from the kitchen ticket to your doorstep.
          </p>
        </div>

        {/* Quick order tracker for guests or specific ID */}
        <form onSubmit={handleTrackSingleOrder} className="flex gap-2">
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            placeholder="e.g. FX-10482"
            className="px-3.5 py-2 rounded-xl border border-stone-300 focus:border-orange-500 text-xs sm:text-sm outline-hidden w-40 sm:w-48 bg-white uppercase font-mono font-semibold"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
          >
            Track Order
          </button>
        </form>
      </div>

      {cancelMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
            cancelMessage.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {cancelMessage.isError ? (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{cancelMessage.text}</span>
        </div>
      )}

      {/* Tracked single order result (if searched) */}
      {trackedOrder && (
        <div className="p-6 rounded-3xl bg-orange-50/70 border-2 border-orange-500/50 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-600 animate-ping"></span>
              <h3 className="font-heading font-extrabold text-lg text-stone-900">
                Tracked Order #{trackedOrder.id}
              </h3>
            </div>
            <button
              onClick={() => setTrackedOrder(null)}
              className="text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Dismiss
            </button>
          </div>

          <OrderTrackingCard
            order={trackedOrder}
            onReorder={handleReorder}
            onCancel={(id) => setCancelModalOrderId(id)}
            progressIndex={getStepProgressIndex(trackedOrder.orderStatus)}
          />
        </div>
      )}

      {trackingError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
          Could not find order: <strong>{trackingError}</strong>. Check the order ID format (e.g. FX-10482).
        </div>
      )}

      {/* User Orders List */}
      {!user ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-stone-900">
            Sign In to View Your Order History
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Log in to view all your previous orders, live kitchen timelines, and unlock one-click reordering and AI personalized cravings.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-stone-100 animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-stone-900">
            No Orders Placed Yet
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            You haven't ordered from FoodExpress yet. Explore our mouthwatering menu to place your first Cash on Delivery order!
          </p>
          <button
            onClick={onNavigateToMenu}
            className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            Explore Menu &amp; Specials
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>{orders.length} Total Orders Recorded</span>
            <button
              onClick={fetchOrders}
              className="text-orange-600 hover:text-orange-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Statuses</span>
            </button>
          </div>

          {orders.map((order) => (
            <OrderTrackingCard
              key={order.id}
              order={order}
              onReorder={handleReorder}
              onCancel={(id) => setCancelModalOrderId(id)}
              progressIndex={getStepProgressIndex(order.orderStatus)}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-xl text-stone-900">
              Cancel Order #{cancelModalOrderId}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be reversed. (Orders already preparing in kitchen or out for delivery cannot be cancelled).
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                disabled={cancelLoading}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderTrackingCardProps {
  order: Order;
  onReorder: (order: Order) => void;
  onCancel: (id: string) => void;
  progressIndex: number;
}

const OrderTrackingCard: React.FC<OrderTrackingCardProps> = ({
  order,
  onReorder,
  onCancel,
  progressIndex,
}) => {
  const isCancelled = order.orderStatus === 'Cancelled';
  const isDelivered = order.orderStatus === 'Delivered';
  const canCancel = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-5">
      {/* Top Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-base sm:text-lg text-stone-900">
              {order.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                isDelivered
                  ? 'bg-emerald-100 text-emerald-800'
                  : isCancelled
                  ? 'bg-red-100 text-red-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
          <span className="text-xs text-stone-400">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Amount (COD)</span>
            <span className="font-black text-lg text-stone-950 font-heading">
              ₹{order.totalAmount.toFixed(0)}
            </span>
          </div>

          <button
            onClick={() => onReorder(order)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition-all cursor-pointer active:scale-95"
            title="Add all items from this order to cart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reorder</span>
          </button>
        </div>
      </div>

      {/* Progress Timeline Step Tracker */}
      {!isCancelled ? (
        <div className="py-2">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPastOrCurrent = progressIndex >= idx;
              const isCurrent = progressIndex === idx;

              return (
                <div key={step.status} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs transition-all mb-1.5 ${
                      isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-md scale-105'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-orange-600'
                        : isPastOrCurrent
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progressIndex / 4) * 100)}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <Ban className="w-4 h-4 text-red-600 shrink-0" />
          <span>This order was cancelled. No delivery or payment collection will take place.</span>
        </div>
      )}

      {/* Items Summary & Address */}
      <div className="pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600">
        <div>
          <span className="font-bold text-stone-900 block mb-1.5 uppercase text-[10px] tracking-wider">
            Items ({order.items.length})
          </span>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-stone-800">
                  <strong className="text-stone-900">{item.quantity}x</strong> {item.name}
                </span>
                <span className="font-semibold text-stone-700 font-mono">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-bold text-stone-900 block mb-1 uppercase text-[10px] tracking-wider">
              Handover Address
            </span>
            <div className="flex items-start gap-1.5 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
              <span>{order.deliveryAddress}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
              <Banknote className="w-3.5 h-3.5 text-amber-700" />
              <span>{order.paymentStatus}</span>
            </div>

            {canCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
