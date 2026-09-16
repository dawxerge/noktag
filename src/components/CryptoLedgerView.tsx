import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  QrCode, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Info, 
  AlertCircle, 
  Zap, 
  Building2, 
  Hash, 
  Key,
  DollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CryptoTransaction } from '../types';

export const CryptoLedgerView: React.FC = () => {
  const { 
    currentUser, 
    cryptoTransactions, 
    executeCryptoDeposit, 
    executeCryptoWithdrawal, 
    orders, 
    deposits, 
    users, 
    settings,
    setActiveView,
    openOrderConversation,
    openDepositConversation
  } = useApp();

  const [activeTab, setActiveTab] = useState<'explorer' | 'deposit' | 'withdraw'>('explorer');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterNetwork, setFilterNetwork] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<CryptoTransaction | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositNetwork, setDepositNetwork] = useState<'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon'>('TRC-20');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawNetwork, setWithdrawNetwork] = useState<'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon'>('TRC-20');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('TL5hW7K14zPZg12o84LkqX9b39w1XfR');
  const [withdrawStatusMsg, setWithdrawStatusMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // TVL and volume calculations
  const totalValueLocked = useMemo(() => {
    return orders
      .filter(o => ['in_escrow', 'preparing_live_drop', 'drop_ready', 'disputed'].includes(o.escrowStatus))
      .reduce((sum, o) => sum + o.productPriceUSDT, 0);
  }, [orders]);

  const totalCollateralLocked = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.collateralUSDT || 0), 0);
  }, [users]);

  const totalPlatformFeesCollected = useMemo(() => {
    return cryptoTransactions
      .filter(tx => tx.type === 'platform_fee')
      .reduce((sum, tx) => sum + tx.amountUSDT, 0);
  }, [cryptoTransactions]);

  const total24hVolume = useMemo(() => {
    return cryptoTransactions.reduce((sum, tx) => sum + tx.amountUSDT, 0);
  }, [cryptoTransactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return cryptoTransactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterNetwork !== 'all' && tx.network !== filterNetwork) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchHash = tx.txHash.toLowerCase().includes(query);
        const matchFrom = tx.fromAddress.toLowerCase().includes(query);
        const matchTo = tx.toAddress.toLowerCase().includes(query);
        const matchOrder = tx.relatedOrderId?.toLowerCase().includes(query);
        const matchDeposit = tx.relatedDepositId?.toLowerCase().includes(query);
        const matchNote = tx.note?.toLowerCase().includes(query);
        return matchHash || matchFrom || matchTo || matchOrder || matchDeposit || matchNote;
      }

      return true;
    });
  }, [cryptoTransactions, filterType, filterNetwork, searchQuery]);

  // Execute Deposit
  const handlePerformDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    const res = executeCryptoDeposit(depositAmount, depositNetwork);
    if (res.success) {
      setDepositSuccessMsg(res.message);
      setTimeout(() => setDepositSuccessMsg(null), 6000);
    }
  };

  // Execute Withdrawal
  const handlePerformWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const res = executeCryptoWithdrawal(withdrawAmount, withdrawNetwork, withdrawAddress);
    setWithdrawStatusMsg(res);
    setTimeout(() => setWithdrawStatusMsg(null), 6000);
  };

  const getTxTypeBadge = (type: CryptoTransaction['type']) => {
    switch (type) {
      case 'escrow_lock':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-500/30 flex items-center gap-1">
            <Lock className="w-3 h-3" /> EMANET KİLİTLENDİ
          </span>
        );
      case 'escrow_release':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Unlock className="w-3 h-3" /> SATICIYA ÇÖZÜLDÜ
          </span>
        );
      case 'deposit':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3" /> KRİPTO YATIRMA
          </span>
        );
      case 'withdrawal':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> DIŞ CÜZDAN ÇEKİMİ
          </span>
        );
      case 'platform_fee':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-1000/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> KOMİSYON REZERVİ
          </span>
        );
      case 'collateral_deposit':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" /> TEMİNAT BLOKAJI
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-50 text-zinc-500 border border-zinc-300">
            {type}
          </span>
        );
    }
  };

  const getNetworkBadge = (network: string) => {
    switch (network) {
      case 'TRC-20':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/30 font-bold">TRON TRC-20</span>;
      case 'BEP-20':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold">BSC BEP-20</span>;
      case 'ERC-20':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">ETH ERC-20</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold">POLYGON</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-6">
      {/* Top Banner: Protocol Overview & Status */}
      <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  noktag Kripto Defteri & Blokzincir Takip Masası
                </h1>
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
                  ON-CHAIN ESCROW V2
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Alıcı, satıcı ve finansçılar arasındaki tüm USDT para hareketleri, escrow akıllı sözleşme kilitleri ve komisyon tahsilatları bu şeffaf blokzincir defterinde anlık olarak doğrulanır.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#181c26] p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                activeTab === 'explorer'
                  ? 'bg-white dark:bg-[#141720] text-zinc-900 dark:text-zinc-100 font-bold shadow-xs border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>İşlem Defteri (Explorer)</span>
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                activeTab === 'deposit'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Kripto Yatır (Deposit)</span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                activeTab === 'withdraw'
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-bold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-purple-400'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Dış Cüzdana Çek</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network Metrics & TVL Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: TVL in Escrow */}
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>KİLİTLİ ESCROW FONU (TVL)</span>
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalValueLocked.toFixed(2)} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">USDT</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Açıkta teslimat bekleyen zula siparişleri
            </div>
          </div>
          <div className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 w-fit font-medium">
            Akıllı Sözleşme Korumasında
          </div>
        </div>

        {/* Metric 2: Total Collateral Guarantee */}
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>GÜVENCE TEMİNAT HAVUZU</span>
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalCollateralLocked.toFixed(2)} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">USDT</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Satıcı ve Finansçı rehin teminatları
            </div>
          </div>
          <div className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 w-fit font-medium">
            %100 Karşılıklı İşlem Limiti
          </div>
        </div>

        {/* Metric 3: Total 24h Ledger Volume */}
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>24 SAATLİK TRANSFER HACMİ</span>
            <Zap className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {total24hVolume.toFixed(2)} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">USDT</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {cryptoTransactions.length} adet zincir içi işlem
            </div>
          </div>
          <div className="text-[10px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 w-fit font-medium">
            TRC-20 & BEP-20 Doğrulanmış
          </div>
        </div>

        {/* Metric 4: Platform Treasury Fee Revenue */}
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>PLATFORM KOMİSYON KASASI</span>
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalPlatformFeesCollected.toFixed(2)} <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">USDT</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Tamamlanan sipariş geliri (%{settings.platformFeePercent})
            </div>
          </div>
          <div className="text-[10px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50 w-fit font-medium">
            Hazine Rezerv Havuzu
          </div>
        </div>
      </div>

      {/* Tab 1: On-Chain Explorer & Transaction Ledger */}
      {activeTab === 'explorer' && (
        <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          {/* Explorer Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Zincir İçi İşlem Defteri (Ledger)</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                  {filteredTransactions.length} Kayıt
                </span>
              </h2>
            </div>

            {/* Search and Network selector */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="TxHash, Cüzdan veya Sipariş No..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:border-zinc-400 outline-none"
              >
                <option value="all">Tüm İşlem Tipleri</option>
                <option value="escrow_lock">Escrow Kilidi (Lock)</option>
                <option value="escrow_release">Escrow Serbest Bırakma (Release)</option>
                <option value="deposit">Kripto / FAST Yükleme</option>
                <option value="withdrawal">Dış Cüzdan Çekimi</option>
                <option value="platform_fee">Platform Komisyonu</option>
              </select>

              {/* Network Filter */}
              <select
                value={filterNetwork}
                onChange={(e) => setFilterNetwork(e.target.value)}
                className="bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:border-zinc-400 outline-none"
              >
                <option value="all">Tüm Ağlar</option>
                <option value="TRC-20">TRC-20 (Tron)</option>
                <option value="BEP-20">BEP-20 (BSC)</option>
                <option value="ERC-20">ERC-20 (Ethereum)</option>
                <option value="Polygon">Polygon</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-[#181c26]">
                  <th className="py-3 px-3 font-semibold">İşlem Hash (TxHash)</th>
                  <th className="py-3 px-3 font-semibold">İşlem Tipi</th>
                  <th className="py-3 px-3 font-semibold">Ağ</th>
                  <th className="py-3 px-3 text-right font-semibold">Tutar (USDT)</th>
                  <th className="py-3 px-3 font-semibold">Gönderen / Alıcı</th>
                  <th className="py-3 px-3 text-center font-semibold">Onay</th>
                  <th className="py-3 px-3 font-semibold">Zaman</th>
                  <th className="py-3 px-3 text-right font-semibold">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredTransactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    {/* Hash with copy icon */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-mono font-medium">
                        <span>{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(tx.txHash, tx.id);
                          }}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          title="Hash'i Kopyala"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {copiedText === tx.id && (
                          <span className="text-[10px] text-emerald-600 font-medium">Kopyalandı!</span>
                        )}
                      </div>
                      {tx.relatedOrderId && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-medium">
                          <span>📦 Sipariş #{tx.relatedOrderId}</span>
                        </div>
                      )}
                      {tx.relatedDepositId && (
                        <div className="text-[10px] text-purple-700 dark:text-purple-400 flex items-center gap-1 mt-0.5 font-medium">
                          <span>🏦 FAST Yükleme #{tx.relatedDepositId}</span>
                        </div>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      {getTxTypeBadge(tx.type)}
                    </td>

                    {/* Network */}
                    <td className="py-3 px-3">
                      {getNetworkBadge(tx.network)}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                      {tx.amountUSDT.toFixed(2)} USDT
                      <div className="text-[10px] text-zinc-400 font-normal">
                        Gaz: {tx.feeUSDT} USDT
                      </div>
                    </td>

                    {/* Sender / Receiver */}
                    <td className="py-3 px-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <div className="truncate max-w-[150px]" title={tx.fromAddress}>
                        Kimden: {tx.fromAddress.slice(0, 10)}...
                      </div>
                      <div className="truncate max-w-[150px] text-zinc-700 dark:text-zinc-300" title={tx.toAddress}>
                        Kime: {tx.toAddress.slice(0, 10)}...
                      </div>
                    </td>

                    {/* Confirmations */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-1 w-fit mx-auto font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {tx.confirmations}/{tx.requiredConfirmations}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <div className="text-[10px] text-zinc-400">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Inspect button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Direct On-Chain Deposit */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deposit Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Doğrudan Kripto Cüzdanından Bakiye Yatır (Deposit)</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                noktag Akıllı Escrow Cüzdan Havuzuna aktarılan USDT miktarı ağ onayı ile birlikte anında bakiyenize yansır.
              </p>
            </div>

            {depositSuccessMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">AĞ ONAYI TAMAMLANDI</div>
                  <div>{depositSuccessMsg}</div>
                </div>
              </div>
            )}

            <form onSubmit={handlePerformDeposit} className="space-y-4">
              {/* Network Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Blokzincir Ağı Seçiniz
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(['TRC-20', 'BEP-20', 'ERC-20', 'Polygon'] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setDepositNetwork(net)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        depositNetwork === net
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/50'
                          : 'bg-zinc-50 dark:bg-[#1a1e2a] border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      <div>{net}</div>
                      <div className="text-[10px] font-normal text-zinc-400 mt-1">
                        {net === 'TRC-20' ? '~19 Onay' : net === 'BEP-20' ? '~15 Onay' : '~12 Onay'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Yatırılacak Miktar (USDT)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="10"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    USDT
                  </span>
                </div>
                {/* Quick amount chips */}
                <div className="flex items-center gap-2 mt-2 text-xs">
                  {[50, 100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Escrow Address Info */}
              <div className="bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Platform Emanet Havuz Adresi ({depositNetwork})</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('TFz1noktag99EscrowWalletSecureTRC20', 'dep-addr')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Kopyala</span>
                  </button>
                </div>
                <div className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all bg-white dark:bg-[#141720] p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  {depositNetwork === 'TRC-20' 
                    ? 'TFz1noktag99EscrowWalletSecureTRC20'
                    : '0x71C2b8449D4F28D5bA95d3F6335D2034988fB7c1'}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Blokzincir Yatırma İşlemini Simüle Et & Bakiyeyi Güncelle</span>
              </button>
            </form>
          </div>

          {/* QR Code & Safety Explanations (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between space-y-4">
            <div className="text-center space-y-2">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Mobil Cüzdan QR Kodu
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Binance, TrustWallet veya TronLink ile tarayarak anında gönderebilirsiniz.
              </p>
            </div>

            {/* Simulated QR Code Canvas */}
            <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-xs flex flex-col items-center justify-center border-2 border-emerald-300 dark:border-emerald-600">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-zinc-50 rounded-lg">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-xs ${i % 2 === 0 || i % 7 === 0 ? 'bg-zinc-900' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Önemli Yatırma Kuralları</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Yalnızca seçtiğiniz ağdan (ör. {depositNetwork}) USDT gönderin.</li>
                <li>Minimum yatırma limiti: <strong>10 USDT</strong>.</li>
                <li>Kripto kullanamıyorsanız, <strong>"IBAN to Crypto (Finansçılar)"</strong> menüsünden FAST ile saniyeler içinde yükleme yapabilirsiniz.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Withdrawal to External Wallet */}
      {activeTab === 'withdraw' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Dış Kripto Cüzdanına Çekim Yap (Withdrawal)</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              noktag cüzdanınızdaki USDT bakiyenizi kendi harici borsa veya donanım cüzdanınıza aktarın.
            </p>
          </div>

          {/* Current balance chip */}
          <div className="bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Çekilebilir Bakiye</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{currentUser.balanceUSDT.toFixed(2)} USDT</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Kullanıcı Rolü</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">{currentUser.role}</span>
            </div>
          </div>

          {withdrawStatusMsg && (
            <div className={`border rounded-xl p-4 flex items-start gap-3 text-xs ${
              withdrawStatusMsg.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}>
              {withdrawStatusMsg.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{withdrawStatusMsg.success ? 'ÇEKİM İŞLEMİ BAŞARILI' : 'ÇEKİM HATASI'}</div>
                <div>{withdrawStatusMsg.message}</div>
              </div>
            </div>
          )}

          <form onSubmit={handlePerformWithdrawal} className="space-y-4 text-xs">
            {/* Network Selector */}
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-2">Çekim Ağı</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['TRC-20', 'BEP-20', 'ERC-20', 'Polygon'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setWithdrawNetwork(net)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      withdrawNetwork === net
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-800 dark:text-purple-300 ring-1 ring-purple-500/50'
                        : 'bg-zinc-50 dark:bg-[#1a1e2a] border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <div>{net}</div>
                    <div className="text-[10px] font-normal text-zinc-400 mt-0.5">
                      Ücret: {net === 'TRC-20' ? '1.0 USDT' : net === 'BEP-20' ? '0.25 USDT' : '5.0 USDT'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Alıcı Cüzdan Adresi ({withdrawNetwork})</label>
              <input 
                type="text"
                placeholder="Örn: TL5hW7K14zPZg12o84LkqX9b39w1XfR..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-purple-500 outline-none font-mono"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Çekilecek Miktar (USDT)</label>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(Math.floor(currentUser.balanceUSDT))}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Tümünü Çek (Maksimum)
                </button>
              </div>
              <input 
                type="number"
                min="5"
                max={currentUser.balanceUSDT}
                step="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Fee summary breakdown */}
            <div className="bg-zinc-50 dark:bg-[#1a1e2a] border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Brüt Çekim Tutarı:</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">{withdrawAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>Ağ Madenci Ücreti (Gas Fee):</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  -{withdrawNetwork === 'TRC-20' ? '1.00' : withdrawNetwork === 'BEP-20' ? '0.25' : '5.00'} USDT
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <span>Hesabınıza Geçecek Net Tutar:</span>
                <span>
                  {Math.max(0, withdrawAmount - (withdrawNetwork === 'TRC-20' ? 1.0 : withdrawNetwork === 'BEP-20' ? 0.25 : 5.0)).toFixed(2)} USDT
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={currentUser.balanceUSDT < withdrawAmount || withdrawAmount <= 0}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Çekim İşlemini Onayla & Gönder</span>
            </button>
          </form>
        </div>
      )}

      {/* Transaction Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141720] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Zincir İçi İşlem Detayı (Tx Receipt)</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">TRANSACTION HASH</span>
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-[#1a1e2a] p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[11px] font-mono break-all">
                  <span>{selectedTx.txHash}</span>
                  <button
                    onClick={() => handleCopy(selectedTx.txHash, 'modal-hash')}
                    className="ml-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">İŞLEM TİPİ</span>
                  <div className="mt-1">{getTxTypeBadge(selectedTx.type)}</div>
                </div>

                <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">AĞ & BLOK</span>
                  <div className="mt-1 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {getNetworkBadge(selectedTx.network)}
                    <span className="text-[11px] text-zinc-500 font-mono">#{selectedTx.blockNumber || '48921000'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">TUTAR</span>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {selectedTx.amountUSDT.toFixed(2)} USDT
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">AĞ KOMİSYONU (GAS)</span>
                  <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mt-1">
                    {selectedTx.feeUSDT.toFixed(2)} USDT
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">GÖNDEREN ADRES (FROM)</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px] break-all">{selectedTx.fromAddress}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">ALICI ADRES (TO / CONTRACT)</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px] break-all">{selectedTx.toAddress}</span>
                </div>
              </div>

              {selectedTx.note && (
                <div className="bg-zinc-50 dark:bg-[#1a1e2a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-medium">PROTOKOL NOTU</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedTx.note}</span>
                </div>
              )}

              {/* Jump links if related to order or deposit */}
              {selectedTx.relatedOrderId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                  <span className="text-amber-800 dark:text-amber-300 font-medium">Bu işlem Sipariş #{selectedTx.relatedOrderId} ile ilişkilidir.</span>
                  <button
                    onClick={() => {
                      setSelectedTx(null);
                      openOrderConversation(selectedTx.relatedOrderId!);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Sohbete Git</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedTx.relatedDepositId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50">
                  <span className="text-purple-800 dark:text-purple-300 font-medium">Bu işlem FAST Havale #{selectedTx.relatedDepositId} ile ilişkilidir.</span>
                  <button
                    onClick={() => {
                      setSelectedTx(null);
                      openDepositConversation(selectedTx.relatedDepositId!);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Masaya Git</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
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
