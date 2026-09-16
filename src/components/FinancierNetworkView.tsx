import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FinancierOffer } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Star, 
  AlertCircle,
  Copy,
  Upload,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

export const FinancierNetworkView: React.FC = () => {
  const { financiers, deposits, currentUser, requestFiatDeposit, uploadDepositReceipt, setActiveView } = useApp();

  const [selectedFinancier, setSelectedFinancier] = useState<FinancierOffer | null>(null);
  const [amountTRY, setAmountTRY] = useState<number>(2000);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [activeDepositId, setActiveDepositId] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [copiedIBAN, setCopiedIBAN] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // User's deposits
  const myDeposits = deposits.filter(d => d.buyerId === currentUser.id);
  const activeDeposit = activeDepositId ? deposits.find(d => d.id === activeDepositId) : null;

  const handleStartDeposit = () => {
    if (!selectedFinancier) return;
    const bank = selectedBank || selectedFinancier.supportedBanks[0];
    const res = requestFiatDeposit(selectedFinancier.financierId, amountTRY, bank);
    if (res.success && res.depositId) {
      setActiveDepositId(res.depositId);
    }
  };

  const handleUploadReceipt = () => {
    if (!activeDepositId) return;
    uploadDepositReceipt(activeDepositId, receiptFileName || 'dekont_fast_transfer.pdf', receiptNote);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Explaining IBAN to Crypto Escrow */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>P2P IBAN'dan Kripto Yükleme Protokolü</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Kriptonuz Yok mu? Finansçılar ile FAST / Havale Yapın
            </h1>
            <p className="text-sm text-zinc-700">
              Kripto kullanmayı bilmeyen veya cüzdanı olmayan müşteriler için Finansçılarımız IBAN üzerinden TL kabul eder. Finansçının <strong className="text-purple-300">Güvence Teminatı</strong> sistemde kilitli olduğu için paranız %100 güvendedir.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs font-mono space-y-2 min-w-[240px]">
            <div className="text-zinc-500 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Güvence Mekanizması:
            </div>
            <div className="text-[11px] text-zinc-700 space-y-1">
              <div>1. Finansçı teminat yatırır (örn: 3,000 USDT)</div>
              <div>2. Yükleme talebinizde USDT bloke edilir</div>
              <div>3. Havale onayında anında cüzdana geçer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deposit Notification if pending */}
      {myDeposits.some(d => ['pending_payment', 'receipt_uploaded'].includes(d.status)) && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">Bekleyen IBAN Yükleme Talebiniz Var</div>
              <div className="text-zinc-500 font-mono">
                {myDeposits[0].amountTRY} TRY ➔ {myDeposits[0].amountUSDT} USDT ({myDeposits[0].financierName})
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveDepositId(myDeposits[0].id)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono whitespace-nowrap"
          >
            İşlem / Dekont Ekranını Aç
          </button>
        </div>
      )}

      {/* Finansçı Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {financiers.map(fin => {
          const usedExposurePercent = Math.round((fin.activeExposureUSDT / fin.collateralUSDT) * 100);

          return (
            <div
              key={fin.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 font-mono">
                      {fin.financierName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-base flex items-center gap-1.5">
                        {fin.financierName}
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </h3>
                      <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {fin.financierRating}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400">Güven Skoru: %{fin.financierTrustScore}</span>
                        <span>•</span>
                        <span className="text-zinc-400">Ort. Hız: ~{fin.averageSpeedMinutes} dk</span>
                      </div>
                    </div>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                    ÇEVRİMİÇİ
                  </span>
                </div>

                {/* Rates and Collateral capacity */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
                    <div className="text-zinc-500 text-[10px]">Komisyon Oranı</div>
                    <div className="text-white font-bold text-sm">%{fin.commissionRatePercent}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
                    <div className="text-zinc-500 text-[10px]">Kur (USDT/TRY)</div>
                    <div className="text-white font-bold text-sm">{fin.exchangeRateTRYPerUSDT} ₺</div>
                  </div>
                </div>

                {/* Collateral & Exposure Capacity Bar (Critical Requirement) */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Kilitli Güvence Teminatı:
                    </span>
                    <span className="text-emerald-400 font-bold">{fin.collateralUSDT.toFixed(0)} USDT</span>
                  </div>

                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        usedExposurePercent > 80 ? 'bg-red-500' : usedExposurePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, usedExposurePercent)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>Açıkta: {fin.activeExposureUSDT} USDT (%{usedExposurePercent})</span>
                    <span className="text-zinc-700 font-semibold">Kalan Kapasite: {fin.availableCapacityUSDT} USDT</span>
                  </div>
                </div>

                {/* Supported Banks */}
                <div className="mt-3 text-xs">
                  <span className="text-[11px] font-mono text-zinc-500">Desteklenen Bankalar:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {fin.supportedBanks.map(bank => (
                      <span key={bank} className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-mono">
                        {bank}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedFinancier(fin);
                    setSelectedBank(fin.supportedBanks[0]);
                    setAmountTRY(2000);
                  }}
                  className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Bu Finansçı ile IBAN'dan Yükle
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPOSIT FORM MODAL */}
      {selectedFinancier && !activeDepositId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">IBAN ile Kripto Yükle</h3>
                  <p className="text-xs font-mono text-zinc-500">{selectedFinancier.financierName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFinancier(null)}
                className="text-zinc-500 hover:text-zinc-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-700">Yatırmak İstediğiniz Tutar (TRY):</label>
              <div className="relative">
                <input
                  type="number"
                  min={selectedFinancier.minAmountTRY}
                  max={selectedFinancier.maxAmountTRY}
                  step="100"
                  value={amountTRY}
                  onChange={(e) => setAmountTRY(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-white font-mono text-base font-bold focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-zinc-500 font-bold">TRY (₺)</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>Min: {selectedFinancier.minAmountTRY} ₺</span>
                <span>Maks: {selectedFinancier.maxAmountTRY} ₺</span>
              </div>
            </div>

            {/* Bank selection */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-700">Havale Yapacağınız Banka:</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {selectedFinancier.supportedBanks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Calculation summary */}
            {(() => {
              const grossUSDT = amountTRY / selectedFinancier.exchangeRateTRYPerUSDT;
              const feeUSDT = (grossUSDT * selectedFinancier.commissionRatePercent) / 100;
              const netUSDT = Number((grossUSDT - feeUSDT).toFixed(2));

              return (
                <div className="bg-white p-3 rounded-xl border border-zinc-200 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-zinc-500">
                    <span>Kur:</span>
                    <span className="text-white">1 USDT = {selectedFinancier.exchangeRateTRYPerUSDT} ₺</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Finansçı Komisyonu (%{selectedFinancier.commissionRatePercent}):</span>
                    <span className="text-amber-400 font-medium">≈ {feeUSDT.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-zinc-200">
                    <span>Cüzdanınıza Geçecek Net:</span>
                    <span className="text-emerald-400">{netUSDT} USDT</span>
                  </div>
                </div>
              );
            })()}

            <div className="bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-lg text-[11px] text-purple-300 font-mono flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span>Talep açıldığında bu tutardaki kripto finansçının güvence bedelinden kilitlenir. Paran kaybolamaz.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFinancier(null)}
                className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono"
              >
                Vazgeç
              </button>
              <button
                onClick={handleStartDeposit}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono"
              >
                Talebi Oluştur & IBAN Bilgilerini Al
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE DEPOSIT INSTRUCTIONS & RECEIPT MODAL */}
      {activeDeposit && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">IBAN Transfer Talimatı #{activeDeposit.id}</h3>
                  <p className="text-xs font-mono text-zinc-500">{activeDeposit.financierName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveDepositId(null);
                  setSelectedFinancier(null);
                }}
                className="text-zinc-500 hover:text-zinc-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-400">Gönderilecek Tutar:</span>
                <div className="text-lg font-bold text-amber-400">{activeDeposit.amountTRY} ₺</div>
              </div>
              <div>
                <span className="text-zinc-400">Alınacak USDT:</span>
                <div className="text-lg font-bold text-emerald-400">{activeDeposit.amountUSDT} USDT</div>
              </div>
            </div>

            {/* IBAN & Reference code to copy */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Alıcı Adı / Unvan:</span>
                </div>
                <div className="text-white font-bold">{activeDeposit.ibanOwner}</div>
              </div>

              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Banka & IBAN:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeDeposit.iban);
                      setCopiedIBAN(true);
                      setTimeout(() => setCopiedIBAN(false), 2000);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedIBAN ? 'Kopyalandı!' : 'IBAN Kopyala'}
                  </button>
                </div>
                <div className="text-emerald-400 font-bold tracking-wider">{activeDeposit.iban}</div>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/40 p-3 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span>Havale Açıklamasına Yazılacak Kod (Zorunlu):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeDeposit.referenceCode);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedRef ? 'Kopyalandı!' : 'Kodu Kopyala'}
                  </button>
                </div>
                <div className="text-white text-base font-bold tracking-widest">{activeDeposit.referenceCode}</div>
                <p className="text-[10px] text-zinc-500">
                  * Otomatik eşleşme için banka açıklama alanına sadece bu referans kodunu yazınız.
                </p>
              </div>
            </div>

            {/* Receipt Upload Box */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono text-zinc-700">Ödemeyi Yaptıktan Sonra Dekont Ekleyin:</label>
              
              {activeDeposit.status === 'receipt_uploaded' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-3 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Dekontunuz iletildi ({activeDeposit.receiptFileName}). Finansçı onayladığında bakiye yansıyacaktır.</span>
                </div>
              ) : activeDeposit.status === 'verified_credited' ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Tebrikler! Finansçı ödemeyi onayladı ve {activeDeposit.amountUSDT} USDT bakiyenize aktarıldı.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Dekont dosya adı (Örn: fast_dekont.pdf)"
                      value={receiptFileName}
                      onChange={(e) => setReceiptFileName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-white"
                    />
                    <button
                      onClick={() => setReceiptFileName('dekont_' + Math.floor(1000 + Math.random() * 9000) + '.pdf')}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono rounded-lg"
                    >
                      Dosya Seç
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="İsteğe bağlı not (Gönderen adı vb.)"
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-white"
                  />
                  <button
                    onClick={handleUploadReceipt}
                    className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs font-mono flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    Havale Yaptım & Dekontu Gönder
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-zinc-200">
              <button
                onClick={() => {
                  setActiveDepositId(null);
                  setSelectedFinancier(null);
                }}
                className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
