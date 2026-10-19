import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  User,
  ShieldAlert,
  Menu as MenuIcon,
  X,
  LogOut,
  Flame,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface NavbarProps {
  activeTab: 'home' | 'menu' | 'ai-cravings' | 'my-orders' | 'admin' | 'profile';
  setActiveTab: (tab: 'home' | 'menu' | 'ai-cravings' | 'my-orders' | 'admin' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, openAuthModal, isAdmin } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (tab: 'home' | 'menu' | 'ai-cravings' | 'my-orders' | 'admin' | 'profile') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-orange-600 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
              COD Only
            </span>
            <span>Pay Cash on Delivery upon hot arrival! Free delivery on orders over ₹499</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-stone-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-400" /> Average delivery: 25-35 mins
            </span>
            <span className="flex items-center gap-1 text-orange-400 font-semibold">
              <Sparkles className="w-3 h-3" /> AI Craving Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-all duration-300">
              <Flame className="w-6 h-6 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black tracking-tight text-stone-950 font-heading">
                  Food<span className="text-orange-600">Express</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-stone-500 -mt-1">
                AI • Delicious • Fast
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('menu')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
              }`}
            >
              Menu & Dishes
            </button>

            <button
              onClick={() => handleNav('ai-cravings')}
              className={`relative px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ai-cravings'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-orange-600 hover:bg-orange-50/80 bg-orange-50/40 border border-orange-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Craving Predictor</span>
              <span className="absolute -top-1.5 -right-1 bg-stone-900 text-[9px] text-amber-300 font-extrabold px-1.5 py-0.2 rounded-full border border-amber-400/40 shadow-xs uppercase tracking-tighter">
                Smart
              </span>
            </button>

            <button
              onClick={() => handleNav('my-orders')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'my-orders'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
              }`}
            >
              My Orders
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Admin Portal Tab */}
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeTab === 'admin'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-100/80 text-stone-700 border-stone-200 hover:bg-stone-200/80'
              }`}
              title="Admin Portal"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Admin</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/80 text-stone-900 transition-all border border-orange-200/80 flex items-center justify-center cursor-pointer group"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-orange-600 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-orange-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center px-1.5 shadow-sm border-2 border-white animate-bounce-short">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Login/Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 bg-white transition-all cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-stone-800 hidden sm:inline max-w-[90px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs text-stone-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      Manage Profile & Address
                    </button>

                    <button
                      onClick={() => handleNav('my-orders')}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UtensilsCrossed className="w-4 h-4 text-stone-400" />
                      Order History & Tracking
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-orange-600 text-white transition-all shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNav('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left ${
              activeTab === 'home' ? 'bg-orange-50 text-orange-600' : 'text-stone-800 hover:bg-stone-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left ${
              activeTab === 'menu' ? 'bg-orange-50 text-orange-600' : 'text-stone-800 hover:bg-stone-50'
            }`}
          >
            Menu & Dishes
          </button>
          <button
            onClick={() => handleNav('ai-cravings')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-left ${
              activeTab === 'ai-cravings'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                : 'bg-orange-50 text-orange-600 border border-orange-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Craving Predictor</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase">Smart</span>
          </button>
          <button
            onClick={() => handleNav('my-orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left ${
              activeTab === 'my-orders' ? 'bg-orange-50 text-orange-600' : 'text-stone-800 hover:bg-stone-50'
            }`}
          >
            My Orders & Tracking
          </button>
          <button
            onClick={() => handleNav('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left ${
              activeTab === 'admin' ? 'bg-stone-900 text-white' : 'text-stone-800 hover:bg-stone-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            Admin Portal
          </button>
        </div>
      )}
    </header>
  );
};
