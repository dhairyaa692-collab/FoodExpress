import React, { useState } from 'react';
import { Star, Clock, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { FoodItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface FoodCardProps {
  food: FoodItem;
  featured?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, featured = false }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.foodItem.id === food.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (!food.isAvailable) return;
    addToCart(food, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleIncrement = () => {
    if (!food.isAvailable) return;
    updateQuantity(food.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(food.id, quantity - 1);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col ${
        !food.isAvailable ? 'opacity-70 grayscale-[20%]' : ''
      } ${featured ? 'ring-2 ring-orange-500/30' : ''}`}
    >
      {/* Food Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <img
          src={food.imageUrl}
          alt={food.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback image if broken
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {/* Veg / Non-Veg Indicator */}
          <div
            className={`w-5 h-5 rounded-md bg-white/95 backdrop-blur-xs flex items-center justify-center border shadow-xs ${
              food.isVeg ? 'border-emerald-600' : 'border-amber-700'
            }`}
            title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            {food.isVeg ? (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            ) : (
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-amber-700"></div>
            )}
          </div>

          {/* Category Tag */}
          <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold tracking-wide">
            {food.category}
          </span>
        </div>

        {/* Availability Badge */}
        {!food.isAvailable ? (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-extrabold text-xs uppercase px-3 py-1 rounded-full shadow-lg tracking-wider">
              Sold Out
            </span>
          </div>
        ) : (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-xs font-semibold">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{food.prepTimeMinutes}m</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              Popularity: {food.popularity}%
            </span>
          </div>

          <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {food.name}
          </h3>

          {food.restaurant && (
            <p className="text-[11px] font-bold text-orange-700/90 truncate mt-0.5">
              by {food.restaurant}
            </p>
          )}

          <p className="text-stone-500 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block -mb-0.5">
              Price
            </span>
            <span className="text-lg sm:text-xl font-black text-stone-950 font-heading">
              ₹{food.price}
            </span>
          </div>

          <div>
            {!food.isAvailable ? (
              <button
                disabled
                className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-400 cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center bg-orange-600 text-white rounded-xl shadow-sm p-1">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 flex items-center justify-center hover:bg-orange-700 rounded-lg transition-colors cursor-pointer active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-extrabold text-sm">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 flex items-center justify-center hover:bg-orange-700 rounded-lg transition-colors cursor-pointer active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-orange-600 text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
