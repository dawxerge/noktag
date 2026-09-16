import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MarketplaceView } from './components/MarketplaceView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { FinancierNetworkView } from './components/FinancierNetworkView';
import { SellerDashboard } from './components/SellerDashboard';
import { FinancierDashboard } from './components/FinancierDashboard';
import { AdminPanel } from './components/AdminPanel';
import { TelegramBotSimulator } from './components/TelegramBotSimulator';
import { ArchitectureAndRecommendations } from './components/ArchitectureAndRecommendations';
import { HowItWorksView } from './components/HowItWorksView';
import { MessagingHubView } from './components/MessagingHubView';
import { CryptoLedgerView } from './components/CryptoLedgerView';
import { 
  ShieldCheck, 
  Lock, 
  Send, 
  ExternalLink, 
  Cpu, 
  CheckCircle2, 
  RefreshCw,
  Users
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, currentUser, switchUser, users, settings, telegramNotifications, markTelegramPushRead } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'marketplace':
        return <MarketplaceView />;
      case 'my_orders':
        return <OrderTrackingView />;
      case 'financiers':
        return <FinancierNetworkView />;
      case 'seller_portal':
        return <SellerDashboard />;
      case 'financier_portal':
        return <FinancierDashboard />;
      case 'admin_panel':
        return <AdminPanel />;
      case 'telegram_bot':
        return <TelegramBotSimulator />;
      case 'architecture_guide':
        return <ArchitectureAndRecommendations />;
      case 'how_it_works':
        return <HowItWorksView />;
      case 'messages':
        return <MessagingHubView />;
      case 'crypto_ledger':
        return <CryptoLedgerView />;
      default:
        return <MarketplaceView />;
    }
  };

  // Filter unread notifications for current user
  const activeNotifications = telegramNotifications.filter(n => n.userId === currentUser.id && !n.read);

  return (
    <div className="min-h-screen bg-[var(--canvas-bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Global Telegram Push Notification Toasts */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {activeNotifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto w-84 bg-white dark:bg-[#151822] text-zinc-900 dark:text-zinc-100 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-zinc-50 dark:bg-[#1a1e2a] px-3.5 py-2.5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider">TELEGRAM BİLDİRİMİ</span>
              </div>
              <button onClick={() => markTelegramPushRead(notification.id)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs">✕</button>
            </div>
            <div className="p-3.5">
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{notification.message}</p>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 text-right">{notification.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {renderActiveView()}
      </main>

      {/* Modern Footer with System Status & Role Switcher */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f1117] text-xs text-zinc-500 dark:text-zinc-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">noktag.com</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>P2P Canlı & Hazır Zula (Live/Dead Drop) Escrow Protokolü</span>
            </div>

            {/* Live Operational Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Akıllı Escrow: Çevrimiçi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" /> Teminat Kilidi: Güvenli
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 font-medium">
                <Send className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" /> {settings.telegramBotUsername}: Aktif
              </span>
            </div>
          </div>

          {/* Role Switching Quick Bar in Footer */}
          <div className="bg-zinc-50 dark:bg-[#141720] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <Users className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <span>Simülasyon Rolleri (Tek Tıkla Geçiş):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    u.id === currentUser.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {u.username} ({u.role.toUpperCase()})
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-zinc-400 dark:text-zinc-500 text-[11px] gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              © {new Date().getFullYear()} noktag.com. Tüm hakları saklıdır. Zero-Knowledge Escrow & P2P Drop Network.
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setActiveView('how_it_works')} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors">
                Nasıl Çalışır? (Rehber)
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button onClick={() => setActiveView('architecture_guide')} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors">
                Mimari & Güvenlik Raporu
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button onClick={() => setActiveView('telegram_bot')} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors">
                Telegram Botu
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button onClick={() => setActiveView('admin_panel')} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors">
                Hakem Masası
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
