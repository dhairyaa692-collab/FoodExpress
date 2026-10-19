import React from 'react';
import { AiCravingSection } from '../components/AiCravingSection.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Brain,
  History,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Database,
  Cpu,
} from 'lucide-react';

interface AiCravingPageProps {
  onNavigateToMenu: () => void;
}

export const AiCravingPage: React.FC<AiCravingPageProps> = ({ onNavigateToMenu }) => {
  const { user, openAuthModal } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Computer Engineering Project Core Feature</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-stone-900 tracking-tight">
          AI Craving Predictor
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          How do we know what you crave before you even ask? FoodExpress analyzes past dish frequencies, category affinities, and meal times to deliver intelligent culinary predictions.
        </p>
      </div>

      {/* Main Interactive Craving Engine */}
      <AiCravingSection onNavigateToMenu={onNavigateToMenu} />

      {/* Deep Dive: How the Recommendation Algorithm Works */}
      <div className="rounded-3xl bg-white border border-stone-200/90 p-8 sm:p-10 shadow-xs space-y-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 block mb-1">
            System Architecture
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            How the FoodExpress Craving Model Operates
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-2xl">
            A hybrid machine learning pipeline combining user behavioral order history with Google Gemini generative rationale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-stone-900">
              1. Persistent Order History
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every completed Cash on Delivery order is recorded in the backend database with timestamp, dishes, and portion sizes to construct your personal taste profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-stone-900">
              2. Temporal &amp; Category Scoring
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Weighted algorithms detect day-of-week habits (e.g. weekend burgers vs weekday biryanis) and complementary pairings (desserts with fiery noodles).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-stone-900">
              3. Transparent "Why" Rationale
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Unlike opaque black-box recommendations, our system produces clear, human explanations for why each dish was picked for your current palate.
            </p>
          </div>
        </div>

        {/* User state callout */}
        {!user && (
          <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading font-extrabold text-base text-orange-950">
                Want to test with real historical order data?
              </h4>
              <p className="text-xs text-orange-800">
                Sign in with the 1-click Alex Johnson demo account to see the algorithm analyze multiple completed orders across pizza, burgers, and Indian curry.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
            >
              Sign In Demo Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
