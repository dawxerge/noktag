import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Wallet, 
  ChevronDown, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Coins,
  Send,
  FileText,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    activeView, 
    setActiveView, 
    orders,
    deposits,
    conversations,
    settings,
    resetAllData,
    theme,
    toggleTheme
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Active counts
  const userConversationsCount = conversations.filter(
    c => c.participants.some(p => p.userId === currentUser.id) || currentUser.role === 'admin'
  ).length;

  const activeOrdersCount = orders.filter(
    o => o.buyerId === currentUser.id && ['in_escrow', 'preparing_live_drop', 'drop_ready', 'disputed'].includes(o.escrowStatus)
  ).length;

  const sellerPendingCount = orders.filter(
    o => o.sellerId === currentUser.id && o.escrowStatus === 'preparing_live_drop'
  ).length;

  const financierPendingCount = deposits.filter(
    d => d.financierId === currentUser.id && d.status === 'receipt_uploaded'
  ).length;

  const adminDisputeCount = orders.filter(o => o.escrowStatus === 'disputed').length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-[10px] px-2 py-0.5 rounded-full font-medium">YÖNETİCİ</span>;
      case 'seller':
        return <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-[10px] px-2 py-0.5 rounded-full font-medium">SATICI</span>;
      case 'financier':
        return <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 text-[10px] px-2 py-0.5 rounded-full font-medium">FİNANSÇI (P2P)</span>;
      default:
        return <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-[10px] px-2 py-0.5 rounded-full font-medium">MÜŞTERİ</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0e1015]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Top micro-bar: network status & safety banner */}
      <div className="bg-zinc-50 dark:bg-[#0a0c10] border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-1 text-xs flex flex-wrap items-center justify-between text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></span>
            <span className="font-medium text-zinc-700 dark:text-zinc-200">noktag.com Escrow Ağı: AKTİF</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">Kripto Teminat & P2P Güvence Protokolü v2.4</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Komisyon: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">%{settings.platformFeePercent}</strong></span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span>Oto-Onay: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{settings.autoConfirmHours}s</strong></span>
          <button 
            onClick={() => resetAllData()} 
            title="Verileri sıfırla" 
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 ml-2 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('marketplace')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-600 to-zinc-900 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  noktag<span className="text-emerald-500">.com</span>
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ESCROW
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider">
                P2P GÜVENLİ ZULA AĞI
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveView('how_it_works')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'how_it_works'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Nasıl Çalışır?</span>
            </button>

            <button
              onClick={() => setActiveView('marketplace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'marketplace'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              🛒 Pazar Yeri
            </button>

            <button
              onClick={() => setActiveView('my_orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                activeView === 'my_orders'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              📦 Emanet Siparişlerim
              {activeOrdersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('financiers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'financiers'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              🏦 IBAN to Crypto (Finansçılar)
            </button>

            {currentUser.role === 'seller' && (
              <button
                onClick={() => setActiveView('seller_portal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                  activeView === 'seller_portal'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
                }`}
              >
                📍 Satıcı Masası
                {sellerPendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                    {sellerPendingCount}
                  </span>
                )}
              </button>
            )}

            {currentUser.role === 'financier' && (
              <button
                onClick={() => setActiveView('financier_portal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                  activeView === 'financier_portal'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                    : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50/60 dark:hover:bg-purple-950/30'
                }`}
              >
                ⚡ Finansçı Masası
                {financierPendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold">
                    {financierPendingCount}
                  </span>
                )}
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin_panel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                  activeView === 'admin_panel'
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                    : 'text-red-700 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/30'
                }`}
              >
                🛡️ Hakem Masası
                {adminDisputeCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-200 font-bold">
                    {adminDisputeCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveView('messages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative flex items-center gap-1.5 ${
                activeView === 'messages'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Şifreli Mesajlar</span>
              {userConversationsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold">
                  {userConversationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('crypto_ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'crypto_ledger'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>İşlem Defteri</span>
            </button>

            <button
              onClick={() => setActiveView('telegram_bot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'telegram_bot'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              Telegram
            </button>

            <button
              onClick={() => setActiveView('architecture_guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'architecture_guide'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              Rapor
            </button>
          </nav>

          {/* User Profile, Wallet & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Açık Temaya Geç (Gündüz)' : 'Koyu Temaya Geç (Göz Dinlendirici Karbon)'}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-[#161822] dark:hover:bg-[#1f2230] text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[11px] font-medium text-zinc-300">Gündüz</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-700" />
                  <span className="hidden xl:inline text-[11px] font-medium text-zinc-700">Gece</span>
                </>
              )}
            </button>

            {/* Wallet Balance Chip */}
            <div className="bg-zinc-50 dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 leading-none">Bakiye</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {currentUser.balanceUSDT.toFixed(2)} <span className="text-[10px] text-zinc-500 font-normal">USDT</span>
                </div>
              </div>
            </div>

            {/* Role / User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="bg-white dark:bg-[#141720] hover:bg-zinc-50 dark:hover:bg-[#1c202d] border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-left transition-colors shadow-2xs"
              >
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.username} 
                  className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {currentUser.username}
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">Aktif Rolü Değiştir (Simülasyon)</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Sistemi 4 farklı aktörün gözünden deneyimleyin:</p>
                  </div>

                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                          u.id === currentUser.id ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatarUrl} alt={u.username} className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                          <div>
                            <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{u.username}</div>
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{u.balanceUSDT.toFixed(0)} USDT</div>
                          </div>
                        </div>
                        {getRoleBadge(u.role)}
                      </button>
                    ))}
                  </div>

                  {/* Collateral warning if seller or financier */}
                  {(currentUser.role === 'seller' || currentUser.role === 'financier') && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 px-2 py-1 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>Güvence Bedeli: {currentUser.collateralUSDT} USDT (Açık: {currentUser.activeExposureUSDT} USDT)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-zinc-100 dark:border-zinc-800 gap-2 text-xs">
          <button
            onClick={() => setActiveView('how_it_works')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1 ${
              activeView === 'how_it_works' 
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Nasıl Çalışır?
          </button>
          <button
            onClick={() => setActiveView('marketplace')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeView === 'marketplace' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            🛒 Pazar
          </button>
          <button
            onClick={() => setActiveView('my_orders')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeView === 'my_orders' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            📦 Siparişler ({activeOrdersCount})
          </button>
          <button
            onClick={() => setActiveView('financiers')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeView === 'financiers' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            🏦 IBAN/FAST
          </button>
          <button
            onClick={() => setActiveView('messages')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeView === 'messages' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            💬 Mesajlar
          </button>
          <button
            onClick={() => setActiveView('crypto_ledger')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeView === 'crypto_ledger' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            🪙 Defter
          </button>
        </div>
      </div>
    </header>
  );
};
