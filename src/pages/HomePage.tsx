import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/HeroSection.tsx';
import { AiCravingSection } from '../components/AiCravingSection.tsx';
import { FoodCard } from '../components/FoodCard.tsx';
import { FoodItem, FoodCategory } from '../types/index.ts';
import {
  Flame,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  HeartHandshake,
  UtensilsCrossed,
  ChefHat,
  Tag,
  Smile,
} from 'lucide-react';

interface HomePageProps {
  onNavigateToMenu: (category?: FoodCategory | 'All', search?: string) => void;
  onNavigateToAi: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToMenu, onNavigateToAi }) => {
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/menu?sortBy=popularity');
        if (res.ok) {
          const data = await res.json();
          setPopularDishes(data.items.slice(0, 8)); // Top 8 popular dishes
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  const handleHeroSearch = (query: string) => {
    onNavigateToMenu('All', query);
  };

  const handleSelectCategory = (cat: FoodCategory | 'All') => {
    onNavigateToMenu(cat);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Hero Section */}
      <HeroSection
        onSearch={handleHeroSearch}
        onSelectCategory={handleSelectCategory}
        onOrderNow={() => onNavigateToMenu('All')}
        onExploreAi={onNavigateToAi}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. Today's Special Offers Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-200">
                <Tag className="w-3.5 h-3.5" />
                <span>Today's Chef Specials</span>
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl">
                Get FREE Delivery on Orders Over ₹499!
              </h3>
              <p className="text-white/90 text-xs sm:text-sm max-w-lg">
                Freshly prepared restaurant meals delivered hot to your doorstep. Pure Cash on Delivery. No card prepayment needed.
              </p>
            </div>

            <button
              onClick={() => onNavigateToMenu('All')}
              className="px-6 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-900 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer"
            >
              <span>Explore Chef Specials</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </section>

        {/* 3. AI Craving Predictor Spotlight */}
        <AiCravingSection onNavigateToMenu={() => onNavigateToMenu('All')} />

        {/* 4. Popular Dishes & Recommended Meals */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>FoodExpress Fan Favorites</span>
              </div>
              <h2 className="font-heading font-black text-3xl text-stone-900">
                Trending Dishes This Week
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                Hand-picked dishes prepared fresh by master chefs with 4.5+ star customer reviews.
              </p>
            </div>

            <button
              onClick={() => onNavigateToMenu('All')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              <span>View All 20+ Dishes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-stone-100 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularDishes.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </section>

        {/* 4.5 Featured Restaurant Partners */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">
                <ChefHat className="w-4 h-4" />
                <span>Verified Kitchen Partners</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                Featured Restaurants on FoodExpress
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                Freshly prepared at top-rated specialty culinary kitchens with authentic recipes.
              </p>
            </div>
            <button
              onClick={() => onNavigateToMenu('All')}
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Explore All Dishes →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Punjab Grill & Royal Kitchens',
                cuisine: 'Indian',
                desc: 'Rich North Indian butter curries, tandoori rotis & garlic naans.',
                price: '₹259',
                time: '25-35 mins',
                rating: '4.9',
                img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Royal Biryani Darbar',
                cuisine: 'Indian',
                desc: 'Slow-steamed Awadhi dum biryanis & melt-in-mouth galouti kebabs.',
                price: '₹299',
                time: '25-35 mins',
                rating: '5.0',
                img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Artisan Sourdough Pizza Co.',
                cuisine: 'Pizza',
                desc: 'Hand-tossed sourdough crusts & San Marzano gourmet toppings.',
                price: '₹289',
                time: '20-25 mins',
                rating: '4.9',
                img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'The Burger Club & Smokery',
                cuisine: 'Burger',
                desc: 'Brioche smashed burgers, seasoned loaded fries & spicy wings.',
                price: '₹159',
                time: '15-20 mins',
                rating: '4.9',
                img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Dosa Kingdom & South Express',
                cuisine: 'Indian',
                desc: 'Desi ghee roast masala dosas, gunpowder podi idlis & filter kaapi.',
                price: '₹79',
                time: '15-20 mins',
                rating: '4.9',
                img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Tokyo Ramen & Dim Sum Lounge',
                cuisine: 'Chinese',
                desc: '12-hour miso ramen, truffle crystal dim sums & tempura prawns.',
                price: '₹179',
                time: '15-25 mins',
                rating: '4.9',
                img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Dragon House Asian Wok',
                cuisine: 'Chinese',
                desc: 'Wok-tossed garlic noodles, steamed dim sums & fiery fried rice.',
                price: '₹219',
                time: '15-25 mins',
                rating: '4.8',
                img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Sweet Indulgence Bakery & Gelato',
                cuisine: 'Desserts',
                desc: 'New York blueberry cheesecakes, Biscoff tres leches & thickshakes.',
                price: '₹179',
                time: '10-15 mins',
                rating: '5.0',
                img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
              },
            ].map((rest) => (
              <div
                key={rest.name}
                onClick={() => onNavigateToMenu(rest.cuisine as any, rest.name)}
                className="group cursor-pointer rounded-2xl bg-white border border-stone-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 overflow-hidden relative bg-stone-100">
                    <img
                      src={rest.img}
                      alt={rest.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                      ★ {rest.rating}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {rest.cuisine}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-extrabold text-stone-900 text-base group-hover:text-orange-600 transition-colors line-clamp-1">
                      {rest.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {rest.desc}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-600">
                  <span>{rest.price} onwards</span>
                  <span className="text-orange-600 font-bold">{rest.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. How FoodExpress Works */}
        <section className="rounded-3xl bg-stone-100/70 border border-stone-200/80 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-orange-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
              Seamless Ordering Experience
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
              How FoodExpress Works
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Designed for speed, zero-hassle cash payments, and hyper-personalized food recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto font-heading font-black text-lg">
                1
              </div>
              <h4 className="font-heading font-extrabold text-lg text-stone-900">
                Choose Your Craving
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Browse hand-crafted pizzas, burgers, biryanis, and noodles, or let our AI predict your flavor profile based on your tastes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto font-heading font-black text-lg">
                2
              </div>
              <h4 className="font-heading font-extrabold text-lg text-stone-900">
                Hot &amp; Fresh Prep
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Our kitchen dispatches your meal within 20 minutes in temperature-controlled thermal bags to preserve crispness.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-heading font-black text-lg">
                3
              </div>
              <h4 className="font-heading font-extrabold text-lg text-stone-900">
                Cash on Delivery
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Pay in cash directly to your rider at your door. No credit cards, no digital OTPs, no payment gateway failures.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
