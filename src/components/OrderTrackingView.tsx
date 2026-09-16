import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, DropCoordinates, EscrowStatus } from '../types';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff, 
  Star, 
  MessageSquare, 
  Navigation, 
  Lock, 
  Zap,
  Send,
  AlertCircle
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, currentUser, confirmOrderReceipt, openDispute, setActiveView } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Dispute modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('Zula yerinde bulunamadı');

  // Filter orders relevant to current user
  const relevantOrders = orders.filter(o => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'seller') return o.sellerId === currentUser.id;
    return o.buyerId === currentUser.id;
  });

  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case 'preparing_live_drop':
        return (
          <span className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Canlı Zula Hazırlanıyor
          </span>
        );
      case 'drop_ready':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> Zula Hazır & Koordinatlar Açıldı
          </span>
        );
      case 'released_to_seller':
      case 'buyer_confirmed':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tamamlandı (Escrow Çözüldü)
          </span>
        );
      case 'disputed':
        return (
          <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Uyuşmazlık (Hakem İncelemesinde)
          </span>
        );
      case 'refunded_to_buyer':
        return (
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Alıcıya İade Edildi
          </span>
        );
      default:
        return (
          <span className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full text-xs font-mono">
            {status}
          </span>
        );
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const submitConfirmReceipt = () => {
    if (!selectedOrder) return;
    confirmOrderReceipt(selectedOrder.id, ratingValue, ratingFeedback);
    setRatingModalOpen(false);
    setSelectedOrder(null);
  };

  const submitDispute = () => {
    if (!selectedOrder) return;
    const fullReason = `[${disputeCategory}] ${disputeReason}`;
    openDispute(selectedOrder.id, fullReason);
    setDisputeModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-400" />
            Emanet & Zula Sipariş Takibi
          </h1>
          <p className="text-sm text-zinc-500 font-mono mt-0.5">
            noktag.com Kripto Escrow Kontratları ve Canlı/Ölü Zula Bilgileri
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700">
            Toplam Sipariş: <strong className="text-emerald-400">{relevantOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {relevantOrders.map(order => {
          const isDead = order.dropType === 'dead_drop';

          return (
            <div
              key={order.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-zinc-200 font-mono text-xs text-emerald-400 font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">{order.productTitle}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
                      <span>Satıcı: <strong className="text-zinc-800">{order.sellerName}</strong></span>
                      <span>•</span>
                      <span>Alıcı: <strong className="text-zinc-800">{order.buyerName}</strong></span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.escrowStatus)}
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-white">{order.productPriceUSDT} USDT</div>
                    <div className="text-[10px] text-zinc-400">Komisyon: {order.platformFeeUSDT} USDT</div>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 p-2 rounded-lg">
                  <div className="font-bold">1. Emanet</div>
                  <div className="text-[10px] text-zinc-500">USDT Kilitlendi</div>
                </div>

                <div className={`p-2 rounded-lg border ${
                  order.escrowStatus === 'preparing_live_drop'
                    ? 'bg-cyan-950/60 border-zinc-200 text-zinc-700 animate-pulse'
                    : ['drop_ready', 'released_to_seller', 'buyer_confirmed'].includes(order.escrowStatus)
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : 'bg-white border-zinc-200 text-zinc-400'
                }`}>
                  <div className="font-bold">2. Zula Hazırlık</div>
                  <div className="text-[10px]">{isDead ? 'Ölü Zula (Hazır)' : 'Canlı Yerleştirme'}</div>
                </div>

                <div className={`p-2 rounded-lg border ${
                  order.escrowStatus === 'drop_ready'
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                    : ['released_to_seller', 'buyer_confirmed'].includes(order.escrowStatus)
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : 'bg-white border-zinc-200 text-zinc-400'
                }`}>
                  <div className="font-bold">3. Koordinat Açık</div>
                  <div className="text-[10px]">{order.dropCoordinates ? 'GPS & Fotoğraf Açık' : 'Bekleniyor'}</div>
                </div>

                <div className={`p-2 rounded-lg border ${
                  ['released_to_seller', 'buyer_confirmed'].includes(order.escrowStatus)
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : order.escrowStatus === 'disputed'
                    ? 'bg-red-950/60 border-red-500/50 text-red-300'
                    : 'bg-white border-zinc-200 text-zinc-400'
                }`}>
                  <div className="font-bold">4. Tamamlanma</div>
                  <div className="text-[10px]">{order.escrowStatus === 'disputed' ? 'Hakem Masasında' : 'Onay / İade'}</div>
                </div>
              </div>

              {/* Status Specific Highlights */}
              {order.escrowStatus === 'preparing_live_drop' && (
                <div className="bg-cyan-950/30 border border-zinc-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Clock className="w-4 h-4 animate-spin text-zinc-700" />
                    <span>Satıcı canlı zulayı hazırlıyor. Alıcı notu: <strong>{order.buyerNotes || 'Belirtilmedi'}</strong></span>
                  </div>
                  <div className="text-zinc-700 font-mono font-bold">
                    Hazırlık Süresi Devam Ediyor
                  </div>
                </div>
              )}

              {order.escrowStatus === 'drop_ready' && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Zula konumu hazır! Koordinatları ve fotoğrafı inceleyip teslim alabilirsiniz.</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowPhoto(false);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg font-mono flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Zula Detaylarını Görüntüle
                  </button>
                </div>
              )}

              {order.escrowStatus === 'disputed' && (
                <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-red-300 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>İtiraz Açıldı: {order.disputeReason}</span>
                  </div>
                  <p className="text-zinc-500 text-[11px] font-mono">
                    Paranız Escrow emanetinde kilitli kalmaya devam ediyor. Yönetici/Hakem tarafları dinleyip kanıtları inceledikten sonra karara bağlayacaktır.
                  </p>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPhoto(false);
                  }}
                  className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-mono"
                >
                  <Eye className="w-3.5 h-3.5" /> Sipariş Sözleşme Kartını Aç
                </button>

                <div className="flex items-center gap-2">
                  {/* Buyer action buttons */}
                  {currentUser.id === order.buyerId && order.escrowStatus === 'drop_ready' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setDisputeModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-mono font-medium"
                      >
                        ⚖️ İtiraz Et (Dispute)
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setRatingModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium font-mono font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Teslim Aldım & Escrow'u Serbest Bırak
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {relevantOrders.length === 0 && (
          <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl p-8">
            <Lock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-700 font-medium">Henüz bir emanet siparişiniz bulunmamaktadır.</p>
            <p className="text-xs text-zinc-400 mt-1 font-mono">Pazar yerinden hazır veya canlı bir zula siparişi verebilirsiniz.</p>
            <button
              onClick={() => setActiveView('marketplace')}
              className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-black text-white font-medium font-semibold text-xs font-mono rounded-lg"
            >
              Pazar Yerine Git
            </button>
          </div>
        )}
      </div>

      {/* FULL ORDER DETAIL & DECRYPTED COORDINATES MODAL */}
      {selectedOrder && !ratingModalOpen && !disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Escrow & Zula Kartı #{selectedOrder.id}</h3>
                  <p className="text-xs font-mono text-zinc-500">Şifrelenmiş Emanet Kaydı</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-500 hover:text-zinc-900 text-lg font-bold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Product & Contract Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-white border border-zinc-200 p-3 rounded-xl">
              <div>
                <span className="text-zinc-400">Tutar:</span>
                <div className="text-white font-bold">{selectedOrder.productPriceUSDT} USDT</div>
              </div>
              <div>
                <span className="text-zinc-400">Zula Türü:</span>
                <div className="text-zinc-700 font-bold">
                  {selectedOrder.dropType === 'dead_drop' ? 'Dead Drop' : 'Live Drop'}
                </div>
              </div>
              <div>
                <span className="text-zinc-400">Şehir:</span>
                <div className="text-white">{selectedOrder.city}</div>
              </div>
              <div>
                <span className="text-zinc-400">Durum:</span>
                <div className="text-emerald-400 font-bold">{selectedOrder.escrowStatus}</div>
              </div>
            </div>

            {/* DECRYPTED DROP DATA BOX */}
            {selectedOrder.dropCoordinates ? (
              <div className="bg-white border border-amber-500/40 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
                    <Navigation className="w-4 h-4" />
                    ZULA KOORDİNATLARI & TALİMATLAR
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    GİZLİ VERİ AÇILDI
                  </span>
                </div>

                {/* Simulated GPS Coordinates & Map Link */}
                <div className="bg-white border border-zinc-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400">GPS KOORDİNATLARI (WGS84)</div>
                    <div className="text-white font-mono text-sm font-bold">
                      {selectedOrder.dropCoordinates.lat}, {selectedOrder.dropCoordinates.lng}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(`${selectedOrder.dropCoordinates?.lat}, ${selectedOrder.dropCoordinates?.lng}`)}
                      className="px-2.5 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-xs font-mono text-zinc-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedCoords ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                    <a
                      href={`https://maps.google.com/?q=${selectedOrder.dropCoordinates.lat},${selectedOrder.dropCoordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Haritada Aç
                    </a>
                  </div>
                </div>

                {/* Address Hint & Stealth Directions */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-mono text-zinc-500">Adres İpucu:</span>
                    <p className="text-white bg-white p-2.5 rounded-lg border border-zinc-200 mt-1">
                      {selectedOrder.dropCoordinates.addressHint}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-zinc-500">Gizlilik & Alma Talimatları:</span>
                    <p className="text-amber-200 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20 mt-1">
                      {selectedOrder.dropCoordinates.stealthInstructions}
                    </p>
                  </div>
                </div>

                {/* Stealth Photo with Reveal Button */}
                {selectedOrder.dropCoordinates.photoUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500">Fotoğraflı Zula Kanıtı / İpucu:</span>
                      <button
                        onClick={() => setShowPhoto(!showPhoto)}
                        className="text-zinc-700 hover:text-zinc-700 flex items-center gap-1"
                      >
                        {showPhoto ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPhoto ? 'Fotoğrafı Gizle / Bulanıklaştır' : 'Fotoğrafı Göster'}
                      </button>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-zinc-200 h-52 bg-zinc-50 flex items-center justify-center">
                      <img
                        src={selectedOrder.dropCoordinates.photoUrl}
                        alt="Zula İpucu"
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          showPhoto ? 'blur-0' : 'blur-xl'
                        }`}
                      />
                      {!showPhoto && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                          <Eye className="w-8 h-8 text-white/70 mb-2" />
                          <button
                            onClick={() => setShowPhoto(true)}
                            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-mono backdrop-blur-sm"
                          >
                            Fotoğrafı Netleştir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-cyan-950/20 border border-zinc-200 rounded-xl p-5 text-center space-y-2">
                <Clock className="w-8 h-8 text-zinc-700 mx-auto animate-spin" />
                <h4 className="text-zinc-900 font-semibold text-sm">Canlı Zula Hazırlanıyor</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Satıcı belirlediğiniz bölgeye giderek güvenli noktaya zulayı yerleştirmektedir. Koordinatlar sisteme yüklendiğinde anında bildirim alacaksınız.
                </p>
              </div>
            )}

            {/* Buyer Review info if already completed */}
            {selectedOrder.buyerRatingGiven && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  Alıcı Değerlendirmesi: {selectedOrder.buyerRatingGiven} / 5 Yıldız
                </div>
                {selectedOrder.buyerFeedback && (
                  <p className="text-zinc-700 italic">"{selectedOrder.buyerFeedback}"</p>
                )}
              </div>
            )}

            {/* Action Buttons in Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono"
              >
                Kapat
              </button>

              {currentUser.id === selectedOrder.buyerId && selectedOrder.escrowStatus === 'drop_ready' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDisputeModalOpen(true)}
                    className="px-3 py-2 rounded-lg bg-red-950 border border-red-500/40 text-red-300 font-mono text-xs hover:bg-red-900"
                  >
                    ⚖️ İtiraz Et
                  </button>
                  <button
                    onClick={() => setRatingModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium font-mono text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Teslim Aldım & Onayla
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RATING & ESCROW RELEASE MODAL */}
      {ratingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Zulayı Teslim Aldınız mı?</h3>
              <p className="text-xs text-zinc-500">
                Onayladığınızda Escrow emanetindeki <strong>{selectedOrder.sellerNetUSDT} USDT</strong> satıcıya aktarılacak ve işlem tamamlanacaktır.
              </p>
            </div>

            {/* Star Rating selector */}
            <div className="space-y-1 text-center py-2">
              <label className="text-xs font-mono text-zinc-700">Satıcı ve Zula Kalitesini Puanlayın:</label>
              <div className="flex items-center justify-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="p-1.5 transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= ratingValue ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-700">İsteğe Bağlı Yorum / Geri Bildirim:</label>
              <textarea
                rows={2}
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                placeholder="Zula çok temiz ve tam tarif edildiği gibiydi..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRatingModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono"
              >
                Vazgeç
              </button>
              <button
                onClick={submitConfirmReceipt}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs font-mono"
              >
                Onayla & Ödemeyi Çöz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE OPENING MODAL */}
      {disputeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold pb-2 border-b border-zinc-200">
              <AlertTriangle className="w-5 h-5" />
              <span>Escrow Uyuşmazlığı / İtiraz Başlat</span>
            </div>

            <p className="text-xs text-zinc-700">
              İtiraz açtığınızda satıcının ödemesi dondurulur ve dosya noktag.com Hakem Heyetine aktarılır.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-700">İtiraz Nedeni:</label>
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Zula yerinde bulunamadı">Zula belirtilen koordinatta yok / boş</option>
                <option value="Ürün hasarlı veya eksik">Paket açılmış veya ürün hasarlı</option>
                <option value="Yanlış ürün veya şifre geçersiz">Yanlış ürün veya kilit açılamadı</option>
                <option value="Satıcı süreyi aştı">Satıcı verilen canlı hazırlık süresini aştı</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-700">Açıklama ve Kanıt Detayı:</label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Örn: Belirtilen ağaç kovuğuna gittim, fotoğraf çektim ancak herhangi bir paket bulunamadı..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono"
              >
                Vazgeç
              </button>
              <button
                onClick={submitDispute}
                disabled={!disputeReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs font-mono"
              >
                Hakeme Gönder & Escrow'u Dondur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
