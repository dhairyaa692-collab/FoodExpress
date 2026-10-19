import React, { useState, useEffect } from 'react';
import { FoodCard } from '../components/FoodCard.tsx';
import { FoodItem, FoodCategory } from '../types/index.ts';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Utensils,
  Leaf,
  Beef,
  Flame,
} from 'lucide-react';

interface MenuPageProps {
  initialCategory?: FoodCategory | 'All';
  initialSearch?: string;
  onClearInitialFilters?: () => void;
}

const CATEGORIES: { id: FoodCategory | 'All'; label: string; icon: string }[] = [
  { id: 'All', label: 'All Dishes', icon: '🍽️' },
  { id: 'Pizza', label: 'Pizza', icon: '🍕' },
  { id: 'Burger', label: 'Burgers', icon: '🍔' },
  { id: 'Indian', label: 'Indian Cuisine', icon: '🍛' },
  { id: 'Chinese', label: 'Chinese Wok', icon: '🥡' },
  { id: 'Snacks', label: 'Snacks & Sides', icon: '🍟' },
  { id: 'Desserts', label: 'Desserts', icon: '🍰' },
  { id: 'Beverages', label: 'Beverages', icon: '🥤' },
];

export const MenuPage: React.FC<MenuPageProps> = ({
  initialCategory = 'All',
  initialSearch = '',
  onClearInitialFilters,
}) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>(initialCategory);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'rating'>('popularity');
  const [maxPrice, setMaxPrice] = useState<number>(500);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (vegFilter === 'veg') params.append('vegOnly', 'true');
      params.append('sortBy', sortBy);

      const res = await fetch(`/api/menu?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let fetched: FoodItem[] = data.items;

        // In-memory filter for non-veg if selected
        if (vegFilter === 'non-veg') {
          fetched = fetched.filter((item) => !item.isVeg);
        }

        // Restaurant filter
        if (selectedRestaurant !== 'All') {
          fetched = fetched.filter((item) => item.restaurant === selectedRestaurant);
        }

        // Filter by price slider
        fetched = fetched.filter((item) => item.price <= maxPrice);

        setItems(fetched);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory, selectedRestaurant, searchQuery, vegFilter, sortBy, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedRestaurant('All');
    setSearchQuery('');
    setVegFilter('all');
    setSortBy('popularity');
    setMaxPrice(500);
    if (onClearInitialFilters) onClearInitialFilters();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-orange-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
            FoodExpress Restaurant Menu
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
            Explore Dishes &amp; Cuisines
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Fresh ingredients, masterchef recipes, and 100% Cash on Delivery on every order.
          </p>
        </div>

        {/* Search input inside page */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, spice, sauce..."
            className="w-full pl-10 pr-8 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-hidden bg-white shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/90 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Diet preference filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-700">Diet Preference:</span>
          <div className="flex bg-white rounded-xl p-1 border border-stone-200 shadow-2xs">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                vegFilter === 'all' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                vegFilter === 'veg' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              <Leaf className="w-3 h-3" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                vegFilter === 'non-veg' ? 'bg-amber-800 text-white' : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <Beef className="w-3 h-3" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Restaurant Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-stone-700">Kitchen:</span>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold text-xs text-stone-800"
          >
            <option value="All">All Restaurants ({[
              'Artisan Sourdough Pizza Co.',
              'The Burger Club & Smokery',
              'Punjab Grill & Royal Kitchens',
              'Royal Biryani Darbar',
              'Dosa Kingdom & South Express',
              'Dragon House Asian Wok',
              'Tokyo Ramen & Dim Sum Lounge',
              'The Belgian Waffle & Sweet Street',
              'Sweet Indulgence Bakery & Gelato',
            ].length})</option>
            {[
              'Artisan Sourdough Pizza Co.',
              'The Burger Club & Smokery',
              'Punjab Grill & Royal Kitchens',
              'Royal Biryani Darbar',
              'Dosa Kingdom & South Express',
              'Dragon House Asian Wok',
              'Tokyo Ramen & Dim Sum Lounge',
              'The Belgian Waffle & Sweet Street',
              'Sweet Indulgence Bakery & Gelato',
            ].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Max price slider */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="font-bold text-stone-700">Max Price:</span>
          <input
            type="range"
            min="50"
            max="600"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-24 accent-orange-600 cursor-pointer"
          />
          <span className="font-mono font-bold text-stone-900">₹{maxPrice}</span>
        </div>

        {/* Sort by dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 font-semibold focus:ring-1 focus:ring-orange-500 outline-hidden"
          >
            <option value="popularity">Most Popular 🔥</option>
            <option value="rating">Highest Rated ★</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset button */}
        {(selectedCategory !== 'All' || selectedRestaurant !== 'All' || searchQuery || vegFilter !== 'all' || maxPrice < 600 || sortBy !== 'popularity') && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-stone-100 animate-pulse"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-stone-50 rounded-3xl border border-stone-200">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-stone-900 mb-1">
            No dishes found matching your criteria
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mb-4">
            Try adjusting your price range, clearing the search query, or switching categories.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md hover:bg-orange-700 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-stone-500 font-semibold flex items-center justify-between">
            <span>
              Showing {items.length} delicious dish{items.length !== 1 ? 'es' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
