import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { AiCravingPage } from './pages/AiCravingPage.tsx';
import { MyOrdersPage } from './pages/MyOrdersPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { FoodCategory } from './types/index.ts';

type NavigationTab = 'home' | 'menu' | 'ai-cravings' | 'my-orders' | 'admin' | 'profile';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [menuFilterCategory, setMenuFilterCategory] = useState<FoodCategory | 'All'>('All');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');

  const handleNavigateToMenu = (category: FoodCategory | 'All' = 'All', search: string = '') => {
    setMenuFilterCategory(category);
    setMenuSearchQuery(search);
    setActiveTab('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAi = () => {
    setActiveTab('ai-cravings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToOrders = () => {
    setActiveTab('my-orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-stone-900">
      {/* Global Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={handleNavigate} />

      {/* Main Page Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onNavigateToMenu={handleNavigateToMenu}
            onNavigateToAi={handleNavigateToAi}
          />
        )}

        {activeTab === 'menu' && (
          <MenuPage
            initialCategory={menuFilterCategory}
            initialSearch={menuSearchQuery}
            onClearInitialFilters={() => {
              setMenuFilterCategory('All');
              setMenuSearchQuery('');
            }}
          />
        )}

        {activeTab === 'ai-cravings' && (
          <AiCravingPage onNavigateToMenu={() => handleNavigateToMenu('All')} />
        )}

        {activeTab === 'my-orders' && (
          <MyOrdersPage onNavigateToMenu={() => handleNavigateToMenu('All')} />
        )}

        {activeTab === 'admin' && <AdminPage />}

        {activeTab === 'profile' && (
          <ProfilePage onNavigateToOrders={handleNavigateToOrders} />
        )}
      </main>

      {/* Global Slide-over Cart & Modals */}
      <CartDrawer onNavigateToMenu={() => handleNavigateToMenu('All')} />
      <CheckoutModal />
      <OrderConfirmationModal
        onNavigateToOrders={handleNavigateToOrders}
        onNavigateToMenu={() => handleNavigateToMenu('All')}
      />
      <AuthModal />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
