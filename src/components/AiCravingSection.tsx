import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  ShoppingBag,
  HelpCircle,
  Check,
  TrendingUp,
  BrainCircuit,
  Sliders,
  Utensils,
  Flame,
  Info,
} from 'lucide-react';
import { CravingResponse, FoodItem } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface AiCravingSectionProps {
  onNavigateToMenu?: () => void;
}

const PREFERENCE_OPTIONS = [
  { id: 'spicy', label: '🔥 Spicy & Fiery', tag: 'Spicy' },
  { id: 'comfort', label: '🧀 Cheesy Comfort', tag: 'Pizza' },
  { id: 'burger', label: '🍔 Juicy Burgers', tag: 'Burger' },
  { id: 'indian', label: '🍛 Rich Indian Curry', tag: 'Indian' },
  { id: 'noodles', label: '🍜 Wok Noodles', tag: 'Chinese' },
  { id: 'veg', label: '🥗 Pure Vegetarian', tag: 'Veg' },
  { id: 'sweet', label: '🍰 Sweet Desserts', tag: 'Desserts' },
  { id: 'quick', label: '🍟 Fast Snacks', tag: 'Snacks' },
];

export const AiCravingSection: React.FC<AiCravingSectionProps> = ({ onNavigateToMenu }) => {
  const { user, token } = useAuth();
  const { addToCart } = useCart();

  const [data, setData] = useState<CravingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [expandedReasonIndex, setExpandedReasonIndex] = useState<number | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const fetchCravings = async (prefs: string[] = selectedPreferences) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/cravings', {
        method: 'POST',
        headers,
        body: JSON.stringify({ preferences: prefs }),
      });

      if (res.ok) {
        const json: CravingResponse = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch cravings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCravings();
  }, [user, token]);

  const togglePreference = (pref: string) => {
    const next = selectedPreferences.includes(pref)
      ? selectedPreferences.filter((p) => p !== pref)
      : [...selectedPreferences, pref];
    setSelectedPreferences(next);
    fetchCravings(next);
  };

  const handleAddToCart = (food: FoodItem) => {
    addToCart(food, 1);
    setAddedItemIds((prev) => ({ ...prev, [food.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [food.id]: false }));
    }, 1000);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white p-6 sm:p-10 border border-stone-800 shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-stone-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-extrabold uppercase tracking-widest mb-3">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Smart Palate Intelligence</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              Your Next <span className="text-orange-500">Craving</span>
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              {data?.isPersonalized
                ? `Predictive neural model trained on your previous orders, timing trends, and meal affinities.`
                : `New to FoodExpress? Pick your current craving vibe below or order your first meal to train the AI.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCravings()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Recommendations</span>
            </button>
          </div>
        </div>

        {/* AI Insight Bar */}
        {data && (
          <div className="my-6 p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-stone-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">
                  {data.isPersonalized ? 'Personalized Order History Analysis:' : 'Trending Baseline Engine:'}
                </span>{' '}
                <span className="text-stone-300">{data.summaryMessage}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30">
              <TrendingUp className="w-3 h-3 text-orange-400" />
              <span>{data.isPersonalized ? 'High Accuracy Model' : 'Initial Exploration'}</span>
            </div>
          </div>
        )}

        {/* Preference Selector for New Users or Fine Tuning */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>Filter by Current Mood / Flavor Preference</span>
            </span>
            {selectedPreferences.length > 0 && (
              <button
                onClick={() => {
                  setSelectedPreferences([]);
                  fetchCravings([]);
                }}
                className="text-[11px] text-orange-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {PREFERENCE_OPTIONS.map((opt) => {
              const isSelected = selectedPreferences.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => togglePreference(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                      : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border-stone-700/80'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommendations Cards Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-300">
              Analyzing flavor profiles and order patterns...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {data?.recommendations.map((rec, index) => {
              const isAdded = addedItemIds[rec.foodItem.id];
              const isExpanded = expandedReasonIndex === index;

              return (
                <div
                  key={rec.foodItem.id}
                  className="group bg-stone-900 rounded-2xl border border-stone-800 hover:border-orange-500/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-800">
                      <img
                        src={rec.foodItem.imageUrl}
                        alt={rec.foodItem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {rec.cravingTag}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold">
                          {rec.confidenceScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[11px] font-bold text-stone-400">
                          {rec.foodItem.category}
                        </span>
                        <span className="text-[11px] font-bold text-amber-400">
                          ★ {rec.foodItem.rating.toFixed(1)}
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-base text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {rec.foodItem.name}
                      </h3>
                      {rec.foodItem.restaurant && (
                        <p className="text-[10px] font-bold text-amber-400/90 truncate mt-0.5">
                          by {rec.foodItem.restaurant}
                        </p>
                      )}

                      {/* "Why this recommendation?" Explanation */}
                      <div className="mt-3 p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs">
                        <div className="flex items-center gap-1 text-orange-400 font-bold mb-1">
                          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Why this recommendation?</span>
                        </div>
                        <p className="text-stone-300 text-[11px] leading-relaxed italic">
                          "{rec.reason}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="p-4 pt-0 mt-2 border-t border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block -mb-0.5">
                        Price
                      </span>
                      <span className="text-lg font-black text-white font-heading">
                        ₹{rec.foodItem.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(rec.foodItem)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-500 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Identified Patterns Section */}
        {data?.patternsIdentified && data.patternsIdentified.length > 0 && (
          <div className="mt-8 pt-6 border-t border-stone-800/80">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-orange-500" />
              <span>AI Pattern Insights &amp; Palate Behavioral Habits</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.patternsIdentified.map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                  <span>{pattern}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
