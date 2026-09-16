import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Lock, 
  Send, 
  Paperclip, 
  Flame, 
  CheckCheck, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  Clock, 
  DollarSign, 
  Scale, 
  CheckCircle2, 
  Building2, 
  Store, 
  User, 
  Search, 
  Filter, 
  Key, 
  ChevronRight, 
  Info, 
  ExternalLink,
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Conversation, ChatMessageItem } from '../types';

export const MessagingHubView: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
    messages, 
    selectedConversationId, 
    setSelectedConversationId, 
    sendMessage,
    orders,
    deposits,
    confirmOrderReceipt,
    openDispute,
    financierApproveDeposit,
    setActiveView
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'order_escrow' | 'fiat_deposit' | 'dispute_arbitration' | 'direct'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState<'image' | 'coordinate' | 'receipt'>('image');
  const [attachmentData, setAttachmentData] = useState({ name: '', url: '', note: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // User must be participant or admin
      const isParticipant = conv.participants.some(p => p.userId === currentUser.id) || currentUser.role === 'admin';
      if (!isParticipant) return false;

      // Filter type
      if (filterType !== 'all' && conv.type !== filterType) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = conv.title.toLowerCase().includes(query);
        const matchSubtitle = conv.subtitle.toLowerCase().includes(query);
        const matchParticipant = conv.participants.some(p => p.username.toLowerCase().includes(query));
        return matchTitle || matchSubtitle || matchParticipant;
      }

      return true;
    });
  }, [conversations, currentUser, filterType, searchQuery]);

  // Active conversation
  const activeConversation = useMemo(() => {
    if (!selectedConversationId && filteredConversations.length > 0) {
      return filteredConversations[0];
    }
    return conversations.find(c => c.id === selectedConversationId) || filteredConversations[0] || null;
  }, [selectedConversationId, conversations, filteredConversations]);

  // Active conversation messages
  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages.filter(m => m.conversationId === activeConversation.id);
  }, [activeConversation, messages]);

  // Scroll to bottom of message thread on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Handle Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation) return;
    if (!messageInput.trim()) return;

    sendMessage(activeConversation.id, messageInput, {
      burnAfterReading
    });

    setMessageInput('');
    setBurnAfterReading(false);
  };

  // Quick Attachment send
  const handleSendAttachment = () => {
    if (!activeConversation) return;

    let attachmentObj: ChatMessageItem['attachment'];
    let defaultText = '';

    if (selectedAttachmentType === 'image') {
      attachmentObj = {
        type: 'image',
        name: attachmentData.name || 'zula_kanit_fotografi.jpg',
        url: attachmentData.url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        size: '1.4 MB'
      };
      defaultText = attachmentData.note || '📷 Şifreli görsel kanıt/fotoğraf eklendi.';
    } else if (selectedAttachmentType === 'coordinate') {
      attachmentObj = {
        type: 'coordinate',
        name: 'GPS Zula Koordinat Mührü',
        url: 'https://maps.google.com',
        size: 'GPS Pin'
      };
      defaultText = attachmentData.note || '📍 Koordinat: 41.0082° N, 28.9784° E (Ağaç kovuğu, manyetik kutu)';
    } else {
      attachmentObj = {
        type: 'receipt',
        name: attachmentData.name || 'banka_fast_dekontu.pdf',
        url: '#',
        size: '240 KB'
      };
      defaultText = attachmentData.note || '🏦 Banka FAST transfer dekontu eklendi.';
    }

    sendMessage(activeConversation.id, defaultText, {
      attachment: attachmentObj,
      burnAfterReading
    });

    setAttachmentModalOpen(false);
    setAttachmentData({ name: '', url: '', note: '' });
  };

  // Helper for linked order or deposit
  const linkedOrder = activeConversation?.type === 'order_escrow' || activeConversation?.type === 'dispute_arbitration'
    ? orders.find(o => o.id === activeConversation.referenceId)
    : null;

  const linkedDeposit = activeConversation?.type === 'fiat_deposit'
    ? deposits.find(d => d.id === activeConversation.referenceId)
    : null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'seller':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-500/30">SATICI</span>;
      case 'financier':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">FİNANSÇI</span>;
      case 'admin':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/30">HAKEM / ADMIN</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">ALICI</span>;
    }
  };

  const getEscrowBadge = (type: Conversation['type'], status?: string) => {
    if (type === 'dispute_arbitration') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 font-semibold animate-pulse">
          <Scale className="w-3 h-3" /> HAKEM HEYETİ İNCELEMESİNDE
        </span>
      );
    }
    if (type === 'fiat_deposit') {
      if (status === 'verified_credited') {
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> FAST TEYİT EDİLDİ (USDT YÜKLENDİ)
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
          <Clock className="w-3 h-3" /> FAST HAVALE MASASINDA BEKLİYOR
        </span>
      );
    }
    if (status === 'released_to_seller') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> EMANET SERBEST BIRAKILDI
        </span>
      );
    }
    if (status === 'drop_ready') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> ZULA HAZIR (ALICI KONTROLÜNDE)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center gap-1">
        <Lock className="w-3 h-3" /> AKILLI EMANET KİLİTLİ
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      {/* Top Protocol Security Banner */}
      <div className="bg-white border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 border border-emerald-500/40 flex items-center justify-center text-emerald-700 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 font-mono">
                  Şifreli İletişim & Escrow Odaları
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono border border-emerald-200">
                  PGP-256 E2E
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Alıcı, Satıcı, Finansçı ve Hakem Heyeti arasındaki tüm mesaj ve kanıt trafiği kriptografik mühür altındadır.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="bg-zinc-50/80 border border-zinc-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-zinc-600">
              <Key className="w-3.5 h-3.5 text-emerald-700" />
              <span>Aktif Kullanıcı: <strong className="text-white">{currentUser.username}</strong></span>
              {getRoleBadge(currentUser.role)}
            </div>
            <div className="bg-zinc-50/80 border border-zinc-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-zinc-600">
              <Flame className="w-3.5 h-3.5 text-amber-700" />
              <span>Oto-İmha Koruması: <strong className="text-amber-700">48 Saat</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Messaging Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left Column: Conversations Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white/90 border border-zinc-200 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Header & Search */}
          <div className="p-4 border-b border-zinc-200 space-y-3 bg-zinc-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 font-mono flex items-center gap-2">
                <span>Konuşma Odaları</span>
                <span className="px-1.5 py-0.2 rounded-full text-xs bg-zinc-50 text-zinc-500">
                  {filteredConversations.length}
                </span>
              </h2>
              <button 
                onClick={() => setFilterType('all')} 
                className="text-xs text-emerald-700 hover:underline font-mono"
              >
                Filtreyi Temizle
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Oda, ürün adı veya kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50/90 border border-zinc-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono scrollbar-thin">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterType === 'all' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilterType('order_escrow')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterType === 'order_escrow' 
                    ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' 
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                📦 Sipariş
              </button>
              <button
                onClick={() => setFilterType('fiat_deposit')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterType === 'fiat_deposit' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                🏦 FAST Havale
              </button>
              <button
                onClick={() => setFilterType('dispute_arbitration')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterType === 'dispute_arbitration' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                ⚠️ Hakem
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-zinc-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                <p>Seçilen kriterde aktif iletişim odası bulunamadı.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-zinc-50/90 border border-zinc-300 shadow-md ring-1 ring-emerald-500/30'
                        : 'hover:bg-zinc-50/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {conv.type === 'dispute_arbitration' ? (
                          <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                            <Scale className="w-3.5 h-3.5" />
                          </div>
                        ) : conv.type === 'fiat_deposit' ? (
                          <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="font-semibold text-xs text-white truncate font-mono">
                          {conv.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 line-clamp-1">
                      {conv.lastMessage}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-zinc-500 truncate">
                        {conv.participants.map(p => p.username).join(', ')}
                      </span>
                      {conv.escrowAmountUSDT && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {conv.escrowAmountUSDT} USDT
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Thread & Actions (8 cols) */}
        <div className="lg:col-span-8 bg-white/90 border border-zinc-200 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {activeConversation ? (
            <>
              {/* Room Header */}
              <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-zinc-900 font-mono">
                      {activeConversation.title}
                    </h2>
                    {getEscrowBadge(activeConversation.type, activeConversation.escrowStatus)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                    <span>{activeConversation.subtitle}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Lock className="w-3 h-3" /> Şifreli E2E Kanalı
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons according to context */}
                <div className="flex items-center gap-2">
                  {linkedOrder && (
                    <>
                      {linkedOrder.escrowStatus === 'drop_ready' && currentUser.id === linkedOrder.buyerId && (
                        <button
                          onClick={() => confirmOrderReceipt(linkedOrder.id, 5, 'Ürün başarıyla teslim alındı.')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-all shadow-md shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Zulayı Onayla & Fonu Çöz
                        </button>
                      )}

                      {linkedOrder.escrowStatus !== 'released_to_seller' && linkedOrder.escrowStatus !== 'disputed' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Lütfen itiraz gerekçenizi belirtin (örn: Belirtilen koordinatta zula yok):');
                            if (reason) openDispute(linkedOrder.id, reason);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono flex items-center gap-1 transition-all"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hakem Çağır (İtiraz)
                        </button>
                      )}

                      <button
                        onClick={() => setActiveView('my_orders')}
                        className="p-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-200 text-zinc-600 text-xs"
                        title="Sipariş detayına git"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {linkedDeposit && linkedDeposit.status === 'receipt_uploaded' && currentUser.id === linkedDeposit.financierId && (
                    <button
                      onClick={() => financierApproveDeposit(linkedDeposit.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-all shadow-md shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Havale Teyit Et ({linkedDeposit.amountUSDT} USDT Aktar)
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40">
                {activeMessages.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUser.id;
                  const isSystem = msg.isSystemEvent || msg.senderId === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-3">
                        <div className="max-w-xl w-full bg-white/90 border border-zinc-200 rounded-2xl p-3 text-center shadow-md">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[11px] font-bold font-mono text-emerald-700 uppercase tracking-wider">
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {msg.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-700 font-mono">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-300 flex items-center justify-center text-xs font-mono text-zinc-600 shrink-0">
                          {msg.senderName.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className={`max-w-md flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {/* Sender info */}
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                          <span className="font-semibold text-zinc-600">{msg.senderName}</span>
                          {getRoleBadge(msg.senderRole)}
                          <span className="text-[10px] text-zinc-400">{msg.timestamp}</span>
                        </div>

                        {/* Bubble */}
                        <div 
                          className={`rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                            isCurrentUser
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-bl-none'
                          }`}
                        >
                          {/* Burn tag */}
                          {msg.burnAfterReading && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-300 mb-1 border-b border-amber-400/20 pb-0.5">
                              <Flame className="w-3 h-3" />
                              <span>Okunduktan Sonra İmha Olacak</span>
                            </div>
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                          {/* Attachment preview if exists */}
                          {msg.attachment && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2">
                              {msg.attachment.type === 'coordinate' ? (
                                <div className="bg-white/80 border border-zinc-300 p-2 rounded-xl flex items-center gap-2 w-full">
                                  <MapPin className="w-4 h-4 text-emerald-700" />
                                  <div className="text-[11px] font-mono">
                                    <span className="text-zinc-700 font-bold">Zula Koordinat Verisi</span>
                                    <span className="block text-[10px] text-zinc-500">Şifreli GPS Mührü Çözüldü</span>
                                  </div>
                                </div>
                              ) : msg.attachment.type === 'receipt' ? (
                                <div className="bg-white/80 border border-zinc-300 p-2 rounded-xl flex items-center gap-2 w-full">
                                  <FileText className="w-4 h-4 text-purple-400" />
                                  <div className="text-[11px] font-mono">
                                    <span className="text-zinc-700 font-bold">{msg.attachment.name}</span>
                                    <span className="block text-[10px] text-zinc-500">{msg.attachment.size} • FAST Dekontu</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 w-full">
                                  <img 
                                    src={msg.attachment.url} 
                                    alt="Zula Kanıtı" 
                                    className="rounded-lg object-cover max-h-40 w-full border border-zinc-300" 
                                  />
                                  <span className="text-[10px] font-mono text-zinc-600 block">
                                    📎 {msg.attachment.name} ({msg.attachment.size})
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Encrypted check badge */}
                        <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
                          <Lock className="w-2.5 h-2.5 text-emerald-600/70" />
                          <span>Mühürlü İletim</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Controls */}
              <div className="p-3 border-t border-zinc-200 bg-zinc-50">
                {/* Ephemeral burn mode toggle banner */}
                {burnAfterReading && (
                  <div className="bg-amber-50 border border-amber-500/30 rounded-lg px-3 py-1.5 mb-2 flex items-center justify-between text-xs text-amber-300 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                      <span>Kendi Kendini İmha Eden Mesaj Modu Aktif (Tek Seferlik Gösterim)</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setBurnAfterReading(false)}
                      className="text-zinc-500 hover:text-zinc-900"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {/* Attachment trigger */}
                    <button
                      type="button"
                      onClick={() => setAttachmentModalOpen(true)}
                      className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors"
                      title="Kanıt, Dekont veya Zula Koordinatı Ekle"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Burn after reading toggle */}
                    <button
                      type="button"
                      onClick={() => setBurnAfterReading(!burnAfterReading)}
                      className={`p-2 rounded-xl transition-colors ${
                        burnAfterReading 
                          ? 'bg-amber-500/20 text-amber-700 border border-amber-500/40' 
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-500'
                      }`}
                      title="Kendi Kendini İmha Eden Mesaj"
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="Şifreli mesajınızı yazın... (Enter ile gönder)"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-zinc-50/90 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-md shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gönder</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
              <Shield className="w-12 h-12 mb-3 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-900 font-mono mb-1">Görüşme Odası Seçiniz</h3>
              <p className="text-xs max-w-sm">
                Sol panelden sipariş escrow odası, FAST yükleme masası veya hakem anlaşmazlık başlığını seçerek iletişime geçebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attachment / Kanıt Paylaşım Modalı */}
      {attachmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 font-mono flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-700" />
                <span>Şifreli Ek & Kanıt Gönder</span>
              </h3>
              <button onClick={() => setAttachmentModalOpen(false)} className="text-zinc-500 hover:text-zinc-900">✕</button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedAttachmentType('image')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  selectedAttachmentType === 'image'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Zula Fotoğrafı</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAttachmentType('coordinate')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  selectedAttachmentType === 'coordinate'
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>GPS Zula Pini</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAttachmentType('receipt')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  selectedAttachmentType === 'receipt'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Banka Dekontu</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 font-mono mb-1">Dosya / Ek Başlığı</label>
                <input 
                  type="text"
                  placeholder={selectedAttachmentType === 'image' ? 'zula_yaklasim_foto.jpg' : selectedAttachmentType === 'coordinate' ? 'Kadıköy Rıhtım GPS Pini' : 'garanti_fast_dekont.pdf'}
                  value={attachmentData.name}
                  onChange={(e) => setAttachmentData({ ...attachmentData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono mb-1">Açıklama / Şifreli Not</label>
                <textarea 
                  rows={2}
                  placeholder="Karşı tarafa iletilecek not veya zula açılış şifresi..."
                  value={attachmentData.note}
                  onChange={(e) => setAttachmentData({ ...attachmentData, note: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setAttachmentModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 text-zinc-600 text-xs font-mono"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSendAttachment}
                className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium text-xs font-mono flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Şifrele ve Odaya Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
