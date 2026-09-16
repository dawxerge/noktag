import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Smartphone, 
  Bot, 
  CheckCheck, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Zap, 
  Settings, 
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Compass,
  Crosshair,
  Radar,
  Navigation,
  ChevronDown
} from 'lucide-react';
import { 
  calculateDistanceKm, 
  formatDistance, 
  getProductCoordinates, 
  detectLocationFromText, 
  POPULAR_LOCATIONS,
  UserGeoLocation 
} from '../utils/geoUtils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  inlineButtons?: { text: string; action: string }[];
}

export const TelegramBotSimulator: React.FC = () => {
  const { currentUser, orders, products, settings, setActiveView, userLocation, setUserLocation, createOrder } = useApp();

  const [inputCommand, setInputCommand] = useState('');
  const [activeTab, setActiveTab] = useState<'simulator' | 'bot_config'>('simulator');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [botToken, setBotToken] = useState('7819234819:AAFi_noktag_escrow_secret_key');
  const [webhookUrl, setWebhookUrl] = useState('https://api.noktag.com/webhook/telegram');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: `🛡️ *noktag.com Resmi Escrow & Drop Botu*

Hoş geldiniz *${currentUser.username}*!

Buradan:
• 📍 *Bana Yakın Ne Var?* ile çevrenizdeki zulaları harita/mesafe radarıyla bulabilir
• Kripto bakiyenizi ve teminatları yönetebilir
• Hazır (Dead) ve Canlı (Live) zulaları görüntüleyebilir
• Finansçılar ile IBAN'dan anında kripto yükleyebilir
• Canlı zulanız hazırlandığında anlık GPS bildirimi alabilirsiniz.

Lütfen bir işlem seçin:`,
      timestamp: '12:00',
      inlineButtons: [
        { text: '📍 Bana Yakın Ne Var? (Radar)', action: '/yakinimda' },
        { text: '🛒 Pazar Yeri & Zulalar', action: '/market' },
        { text: '📦 Aktif Siparişlerim', action: '/siparisler' },
        { text: '💳 Cüzdan & Bakiye', action: '/cuzdan' },
        { text: '🏦 Finansçı (IBAN/FAST)', action: '/finans' },
      ],
    },
  ]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputCommand('');
    setShowLocationPicker(false);

    // Bot Response Logic
    setTimeout(() => {
      let botResponse: ChatMessage;
      const lower = text.toLowerCase();

      // Check for location actions or text containing location keywords
      const detectedLocation = detectLocationFromText(text);

      if (
        lower.includes('/yakinimda') || 
        lower.includes('/konum') || 
        lower.includes('/radar') || 
        lower.includes('yakın') || 
        lower.includes('nerede') ||
        lower.includes('bana yakın ne var')
      ) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `🎯 *noktag.com Çevresel Zula Radarı*

Mevcut Referans Konum: *${userLocation ? userLocation.name : 'Henüz Belirlenmedi'}*

Yakınınızdaki hazır (Dead Drop) ve canlı (Live Drop) zulaları görüntülemek için:
• Aşağıdaki semt butonlarından birine dokunun
• Veya alttaki 📍 *Konum* tuşuyla canlı GPS koordinatınızı gönderin
• Ya da mesaj olarak semtinizi veya koordinatları yazın (örn: *Kadıköy*, *Beşiktaş*, *41.04, 29.00*)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '📍 Canlı GPS Konumumu Paylaş', action: 'send_live_gps' },
            { text: '🏙️ Beşiktaş / Bebek', action: 'loc_besiktas' },
            { text: '🏙️ Kadıköy / Moda', action: 'loc_kadikoy' },
            { text: '🏙️ Şişli / Maçka', action: 'loc_sisli' },
            { text: '🏙️ Üsküdar / Sahil', action: 'loc_uskudar' },
            { text: '🏙️ Ankara / Tunalı', action: 'loc_ankara' },
            { text: '🏙️ İzmir / Alsancak', action: 'loc_izmir' },
          ],
        };
      } else if (text.startsWith('loc_') || text === 'send_live_gps' || detectedLocation) {
        // Location provided!
        let targetLoc: UserGeoLocation;
        if (text === 'send_live_gps') {
          targetLoc = {
            name: 'Canlı GPS Konumu (41.0428, 29.0077)',
            lat: 41.0428,
            lng: 29.0077,
            source: 'gps',
            accuracyMeters: 8,
          };
        } else if (text === 'loc_besiktas') {
          targetLoc = POPULAR_LOCATIONS[0];
        } else if (text === 'loc_kadikoy') {
          targetLoc = POPULAR_LOCATIONS[1];
        } else if (text === 'loc_sisli') {
          targetLoc = POPULAR_LOCATIONS[2];
        } else if (text === 'loc_uskudar') {
          targetLoc = POPULAR_LOCATIONS[3];
        } else if (text === 'loc_ankara') {
          targetLoc = POPULAR_LOCATIONS[4];
        } else if (text === 'loc_izmir') {
          targetLoc = POPULAR_LOCATIONS[5];
        } else {
          targetLoc = detectedLocation!;
        }

        setUserLocation(targetLoc);

        // Calculate distance to all products and sort by closest
        const productsWithDist = products
          .map(p => {
            const coords = getProductCoordinates(p);
            const dist = coords
              ? calculateDistanceKm(targetLoc.lat, targetLoc.lng, coords.lat, coords.lng)
              : 9999;
            return { product: p, coords, dist };
          })
          .sort((a, b) => a.dist - b.dist);

        const topNearby = productsWithDist.slice(0, 4);

        const messageBody =
          `📍 *Konum Doğrulandı:* ${targetLoc.name}\n` +
          `🛰️ *Radar Taraması: Çevrenizdeki En Yakın ${topNearby.length} Zula Tespit Edildi*\n\n` +
          topNearby
            .map((item, idx) => {
              const p = item.product;
              const isDead = p.dropType === 'dead_drop';
              return (
                `${idx + 1}. 🎯 *[${formatDistance(item.dist)}]* *${p.title}*\n` +
                `   Tür: ${isDead ? '⚡ Dead Drop (Hazır Zula)' : `⏱️ Live Drop (${p.prepTimeMinutes} dk Hazırlık)`}\n` +
                `   Fiyat: \`${p.priceUSDT} USDT\` (≈ ${(p.priceUSDT * 39).toFixed(0)} TRY)\n` +
                `   Bölge: ${p.district}\n` +
                `   Satıcı: ${p.sellerName} ⭐ ${p.sellerRating} (%${p.sellerTrustScore})`
              );
            })
            .join('\n\n') +
          `\n\n💡 _Aşağıdaki butonlarla ürünü doğrudan Escrow ile satın alabilir veya web radarında haritayı açabilirsiniz:_`;

        const inlineButtons: { text: string; action: string }[] = [];
        if (topNearby[0]) {
          inlineButtons.push({
            text: `🛒 1. Ürünü Al (${topNearby[0].product.priceUSDT} USDT)`,
            action: `buy_${topNearby[0].product.id}`,
          });
        }
        if (topNearby[1]) {
          inlineButtons.push({
            text: `🛒 2. Ürünü Al (${topNearby[1].product.priceUSDT} USDT)`,
            action: `buy_${topNearby[1].product.id}`,
          });
        }
        inlineButtons.push({ text: '🗺️ Web Radar Haritasını Aç', action: 'open_web_market' });
        inlineButtons.push({ text: '🔄 Başka Konum Tara', action: '/yakinimda' });

        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: messageBody,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons,
        };
      } else if (text.startsWith('buy_')) {
        const prodId = text.replace('buy_', '');
        const targetProd = products.find(p => p.id === prodId);

        if (!targetProd) {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: '❌ Ürün bulunamadı veya stok tükendi.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            inlineButtons: [{ text: '🛒 Pazaryeri', action: '/market' }],
          };
        } else {
          const res = createOrder(targetProd.id, 'Telegram Bot Hızlı Siparişi');
          if (res.success) {
            const isDead = targetProd.dropType === 'dead_drop';
            const deadDetails = targetProd.deadDropCoordinates;

            let detailsText = '';
            if (isDead && deadDetails) {
              detailsText =
                `\n\n🔓 *ZULA DETAYLARI & GİZLİ KOORDİNATLAR:*\n` +
                `• GPS: \`${deadDetails.lat}, ${deadDetails.lng}\`\n` +
                `• Semt: ${deadDetails.district}\n` +
                `• Zula İpucu: ${deadDetails.addressHint}\n` +
                `• Kamuflaj: ${deadDetails.stealthInstructions}\n\n` +
                `⚠️ Ürünü zuladan aldıktan sonra web panelinden "Teslim Aldım" onayı vermeyi unutmayın.`;
            } else {
              detailsText =
                `\n\n⏱️ *CANLI ZULA HAZIRLANIYOR:*\n` +
                `Satıcı ${targetProd.prepTimeMinutes} dakika içinde belirlediğiniz bölgeye zulayı yerleştirip koordinatları yükleyecektir.\n` +
                `Zula bırakıldığı anda Telegram push bildiriminiz gelecektir.`;
            }

            botResponse = {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text:
                `✅ *Escrow Emanet Siparişi Başarıyla Oluşturuldu! (#${res.orderId})*\n\n` +
                `Ürün: *${targetProd.title}*\n` +
                `Tutar: \`${targetProd.priceUSDT} USDT\` akıllı emanet havuzunda kilitlendi.` +
                detailsText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              inlineButtons: [
                { text: '📦 Siparişlerime Git', action: 'open_web_orders' },
                { text: '🛒 Pazaryeri', action: '/market' },
              ],
            };
          } else {
            botResponse = {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text: `⚠️ *Sipariş Oluşturulamadı:*\n\n${res.message}\n\nMevcut Bakiyeniz: \`${currentUser.balanceUSDT} USDT\`\nÜrün Tutarı: \`${targetProd.priceUSDT} USDT\``,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              inlineButtons: [
                { text: '💳 Cüzdana USDT Yükle', action: '/cuzdan' },
                { text: '🏦 Finansçı (IBAN/FAST)', action: '/finans' },
              ],
            };
          }
        }
      } else if (lower.includes('/start') || lower.includes('merhaba') || lower.includes('başla')) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `👋 *noktag.com Escrow Menüsü:*\n\nBakiye: \`${currentUser.balanceUSDT} USDT\`\nGüven Skoru: \`%${currentUser.reputation.trustScore}\`\n\nNeyi incelemek istersiniz?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '📍 Bana Yakın Ne Var? (Radar)', action: '/yakinimda' },
            { text: '🛒 Pazar Yeri', action: '/market' },
            { text: '📦 Siparişlerim', action: '/siparisler' },
            { text: '💳 Cüzdan', action: '/cuzdan' },
          ],
        };
      } else if (lower.includes('/market') || lower.includes('ürün') || lower.includes('pazar')) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `📍 *Aktif Zula Listesi (${products.length} İlan):*\n\n` +
            products.slice(0, 3).map(p => 
              `• *${p.title}*\n  Tür: ${p.dropType === 'dead_drop' ? '⚡ Dead Drop (Hazır)' : '⏱️ Live Drop (' + p.prepTimeMinutes + ' dk)'}\n  Fiyat: \`${p.priceUSDT} USDT\` (${p.city})\n`
            ).join('\n'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '📍 Bana Yakın Ne Var? (Radar)', action: '/yakinimda' },
            { text: '🌐 Web Uygulamasında Satın Al', action: 'open_web_market' },
            { text: '💳 Bakiye Yükle', action: '/cuzdan' }
          ]
        };
      } else if (lower.includes('/cuzdan') || lower.includes('/bakiye') || lower.includes('para')) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `💳 *Cüzdan Durumu:*\n\nKullanıcı: \`${currentUser.username}\`\nMevcut Bakiye: \`${currentUser.balanceUSDT} USDT\`\n\nKripto adresiniz (TRC20):\n\`TFz1noktag99EscrowWalletSecureTRC20\`\n\nKriptonuz yoksa Finansçı masası ile FAST/IBAN üzerinden de yükleyebilirsiniz:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '🏦 IBAN ile Yükle (Finansçı)', action: '/finans' },
            { text: '🔄 Bakiye Yenile', action: '/cuzdan' }
          ]
        };
      } else if (lower.includes('/siparisler') || lower.includes('zula')) {
        const myOrders = orders.filter(o => o.buyerId === currentUser.id);
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `📦 *Siparişleriniz (${myOrders.length} Adet):*\n\n` +
            (myOrders.length > 0 
              ? myOrders.map(o => `• #${o.id} - ${o.productTitle}\n  Durum: \`${o.escrowStatus}\` | ${o.productPriceUSDT} USDT`).join('\n\n')
              : 'Aktif bir siparişiniz bulunmamaktadır.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '📍 Zula Koordinatlarını Aç', action: 'open_web_orders' },
            { text: '🛒 Yeni Sipariş Ver', action: '/market' }
          ]
        };
      } else if (lower.includes('/finans') || lower.includes('iban')) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `🏦 *Finansçılar Masası (IBAN to Crypto):*\n\nKripto cüzdanı olmayanlar için teminatlı Finansçılarımız FAST havalesi karşılığında hesabınıza USDT tanımlar.\n\nAktif Masalar:\n• *Atlas_P2P_Finans* (%4 Komisyon, Teminat: 3,000 USDT)\n• *Bogazici_KriptoKasa* (%3.5 Komisyon, Teminat: 1,800 USDT)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '🏦 Finansçı Masasına Git', action: 'open_web_financiers' }
          ]
        };
      } else {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `🤖 Komut algılandı: "${text}"\n\nKullanabileceğiniz komutlar:\n/yakinimda - 📍 Bana Yakın Ne Var? (Radar)\n/start - Ana Menü\n/market - Zula Pazaryeri\n/cuzdan - Bakiye ve Yükleme\n/siparisler - Siparişlerim & Zula Koordinatları\n/finans - IBAN to Crypto Masası`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inlineButtons: [
            { text: '📍 Bana Yakın Ne Var?', action: '/yakinimda' },
            { text: '🛒 Pazar Yeri', action: '/market' },
            { text: '📦 Siparişlerim', action: '/siparisler' }
          ]
        };
      }

      setMessages(prev => [...prev, botResponse]);
    }, 450);
  };

  const handleInlineClick = (action: string) => {
    if (action === 'open_web_market') {
      setActiveView('marketplace');
    } else if (action === 'open_web_orders') {
      setActiveView('my_orders');
    } else if (action === 'open_web_financiers') {
      setActiveView('financiers');
    } else {
      handleSendMessage(action);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700">
            <Send className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              Bütünleşik Telegram Bot Simülatörü
            </h1>
            <p className="text-xs font-mono text-zinc-500">
              @NoktagEscrowBot • Telegram WebApp (TMA) ve Bot API Entegrasyonu
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'simulator' ? 'bg-sky-500 text-black' : 'bg-zinc-100 text-zinc-700'
            }`}
          >
            📱 İnteraktif Bot Ekranı
          </button>
          <button
            onClick={() => setActiveTab('bot_config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'bot_config' ? 'bg-sky-500 text-black' : 'bg-zinc-100 text-zinc-700'
            }`}
          >
            ⚙️ BotFather / Webhook API
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Telegram Phone Simulator Frame */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-md bg-white border-4 border-zinc-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
              {/* Telegram App Header */}
              <div className="bg-white px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold font-mono">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      noktag Escrow Bot
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <div className="text-[11px] text-zinc-700 font-mono">bot • @NoktagEscrowBot</div>
                  </div>
                </div>

                <div className="text-[11px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                  CANLI
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white text-xs">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 space-y-2 ${
                        msg.sender === 'user'
                          ? 'bg-[#2b5278] text-white rounded-tr-none'
                          : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-200'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      <div className="text-[10px] text-zinc-500 text-right font-mono flex items-center justify-end gap-1">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-300" />}
                      </div>
                    </div>

                    {/* Inline Keyboard Buttons */}
                    {msg.inlineButtons && msg.inlineButtons.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2 w-[85%]">
                        {msg.inlineButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleInlineClick(btn.action)}
                            className="bg-[#2b5278]/60 hover:bg-[#2b5278] text-sky-200 border border-zinc-200 p-2 rounded-xl text-[11px] font-medium text-center transition-colors"
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Prompt Bar */}
              <div className="bg-white px-3 py-1.5 border-t border-zinc-200 flex gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
                <button
                  onClick={() => handleSendMessage('/yakinimda')}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 font-bold transition-all"
                >
                  <Crosshair className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>📍 /yakinimda</span>
                </button>
                <button
                  onClick={() => handleSendMessage('/market')}
                  className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-zinc-700 whitespace-nowrap"
                >
                  /market
                </button>
                <button
                  onClick={() => handleSendMessage('/cuzdan')}
                  className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-zinc-700 whitespace-nowrap"
                >
                  /cuzdan
                </button>
                <button
                  onClick={() => handleSendMessage('/siparisler')}
                  className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-zinc-700 whitespace-nowrap"
                >
                  /siparisler
                </button>
                <button
                  onClick={() => handleSendMessage('/finans')}
                  className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-zinc-700 whitespace-nowrap"
                >
                  /finans
                </button>
              </div>

              {/* Chat Input Bar with Location Picker */}
              <div className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2 relative">
                {/* Location Picker Popover */}
                {showLocationPicker && (
                  <div className="absolute bottom-14 left-3 right-3 bg-white border border-zinc-200 rounded-2xl p-3 shadow-2xl z-30 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Telegram Konum Paylaşımı</span>
                      </div>
                      <button
                        onClick={() => setShowLocationPicker(false)}
                        className="text-zinc-500 hover:text-zinc-900 text-xs font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          handleSendMessage('send_live_gps');
                          setShowLocationPicker(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-sky-500/20 hover:from-emerald-500/30 hover:to-sky-500/30 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between text-xs transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>🛰️ Canlı GPS Konumumu Gönder</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ±8m Hassasiyet
                        </span>
                      </button>

                      <div className="text-[10px] font-mono text-zinc-500 px-1 pt-1">
                        Hızlı Popüler Semt Seçimi:
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {POPULAR_LOCATIONS.map(loc => (
                          <button
                            key={loc.name}
                            onClick={() => {
                              handleSendMessage(loc.name);
                              setShowLocationPicker(false);
                            }}
                            className="text-left p-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-200 text-zinc-800 text-[11px] truncate transition-all"
                          >
                            📍 {loc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Quick Button */}
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                    showLocationPicker
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-emerald-400 border-zinc-200'
                  }`}
                  title="Konum Gönder (Radar Taraması)"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Konum</span>
                </button>

                <input
                  type="text"
                  placeholder="Mesaj, semt veya komut yazın (/yakinimda, Kadıköy...)"
                  value={inputCommand}
                  onChange={(e) => setInputCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputCommand)}
                  className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => handleSendMessage(inputCommand)}
                  className="p-2 bg-sky-500 hover:bg-sky-400 text-black rounded-xl font-bold transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Explanation Card */}
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-zinc-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                Telegram Entegrasyonunun Gücü
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                noktag.com botu, müşteriler ve satıcılar için <strong>7/24 anlık push bildirimi</strong> sağlar:
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-emerald-500/30 bg-emerald-950/20">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    1. Çevresel Zula Radarı (/yakinimda)
                  </div>
                  <div className="text-zinc-700 text-[11px] mt-0.5">
                    Kullanıcı Telegram'dan GPS konumu gönderdiğinde veya semt yazdığında sistem anında en yakın Dead ve Live Dropları mesafeleriyle listeler ve direkt Telegram içinden Escrow alımına izin verir.
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                  <div className="text-zinc-700 font-bold">2. Anında Zula Bildirimi</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Satıcı canlı zulayı bıraktığı anda GPS koordinatı ve fotoğraf ipucu alıcının Telegram'ına düşer.
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                  <div className="text-purple-400 font-bold">3. Finansçı Havale Bildirimi</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    FAST dekontu yüklendiğinde finansçıya anında "Onay Bekleyen Dekont" alarmı çalar.
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                  <div className="text-amber-400 font-bold">4. Telegram Mini App (TMA)</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Kullanıcı Telegram'dan hiç çıkmadan tek tuşla tam ekran pazar yeri ve harita görüntüleyebilir.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-xs font-mono space-y-2">
              <div className="text-zinc-500 font-semibold">Test Edilebilecek Bot Komutları:</div>
              <ul className="text-zinc-700 space-y-1 text-[11px]">
                <li><code className="text-emerald-400">/yakinimda</code> : 📍 Çevremdeki en yakın zulaları tara</li>
                <li><code className="text-zinc-700">/start</code> : Escrow ana kontrol menüsü</li>
                <li><code className="text-zinc-700">/market</code> : Aktif dead ve live drop listesi</li>
                <li><code className="text-zinc-700">/cuzdan</code> : Kripto bakiyesi ve yükleme adresi</li>
                <li><code className="text-zinc-700">/siparisler</code> : Aktif emanetler & koordinatlar</li>
                <li><code className="text-zinc-700">/finans</code> : IBAN to Crypto masaları</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* BOT CONFIGURATION / API VIEW */
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Telegram Bot API & Webhook Ayarları</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              noktag.com backend sunucusunun Telegram sunucuları ile haberleştiği webhook konfigürasyonu.
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-zinc-700">BotFather Token (Production Secret):</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-emerald-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-700">Webhook Endpoint URL:</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-white font-mono"
              />
            </div>

            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2">
              <div className="text-zinc-500 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-zinc-700" />
                Örnek Webhook İstek Payload'u (Telegram Update):
              </div>
              <pre className="text-[11px] text-zinc-700 bg-black/50 p-3 rounded-lg overflow-x-auto">
{`{
  "update_id": 98124501,
  "message": {
    "message_id": 412,
    "from": { "id": 1829103, "username": "${currentUser.username}" },
    "chat": { "id": 1829103, "type": "private" },
    "text": "/siparisler"
  }
}`}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCheck className="w-4 h-4" /> Webhook Durumu: 200 OK (Bağlantı Aktif)
              </span>
              <button
                onClick={() => alert('Webhook konfigürasyonu güncellendi.')}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold rounded-lg"
              >
                Konfigürasyonu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
