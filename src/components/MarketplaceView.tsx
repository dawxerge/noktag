import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, DropType } from '../types';
import { NearbyRadarWidget } from './NearbyRadarWidget';
import { SellerTrustBadge } from './SellerTrustBadge';
import { calculateDistanceKm, formatDistance, getProductCoordinates } from '../utils/geoUtils';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Info,
  Lock,
  Compass,
  Crosshair,
  ExternalLink,
  Activity,
  Sparkles,
  Radio,
  Layers
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { products, currentUser, createOrder, setActiveView, userLocation } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDropType, setSelectedDropType] = useState<'all' | DropType>('all');

  // Radar Proximity Filters
  const [maxRadiusKm, setMaxRadiusKm] = useState<number | null>(null);
  const [sortByDistance, setSortByDistance] = useState<boolean>(true);

  // Purchase Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyerNotes, setBuyerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string; orderId?: string } | null>(null);

  const categories = ['all', 'Güvenlik Donanımı', 'Siber Güvenlik', 'Gizlilik Kiti', 'Donanım & Depolama', 'Fiziksel Güvenlik'];
  const cities = ['all', 'İstanbul', 'Ankara', 'İzmir', 'Antalya'];

  const filteredProductsWithDistance = useMemo(() => {
    return products
      .map((p) => {
        const coords = getProductCoordinates(p);
        const distance =
          userLocation && coords
            ? calculateDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
            : null;
        return { product: p, coords, distance };
      })
      .filter(({ product: p, distance }) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.district.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesCity = selectedCity === 'all' || p.city === selectedCity;
        const matchesDropType = selectedDropType === 'all' || p.dropType === selectedDropType;

        // Radius filter
        const matchesRadius = maxRadiusKm === null || (distance !== null && distance <= maxRadiusKm);

        return matchesSearch && matchesCategory && matchesCity && matchesDropType && matchesRadius;
      })
      .sort((a, b) => {
        if (sortByDistance && a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedCity, selectedDropType, maxRadiusKm, sortByDistance, userLocation]);

  const handleBuy = () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const result = createOrder(selectedProduct.id, buyerNotes);
      setPurchaseResult(result);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-zinc-900">
      {/* TOP CINEMATIC HERO COMMAND CENTER */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-zinc-200/90 dark:border-white/10 group">
        {/* Background Image with Atmospheric Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_marketplace_banner_1790755964410.jpg"
            alt="Noktag Stealth Escrow Marketplace"
            className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Cyber Vignette & Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/85 to-zinc-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 cyber-grid-overlay opacity-30 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-white space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-lg shadow-emerald-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide uppercase font-mono text-[11px]">NOKTAG ESCROW PROTOCOL v2.4 • ONLINE</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                P2P Kripto Teminatlı <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Zula & Escrow Pazaryeri
                </span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                Satıcılar yalnızca cüzdanlarına kilitledikleri <strong className="text-white font-semibold">USDT Güvence Bedeli</strong> kadar sipariş alabilir. Ödemeniz siz zula noktasından ürünü alıp onaylayana kadar akıllı emanette mühürlü kalır.
              </p>

              {/* Action Buttons & Micro Stats */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveView('how_it_works')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4 text-zinc-950" />
                  <span>Protokol Nasıl Çalışır?</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const radarElem = document.getElementById('nearby-radar-section');
                    if (radarElem) radarElem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium text-xs flex items-center gap-2 transition-all shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Yakınımdaki Zulaları Tara</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-zinc-400 pl-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>18,500+ USDT Kilitli Teminat</span>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive Visual Drop Type Showcase Cards */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full lg:w-80">
              {/* Dead Drop Card */}
              <div 
                onClick={() => setSelectedDropType('dead_drop')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md flex items-center gap-3.5 group/card ${
                  selectedDropType === 'dead_drop'
                    ? 'bg-emerald-950/60 border-emerald-400/60 shadow-lg shadow-emerald-950/50'
                    : 'bg-zinc-900/60 border-white/10 hover:border-emerald-500/40 hover:bg-zinc-900/80'
                }`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/15">
                  <img
                    src="/src/assets/images/dead_drop_capsule_1790755982915.jpg"
                    alt="Dead Drop Kapsül"
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="p-0.5 rounded-full bg-emerald-500 text-zinc-950 block">
                      <Zap className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover/card:text-emerald-300 transition-colors">
                      Dead Drop (Hazır Zula)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ANINDA
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-1">
                    Ödeme ile GPS & şifreli fotoğraf anında açılır.
                  </p>
                  <div className="text-[10px] text-emerald-400/90 font-medium mt-1 flex items-center gap-1">
                    <span>Filtrele ({products.filter(p => p.dropType === 'dead_drop').length} ürün)</span>
                    <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Live Drop Card */}
              <div 
                onClick={() => setSelectedDropType('live_drop')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md flex items-center gap-3.5 group/card ${
                  selectedDropType === 'live_drop'
                    ? 'bg-amber-950/60 border-amber-400/60 shadow-lg shadow-amber-950/50'
                    : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/40 hover:bg-zinc-900/80'
                }`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/15">
                  <img
                    src="/src/assets/images/live_drop_covert_1790755995390.jpg"
                    alt="Live Drop Kurye"
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="p-0.5 rounded-full bg-amber-500 text-zinc-950 block">
                      <Clock className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover/card:text-amber-300 transition-colors">
                      Live Drop (Canlı Zula)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      GEOFENCE
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-1">
                    Seçtiğiniz semte 30-90 dk içinde bırakılır.
                  </p>
                  <div className="text-[10px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
                    <span>Filtrele ({products.filter(p => p.dropType === 'live_drop').length} ürün)</span>
                    <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics Strip */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Teminat Modeli</div>
                <div className="font-semibold text-white">%100 USDT Koruması</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Başarılı Teslimat</div>
                <div className="font-semibold text-white">%99.4 Tamamlanma</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Ort. Live Bırakım</div>
                <div className="font-semibold text-white">45 - 75 Dakika</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-teal-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-mono">GPS Koruma Yarıçapı</div>
                <div className="font-semibold text-white">3 KM Geofence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANA YAKIN NE VAR? RADAR TARAMASI WIDGET */}
      <div id="nearby-radar-section">
        <NearbyRadarWidget
          maxRadiusKm={maxRadiusKm}
          setMaxRadiusKm={setMaxRadiusKm}
          sortByDistance={sortByDistance}
          setSortByDistance={setSortByDistance}
          onSelectProduct={(prod) => {
            setSelectedProduct(prod);
            setBuyerNotes('');
            setPurchaseResult(null);
          }}
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm border border-zinc-200/90 dark:border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Ürün, semt veya anahtar kelime arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/60 transition-all"
            >
              <option value="all">Tüm Şehirler (Türkiye)</option>
              {cities.filter(c => c !== 'all').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/60 transition-all"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop Type Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Zula Tipi:</span>
            <button
              onClick={() => setSelectedDropType('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedDropType === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Tümü ({products.length})
            </button>
            <button
              onClick={() => setSelectedDropType('dead_drop')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                selectedDropType === 'dead_drop'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50 font-semibold shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Dead Drop (Hazır)
            </button>
            <button
              onClick={() => setSelectedDropType('live_drop')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                selectedDropType === 'live_drop'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/50 font-semibold shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Live Drop (Canlı)
            </button>
          </div>

          <div className="text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-3">
            {maxRadiusKm && (
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                Mesafe: <strong>&lt; {maxRadiusKm} km</strong>
              </span>
            )}
            <span>
              Listelenen: <strong className="text-zinc-900 dark:text-zinc-100">{filteredProductsWithDistance.length}</strong> Zula
            </span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProductsWithDistance.map(({ product, coords, distance }) => {
          const isDead = product.dropType === 'dead_drop';

          return (
            <div
              key={product.id}
              className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group relative border border-zinc-200/90 dark:border-white/10 shadow-xs"
            >
              {/* Product Image & Top Overlays */}
              <div className="relative h-48 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient vignette for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

                {/* Drop Type Badge */}
                <div className="absolute top-3 left-3">
                  {isDead ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-950/85 backdrop-blur-md border border-emerald-400/40 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <Zap className="w-3 h-3 text-emerald-400" />
                      DEAD DROP (HAZIR)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-950/85 backdrop-blur-md border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <Clock className="w-3 h-3 text-amber-400" />
                      LIVE DROP ({product.prepTimeMinutes} DK)
                    </span>
                  )}
                </div>

                {/* Location Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-lg text-[11px] text-white flex items-center gap-1 shadow-md font-medium">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{product.city}</span>
                </div>

                {/* District Pill */}
                <div className="absolute bottom-2.5 left-3 text-xs text-white flex items-center gap-1">
                  <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-medium shadow-md text-[11px]">
                    📍 {product.district}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
                    {product.category}
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* PROXIMITY DISTANCE BADGE */}
                  {distance !== null && (
                    <div className="pt-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
                        Konumunuza {formatDistance(distance)}
                      </span>
                      {coords && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline flex items-center gap-0.5"
                        >
                          <span>Rota</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Seller Info & Reputation Badge */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
                      {product.sellerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium text-[11px] flex items-center gap-1 truncate">
                        <span className="truncate">{product.sellerName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                        <span>{product.sellerRating}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">{product.sellerCollateral} USDT</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <SellerTrustBadge
                      sellerId={product.sellerId}
                      sellerName={product.sellerName}
                      sellerRating={product.sellerRating}
                      sellerTrustScore={product.sellerTrustScore}
                      sellerCollateral={product.sellerCollateral}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 leading-none">
                      {product.priceUSDT} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">USDT</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                      ≈ {(product.priceUSDT * 39).toFixed(0)} TRY
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setBuyerNotes('');
                      setPurchaseResult(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Escrow ile Al
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProductsWithDistance.length === 0 && (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl p-8 shadow-xs">
          <Info className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-zinc-800 font-medium">Arama veya mesafe kriterlerine uygun zula bulunamadı.</p>
          <p className="text-xs text-zinc-500 mt-1">Mesafe yarıçapını genişletebilir veya filtreleri temizleyebilirsiniz.</p>
        </div>
      )}

      {/* BUY CONFIRMATION & ESCROW MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-zinc-900">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Escrow Güvenceli Satın Alım</h3>
                  <p className="text-xs text-zinc-500">noktag.com Akıllı Emanet Protokolü</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Product Summary */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex gap-3 items-center">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-zinc-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-900 truncate">{selectedProduct.title}</div>
                <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{selectedProduct.city} - {selectedProduct.district}</span>
                </div>
                {userLocation && (
                  <div className="text-[11px] text-zinc-600 flex items-center gap-1 mt-1">
                    <Crosshair className="w-3 h-3 text-zinc-400" />
                    <span>Konumunuza {formatDistance(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedProduct.lat || selectedProduct.deadDropCoordinates?.lat || 41.0, selectedProduct.lng || selectedProduct.deadDropCoordinates?.lng || 29.0))} mesafede</span>
                  </div>
                )}
                <div className="text-xs font-bold text-zinc-900 mt-1">
                  {selectedProduct.priceUSDT} USDT (≈ {(selectedProduct.priceUSDT * 39).toFixed(0)} TRY)
                </div>
              </div>
            </div>

            {/* Seller Trust & Reputation Summary */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700 shadow-2xs">
                  {selectedProduct.sellerName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 flex items-center gap-1">
                    <span>Satıcı: {selectedProduct.sellerName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <span>Kilitli Teminat: <strong className="text-zinc-700">{selectedProduct.sellerCollateral} USDT</strong></span>
                    <span className="text-zinc-300">•</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {selectedProduct.sellerRating}
                    </span>
                  </div>
                </div>
              </div>

              <SellerTrustBadge
                sellerId={selectedProduct.sellerId}
                sellerName={selectedProduct.sellerName}
                sellerRating={selectedProduct.sellerRating}
                sellerTrustScore={selectedProduct.sellerTrustScore}
                sellerCollateral={selectedProduct.sellerCollateral}
                compact={false}
              />
            </div>

            {/* Drop Type Clarification */}
            <div className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Zula Türü:</span>
                {selectedProduct.dropType === 'dead_drop' ? (
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> Dead Drop (Hazır Zula)
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Live Drop ({selectedProduct.prepTimeMinutes} dk Hazırlık)
                  </span>
                )}
              </div>

              <p className="text-zinc-600 text-[11px] leading-relaxed">
                {selectedProduct.dropType === 'dead_drop' 
                  ? 'Satın alım onaylandığında GPS koordinatları, gizli şifre ve konum fotoğrafı anında ekranınıza açılır.'
                  : `Satıcı ${selectedProduct.prepTimeMinutes} dakika içinde belirteceğiniz semte zulayı yerleştirip GPS koordinatlarını yükler.`}
              </p>
            </div>

            {/* If Live Drop, buyer can enter location preferences */}
            {selectedProduct.dropType === 'live_drop' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-zinc-500" />
                  Tercih Ettiğiniz Semt / Not (Satıcıya İletilecek):
                </label>
                <textarea
                  rows={2}
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Örn: Moda Caddesi civarı, sakin bir park çevresi olsun..."
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                />
              </div>
            )}

            {/* Buyer Balance & Escrow Guarantee Box */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-600">Cüzdan Bakiyeniz:</span>
                <span className="text-zinc-900 font-bold">{currentUser.balanceUSDT.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Ödenecek Tutar:</span>
                <span className="text-emerald-800 font-bold">{selectedProduct.priceUSDT} USDT</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-emerald-200">
                <span>Kalan Bakiye:</span>
                <span>{(currentUser.balanceUSDT - selectedProduct.priceUSDT).toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Purchase Result Message */}
            {purchaseResult && (
              <div className={`p-3 rounded-xl text-xs ${
                purchaseResult.success 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  {purchaseResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />}
                  <div>
                    <div className="font-semibold">{purchaseResult.message}</div>
                    {purchaseResult.success && (
                      <button
                        onClick={() => {
                          setSelectedProduct(null);
                          setActiveView('my_orders');
                        }}
                        className="mt-2 inline-flex items-center gap-1 underline text-zinc-900 hover:text-black font-medium"
                      >
                        Siparişlerim sayfasına git <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors"
              >
                Vazgeç
              </button>

              <button
                onClick={handleBuy}
                disabled={isSubmitting || currentUser.balanceUSDT < selectedProduct.priceUSDT}
                className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                {isSubmitting ? 'Escrow Kilitleniyor...' : 'Escrow İle Onayla ve Satın Al'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
