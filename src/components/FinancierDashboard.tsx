import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowDownLeft, 
  FileText, 
  Percent,
  Wallet,
  Check
} from 'lucide-react';

export const FinancierDashboard: React.FC = () => {
  const { 
    currentUser, 
    deposits, 
    financiers, 
    financierApproveDeposit, 
    depositCollateral, 
    withdrawCollateral 
  } = useApp();

  const myFinancierOffer = financiers.find(f => f.financierId === currentUser.id);
  const myIncomingDeposits = deposits.filter(d => d.financierId === currentUser.id);

  // Selected deposit review modal
  const [inspectDeposit, setInspectDeposit] = useState<any | null>(null);

  // Collateral modal
  const [collateralAmount, setCollateralAmount] = useState(500);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pendingDeposits = myIncomingDeposits.filter(d => d.status === 'receipt_uploaded');
  const completedDeposits = myIncomingDeposits.filter(d => d.status === 'verified_credited');

  const handleApprove = (depositId: string) => {
    const res = financierApproveDeposit(depositId);
    setInspectDeposit(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Finansçı Masası & P2P On-Ramp Paneli
            </h1>
            <p className="text-xs font-mono text-zinc-500">
              {currentUser.username} • IBAN'dan Kriptoya Dönüşüm Masası
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700">
            Komisyon Oranınız: <strong className="text-purple-400">%{myFinancierOffer?.commissionRatePercent || 4.0}</strong>
          </span>
        </div>
      </div>

      {/* Collateral & Exposure Health Card */}
      <div className="bg-white border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-zinc-900 text-base">Güvence Bedeli & İşlem Kapasitesi</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            Aktif Masada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500">Yatırılan Teminat (Kilitli):</span>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {(myFinancierOffer?.collateralUSDT || currentUser.collateralUSDT).toFixed(2)} USDT
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500">Açık İşlemdekiler (Bloke):</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {(myFinancierOffer?.activeExposureUSDT || currentUser.activeExposureUSDT).toFixed(2)} USDT
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500">Kullanılabilir Açık Kapasite:</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(myFinancierOffer?.availableCapacityUSDT || 0).toFixed(2)} USDT
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs font-mono">
          <span className="text-zinc-500">
            * Alıcılar yalnızca kalan kapasiteniz kadar IBAN yükleme talebi açabilir.
          </span>
          <button
            onClick={() => {
              const res = depositCollateral(collateralAmount);
              setFeedback(res.message);
              setTimeout(() => setFeedback(null), 2500);
            }}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
          >
            + {collateralAmount} USDT Teminat Ekle
          </button>
        </div>

        {feedback && (
          <div className="p-2 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* PENDING TRANSFERS QUEUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-zinc-900">Onay Bekleyen Banka Havaleleri</h2>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full">
            {pendingDeposits.length} Dekont Bekliyor
          </span>
        </div>

        {pendingDeposits.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center text-xs font-mono text-zinc-500">
            Şu an inceleme bekleyen FAST/Havale talebi bulunmamaktadır.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDeposits.map(dep => (
              <div
                key={dep.id}
                className="bg-white border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white text-sm">#{dep.id}</span>
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                      {dep.amountTRY} TRY
                    </span>
                    <span className="text-zinc-500">➔</span>
                    <span className="text-emerald-400 font-bold">{dep.amountUSDT} USDT</span>
                  </div>

                  <div className="font-mono text-zinc-500 flex flex-wrap gap-2 text-[11px]">
                    <span>Alıcı: <strong className="text-zinc-800">{dep.buyerName}</strong></span>
                    <span>•</span>
                    <span>Banka: <strong className="text-zinc-800">{dep.bankName}</strong></span>
                    <span>•</span>
                    <span>Açıklama Kodu: <strong className="text-amber-400">{dep.referenceCode}</strong></span>
                  </div>

                  {dep.receiptFileName && (
                    <div className="text-[11px] font-mono text-zinc-700 flex items-center gap-1 mt-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Yüklenen Dekont: {dep.receiptFileName} ({dep.receiptNote || 'Not yok'})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(dep.id)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-medium font-mono text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <Check className="w-4 h-4" />
                    Havale Geldi & USDT'yi Aktar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TRANSFERS HISTORY */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">Geçmiş Tamamlanan İşlemler</h2>
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden text-xs font-mono">
          <table className="w-full text-left">
            <thead className="bg-white text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="p-3">İşlem ID</th>
                <th className="p-3">Müşteri</th>
                <th className="p-3">TRY Tutarı</th>
                <th className="p-3">Aktarılan USDT</th>
                <th className="p-3">Referans Kodu</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-zinc-700">
              {completedDeposits.map(d => (
                <tr key={d.id} className="hover:bg-zinc-50">
                  <td className="p-3 text-zinc-900 font-bold">{d.id}</td>
                  <td className="p-3">{d.buyerName}</td>
                  <td className="p-3 text-amber-400 font-bold">{d.amountTRY} ₺</td>
                  <td className="p-3 text-emerald-400 font-bold">{d.amountUSDT} USDT</td>
                  <td className="p-3 text-zinc-500">{d.referenceCode}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı
                    </span>
                  </td>
                </tr>
              ))}
              {completedDeposits.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-400">
                    Henüz tamamlanmış işlem kaydı bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
