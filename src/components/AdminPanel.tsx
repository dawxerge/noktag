import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Sliders, 
  Scale, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Clock, 
  Lock, 
  Ban, 
  FileText,
  Activity,
  Send,
  Eye
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    orders, 
    users, 
    settings, 
    auditLogs, 
    adminResolveDispute, 
    updateSettings, 
    toggleUserBan 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'disputes' | 'settings' | 'risk_watchdog' | 'audit_logs'>('disputes');

  // Dispute resolution modal state
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState<any | null>(null);
  const [arbitrationDecision, setArbitrationDecision] = useState<'buyer' | 'seller' | 'split'>('buyer');
  const [arbitrationNotes, setArbitrationNotes] = useState('');

  // Settings form state
  const [formFeePercent, setFormFeePercent] = useState(settings.platformFeePercent);
  const [formAutoConfirmHours, setFormAutoConfirmHours] = useState(settings.autoConfirmHours);
  const [formMinSellerCollateral, setFormMinSellerCollateral] = useState(settings.minSellerCollateralUSDT);
  const [formMinFinancierCollateral, setFormMinFinancierCollateral] = useState(settings.minFinancierCollateralUSDT);
  const [formTgBotUsername, setFormTgBotUsername] = useState(settings.telegramBotUsername);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const activeDisputes = orders.filter(o => o.escrowStatus === 'disputed');

  // Treasury stats
  const totalCompletedOrders = orders.filter(o => ['released_to_seller', 'buyer_confirmed'].includes(o.escrowStatus));
  const totalVolumeUSDT = orders.reduce((sum, o) => sum + o.productPriceUSDT, 0);
  const totalPlatformFeesCollected = orders
    .filter(o => ['released_to_seller', 'buyer_confirmed'].includes(o.escrowStatus))
    .reduce((sum, o) => sum + o.platformFeeUSDT, 0);
  const totalEscrowLockedUSDT = orders
    .filter(o => ['in_escrow', 'preparing_live_drop', 'drop_ready', 'disputed'].includes(o.escrowStatus))
    .reduce((sum, o) => sum + o.productPriceUSDT, 0);
  const totalCollateralLockedUSDT = users.reduce((sum, u) => sum + u.collateralUSDT, 0);

  const handleResolveDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeOrder) return;

    adminResolveDispute(selectedDisputeOrder.id, arbitrationDecision, arbitrationNotes);
    setSelectedDisputeOrder(null);
    setArbitrationNotes('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformFeePercent: Number(formFeePercent),
      autoConfirmHours: Number(formAutoConfirmHours),
      minSellerCollateralUSDT: Number(formMinSellerCollateral),
      minFinancierCollateralUSDT: Number(formMinFinancierCollateral),
      telegramBotUsername: formTgBotUsername,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              noktag.com Yönetim & Hakem Masası
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Uyuşmazlık Çözümü (Dispute Arbitration), Yüzdeler, Güvence Bedeli Denetimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            {activeDisputes.length} Açık İtiraz
          </span>
        </div>
      </div>

      {/* Treasury Analytics KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Toplam Emanet Hacmi</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalVolumeUSDT.toFixed(2)} USDT</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{orders.length} adet işlem</div>
        </div>

        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Platform Geliri (%{settings.platformFeePercent})</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalPlatformFeesCollected.toFixed(2)} USDT</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Kasa rezervi</div>
        </div>

        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Şu An Emanette Kilitli</div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{totalEscrowLockedUSDT.toFixed(2)} USDT</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Aktif siparişlerde</div>
        </div>

        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Toplam Sistem Teminatı</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalCollateralLockedUSDT.toFixed(2)} USDT</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Satıcı + Finansçı teminatı</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs gap-1">
        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'disputes'
              ? 'bg-white dark:bg-[#141720] text-red-600 dark:text-red-400 border-t-2 border-red-500 border-x border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          Hakem Masası (İtirazlar)
          {activeDisputes.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {activeDisputes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-[#141720] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-500 border-x border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-500" />
          Yüzdeler & Parametreler
        </button>

        <button
          onClick={() => setActiveTab('risk_watchdog')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'risk_watchdog'
              ? 'bg-white dark:bg-[#141720] text-zinc-900 dark:text-zinc-100 border-t-2 border-zinc-400 dark:border-zinc-600 border-x border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Users className="w-4 h-4 text-zinc-500" />
          Teminat & Risk Takibi
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'audit_logs'
              ? 'bg-white dark:bg-[#141720] text-purple-700 dark:text-purple-400 border-t-2 border-purple-500 border-x border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-500" />
          Denetim İzi (Audit Log)
        </button>
      </div>

      {/* TAB 1: HAKEM MASASI (DISPUTES) */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">İnceleme Bekleyen Anlaşmazlıklar</h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Admin yetkisiyle emanetteki fonlar serbest bırakılabilir veya iade edilebilir.
            </span>
          </div>

          {activeDisputes.length === 0 ? (
            <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">Aktif Anlaşmazlık Yok</div>
              <div>Tüm emanet işlemleri otomatik veya sorunsuz olarak işlemektedir.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDisputes.map(dispute => (
                <div
                  key={dispute.id}
                  className="bg-white dark:bg-[#141720] border border-red-200 dark:border-red-900/50 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-xs">
                        #{dispute.id}
                      </span>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{dispute.productTitle}</h3>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-2">
                          <span>Alıcı: <strong className="text-zinc-800 dark:text-zinc-200">{dispute.buyerName}</strong></span>
                          <span>•</span>
                          <span>Satıcı: <strong className="text-zinc-800 dark:text-zinc-200">{dispute.sellerName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{dispute.productPriceUSDT} USDT</div>
                      <div className="text-[10px] text-red-600 dark:text-red-400 font-semibold">ESCRW KİLİTLİ</div>
                    </div>
                  </div>

                  {/* Dispute Details & Claims */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Buyer claim */}
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3 rounded-lg space-y-1.5">
                      <div className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Alıcının İtiraz Gerekçesi ({dispute.buyerName}):
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200">{dispute.disputeReason}</p>
                      {dispute.buyerNotes && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Alıcı ilk sipariş notu: "{dispute.buyerNotes}"</p>
                      )}
                    </div>

                    {/* Seller Drop Evidence */}
                    <div className="bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg space-y-1.5">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-500" />
                        Satıcının Kayıtlı Zula İpuçları ({dispute.sellerName}):
                      </div>
                      {dispute.dropCoordinates ? (
                        <div className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1">
                          <div>GPS: {dispute.dropCoordinates.lat}, {dispute.dropCoordinates.lng}</div>
                          <div>İpucu: {dispute.dropCoordinates.addressHint}</div>
                          <div>Talimat: {dispute.dropCoordinates.stealthInstructions}</div>
                        </div>
                      ) : (
                        <div className="text-zinc-400 dark:text-zinc-500">Koordinat yüklenmedi.</div>
                      )}
                    </div>
                  </div>

                  {/* Arbitration Action trigger */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setSelectedDisputeOrder(dispute);
                        setArbitrationDecision('buyer');
                        setArbitrationNotes('İnceleme sonucunda zula yerinde bulunamamış ve alıcı kanıtları haklı görülmüştür.');
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Scale className="w-4 h-4" />
                      Hakem Kararını Ver (Fonları Yönet)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: YÜZDELER VE PARAMETRELER (SETTINGS) */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Sistem Komisyonları & Parametreler</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tüm platform komisyonları, güvence bedeli eşikleri ve otomatik onay süreleri bu panelden yönetilir.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Platform Komisyon Oranı (%):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={formFeePercent}
                    onChange={(e) => setFormFeePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                  />
                  <Percent className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Her başarılı escrow işleminden platformun kazandığı pay.</span>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Zula Otomatik Onay Süresi (Saat):</label>
                <div className="relative">
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={formAutoConfirmHours}
                    onChange={(e) => setFormAutoConfirmHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                  />
                  <Clock className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Alıcı itiraz etmezse fonların satıcıya otomatik aktarılma süresi.</span>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Minimum Satıcı Güvence Bedeli (USDT):</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={formMinSellerCollateral}
                  onChange={(e) => setFormMinSellerCollateral(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Satıcının ilan verebilmesi için yatırması zorunlu alt limit.</span>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Minimum Finansçı Güvence Bedeli (USDT):</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={formMinFinancierCollateral}
                  onChange={(e) => setFormMinFinancierCollateral(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Finansçının IBAN masası açabilmesi için gereken teminat.</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-700 dark:text-zinc-300 font-medium">Telegram Bot Kullanıcı Adı:</label>
              <div className="relative">
                <input
                  type="text"
                  value={formTgBotUsername}
                  onChange={(e) => setFormTgBotUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
                <Send className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Parametreler başarıyla güncellendi ve akıllı escrow kurallarına yansıtıldı.</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium rounded-lg transition-colors"
              >
                Ayarları Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: TEMİNAT & RISK TAKİBİ */}
      {activeTab === 'risk_watchdog' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Satıcı ve Finansçı Teminat & Risk İzleme</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Hiçbir satıcı veya finansçı güvence bedelinden fazla açık işlem tutamaz. Riskli aktörler buradan dondurulabilir.
            </p>
          </div>

          <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-[#181c26] text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3 font-semibold">Kullanıcı</th>
                  <th className="p-3 font-semibold">Rol</th>
                  <th className="p-3 font-semibold">Teminat (Kilitli)</th>
                  <th className="p-3 font-semibold">Açık İşlem</th>
                  <th className="p-3 font-semibold">Risk Oranı</th>
                  <th className="p-3 font-semibold">İtibar / Güven</th>
                  <th className="p-3 text-right font-semibold">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {users.filter(u => ['seller', 'financier'].includes(u.role)).map(u => {
                  const riskRatio = u.collateralUSDT > 0 
                    ? Math.round((u.activeExposureUSDT / u.collateralUSDT) * 100) 
                    : 0;

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={u.avatarUrl} alt={u.username} className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700" />
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{u.username}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          u.role === 'seller' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                        }`}>
                          {u.role === 'seller' ? 'Satıcı' : 'Finansçı'}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">{u.collateralUSDT} USDT</td>
                      <td className="p-3 text-amber-700 dark:text-amber-400 font-bold">{u.activeExposureUSDT} USDT</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${riskRatio > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${riskRatio}%` }}
                            ></div>
                          </div>
                          <span>%{riskRatio}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">%{u.reputation.trustScore}</span> ({u.reputation.completedTrades} İşlem)
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleUserBan(u.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            u.isBanned 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200' 
                              : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 hover:bg-red-200'
                          }`}
                        >
                          {u.isBanned ? 'Yasağı Kaldır' : 'Dondur / Askıya Al'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Denetim İzi & Sistem Olayları</h2>
          <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{log.action}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{log.actor}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE ARBITRATION DECISION MODAL */}
      {selectedDisputeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141720] border border-red-200 dark:border-red-900/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <Scale className="w-5 h-5" />
                <span>Hakem Karar Masası #{selectedDisputeOrder.id}</span>
              </div>
              <button
                onClick={() => setSelectedDisputeOrder(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <div className="text-zinc-900 dark:text-zinc-100 font-bold">{selectedDisputeOrder.productTitle}</div>
              <div className="text-zinc-600 dark:text-zinc-400">Emanette Kilitli: <strong className="text-zinc-900 dark:text-zinc-100">{selectedDisputeOrder.productPriceUSDT} USDT</strong></div>
              <div className="text-zinc-500 dark:text-zinc-400">Alıcı: {selectedDisputeOrder.buyerName} • Satıcı: {selectedDisputeOrder.sellerName}</div>
            </div>

            <form onSubmit={handleResolveDispute} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Hakem Kararı:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setArbitrationDecision('buyer')}
                    className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                      arbitrationDecision === 'buyer'
                        ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-200'
                        : 'bg-zinc-50 dark:bg-[#181c26] border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Alıcıya Tam İade (%100)
                  </button>

                  <button
                    type="button"
                    onClick={() => setArbitrationDecision('seller')}
                    className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                      arbitrationDecision === 'seller'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200'
                        : 'bg-zinc-50 dark:bg-[#181c26] border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Satıcıya Aktar (%100)
                  </button>

                  <button
                    type="button"
                    onClick={() => setArbitrationDecision('split')}
                    className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                      arbitrationDecision === 'split'
                        ? 'bg-blue-100 dark:bg-blue-950/80 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200'
                        : 'bg-zinc-50 dark:bg-[#181c26] border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    50 / 50 Bölüştür
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Gerekçeli Karar Açıklaması:</label>
                <textarea
                  rows={3}
                  required
                  value={arbitrationNotes}
                  onChange={(e) => setArbitrationNotes(e.target.value)}
                  placeholder="Sunulan fotoğraf kanıtları incelenmiş olup..."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeOrder(null)}
                  className="px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Kararı Uygula & Fonları Aktar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
