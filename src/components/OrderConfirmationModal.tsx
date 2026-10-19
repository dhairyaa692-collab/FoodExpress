import React from 'react';
import { CheckCircle, Truck, MapPin, Phone, Banknote, Calendar, ArrowRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface OrderConfirmationModalProps {
  onNavigateToOrders: () => void;
  onNavigateToMenu: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  onNavigateToOrders,
  onNavigateToMenu,
}) => {
  const { lastPlacedOrder, isOrderConfirmationOpen, setIsOrderConfirmationOpen } = useCart();

  if (!isOrderConfirmationOpen || !lastPlacedOrder) return null;

  const handleTrackOrder = () => {
    setIsOrderConfirmationOpen(false);
    onNavigateToOrders();
  };

  const handleContinueShopping = () => {
    setIsOrderConfirmationOpen(false);
    onNavigateToMenu();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOrderConfirmationOpen(false)}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all relative border border-stone-100">
          <button
            onClick={() => setIsOrderConfirmationOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Banner */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <CheckCircle className="w-9 h-9" />
            </div>
            <span className="inline-block bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              Order Confirmed
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
              Thank You for Your Order!
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Your kitchen ticket is being prepared. Keep your cash ready for the delivery rider!
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 space-y-4 mb-6 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-stone-400 block text-[11px] uppercase font-bold">Order ID</span>
                <span className="font-extrabold text-stone-900 font-mono text-base">
                  {lastPlacedOrder.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-400 block text-[11px] uppercase font-bold">Estimated Time</span>
                <span className="font-extrabold text-orange-600 text-sm">25 - 35 mins</span>
              </div>
            </div>

            {/* Payment & Delivery Status */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-200">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                  <Banknote className="w-3.5 h-3.5 text-orange-600" />
                  <span>Payment Method</span>
                </div>
                <p className="font-bold text-stone-900">{lastPlacedOrder.paymentMethod}</p>
                <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                  {lastPlacedOrder.paymentStatus}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                  <Truck className="w-3.5 h-3.5 text-orange-600" />
                  <span>Order Status</span>
                </div>
                <p className="font-bold text-stone-900">{lastPlacedOrder.orderStatus}</p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Kitchen Accepted
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-1.5 text-stone-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900">{lastPlacedOrder.customerName}</span>
                  <p className="text-stone-500">{lastPlacedOrder.deliveryAddress}</p>
                  {lastPlacedOrder.deliveryInstructions && (
                    <p className="text-[11px] text-stone-400 italic">
                      Note: "{lastPlacedOrder.deliveryInstructions}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{lastPlacedOrder.customerPhone}</span>
              </div>
            </div>

            {/* Ordered Items Summary */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-[11px] uppercase font-bold text-stone-400 block mb-2">
                Ordered Dishes
              </span>
              <div className="space-y-2">
                {lastPlacedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-stone-800">
                      <strong>{item.quantity}x</strong> {item.name}
                    </span>
                    <span className="font-bold text-stone-900">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-3 border-t border-stone-200 flex justify-between items-center text-sm font-extrabold text-stone-950 font-heading">
                <span>Total Amount to Pay Rider:</span>
                <span className="text-orange-600 font-black text-lg">
                  ₹{lastPlacedOrder.totalAmount.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleTrackOrder}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Track Live in My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleContinueShopping}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Order More Food
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
