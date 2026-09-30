import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Star, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Lock, 
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

interface SellerTrustBadgeProps {
  sellerId?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerTrustScore?: number;
  sellerCollateral?: number;
  compact?: boolean;
  showDetailsOnHover?: boolean;
  className?: string;
}

export const SellerTrustBadge: React.FC<SellerTrustBadgeProps> = ({
  sellerId,
  sellerName,
  sellerRating: fallbackRating = 5.0,
  sellerTrustScore: fallbackTrust = 95,
  sellerCollateral: fallbackCollateral = 1000,
  compact = false,
  showDetailsOnHover = true,
  className = '',
}) => {
  const { users, orders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Find seller user in state
  const sellerUser = users.find(
    (u) => (sellerId && u.id === sellerId) || (sellerName && u.username === sellerName)
  );

  // Find all orders for this seller in the system
  const sellerOrders = orders.filter(
    (o) => (sellerId && o.sellerId === sellerId) || (sellerName && o.sellerName === sellerName)
  );

  // Historical statistics
  const totalTrades = sellerUser?.reputation?.totalTrades ?? (sellerOrders.length || 10);
  const completedTrades = sellerUser?.reputation?.completedTrades ?? (sellerOrders.filter(o => o.escrowStatus === 'released_to_seller' || o.escrowStatus === 'buyer_confirmed').length || totalTrades);
  const disputeLossCount = sellerUser?.reputation?.disputeLossCount ?? 0;
  const disputeCount = sellerUser?.reputation?.disputeCount ?? sellerOrders.filter(o => o.escrowStatus === 'disputed').length;
  const rating = sellerUser?.reputation?.rating ?? fallbackRating;
  const collateralUSDT = sellerUser?.collateralUSDT ?? fallbackCollateral;
  const isVerified = sellerUser?.reputation?.isVerified ?? true;
  const memberSince = sellerUser?.reputation?.memberSince ?? '2024';

  // Derived percentage from historical order successful completions
  const completionPercentage = totalTrades > 0
    ? Math.round((completedTrades / totalTrades) * 100)
    : (fallbackTrust || 100);

  // Trust tiers configuration
  const getTrustTier = (pct: number, total: number) => {
    if (total === 0) {
      return {
        label: 'Yeni Satıcı',
        levelName: 'Güvence Teminatlı',
        badgeBg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
        progressColor: 'bg-zinc-500',
        ringColor: 'border-zinc-300',
        icon: Shield,
        desc: 'Henüz işlem kaydı yok, ancak sipariş tutarını karşılayan kilitli teminatı mevcuttur.'
      };
    }
    if (pct >= 95) {
      return {
        label: `%${pct} Başarılı`,
        levelName: 'Kusursuz Teslimat',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50 shadow-xs hover:shadow-emerald-500/20',
        progressColor: 'bg-emerald-500',
        ringColor: 'border-emerald-300',
        icon: ShieldCheck,
        desc: 'Tarihsel siparişlerinde mükemmel teslimat başarısı ve sıfır teminat kaybı.'
      };
    }
    if (pct >= 85) {
      return {
        label: `%${pct} Başarılı`,
        levelName: 'Yüksek Güvenilirlik',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-500/50 shadow-xs hover:shadow-sky-500/20',
        progressColor: 'bg-sky-500',
        ringColor: 'border-sky-300',
        icon: ShieldCheck,
        desc: 'İstikrarlı ve güvenli zula teslimatı gerçekleştiren onaylı satıcı.'
      };
    }
    if (pct >= 70) {
      return {
        label: `%${pct} Başarılı`,
        levelName: 'Orta Güven',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/50 shadow-xs hover:shadow-amber-500/20',
        progressColor: 'bg-amber-500',
        ringColor: 'border-amber-300',
        icon: ShieldAlert,
        desc: 'Birtakım itiraz veya gecikmeler yaşanmış olabilir, emanet korumasından yararlanabilirsiniz.'
      };
    }
    return {
      label: `%${pct} Başarılı`,
      levelName: 'Riskli / Düşük',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/50 shadow-xs hover:shadow-rose-500/20',
      progressColor: 'bg-rose-500',
      ringColor: 'border-rose-300',
      icon: AlertTriangle,
      desc: 'Başarısız teslimat veya uyuşmazlık oranı ortalamanın üzerinde.'
    };
  };

  const tier = getTrustTier(completionPercentage, totalTrades);
  const IconComponent = tier.icon;

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => showDetailsOnHover && setIsOpen(true)}
      onMouseLeave={() => showDetailsOnHover && setIsOpen(false)}
    >
      {/* Badge Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all cursor-pointer shadow-2xs hover:shadow-xs focus:outline-none ${tier.badgeBg} ${
          compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
        title="Tarihsel sipariş başarı karnesini görüntülemek için tıklayın"
      >
        <IconComponent className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-semibold tracking-tight">{tier.label}</span>
        {!compact && (
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
            ({completedTrades}/{totalTrades})
          </span>
        )}
      </button>

      {/* Trust Score Breakdown Popover Card */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80 glass-card rounded-2xl p-4 shadow-2xl text-zinc-900 dark:text-zinc-100 border border-zinc-200/90 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                {(sellerName || sellerUser?.username || 'ST').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <span>{sellerName || sellerUser?.username || 'Satıcı'}</span>
                  {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {tier.levelName} • Üye: {memberSince}
                </div>
              </div>
            </div>

            <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Escrow Onaylı</span>
            </div>
          </div>

          {/* Main Success Metric Callout */}
          <div className="my-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Tarihsel Başarılı Teslimat
              </span>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                %{completionPercentage}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${tier.progressColor}`} 
                style={{ width: `${Math.min(100, Math.max(5, completionPercentage))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
              <span>{completedTrades} başarılı teslimat</span>
              <span>{totalTrades} toplam sipariş</span>
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Alıcı Puanı</div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{rating.toFixed(2)} / 5.0</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Kilitli Teminat</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{collateralUSDT.toLocaleString()} USDT</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">İtiraz (Dispute) Kaybı</div>
              <div className={`font-bold mt-0.5 ${disputeLossCount === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {disputeLossCount === 0 ? '0 Kayıp (%100 Koruma)' : `${disputeLossCount} Kayıp`}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Toplam İtiraz</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {disputeCount} İtiraz İncelendi
              </div>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
            <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
            <span>
              Bu satıcının tüm satışları <strong className="text-zinc-700 dark:text-zinc-200">noktag Emanet Havuzu</strong> güvencesindedir. Teslimatı onaylamadan satıcıya bakiye serbest bırakılmaz.
            </span>
          </div>

          {/* Small pointer arrow */}
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200/90 dark:border-zinc-700 rotate-45" />
        </div>
      )}
    </div>
  );
};
