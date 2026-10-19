import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  User as UserIcon,
  FileText,
  Banknote,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    items,
    subtotal,
    deliveryFee,
    totalAmount,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    setLastPlacedOrder,
    setIsOrderConfirmationOpen,
  } = useCart();

  const { user, token } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autofill user profile details if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
      if (!deliveryAddress) setDeliveryAddress(user.address || '');
    }
  }, [user, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate fields
    if (!customerName.trim()) {
      setError('Please provide your full name for the delivery rider.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setError('Please provide a valid contact mobile number.');
      return;
    }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      setError('Please provide a complete delivery address with street and apartment.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          foodId: i.foodItem.id,
          name: i.foodItem.name,
          price: i.foodItem.price,
          quantity: i.quantity,
          isVeg: i.foodItem.isVeg,
          imageUrl: i.foodItem.imageUrl,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        paymentMethod: 'Cash on Delivery',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Successful order placement!
      clearCart();
      setLastPlacedOrder(data.order);
      setIsCheckoutOpen(false);
      setIsOrderConfirmationOpen(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f59e0b', '#10b981', '#dc2626'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while placing your order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all relative border border-stone-100">
          {/* Close button */}
          <button
            onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
            disabled={isSubmitting}
            className="absolute top-6 right-6 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-stone-900">
                Delivery Checkout
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Cash on Delivery (COD) — strictly pay upon receipt
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cannot place order</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, apartment or suite number, city, and zip code"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-hidden transition-all resize-none"
                />
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Ring doorbell twice, leave at door, gate code 1234"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Payment Method Selection (Cash on Delivery ONLY) */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="p-4 rounded-2xl border-2 border-orange-500 bg-orange-50/50 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900 text-sm font-heading">
                        Cash on Delivery (COD)
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Pay cash directly to the courier rider upon delivery. No card details or online prepayment required.
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-orange-600 flex items-center justify-center bg-white shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1.5 px-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero online transaction fee. Safe, transparent, and direct handover.</span>
              </div>
            </div>

            {/* Order Items & Total Summary */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Items Subtotal ({items.length} items)</span>
                <span className="font-semibold text-stone-900">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-stone-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between text-base font-extrabold text-stone-950 font-heading">
                <span>Total Amount to Pay on Delivery:</span>
                <span className="text-orange-600 font-black text-xl">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-60 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order (Cash on Delivery)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
