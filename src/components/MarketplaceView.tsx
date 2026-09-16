import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, DropType } from '../types';
import { NearbyRadarWidget } from './NearbyRadarWidget';
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
  ExternalLink
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
      {/* Top Banner Explaining Escrow & Drops */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>%100 Kripto Teminatlı Escrow Güvencesi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Güvenli Zula Pazaryeri (Dead & Live Drop)
            </h1>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Satıcılar yalnızca yatırdıkları <strong className="text-zinc-900 font-semibold">Güvence Bedeli</strong> kadar işlem açabilir. Ödemeniz siz teslim alıp onaylayana kadar akıllı emanet havuzunda korunur.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setActiveView('how_it_works')}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Nasıl Çalışır? (Rehber)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-zinc-400">
                Escrow Protokolü: <strong className="text-zinc-700">Çevrimiçi</strong>
              </span>
            </div>
          </div>

          {/* Quick Drop Type Overview Badges */}
          <div className="flex flex-col sm:flex-row gap-3 text-xs">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-zinc-200 text-amber-700">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-zinc-900 font-semibold">
                  Dead Drop (Hazır Zula)
                </div>
                <div className="text-zinc-500 text-[11px] mt-0.5">Ödeme anında koordinat ve şifre açılır.</div>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-800">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-zinc-900 font-semibold">
                  Live Drop (Canlı Zula)
                </div>
                <div className="text-zinc-500 text-[11px] mt-0.5">Talep ettiğiniz bölgeye süreli bırakılır.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANA YAKIN NE VAR? RADAR TARAMASI WIDGET */}
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

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Ürün, semt veya anahtar kelime arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-zinc-400"
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
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-zinc-400"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop Type Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">Zula Tipi:</span>
            <button
              onClick={() => setSelectedDropType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedDropType === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              Tümü ({products.length})
            </button>
            <button
              onClick={() => setSelectedDropType('dead_drop')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                selectedDropType === 'dead_drop'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-700" />
              Dead Drop (Hazır)
            </button>
            <button
              onClick={() => setSelectedDropType('live_drop')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                selectedDropType === 'live_drop'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-700" />
              Live Drop (Canlı)
            </button>
          </div>

          <div className="text-zinc-500 text-xs flex items-center gap-3">
            {maxRadiusKm && (
              <span className="text-zinc-800 font-medium">
                Mesafe: <strong>&lt; {maxRadiusKm} km</strong>
              </span>
            )}
            <span>
              Listelenen: <strong className="text-zinc-900">{filteredProductsWithDistance.length}</strong>
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
              className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all flex flex-col group relative"
            >
              {/* Product Image & Top Overlays */}
              <div className="relative h-44 bg-zinc-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Drop Type Badge */}
                <div className="absolute top-3 left-3">
                  {isDead ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs">
                      <Zap className="w-3 h-3" />
                      DEAD DROP (HAZIR)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs">
                      <Clock className="w-3 h-3" />
                      LIVE DROP ({product.prepTimeMinutes} DK)
                    </span>
                  )}
                </div>

                {/* Location Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs border border-zinc-200 px-2 py-0.5 rounded-md text-[11px] text-zinc-800 flex items-center gap-1 shadow-2xs">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  <span>{product.city}</span>
                </div>

                {/* District Pill */}
                <div className="absolute bottom-2 left-3 text-xs text-zinc-800 flex items-center gap-1">
                  <span className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-zinc-200 font-medium shadow-2xs">
                    📍 {product.district}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {product.category}
                  </div>
                  <h3 className="font-semibold text-zinc-900 text-base leading-snug line-clamp-2 group-hover:text-black">
                    {product.title}
                  </h3>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* PROXIMITY DISTANCE BADGE */}
                  {distance !== null && (
                    <div className="pt-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-[11px]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Crosshair className="w-3.5 h-3.5 text-zinc-500" />
                        Konumunuza {formatDistance(distance)}
                      </span>
                      {coords && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 underline flex items-center gap-0.5"
                        >
                          <span>Rota</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Seller Info & Reputation */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-700 font-semibold border border-zinc-200">
                      {product.sellerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-zinc-900 font-medium text-[11px] flex items-center gap-1">
                        {product.sellerName}
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{product.sellerRating} (%{product.sellerTrustScore})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400">Satıcı Teminatı</div>
                    <div className="text-[11px] text-zinc-800 font-semibold">
                      {product.sellerCollateral} USDT
                    </div>
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                  <div>
                    <div className="text-lg font-bold text-zinc-900 leading-none">
                      {product.priceUSDT} <span className="text-xs text-zinc-500 font-normal">USDT</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      ≈ {(product.priceUSDT * 39).toFixed(0)} TRY
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setBuyerNotes('');
                      setPurchaseResult(null);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
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
