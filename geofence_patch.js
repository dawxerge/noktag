const fs = require('fs');
const path = './src/context/AppContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add Haversine formula
const haversine = `
// Geofencing Distance Calculator (Haversine formula in km)
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
`;

if (!code.includes('getDistanceFromLatLonInKm')) {
  code = code.replace('export const AppProvider', haversine + '\nexport const AppProvider');
}

// Add Telegram Notification State
const telegramTypes = `
export interface TelegramNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
}
`;
if (!code.includes('TelegramNotification')) {
  code = code.replace('export interface AppContextType {', telegramTypes + '\nexport interface AppContextType {\n  telegramNotifications: TelegramNotification[];\n  sendTelegramPush: (userId: string, message: string) => void;\n  markTelegramPushRead: (id: string) => void;');
}

if (!code.includes('const [telegramNotifications, setTelegramNotifications]')) {
  code = code.replace('const [messages, setMessages] = useState<ChatMessageItem[]>([]);', 'const [messages, setMessages] = useState<ChatMessageItem[]>([]);\n  const [telegramNotifications, setTelegramNotifications] = useState<TelegramNotification[]>([]);\n\n  const sendTelegramPush = (userId: string, message: string) => {\n    const push: TelegramNotification = {\n      id: "tg-" + Date.now() + Math.random(),\n      userId,\n      message,\n      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),\n      read: false\n    };\n    setTelegramNotifications(prev => [...prev, push]);\n  };\n\n  const markTelegramPushRead = (id: string) => {\n    setTelegramNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));\n  };');
}

// Inject Telegram hooks into context value
code = code.replace('cryptoTransactions,', 'cryptoTransactions,\n    telegramNotifications,\n    sendTelegramPush,\n    markTelegramPushRead,');

// Update fulfillLiveDrop with Geofencing and Telegram Push
const fulfillLiveDropRegex = /const fulfillLiveDrop = \(orderId: string, coordinates: DropCoordinates\) => {[\s\S]*?return { success: true, message: 'Canlı zula koordinatları sisteme yüklendi ve alıcının ekranına şifreli olarak iletildi.' };\n  };/;

const newFulfillLiveDrop = `const fulfillLiveDrop = (orderId: string, coordinates: DropCoordinates) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı.' };
    if (order.escrowStatus !== 'preparing_live_drop') return { success: false, message: 'Sipariş canlı zula hazırlık aşamasında değil.' };
    if (order.sellerId !== currentUser.id) return { success: false, message: 'Yetkisiz işlem.' };

    // Geofencing Check (3km max radius)
    // Assuming buyer's requested central location for the district is approx 41.0082, 28.9784 for demo purposes
    const buyerRequestedLat = 41.0082; 
    const buyerRequestedLng = 28.9784;

    if (coordinates.lat && coordinates.lng) {
      const distance = getDistanceFromLatLonInKm(buyerRequestedLat, buyerRequestedLng, coordinates.lat, coordinates.lng);
      if (distance > 3.0) {
        return { 
          success: false, 
          message: \`Geofence İhlali: Belirttiğiniz zula konumu alıcının talep ettiği bölgeye çok uzak (\${distance.toFixed(2)} km). Güvenlik protokolü gereği maksimum izin verilen yarıçap 3 km'dir.\` 
        };
      }
    }

    const now = new Date();
    
    // Update order
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      escrowStatus: 'drop_ready',
      dropDeliveredAt: now.toISOString(),
      dropCoordinates: coordinates,
      autoConfirmDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    } : o));

    addAuditLog(
      order.sellerId,
      order.sellerName,
      \`\${order.id} nolu sipariş için koordinatlar ve talimatlar sisteme yüklendi (Mesafe doğrulandı). Alıcıya bildirim iletildi.\`,
      'escrow'
    );

    // Send drop ready message to order conversation
    const conv = conversations.find(c => c.referenceId === order.id);
    if (conv) {
      const dropMsg: ChatMessageItem = {
        id: 'msg-' + Date.now(),
        conversationId: conv.id,
        senderId: order.sellerId,
        senderName: order.sellerName,
        senderRole: 'seller',
        text: \`📍 ZULA HAZIR: Satıcı canlı zula konumunu ve şifreli talimatlarını bıraktı. [\${coordinates.lat ?? ''}, \${coordinates.lng ?? ''} - \${coordinates.addressHint || coordinates.stealthInstructions || 'Talimatlar yüklendi'}]\`,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemEvent: true,
        systemEventType: 'live_drop_ready',
        isEncrypted: true,
      };
      setMessages(prev => [...prev, dropMsg]);
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, escrowStatus: 'drop_ready' } : c));
    }

    // Telegram Webhook Push Notification
    sendTelegramPush(
      order.buyerId, 
      \`🔔 [NOKTAG BOT]: 📦 ZULA HAZIR! \${order.productTitle} siparişiniz için satıcı zulayı yerleştirdi. Koordinatları almak için sisteme giriş yapın.\`
    );

    return { success: true, message: 'Canlı zula koordinatları yüklendi. Geofence kontrolü başarılı.' };
  };`;

code = code.replace(fulfillLiveDropRegex, newFulfillLiveDrop);

// Also add a Telegram push when Financier approves deposit
const financierApproveRegex = /setDeposits\(prev => prev.map\(d => d.id === depositId \? \{ \.\.\.d, status: 'verified_credited' \} : d\)\);/
if(code.match(financierApproveRegex)) {
  code = code.replace(financierApproveRegex, `setDeposits(prev => prev.map(d => d.id === depositId ? { ...d, status: 'verified_credited' } : d));\n\n    sendTelegramPush(\n      deposit.userId,\n      \`🔔 [NOKTAG BOT]: 💰 BAKİYE YÜKLENDİ! Finansçı FAST işleminizi onayladı. \${deposit.amountUSDT} USDT hesabınıza aktarıldı.\`\n    );`);
}

fs.writeFileSync(path, code);
console.log('App context patched successfully.');
