import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onNavigateToMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToMenu }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    totalAmount,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 499;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-lg text-stone-900">Your Cart</h2>
                <p className="text-xs text-stone-500 font-medium">
                  {items.length} unique dish{items.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-stone-400 hover:text-red-600 transition-colors cursor-pointer px-2 py-1"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Delivery Banner Progress */}
          {items.length > 0 && (
            <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/60 text-xs">
              {amountNeededForFreeDelivery > 0 ? (
                <div>
                  <div className="flex justify-between items-center text-amber-900 font-medium mb-1.5">
                    <span>
                      Add <strong>₹{amountNeededForFreeDelivery.toFixed(0)}</strong> more for <strong>FREE Delivery!</strong>
                    </span>
                    <span className="font-bold">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Congratulations! You unlocked FREE Delivery!</span>
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-400 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-stone-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-stone-500 text-sm max-w-xs mb-6">
                  Satisfy your hunger with delicious woodfired pizzas, juicy burgers, or Indian curries.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToMenu();
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Browse Menu &amp; Specials
                </button>
              </div>
            ) : (
              items.map(({ foodItem, quantity }) => (
                <div
                  key={foodItem.id}
                  className="flex gap-3.5 p-3 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-white hover:shadow-xs transition-all"
                >
                  <img
                    src={foodItem.imageUrl}
                    alt={foodItem.name}
                    className="w-18 h-18 rounded-lg object-cover bg-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {foodItem.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(foodItem.id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          aria-label={`Remove ${foodItem.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500">₹{foodItem.price} each</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-white border border-stone-200 rounded-lg shadow-2xs">
                        <button
                          onClick={() => updateQuantity(foodItem.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-orange-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(foodItem.id, quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-orange-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-stone-950 font-heading text-sm">
                        ₹{(foodItem.price * quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-stone-200/80 pt-2 flex justify-between text-base font-extrabold text-stone-950 font-heading">
                  <span>Payable Total</span>
                  <span className="text-orange-600 font-black">₹{totalAmount.toFixed(0)}</span>
                </div>
              </div>

              {/* COD Reminder Badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-100/70 border border-orange-200/90 text-orange-900 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Cash on Delivery only. Pay directly to rider upon arrival.</span>
              </div>

              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout (COD)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
