import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { 
  calculateDistanceKm, 
  formatDistance, 
  getProductCoordinates, 
  POPULAR_LOCATIONS, 
  UserGeoLocation, 
  detectLocationFromText 
} from '../utils/geoUtils';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Crosshair, 
  Radar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Search
} from 'lucide-react';

interface NearbyRadarWidgetProps {
  maxRadiusKm: number | null;
  setMaxRadiusKm: (radius: number | null) => void;
  sortByDistance: boolean;
  setSortByDistance: (sort: boolean) => void;
  onSelectProduct: (product: Product) => void;
}

export const NearbyRadarWidget: React.FC<NearbyRadarWidgetProps> = ({
  maxRadiusKm,
  setMaxRadiusKm,
  sortByDistance,
  setSortByDistance,
  onSelectProduct,
}) => {
  const { userLocation, setUserLocation, products } = useApp();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [customLocationText, setCustomLocationText] = useState('');
  const [showRadarCompass, setShowRadarCompass] = useState(true);
  const [hoveredBlip, setHoveredBlip] = useState<{ product: Product; distance: number } | null>(null);

  // Request browser GPS
  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servisini (GPS) desteklemiyor.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc: UserGeoLocation = {
          name: 'Mevcut GPS Konumunuz',
          lat: latitude,
          lng: longitude,
          source: 'gps',
        };
        setUserLocation(newLoc);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Konum izni reddedildi. Aşağıdaki popüler semtlerden birini seçebilirsiniz.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Konum bilgisi alınamadı.');
            break;
          case error.TIMEOUT:
            setLocationError('Konum isteği zaman aşımına uğradı.');
            break;
          default:
            setLocationError('Bilinmeyen bir konum hatası oluştu.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Search by text or coordinates
  const handleSearchCustomLocation = () => {
    if (!customLocationText.trim()) return;

    const detected = detectLocationFromText(customLocationText.trim());
    if (detected) {
      setUserLocation(detected);
      setLocationError(null);
      setCustomLocationText('');
    } else {
      setLocationError(`"${customLocationText}" konumu bulunamadı. Lütfen semt adı veya koordinat (örn: 41.04, 29.00) giriniz.`);
    }
  };

  // Calculate distance for all products
  const nearbyDrops = products
    .map((product) => {
      const coords = getProductCoordinates(product);
      if (!userLocation || !coords) {
        return { product, coords, distance: null };
      }
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
      return { product, coords, distance: dist };
    })
    .filter((item) => {
      if (maxRadiusKm === null || item.distance === null) return true;
      return item.distance <= maxRadiusKm;
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  const radiusOptions: { label: string; value: number | null }[] = [
    { label: 'Tümü', value: null },
    { label: '1 km', value: 1 },
    { label: '3 km', value: 3 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
  ];

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 text-zinc-900">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>ÇEVRESEL ZULA RADARI</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-zinc-700" />
            Konuma Göre Zula ve Drop Tarayıcısı
          </h2>
          <p className="text-xs text-zinc-500">
            GPS konumunuzu belirleyin veya semtinizi seçin; hazır (Dead Drop) ve canlı (Live Drop) zulalar anında mesafesine göre listelensin.
          </p>
        </div>

        {/* Action Controls (GPS & Toggle Radar) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleGetBrowserLocation}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'GPS Alınıyor...' : 'Konumumu Al (GPS)'}</span>
          </button>

          <button
            onClick={() => setShowRadarCompass(!showRadarCompass)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showRadarCompass
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>{showRadarCompass ? 'Radarı Gizle' : 'Radarı Göster'}</span>
          </button>
        </div>
      </div>

      {/* Location Status Bar & Preset Chips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Left: Active Location Card */}
        <div className="lg:col-span-1 bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 font-semibold flex items-center gap-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-zinc-700" />
              AKTİF REFERANS KONUM:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-medium">
              {userLocation?.source === 'gps' ? 'CANLI GPS' : 'SEMT'}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-zinc-200 flex items-center justify-between shadow-2xs">
            <span className="truncate font-semibold text-zinc-900">{userLocation?.name || 'Konum Belirlenmedi'}</span>
            <span className="text-zinc-500 text-[11px] whitespace-nowrap ml-2">
              {userLocation ? `${userLocation.lat.toFixed(3)}°, ${userLocation.lng.toFixed(3)}°` : ''}
            </span>
          </div>

          {locationError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Quick Input by District Name or Lat/Lng */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Semt veya Koordinat yaz (örn: Kadıköy, Beşiktaş)..."
              value={customLocationText}
              onChange={(e) => setCustomLocationText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomLocation()}
              className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
            />
            <button
              onClick={handleSearchCustomLocation}
              className="p-2 bg-zinc-900 hover:bg-black text-white rounded-lg transition-colors"
              title="Konumu Güncelle"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Preset District Chips & Radius Filters */}
        <div className="lg:col-span-2 bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-600 font-semibold text-[11px]">
              POPÜLER MERKEZLER:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-zinc-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sortByDistance}
                  onChange={(e) => setSortByDistance(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                />
                <span>En Yakın Zula Önce</span>
              </label>
            </div>
          </div>

          {/* District Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected = userLocation?.name === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => {
                    setUserLocation(loc);
                    setLocationError(null);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all text-[11px] truncate ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-xs'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  📍 {loc.name}
                </button>
              );
            })}
          </div>

          {/* Radius Filter Pills */}
          <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 text-[11px] font-medium">Yarıçap Filtresi:</span>
            {radiusOptions.map((opt) => {
              const isActive = maxRadiusKm === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => setMaxRadiusKm(opt.value)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TACTICAL VISUAL RADAR SONAR COMPASS & NEARBY HIGHLIGHT CARDS */}
      {showRadarCompass && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Circular Sonar Radar Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-zinc-300 bg-white shadow-xs flex items-center justify-center overflow-hidden">
              {/* Concentric distance rings */}
              <div className="absolute inset-4 rounded-full border border-zinc-200"></div>
              <div className="absolute inset-12 rounded-full border border-zinc-200 border-dashed"></div>
              <div className="absolute inset-20 rounded-full border border-zinc-200"></div>
              <div className="absolute inset-28 rounded-full border border-zinc-200"></div>

              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-zinc-200"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-[1px] bg-zinc-200"></div>
              </div>

              {/* Rotating sweeping sonar beam */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none animate-spin origin-center"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(24, 24, 27, 0.06) 360deg)',
                  animationDuration: '6s',
                }}
              ></div>

              {/* Center User Beacon */}
              <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-zinc-900 border-2 border-white shadow-xs flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white"></span>
              </div>
              <span className="absolute bottom-3 text-[9px] font-medium text-zinc-600 bg-white/90 border border-zinc-200 px-2 py-0.5 rounded-full shadow-2xs">
                SİZ (0.0 km)
              </span>

              {/* Blips for Nearby Products mapped relative to user */}
              {userLocation &&
                nearbyDrops.slice(0, 6).map(({ product, coords, distance }) => {
                  if (!coords || distance === null) return null;

                  const maxDisplayKm = 15;
                  const ratio = Math.min(distance / maxDisplayKm, 0.9);
                  const angle = Math.atan2(coords.lng - userLocation.lng, coords.lat - userLocation.lat);
                  
                  const maxR = 120;
                  const r = Math.max(25, ratio * maxR);
                  const x = Math.sin(angle) * r;
                  const y = -Math.cos(angle) * r;

                  const isDead = product.dropType === 'dead_drop';

                  return (
                    <button
                      key={product.id}
                      onClick={() => onSelectProduct(product)}
                      onMouseEnter={() => setHoveredBlip({ product, distance })}
                      onMouseLeave={() => setHoveredBlip(null)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className="absolute z-20 group transition-transform hover:scale-125 focus:outline-none"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-xs ${
                          isDead
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {isDead ? 'D' : 'L'}
                      </div>
                      <span className="sr-only">{product.title}</span>
                    </button>
                  );
                })}
            </div>

            {/* Hovered blip info readout */}
            <div className="mt-3 text-center min-h-[30px]">
              {hoveredBlip ? (
                <div className="text-xs text-zinc-800 font-medium bg-white px-3 py-1 rounded-full border border-zinc-200 shadow-2xs inline-flex items-center gap-1.5">
                  <span className="text-zinc-500">{hoveredBlip.product.dropType === 'dead_drop' ? 'Dead Drop:' : 'Live Drop:'}</span>
                  <span className="text-zinc-900 truncate max-w-[200px]">{hoveredBlip.product.title}</span>
                  <span className="text-emerald-700 font-semibold">({formatDistance(hoveredBlip.distance)})</span>
                </div>
              ) : (
                <div className="text-[11px] text-zinc-500">
                  Radar noktalarının üzerine gelin veya tıklayarak zula detayını açın
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Closest 3 Drops Quick Cards */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-zinc-600" />
                KONUMUNUZA EN YAKIN ZULA NOKTALARI
              </span>
              <span className="text-xs text-zinc-600 font-medium">
                {nearbyDrops.length} Zula Aktif
              </span>
            </div>

            <div className="space-y-2">
              {nearbyDrops.slice(0, 3).map(({ product, distance }) => {
                const isDead = product.dropType === 'dead_drop';
                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-0.5 left-0.5">
                          {isDead ? (
                            <span className="px-1 rounded bg-emerald-100 text-emerald-800 text-[8px] font-bold">DEAD</span>
                          ) : (
                            <span className="px-1 rounded bg-amber-100 text-amber-800 text-[8px] font-bold">LIVE</span>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-semibold text-zinc-900 truncate group-hover:text-black transition-colors">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <span>📍 {product.district}</span>
                          <span>•</span>
                          <span className="text-zinc-800 font-semibold">{product.priceUSDT} USDT</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="space-y-0.5">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium text-xs">
                          {distance !== null ? formatDistance(distance) : 'Bilinmiyor'}
                        </span>
                        <div className="text-[10px] text-zinc-400">Mesafe</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
