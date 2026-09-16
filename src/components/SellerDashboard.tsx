import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DropCoordinates, Product, DropType } from '../types';
import { 
  Store, 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Navigation, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Wallet,
  ArrowUpRight,
  Zap,
  Info
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    products, 
    fulfillLiveDrop, 
    createProduct, 
    depositCollateral, 
    withdrawCollateral,
    settings 
  } = useApp();

  // Active live drop fulfillments needed
  const pendingLiveOrders = orders.filter(
    o => o.sellerId === currentUser.id && o.escrowStatus === 'preparing_live_drop'
  );

  const myProducts = products.filter(p => p.sellerId === currentUser.id);

  // Fulfill Modal State
  const [selectedFulfillOrder, setSelectedFulfillOrder] = useState<any | null>(null);
  const [dropLat, setDropLat] = useState('40.9875');
  const [dropLng, setDropLng] = useState('29.0258');
  const [addressHint, setAddressHint] = useState('');
  const [stealthInstructions, setStealthInstructions] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80');

  // Add Product Modal State
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Güvenlik Donanımı');
  const [description, setDescription] = useState('');
  const [priceUSDT, setPriceUSDT] = useState(90);
  const [dropType, setDropType] = useState<DropType>('live_drop');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('Kadıköy / Moda');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(60);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80');
  
  // Dead drop initial coords if creating dead drop
  const [deadLat, setDeadLat] = useState('41.0425');
  const [deadLng, setDeadLng] = useState('28.9958');
  const [deadAddressHint, setDeadAddressHint] = useState('');
  const [deadStealth, setDeadStealth] = useState('');

  // Collateral Modal State
  const [collateralModalOpen, setCollateralModalOpen] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState(250);
  const [collateralAction, setCollateralAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [collateralFeedback, setCollateralFeedback] = useState<string | null>(null);

  const availableExposureLimit = Math.max(0, currentUser.collateralUSDT - currentUser.activeExposureUSDT);
  const collateralUsagePercent = currentUser.collateralUSDT > 0 
    ? Math.round((currentUser.activeExposureUSDT / currentUser.collateralUSDT) * 100) 
    : 0;

  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFulfillOrder) return;

    const coords: DropCoordinates = {
      city: selectedFulfillOrder.city,
      district: selectedFulfillOrder.district,
      lat: parseFloat(dropLat) || 40.9875,
      lng: parseFloat(dropLng) || 29.0258,
      addressHint,
      stealthInstructions,
      photoUrl,
    };

    fulfillLiveDrop(selectedFulfillOrder.id, coords);
    setSelectedFulfillOrder(null);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const deadDropCoordinates: DropCoordinates | undefined = dropType === 'dead_drop' ? {
      city,
      district,
      lat: parseFloat(deadLat) || 41.0425,
      lng: parseFloat(deadLng) || 28.9958,
      addressHint: deadAddressHint,
      stealthInstructions: deadStealth,
      photoUrl: imageUrl,
    } : undefined;

    const res = createProduct({
      title,
      category,
      description,
      priceUSDT,
      dropType,
      city,
      district,
      prepTimeMinutes: dropType === 'dead_drop' ? 0 : prepTimeMinutes,
      stock: 5,
      imageUrl,
      deadDropCoordinates,
    });

    if (res.success) {
      setAddProductModalOpen(false);
      setTitle('');
      setDescription('');
    } else {
      alert(res.message);
    }
  };

  const handleCollateralSubmit = () => {
    let res;
    if (collateralAction === 'deposit') {
      res = depositCollateral(collateralAmount);
    } else {
      res = withdrawCollateral(collateralAmount);
    }
    setCollateralFeedback(res.message);
    if (res.success) {
      setTimeout(() => {
        setCollateralModalOpen(false);
        setCollateralFeedback(null);
      }, 1200);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Seller Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Store className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                Satıcı Masası & Zula Yönetimi
              </h1>
              <p className="text-xs font-mono text-zinc-500">
                Kullanıcı: {currentUser.username} • Güven Skoru: %{currentUser.reputation.trustScore}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollateralModalOpen(true)}
            className="px-3.5 py-2 bg-zinc-50 hover:bg-zinc-200 border border-zinc-300 text-amber-700 rounded-lg text-xs font-mono flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Teminat Yönetimi ({currentUser.collateralUSDT} USDT)
          </button>

          <button
            onClick={() => setAddProductModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-medium font-semibold rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Zula / Ürün Ekle
          </button>
        </div>
      </div>

      {/* Collateral & Open Exposure Limit Bar (Mandatory Core Rule) */}
      <div className="bg-white border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-zinc-900 text-base">
              Güvence Bedeli & Açık İşlem Limiti
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Sistem Kuralı: Açık sipariş tutarı toplam güvence bedelinizi aşamaz.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500">Yatırılan Teminat (Collateral):</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{currentUser.collateralUSDT.toFixed(2)} USDT</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500">Şu An Açıkta Olan Siparişler:</span>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{currentUser.activeExposureUSDT.toFixed(2)} USDT</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500">Kalan Açık İşlem Kapasitesi:</span>
            <div className="text-xl font-bold text-zinc-800 mt-0.5">{availableExposureLimit.toFixed(2)} USDT</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-zinc-50 rounded-full overflow-hidden border border-zinc-200">
            <div
              className={`h-full transition-all ${
                collateralUsagePercent > 85 ? 'bg-red-500' : collateralUsagePercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, collateralUsagePercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>Kullanım: %{collateralUsagePercent}</span>
            <span>{currentUser.activeExposureUSDT} / {currentUser.collateralUSDT} USDT</span>
          </div>
        </div>
      </div>

      {/* PENDING LIVE DROPS REQUIRING SELLER FULFILLMENT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-800 animate-spin" />
            <h2 className="text-lg font-bold text-zinc-900">Hazırlanması Gereken Canlı Zulalar</h2>
          </div>
          <span className="text-xs font-mono text-zinc-800 bg-cyan-950/60 border border-zinc-200 px-2.5 py-1 rounded-full">
            {pendingLiveOrders.length} Bekleyen Canlı Zula
          </span>
        </div>

        {pendingLiveOrders.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center text-xs font-mono text-zinc-500">
            Bekleyen canlı zula siparişi bulunmuyor. Yeni sipariş geldiğinde bildirim alacaksınız.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLiveOrders.map(order => (
              <div
                key={order.id}
                className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="font-mono text-xs font-bold text-zinc-800">#{order.id}</span>
                  <span className="text-xs font-mono font-bold text-white">{order.productPriceUSDT} USDT (Net: {order.sellerNetUSDT} USDT)</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{order.productTitle}</h3>
                  <div className="text-xs text-zinc-500 font-mono mt-1 space-y-0.5">
                    <div>Hedef Bölge: <strong className="text-zinc-700">{order.city} - {order.district}</strong></div>
                    <div>Alıcı: <strong className="text-zinc-700">{order.buyerName}</strong></div>
                    {order.buyerNotes && (
                      <div className="bg-white/90 p-2 rounded border border-zinc-200 text-zinc-700 mt-1">
                        Alıcı Notu: "{order.buyerNotes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Canlı Hazırlık Süresi Başladı</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedFulfillOrder(order);
                      setAddressHint(`${order.district} civarı, `);
                      setStealthInstructions('Mıknatıslı mat siyah kutu taşın altındadır.');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-400 text-black font-semibold text-xs font-mono flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Zulayı Bıraktım & Bilgileri Yükle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MY PRODUCTS / LISTINGS */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">Listelediğim Zula ve Ürünler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProducts.map(prod => (
            <div key={prod.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-3">
              <img src={prod.imageUrl} alt={prod.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    prod.dropType === 'dead_drop' ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {prod.dropType === 'dead_drop' ? 'DEAD DROP' : `LIVE DROP (${prod.prepTimeMinutes} DK)`}
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-900 truncate mt-1">{prod.title}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{prod.city} - {prod.district}</p>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-700">
                  {prod.priceUSDT} USDT
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULFILL LIVE DROP MODAL */}
      {selectedFulfillOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Zula Bilgilerini Yükle</h3>
                  <p className="text-xs font-mono text-zinc-500">Sipariş #{selectedFulfillOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFulfillOrder(null)}
                className="text-zinc-500 hover:text-zinc-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFulfillSubmit} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-500">Enlem (Latitude):</label>
                  <input
                    type="text"
                    required
                    value={dropLat}
                    onChange={(e) => setDropLat(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white font-mono mt-1"
                  />
                </div>
                <div>
                  <label className="text-zinc-500">Boylam (Longitude):</label>
                  <input
                    type="text"
                    required
                    value={dropLng}
                    onChange={(e) => setDropLng(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white font-mono mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-500">Açık Adres İpucu (Kullanıcının bulacağı nokta):</label>
                <textarea
                  rows={2}
                  required
                  value={addressHint}
                  onChange={(e) => setAddressHint(e.target.value)}
                  placeholder="Örn: Bebek Parkı güney girişi, kırmızı bankın arkasındaki çam ağacının kovuğu..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                />
              </div>

              <div>
                <label className="text-zinc-500">Gizlilik & Güvenli Alma Talimatı:</label>
                <input
                  type="text"
                  required
                  value={stealthInstructions}
                  onChange={(e) => setStealthInstructions(e.target.value)}
                  placeholder="Örn: Siyah mıknatıslı kutu, dikkat çekmeden 1 saniyede alınabilir."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                />
              </div>

              <div>
                <label className="text-zinc-500">Fotoğraf Kanıtı / İpucu Görseli URL:</label>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                />
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-[11px] text-amber-300">
                * Koordinatları gönderdiğiniz an alıcıya bildirim iletilir ve alıcıya teslim alıp kontrol etmesi için 24 saat süre başlar.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFulfillOrder(null)}
                  className="px-3 py-2 rounded-lg bg-zinc-50 text-zinc-600 text-xs font-mono"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Alıcıya İlet & Durumu Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT / DROP MODAL */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-300 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Yeni Zula / Ürün İlanı Oluştur</h3>
                  <p className="text-xs font-mono text-zinc-500">noktag.com Pazar Yeri</p>
                </div>
              </div>
              <button
                onClick={() => setAddProductModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs font-mono">
              {/* Drop Type Radio */}
              <div className="space-y-1">
                <label className="text-zinc-600">Zula Türünü Seçin:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDropType('live_drop')}
                    className={`p-2.5 rounded-lg border text-left ${
                      dropType === 'live_drop'
                        ? 'bg-cyan-950/60 border-zinc-300 text-zinc-700'
                        : 'bg-white border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Live Drop (Canlı)
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Sipariş gelince belirlenen sürede yerleştirilir.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDropType('dead_drop')}
                    className={`p-2.5 rounded-lg border text-left ${
                      dropType === 'dead_drop'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                        : 'bg-white border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Dead Drop (Hazır)
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Önceden yerleştirilmiştir, anında açılır.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-500">Başlık:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Ledger Nano S Plus Mühürlü Kutu Zulası"
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-500">Kategori:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                  >
                    <option value="Güvenlik Donanımı">Güvenlik Donanımı</option>
                    <option value="Siber Güvenlik">Siber Güvenlik</option>
                    <option value="Gizlilik Kiti">Gizlilik Kiti</option>
                    <option value="Donanım & Depolama">Donanım & Depolama</option>
                    <option value="Fiziksel Güvenlik">Fiziksel Güvenlik</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500">Fiyat (USDT):</label>
                  <input
                    type="number"
                    required
                    min="10"
                    step="1"
                    value={priceUSDT}
                    onChange={(e) => setPriceUSDT(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-500">Şehir:</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                  >
                    <option value="İstanbul">İstanbul</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İzmir">İzmir</option>
                    <option value="Antalya">Antalya</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500">Bölge / Semt:</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Örn: Beşiktaş / Bebek Parkı"
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                  />
                </div>
              </div>

              {dropType === 'live_drop' ? (
                <div>
                  <label className="text-zinc-500">Canlı Zula Hazırlık Süresi (Dakika):</label>
                  <select
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                  >
                    <option value="45">45 Dakika (Hızlı)</option>
                    <option value="60">60 Dakika (Standart)</option>
                    <option value="90">90 Dakika</option>
                    <option value="120">120 Dakika (Geniş Bölge)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2 p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                  <div className="text-amber-300 font-bold">Ölü Zula Hazır Koordinatları:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Enlem (41.0425)"
                      value={deadLat}
                      onChange={(e) => setDeadLat(e.target.value)}
                      className="px-2 py-1.5 bg-white border border-zinc-300 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Boylam (28.9958)"
                      value={deadLng}
                      onChange={(e) => setDeadLng(e.target.value)}
                      className="px-2 py-1.5 bg-white border border-zinc-300 rounded text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Gizli adres ipucu (Taş oyuk, bank arkası vb.)"
                    value={deadAddressHint}
                    onChange={(e) => setDeadAddressHint(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-500">Açıklama:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ürünün durumu, mühür durumu, paketleme detayı..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                />
              </div>

              <div>
                <label className="text-zinc-500">Görsel URL:</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white mt-1"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddProductModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-zinc-50 text-zinc-600 text-xs font-mono"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs font-mono"
                >
                  İlanı Yayına Al
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLATERAL MANAGEMENT MODAL */}
      {collateralModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Güvence Bedeli (Teminat)</h3>
                  <p className="text-xs font-mono text-zinc-500">Açık İşlem Kapasitenizi Belirler</p>
                </div>
              </div>
              <button
                onClick={() => setCollateralModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCollateralAction('deposit')}
                className={`py-2 rounded-lg text-xs font-mono font-bold ${
                  collateralAction === 'deposit' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500'
                }`}
              >
                + Teminat Yatır
              </button>
              <button
                onClick={() => setCollateralAction('withdraw')}
                className={`py-2 rounded-lg text-xs font-mono font-bold ${
                  collateralAction === 'withdraw' ? 'bg-amber-500 text-black' : 'bg-zinc-50 text-zinc-500'
                }`}
              >
                - Teminat Çek
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-600">Tutar (USDT):</label>
              <input
                type="number"
                min="10"
                step="10"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-white font-mono text-base font-bold"
              />
            </div>

            <div className="bg-white p-3 rounded-xl border border-zinc-200 text-xs font-mono space-y-1">
              <div className="flex justify-between text-zinc-500">
                <span>Cüzdan Bakiyeniz:</span>
                <span className="text-white">{currentUser.balanceUSDT} USDT</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Mevcut Teminatınız:</span>
                <span className="text-emerald-700">{currentUser.collateralUSDT} USDT</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Açık İşlemler:</span>
                <span className="text-amber-700">{currentUser.activeExposureUSDT} USDT</span>
              </div>
            </div>

            {collateralFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono">
                {collateralFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCollateralModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-zinc-50 text-zinc-600 text-xs font-mono"
              >
                Kapat
              </button>
              <button
                onClick={handleCollateralSubmit}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono"
              >
                {collateralAction === 'deposit' ? 'Teminatı Kilitle' : 'Serbest Teminatı Çek'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
