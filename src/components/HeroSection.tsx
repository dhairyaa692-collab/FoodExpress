import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Flame,
  Sparkles,
  ShieldCheck,
  Clock,
  BadgePercent,
  CheckCircle2,
} from 'lucide-react';
import { FoodCategory } from '../types/index.ts';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: FoodCategory | 'All') => void;
  onOrderNow: () => void;
  onExploreAi: () => void;
}

const HERO_CATEGORIES: { name: FoodCategory; icon: string; count: string }[] = [
  { name: 'Pizza', icon: '🍕', count: 'Woodfired' },
  { name: 'Burger', icon: '🍔', count: 'Smash Angus' },
  { name: 'Indian', icon: '🍛', count: 'Curry & Naan' },
  { name: 'Chinese', icon: '🥡', count: 'Wok Noodles' },
  { name: 'Snacks', icon: '🍟', count: 'Crispy Wings' },
  { name: 'Desserts', icon: '🍰', count: 'Lava Cakes' },
  { name: 'Beverages', icon: '🥤', count: 'Cold Brews' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onSelectCategory,
  onOrderNow,
  onExploreAi,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <div className="relative pt-6 pb-12 sm:pb-16 overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-radial from-orange-200/40 via-amber-100/20 to-transparent blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Text & Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold tracking-wide">
              <span className="flex h-2 w-2 rounded-full bg-orange-600 animate-ping"></span>
              <span>AI-Powered Food Delivery • Strictly Cash on Delivery</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-stone-950 leading-[1.08]">
              Your Cravings, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-amber-600">
                Delivered.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl font-medium leading-relaxed">
              From cheesy truffle pizzas and double smash burgers to rich Indian curries and sizzling noodles. Our smart AI predictor learns what you crave and delivers it piping hot.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl relative">
              <div className="flex items-center rounded-2xl bg-white p-2 shadow-xl shadow-stone-200/60 border border-stone-200/90 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search dishes, e.g. 'Truffle Pizza', 'Butter Chicken', 'Burger'..."
                  className="w-full px-3 py-2 text-sm text-stone-800 placeholder-stone-400 bg-transparent outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
                >
                  Find Food
                </button>
              </div>
            </form>

            {/* Quick Action CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOrderNow}
                className="px-6 py-3.5 rounded-xl bg-stone-950 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreAi}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-orange-600 font-extrabold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Craving Predictor</span>
              </button>
            </div>

            {/* Value Props Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-stone-200/80 text-xs text-stone-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% COD Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>30 Min Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-red-600 shrink-0" />
                <span>Free Delivery ₹499+</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Food Feature Card */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-white">
                <div className="relative aspect-4/3 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
                    alt="Smoked Bacon Cheddar Smash Burger"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-md text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span>#1 Bestseller Today</span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-orange-600 text-white font-heading font-black text-lg px-3.5 py-1 rounded-xl shadow-lg">
                    ₹299
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-1">
                    <span>Double Angus Smash Burger</span>
                    <span className="text-amber-500">★ 4.9 (480+ reviews)</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    Two juicy patties smashed with caramelized onions, aged cheddar cheese, and signature savory relish.
                  </p>
                </div>
              </div>

              {/* Floating AI Craving Badge */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-stone-950 text-white p-3.5 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-3 max-w-[260px] animate-bounce-short">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider">
                    AI Craving Match
                  </p>
                  <p className="text-xs font-bold text-stone-100">
                    98% Match for your weekend craving!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="mt-12 pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-extrabold text-lg text-stone-900">
              Popular Cuisines &amp; Categories
            </h3>
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              View Full Menu →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {HERO_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="flex flex-col items-center p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group text-center active:scale-95"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="font-bold text-xs text-stone-900 group-hover:text-orange-600">
                  {cat.name}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
