import React from 'react';
import { Flame, Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles, Truck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'menu' | 'ai-cravings' | 'my-orders' | 'admin' | 'profile') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md">
                <Flame className="w-5 h-5 fill-white/20" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                Food<span className="text-orange-500">Express</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Your intelligent culinary companion. Harnessing machine learning and order history analysis to predict and deliver the food you crave most.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-orange-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Strictly 100% Cash on Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Home & Specials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Full Restaurant Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ai-cravings')}
                  className="hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI Craving Predictor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-orders')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  My Orders & Live Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Admin Portal (Staff Only)
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Popular Cuisines
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-stone-400">
              <span className="hover:text-stone-200">Woodfired Pizza</span>
              <span className="hover:text-stone-200">Smash Burgers</span>
              <span className="hover:text-stone-200">Indian Curries</span>
              <span className="hover:text-stone-200">Wok Chinese</span>
              <span className="hover:text-stone-200">Crispy Snacks</span>
              <span className="hover:text-stone-200">Lava Cakes</span>
              <span className="hover:text-stone-200">Cold Brews</span>
              <span className="hover:text-stone-200">Dum Biryani</span>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Customer Support
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+1 (800) 555-FOOD (24x7 Support)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@foodexpress.delivery</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Computer Engineering Lab, Tech Innovation Hub</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Average delivery time: 25 - 35 mins</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} FoodExpress Delivery Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for Computer Engineering Capstone with{' '}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> &amp; Full-Stack React + Node.js
          </p>
        </div>
      </div>
    </footer>
  );
};
