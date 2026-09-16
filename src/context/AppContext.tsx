import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Product, 
  Order, 
  FinancierOffer, 
  FiatDepositRequest, 
  SystemSettings, 
  AuditLog, 
  UserRole,
  DropCoordinates,
  EscrowStatus,
  Conversation,
  ChatMessageItem,
  CryptoTransaction
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_FINANCIERS, 
  INITIAL_DEPOSITS, 
  INITIAL_SETTINGS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_CRYPTO_TRANSACTIONS
} from '../mock/initialData';
import { UserGeoLocation, POPULAR_LOCATIONS } from '../utils/geoUtils';

export interface TelegramNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  products: Product[];
  orders: Order[];
  financiers: FinancierOffer[];
  deposits: FiatDepositRequest[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  conversations: Conversation[];
  messages: ChatMessageItem[];
  cryptoTransactions: CryptoTransaction[];
  telegramNotifications: TelegramNotification[];
  selectedConversationId: string | null;
  activeView: 'marketplace' | 'my_orders' | 'financiers' | 'seller_portal' | 'financier_portal' | 'admin_panel' | 'telegram_bot' | 'architecture_guide' | 'how_it_works' | 'messages' | 'crypto_ledger';
  userLocation: UserGeoLocation | null;
  
  // Actions
  setActiveView: (view: any) => void;
  setUserLocation: (location: UserGeoLocation | null) => void;
  switchUser: (userId: string) => void;
  setSelectedConversationId: (id: string | null) => void;
  sendTelegramPush: (userId: string, message: string) => void;
  markTelegramPushRead: (id: string) => void;
  
  // Communication Hub Actions
  sendMessage: (conversationId: string, text: string, options?: { attachment?: ChatMessageItem['attachment']; burnAfterReading?: boolean }) => void;
  openOrderConversation: (orderId: string) => void;
  openDepositConversation: (depositId: string) => void;

  // Crypto & Ledger Actions
  executeCryptoDeposit: (amountUSDT: number, network: 'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon', fromAddress?: string) => { success: boolean; txHash: string; message: string };
  executeCryptoWithdrawal: (amountUSDT: number, network: 'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon', toAddress: string) => { success: boolean; txHash?: string; message: string };
  
  // Escrow & Order Actions
  createOrder: (productId: string, buyerNotes?: string) => { success: boolean; message: string; orderId?: string };
  fulfillLiveDrop: (orderId: string, coordinates: DropCoordinates) => { success: boolean; message: string };
  confirmOrderReceipt: (orderId: string, rating: number, feedback?: string) => { success: boolean; message: string };
  openDispute: (orderId: string, reason: string, evidence?: string[]) => { success: boolean; message: string };
  adminResolveDispute: (orderId: string, winner: 'buyer' | 'seller' | 'split', notes: string) => { success: boolean; message: string };
  
  // Product Creation
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'sellerName' | 'sellerRating' | 'sellerTrustScore' | 'sellerCollateral'>) => { success: boolean; message: string };
  
  // Financier Actions
  requestFiatDeposit: (financierId: string, amountTRY: number, bankName: string) => { success: boolean; message: string; depositId?: string };
  uploadDepositReceipt: (depositId: string, fileName: string, note?: string) => { success: boolean; message: string };
  financierApproveDeposit: (depositId: string) => { success: boolean; message: string };
  
  // Collateral Actions
  depositCollateral: (amountUSDT: number) => { success: boolean; message: string };
  withdrawCollateral: (amountUSDT: number) => { success: boolean; message: string };
  
  // Admin Settings
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  toggleUserBan: (userId: string) => void;
  resetAllData: () => void;

  // Theme & Appearance
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'noktag_app_state_v1';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
  };

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_current_user_id`) || 'user-buyer-1';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= 6 && parsed[0].lat) return parsed;
      } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  const [userLocation, setUserLocation] = useState<UserGeoLocation | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user_location`);
    return saved ? JSON.parse(saved) : POPULAR_LOCATIONS[0];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [financiers, setFinanciers] = useState<FinancierOffer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_financiers`);
    return saved ? JSON.parse(saved) : INITIAL_FINANCIERS;
  });

  const [deposits, setDeposits] = useState<FiatDepositRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deposits`);
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_conversations`);
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [cryptoTransactions, setCryptoTransactions] = useState<CryptoTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_crypto_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_CRYPTO_TRANSACTIONS;
  });

  const [telegramNotifications, setTelegramNotifications] = useState<TelegramNotification[]>([]);

  const sendTelegramPush = (userId: string, message: string) => {
    const push: TelegramNotification = {
      id: "tg-" + Date.now() + Math.random(),
      userId,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false
    };
    setTelegramNotifications(prev => [...prev, push]);
  };

  const markTelegramPushRead = (id: string) => {
    setTelegramNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(() => {
    return 'conv-order-8831';
  });

  const [activeView, setActiveView] = useState<'marketplace' | 'my_orders' | 'financiers' | 'seller_portal' | 'financier_portal' | 'admin_panel' | 'telegram_bot' | 'architecture_guide' | 'how_it_works' | 'messages' | 'crypto_ledger'>('marketplace');

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_financiers`, JSON.stringify(financiers));
  }, [financiers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_deposits`, JSON.stringify(deposits));
  }, [deposits]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_conversations`, JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_crypto_transactions`, JSON.stringify(cryptoTransactions));
  }, [cryptoTransactions]);
  useEffect(() => {
    if (userLocation) {
      localStorage.setItem(`${STORAGE_KEY}_user_location`, JSON.stringify(userLocation));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_user_location`);
    }
  }, [userLocation]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const logAudit = (action: string, actor: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      type,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      // Auto switch view according to role for smooth previewing
      if (found.role === 'admin') setActiveView('admin_panel');
      else if (found.role === 'seller') setActiveView('seller_portal');
      else if (found.role === 'financier') setActiveView('financier_portal');
      else setActiveView('marketplace');
    }
  };

  // SEND MESSAGE
  const sendMessage = (
    conversationId: string, 
    text: string, 
    options?: { attachment?: ChatMessageItem['attachment']; burnAfterReading?: boolean }
  ) => {
    if (!text.trim() && !options?.attachment) return;

    const newMessage: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderRole: currentUser.role,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: options?.attachment,
      burnAfterReading: options?.burnAfterReading,
      isEncrypted: true,
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation last message & time
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text.trim() || (options?.attachment ? `[Ek: ${options.attachment.name}]` : ''),
          lastMessageTime: newMessage.timestamp,
        };
      }
      return c;
    }));
  };

  // OPEN OR CREATE ORDER CONVERSATION
  const openOrderConversation = (orderId: string) => {
    const existing = conversations.find(c => c.referenceId === orderId);
    if (existing) {
      setSelectedConversationId(existing.id);
      setActiveView('messages');
      return;
    }
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newConvId = `conv-order-${order.id}`;
    const newConv: Conversation = {
      id: newConvId,
      type: 'order_escrow',
      title: order.productTitle,
      subtitle: `Sipariş #${order.id} • ${order.city} / ${order.district}`,
      referenceId: order.id,
      participants: [
        { userId: order.buyerId, username: order.buyerName, role: 'customer' },
        { userId: order.sellerId, username: order.sellerName, role: 'seller' }
      ],
      lastMessage: 'Sipariş şifreli sohbet odası oluşturuldu.',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: {},
      escrowAmountUSDT: order.productPriceUSDT,
      escrowStatus: order.escrowStatus,
      isEncrypted: true,
      autoDestructHours: 48,
    };

    const initialEventMsg: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      conversationId: newConvId,
      senderId: 'system',
      senderName: 'noktag Escrow Engine',
      senderRole: 'admin',
      text: `🔒 AKILLI EMANET AKTİF: #${order.id} siparişi için ${order.productPriceUSDT} USDT kilitli escrow altında tutulmaktadır.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemEvent: true,
      systemEventType: 'escrow_lock',
      isEncrypted: true,
    };

    setConversations(prev => [newConv, ...prev]);
    setMessages(prev => [...prev, initialEventMsg]);
    setSelectedConversationId(newConvId);
    setActiveView('messages');
  };

  // OPEN OR CREATE DEPOSIT CONVERSATION
  const openDepositConversation = (depositId: string) => {
    const existing = conversations.find(c => c.referenceId === depositId);
    if (existing) {
      setSelectedConversationId(existing.id);
      setActiveView('messages');
      return;
    }
    const dep = deposits.find(d => d.id === depositId);
    if (!dep) return;

    const newConvId = `conv-deposit-${dep.id}`;
    const newConv: Conversation = {
      id: newConvId,
      type: 'fiat_deposit',
      title: `FAST Yükleme: ${dep.amountTRY.toLocaleString()} TRY`,
      subtitle: `Talep #${dep.id} • Ref: ${dep.referenceCode}`,
      referenceId: dep.id,
      participants: [
        { userId: dep.buyerId, username: dep.buyerName, role: 'customer' },
        { userId: dep.financierId, username: dep.financierName, role: 'financier' }
      ],
      lastMessage: 'FAST havale masası bağlandı.',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: {},
      escrowAmountUSDT: dep.amountUSDT,
      escrowStatus: dep.status,
      isEncrypted: true,
      autoDestructHours: 24,
    };

    const initialMsg: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      conversationId: newConvId,
      senderId: 'system',
      senderName: 'noktag Finans Masası',
      senderRole: 'admin',
      text: `🏦 FAST TALEBİ: ${dep.amountTRY} TRY ödeme bekleniyor. Referans: ${dep.referenceCode}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemEvent: true,
      systemEventType: 'receipt_uploaded',
      isEncrypted: true,
    };

    setConversations(prev => [newConv, ...prev]);
    setMessages(prev => [...prev, initialMsg]);
    setSelectedConversationId(newConvId);
    setActiveView('messages');
  };

  // EXECUTE ON-CHAIN CRYPTO DEPOSIT
  const executeCryptoDeposit = (
    amountUSDT: number, 
    network: 'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon' = 'TRC-20',
    fromAddress: string = 'TKyP9...SimulatedAddress'
  ) => {
    if (amountUSDT <= 0) return { success: false, txHash: '', message: 'Geçersiz tutar.' };

    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txHash = '0x' + randomHex;
    const now = new Date();

    const newTx: CryptoTransaction = {
      id: 'ctx-' + Date.now(),
      txHash,
      network,
      type: 'deposit',
      fromAddress,
      toAddress: network === 'TRC-20' ? 'TFz1noktag99EscrowWalletSecureTRC20' : '0xPlatform_BSC_Liquidity_HotPool',
      amountUSDT,
      feeUSDT: network === 'TRC-20' ? 1.0 : network === 'BEP-20' ? 0.2 : 4.5,
      confirmations: network === 'TRC-20' ? 19 : 15,
      requiredConfirmations: network === 'TRC-20' ? 19 : 15,
      status: 'confirmed',
      timestamp: now.toISOString(),
      blockNumber: Math.floor(48900000 + Math.random() * 50000),
      note: `${currentUser.username} doğrudan ${network} ağından bakiye yatırma işlemi`,
    };

    setCryptoTransactions(prev => [newTx, ...prev]);
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, balanceUSDT: Number((u.balanceUSDT + amountUSDT).toFixed(2)) };
      }
      return u;
    }));

    logAudit(
      'Kripto Yatırıldı',
      currentUser.username,
      `${amountUSDT} USDT (${network}) başarıyla yatırıldı. TxHash: ${txHash.slice(0, 10)}...`,
      'crypto'
    );

    return {
      success: true,
      txHash,
      message: `${amountUSDT} USDT (${network}) başarıyla cüzdanınıza yansıtıldı. Ağ onayı tamamlandı!`
    };
  };

  // EXECUTE ON-CHAIN CRYPTO WITHDRAWAL
  const executeCryptoWithdrawal = (
    amountUSDT: number,
    network: 'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon' = 'TRC-20',
    toAddress: string
  ) => {
    if (amountUSDT <= 0) return { success: false, message: 'Geçersiz tutar.' };
    if (!toAddress || toAddress.trim().length < 20) {
      return { success: false, message: 'Geçerli bir kripto cüzdan adresi giriniz.' };
    }
    if (currentUser.balanceUSDT < amountUSDT) {
      return { success: false, message: `Yetersiz bakiye. Mevcut: ${currentUser.balanceUSDT.toFixed(2)} USDT` };
    }

    const fee = network === 'TRC-20' ? 1.0 : network === 'BEP-20' ? 0.25 : 5.0;
    const netWithdrawal = Number((amountUSDT - fee).toFixed(2));
    if (netWithdrawal <= 0) {
      return { success: false, message: `Tutar ağ komisyonundan (${fee} USDT) yüksek olmalıdır.` };
    }

    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txHash = '0x' + randomHex;
    const now = new Date();

    const newTx: CryptoTransaction = {
      id: 'ctx-' + Date.now(),
      txHash,
      network,
      type: 'withdrawal',
      fromAddress: network === 'TRC-20' ? 'TFz1noktag99EscrowWalletSecureTRC20' : '0xPlatform_BSC_Liquidity_HotPool',
      toAddress: toAddress.trim(),
      amountUSDT: netWithdrawal,
      feeUSDT: fee,
      confirmations: 1,
      requiredConfirmations: network === 'TRC-20' ? 19 : 15,
      status: 'confirmed',
      timestamp: now.toISOString(),
      blockNumber: Math.floor(48900000 + Math.random() * 50000),
      note: `${currentUser.username} dış cüzdana çekim: ${toAddress.slice(0, 8)}...`,
    };

    setCryptoTransactions(prev => [newTx, ...prev]);
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, balanceUSDT: Number((u.balanceUSDT - amountUSDT).toFixed(2)) };
      }
      return u;
    }));

    logAudit(
      'Kripto Çekimi',
      currentUser.username,
      `${netWithdrawal} USDT (${network}) dış cüzdana transfer edildi. TxHash: ${txHash.slice(0, 10)}...`,
      'crypto'
    );

    return {
      success: true,
      txHash,
      message: `${netWithdrawal} USDT ${toAddress.slice(0, 8)}... adresine gönderildi (Ağ Ücreti: ${fee} USDT).`
    };
  };

  // CREATE ORDER & LOCK ESCROW
  const createOrder = (productId: string, buyerNotes?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Ürün bulunamadı.' };

    if (currentUser.balanceUSDT < product.priceUSDT) {
      return { 
        success: false, 
        message: `Yetersiz bakiye. Gereken: ${product.priceUSDT} USDT, Mevcut: ${currentUser.balanceUSDT.toFixed(2)} USDT. Lütfen Finansçı ile IBAN üzerinden veya kripto cüzdanınızdan yükleme yapın.` 
      };
    }

    const seller = users.find(u => u.id === product.sellerId);
    if (!seller) return { success: false, message: 'Satıcı bulunamadı.' };

    // Check Seller Collateral Exposure Rule
    // Open exposure cannot exceed seller's collateral
    const nextExposure = seller.activeExposureUSDT + product.priceUSDT;
    if (nextExposure > seller.collateralUSDT) {
      return {
        success: false,
        message: `Satıcının açık işlem limiti aşıldı! Satıcı Güvence Bedeli: ${seller.collateralUSDT} USDT, Açıkta olan: ${seller.activeExposureUSDT} USDT. Bu kural alıcıyı korumak içindir.`
      };
    }

    // Platform Fee calculation
    const platformFee = Number(((product.priceUSDT * settings.platformFeePercent) / 100).toFixed(2));
    const sellerNet = Number((product.priceUSDT - platformFee).toFixed(2));

    const isDeadDrop = product.dropType === 'dead_drop';
    const now = new Date();
    const prepDeadline = !isDeadDrop 
      ? new Date(now.getTime() + product.prepTimeMinutes * 60 * 1000).toISOString()
      : undefined;

    const newOrder: Order = {
      id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
      productId: product.id,
      productTitle: product.title,
      productPriceUSDT: product.priceUSDT,
      dropType: product.dropType,
      city: product.city,
      district: product.district,
      buyerId: currentUser.id,
      buyerName: currentUser.username,
      sellerId: seller.id,
      sellerName: seller.username,
      escrowStatus: isDeadDrop ? 'drop_ready' : 'preparing_live_drop',
      platformFeeUSDT: platformFee,
      sellerNetUSDT: sellerNet,
      createdAt: now.toISOString(),
      prepDeadline,
      dropDeliveredAt: isDeadDrop ? now.toISOString() : undefined,
      autoConfirmDeadline: isDeadDrop ? new Date(now.getTime() + settings.autoConfirmHours * 3600 * 1000).toISOString() : undefined,
      dropCoordinates: isDeadDrop ? product.deadDropCoordinates : undefined,
      buyerNotes: buyerNotes || undefined,
    };

    // Deduct buyer balance
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, balanceUSDT: Number((u.balanceUSDT - product.priceUSDT).toFixed(2)) };
      }
      if (u.id === seller.id) {
        return { ...u, activeExposureUSDT: Number((u.activeExposureUSDT + product.priceUSDT).toFixed(2)) };
      }
      return u;
    }));

    // Decrease stock
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
    setOrders(prev => [newOrder, ...prev]);

    // Record On-chain Escrow Lock Crypto Transaction
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txHash = '0x' + randomHex;
    const escrowTx: CryptoTransaction = {
      id: 'ctx-' + Date.now(),
      txHash,
      network: 'TRC-20',
      type: 'escrow_lock',
      fromAddress: 'TFz1noktag99EscrowWalletSecureTRC20',
      toAddress: 'TEscrow_SmartPool_Locked_TRC20',
      amountUSDT: product.priceUSDT,
      feeUSDT: 0.8,
      confirmations: 19,
      requiredConfirmations: 19,
      status: 'confirmed',
      timestamp: now.toISOString(),
      blockNumber: Math.floor(48930000 + Math.random() * 10000),
      relatedOrderId: newOrder.id,
      note: `Sipariş #${newOrder.id} (${product.title}) akıllı escrow emanetine kilitlendi`,
    };
    setCryptoTransactions(prev => [escrowTx, ...prev]);

    // Create Order Conversation & Welcome Message
    const convId = `conv-order-${newOrder.id}`;
    const orderConv: Conversation = {
      id: convId,
      type: 'order_escrow',
      title: newOrder.productTitle,
      subtitle: `Sipariş #${newOrder.id} • ${newOrder.city} / ${newOrder.district}`,
      referenceId: newOrder.id,
      participants: [
        { userId: newOrder.buyerId, username: newOrder.buyerName, role: 'customer' },
        { userId: newOrder.sellerId, username: newOrder.sellerName, role: 'seller' }
      ],
      lastMessage: `🔒 AKILLI EMANET: ${newOrder.productPriceUSDT} USDT kilitlendi.`,
      lastMessageTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: {},
      escrowAmountUSDT: newOrder.productPriceUSDT,
      escrowStatus: newOrder.escrowStatus,
      isEncrypted: true,
      autoDestructHours: 48,
    };
    const orderMsg: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      conversationId: convId,
      senderId: 'system',
      senderName: 'noktag Escrow Engine',
      senderRole: 'admin',
      text: `🔒 AKILLI EMANET KİLİTLENDİ: #${newOrder.id} siparişi için ${newOrder.productPriceUSDT} USDT kilitlendi. ${isDeadDrop ? 'Dead Drop koordinatları açıldı.' : 'Satıcı canlı zula hazırlığına başladı.'}`,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemEvent: true,
      systemEventType: 'escrow_lock',
      isEncrypted: true,
    };
    setConversations(prev => [orderConv, ...prev]);
    setMessages(prev => [...prev, orderMsg]);

    logAudit(
      'Emanet Kilitlendi',
      currentUser.username,
      `${newOrder.id} nolu sipariş için ${product.priceUSDT} USDT kilitlendi (${isDeadDrop ? 'Dead Drop - Anında Açıldı' : 'Live Drop - ' + product.prepTimeMinutes + ' dk Hazırlık'})`,
      'escrow'
    );

    return { 
      success: true, 
      message: isDeadDrop 
        ? 'Ödeme Escrow emanetine alındı ve Hazır Zula (Dead Drop) koordinatları anında açıldı!' 
        : `Ödeme Escrow emanetine alındı! Satıcıya ${product.prepTimeMinutes} dakika canlı zula hazırlık süresi tanındı.`,
      orderId: newOrder.id
    };
  };

  // SELLER FULFILLS LIVE DROP
  const fulfillLiveDrop = (orderId: string, coordinates: DropCoordinates) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı.' };

    // Geofencing Check (3km max radius)
    // Assuming buyer's requested central location for the district is approx 41.0082, 28.9784 for demo purposes
    const buyerRequestedLat = 41.0082; 
    const buyerRequestedLng = 28.9784;

    if (coordinates.lat && coordinates.lng) {
      const distance = getDistanceFromLatLonInKm(buyerRequestedLat, buyerRequestedLng, coordinates.lat, coordinates.lng);
      if (distance > 3.0) {
        return { 
          success: false, 
          message: `Geofence İhlali: Belirttiğiniz zula konumu alıcının talep ettiği bölgeye çok uzak (${distance.toFixed(2)} km). Güvenlik protokolü gereği maksimum izin verilen yarıçap 3 km'dir.` 
        };
      }
    }

    const now = new Date();
    const autoConfirmDeadline = new Date(now.getTime() + settings.autoConfirmHours * 3600 * 1000).toISOString();

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          escrowStatus: 'drop_ready',
          dropDeliveredAt: now.toISOString(),
          autoConfirmDeadline,
          dropCoordinates: coordinates,
        };
      }
      return o;
    }));

    logAudit(
      'Canlı Zula Teslim Edildi',
      order.sellerName,
      `${order.id} nolu sipariş için koordinatlar ve talimatlar sisteme yüklendi (Mesafe: ${coordinates.lat ? getDistanceFromLatLonInKm(buyerRequestedLat, buyerRequestedLng, coordinates.lat, coordinates.lng).toFixed(2) : '?'}km). Alıcıya bildirim iletildi.`,
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
        text: `📍 ZULA HAZIR: Satıcı canlı zula konumunu ve şifreli talimatlarını bıraktı. [${coordinates.lat ?? ''}, ${coordinates.lng ?? ''} - ${coordinates.addressHint || coordinates.stealthInstructions || 'Talimatlar yüklendi'}]`,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemEvent: true,
        systemEventType: 'live_drop_ready',
        isEncrypted: true,
      };
      setMessages(prev => [...prev, dropMsg]);
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, escrowStatus: 'drop_ready' } : c));
    }

    sendTelegramPush(
      order.buyerId, 
      `🔔 [NOKTAG BOT]: 📦 ZULA HAZIR! Sipariş #${order.id.slice(0,6)} için satıcı zulayı yerleştirdi. Koordinatları almak için sisteme giriş yapın.`
    );

    return { success: true, message: 'Canlı zula koordinatları sisteme yüklendi ve alıcının ekranına şifreli olarak iletildi.' };
  };

  // BUYER CONFIRMS RECEIPT -> RELEASE FUNDS
  const confirmOrderReceipt = (orderId: string, rating: number, feedback?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı.' };

    if (order.escrowStatus === 'buyer_confirmed' || order.escrowStatus === 'released_to_seller') {
      return { success: false, message: 'Bu sipariş zaten onaylanmış.' };
    }

    // Release funds to seller + deduct exposure
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === order.sellerId) {
        const newTotalTrades = u.reputation.totalTrades + 1;
        const newCompleted = u.reputation.completedTrades + 1;
        const newRating = Number(((u.reputation.rating * u.reputation.totalTrades + rating) / newTotalTrades).toFixed(2));
        const newTrust = Math.min(100, Math.round((newCompleted / newTotalTrades) * 98 + 2));

        return {
          ...u,
          balanceUSDT: Number((u.balanceUSDT + order.sellerNetUSDT).toFixed(2)),
          activeExposureUSDT: Math.max(0, Number((u.activeExposureUSDT - order.productPriceUSDT).toFixed(2))),
          reputation: {
            ...u.reputation,
            totalTrades: newTotalTrades,
            completedTrades: newCompleted,
            rating: newRating,
            trustScore: newTrust,
          }
        };
      }
      // Platform admin treasury collects platform fee
      if (u.role === 'admin') {
        return {
          ...u,
          balanceUSDT: Number((u.balanceUSDT + order.platformFeeUSDT).toFixed(2))
        };
      }
      // Buyer reputation increments
      if (u.id === order.buyerId) {
        return {
          ...u,
          reputation: {
            ...u.reputation,
            totalTrades: u.reputation.totalTrades + 1,
            completedTrades: u.reputation.completedTrades + 1,
            trustScore: Math.min(100, u.reputation.trustScore + 1)
          }
        };
      }
      return u;
    }));

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          escrowStatus: 'released_to_seller',
          buyerRatingGiven: rating,
          buyerFeedback: feedback,
        };
      }
      return o;
    }));

    // Record Escrow Release & Platform Fee Crypto Transactions
    const randomHex1 = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const randomHex2 = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const releaseTx: CryptoTransaction = {
      id: 'ctx-' + Date.now(),
      txHash: '0x' + randomHex1,
      network: 'TRC-20',
      type: 'escrow_release',
      fromAddress: 'TEscrow_SmartPool_Locked_TRC20',
      toAddress: 'TSeller_Vault_' + order.sellerId.slice(-4),
      amountUSDT: order.sellerNetUSDT,
      feeUSDT: 0.8,
      confirmations: 19,
      requiredConfirmations: 19,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(48935000 + Math.random() * 5000),
      relatedOrderId: order.id,
      note: `Sipariş #${order.id} alıcı onayı sonrası satıcıya aktarıldı`,
    };
    const feeTx: CryptoTransaction = {
      id: 'ctx-fee-' + Date.now(),
      txHash: '0x' + randomHex2,
      network: 'TRC-20',
      type: 'platform_fee',
      fromAddress: 'TEscrow_SmartPool_Locked_TRC20',
      toAddress: 'TPlatform_Revenue_Reserve_TRC20',
      amountUSDT: order.platformFeeUSDT,
      feeUSDT: 0.2,
      confirmations: 19,
      requiredConfirmations: 19,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(48935000 + Math.random() * 5000),
      relatedOrderId: order.id,
      note: `Sipariş #${order.id} %${settings.platformFeePercent} platform komisyonu tahsilatı`,
    };
    setCryptoTransactions(prev => [releaseTx, feeTx, ...prev]);

    // Send confirmation message to conversation if exists
    const conv = conversations.find(c => c.referenceId === order.id);
    if (conv) {
      const confirmMsg: ChatMessageItem = {
        id: 'msg-' + Date.now(),
        conversationId: conv.id,
        senderId: 'system',
        senderName: 'noktag Escrow Engine',
        senderRole: 'admin',
        text: `✅ TESLİMAT VE ONAY TAMAMLANDI: Alıcı teslimatı onayladı (${rating} yıldız). ${order.sellerNetUSDT} USDT satıcıya, ${order.platformFeeUSDT} USDT platform kasasına aktarıldı.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemEvent: true,
        systemEventType: 'released',
        isEncrypted: true,
      };
      setMessages(prev => [...prev, confirmMsg]);
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, escrowStatus: 'released_to_seller' } : c));
    }

    logAudit(
      'Escrow Serbest Bırakıldı',
      currentUser.username,
      `${order.id} nolu sipariş onaylandı. Satıcıya ${order.sellerNetUSDT} USDT aktarıldı. Komisyon: ${order.platformFeeUSDT} USDT`,
      'escrow'
    );

    return { success: true, message: `İşlem başarıyla tamamlandı! ${order.sellerNetUSDT} USDT satıcıya aktarıldı.` };
  };

  // OPEN DISPUTE
  const openDispute = (orderId: string, reason: string, evidence: string[] = []) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı.' };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          escrowStatus: 'disputed',
          disputeReason: reason,
          disputeEvidence: evidence,
          disputeOpenedAt: new Date().toISOString(),
        };
      }
      return o;
    }));

    // Update dispute counters
    setUsers(prev => prev.map(u => {
      if (u.id === order.sellerId || u.id === order.buyerId) {
        return {
          ...u,
          reputation: {
            ...u.reputation,
            disputeCount: u.reputation.disputeCount + 1,
          }
        };
      }
      return u;
    }));

    logAudit(
      'Anlaşmazlık Açıldı',
      currentUser.username,
      `${order.id} nolu işlem için itiraz açıldı: "${reason}". Admin incelemesine alındı.`,
      'dispute'
    );

    // Send dispute message to conversation and add Admin participant
    const conv = conversations.find(c => c.referenceId === order.id);
    if (conv) {
      const disputeMsg: ChatMessageItem = {
        id: 'msg-' + Date.now(),
        conversationId: conv.id,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderRole: currentUser.role,
        text: `⚠️ ANLAŞMAZLIK (DISPUTE) BAŞLATILDI: "${reason}". Tarafsız noktag Hakem Heyeti odaya bağlandı. Kanıtlar incelenene kadar emanet kilitlidir.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemEvent: true,
        systemEventType: 'dispute_opened',
        isEncrypted: true,
      };
      setMessages(prev => [...prev, disputeMsg]);
      setConversations(prev => prev.map(c => {
        if (c.id === conv.id) {
          const hasAdmin = c.participants.some(p => p.role === 'admin');
          return {
            ...c,
            type: 'dispute_arbitration',
            escrowStatus: 'disputed',
            participants: hasAdmin ? c.participants : [
              ...c.participants, 
              { userId: 'usr-admin-1', username: 'noktag_hakem', role: 'admin' }
            ]
          };
        }
        return c;
      }));
    }

    return { success: true, message: 'İtirazınız hakem heyetine (Admin) iletildi. Paraniz güvenle emanette bekletilmektedir.' };
  };

  // ADMIN RESOLVE DISPUTE
  const adminResolveDispute = (orderId: string, winner: 'buyer' | 'seller' | 'split', notes: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı.' };

    let buyerAmount = 0;
    let sellerAmount = 0;

    if (winner === 'buyer') {
      buyerAmount = order.productPriceUSDT;
    } else if (winner === 'seller') {
      sellerAmount = order.sellerNetUSDT;
    } else {
      // Split 50-50
      buyerAmount = Number((order.productPriceUSDT / 2).toFixed(2));
      sellerAmount = Number((order.sellerNetUSDT / 2).toFixed(2));
    }

    setUsers(prev => prev.map(u => {
      if (u.id === order.buyerId && buyerAmount > 0) {
        return { ...u, balanceUSDT: Number((u.balanceUSDT + buyerAmount).toFixed(2)) };
      }
      if (u.id === order.sellerId) {
        const lossIncrement = winner === 'buyer' ? 1 : 0;
        return {
          ...u,
          balanceUSDT: Number((u.balanceUSDT + sellerAmount).toFixed(2)),
          activeExposureUSDT: Math.max(0, Number((u.activeExposureUSDT - order.productPriceUSDT).toFixed(2))),
          reputation: {
            ...u.reputation,
            disputeLossCount: u.reputation.disputeLossCount + lossIncrement,
            trustScore: Math.max(20, u.reputation.trustScore - (winner === 'buyer' ? 8 : 0)),
          }
        };
      }
      return u;
    }));

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          escrowStatus: winner === 'buyer' ? 'refunded_to_buyer' : 'released_to_seller',
          disputeWinner: winner,
          disputeResolutionNotes: notes,
        };
      }
      return o;
    }));

    logAudit(
      'Anlaşmazlık Çözüldü',
      'Yönetim Hakemi (noktag Admin)',
      `${order.id} karara bağlandı. Sonuç: ${winner.toUpperCase()}. Alıcı İade: ${buyerAmount} USDT, Satıcı: ${sellerAmount} USDT. Gerekçe: ${notes}`,
      'dispute'
    );

    return { success: true, message: `Anlaşmazlık başarıyla karara bağlandı: ${winner}. Fonlar aktarıldı.` };
  };

  // CREATE PRODUCT
  const createProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'sellerName' | 'sellerRating' | 'sellerTrustScore' | 'sellerCollateral'>) => {
    if (currentUser.role !== 'seller') {
      return { success: false, message: 'Yalnızca Satıcı rolündeki kullanıcılar ürün ekleyebilir.' };
    }

    if (currentUser.collateralUSDT < settings.minSellerCollateralUSDT) {
      return { 
        success: false, 
        message: `Ürün listelemek için en az ${settings.minSellerCollateralUSDT} USDT Güvence Bedeli (Teminat) yatırmış olmalısınız. Mevcut Teminat: ${currentUser.collateralUSDT} USDT.` 
      };
    }

    const newProd: Product = {
      ...productData,
      id: 'prod-' + (productData.dropType === 'dead_drop' ? 'dead-' : 'live-') + Math.floor(100 + Math.random() * 900),
      sellerId: currentUser.id,
      sellerName: currentUser.username,
      sellerRating: currentUser.reputation.rating,
      sellerTrustScore: currentUser.reputation.trustScore,
      sellerCollateral: currentUser.collateralUSDT,
      createdAt: new Date().toISOString(),
    };

    setProducts(prev => [newProd, ...prev]);

    logAudit(
      'Yeni Ürün/Zula Eklendi',
      currentUser.username,
      `"${newProd.title}" listelendi (${newProd.dropType === 'dead_drop' ? 'Dead Drop' : 'Live Drop ' + newProd.prepTimeMinutes + ' dk'})`,
      'escrow'
    );

    return { success: true, message: 'Ürün/Zula başarıyla yayına alındı.' };
  };

  // REQUEST FIAT TO CRYPTO DEPOSIT VIA FINANCIER
  const requestFiatDeposit = (financierId: string, amountTRY: number, bankName: string) => {
    const financier = financiers.find(f => f.financierId === financierId);
    if (!financier) return { success: false, message: 'Finansçı bulunamadı.' };

    const rate = financier.exchangeRateTRYPerUSDT;
    const grossUSDT = amountTRY / rate;
    const feeUSDT = (grossUSDT * financier.commissionRatePercent) / 100;
    const netUSDT = Number((grossUSDT - feeUSDT).toFixed(2));
    const feeAmountTRY = Number(((amountTRY * financier.commissionRatePercent) / 100).toFixed(2));

    // Check Financier Available Collateral Capacity
    if (netUSDT > financier.availableCapacityUSDT) {
      return {
        success: false,
        message: `Finansçının güvence kapasitesi bu işlem için yetersiz. Maksimum açık işlem kapasitesi: ${financier.availableCapacityUSDT.toFixed(2)} USDT.`
      };
    }

    const newDeposit: FiatDepositRequest = {
      id: 'dep-' + Math.floor(100 + Math.random() * 900),
      buyerId: currentUser.id,
      buyerName: currentUser.username,
      financierId: financier.financierId,
      financierName: financier.financierName,
      amountTRY,
      amountUSDT: netUSDT,
      commissionRate: financier.commissionRatePercent,
      feeAmountTRY,
      bankName,
      iban: 'TR' + Math.floor(100000000000000000000000 + Math.random() * 900000000000000000000000),
      ibanOwner: `${financier.financierName} (Yetkili Emanet Masası)`,
      referenceCode: 'NK-' + Math.floor(1000 + Math.random() * 9000),
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    // Increase Financier Active Exposure
    setFinanciers(prev => prev.map(f => {
      if (f.financierId === financierId) {
        const nextExp = f.activeExposureUSDT + netUSDT;
        return {
          ...f,
          activeExposureUSDT: Number(nextExp.toFixed(2)),
          availableCapacityUSDT: Math.max(0, Number((f.collateralUSDT - nextExp).toFixed(2))),
        };
      }
      return f;
    }));

    setDeposits(prev => [newDeposit, ...prev]);

    logAudit(
      'IBAN Yükleme Talebi Açıldı',
      currentUser.username,
      `${newDeposit.id} nolu talep ile ${amountTRY} TRY -> ${netUSDT} USDT için ${financier.financierName} teminatından bloke kondu.`,
      'financier'
    );

    return { 
      success: true, 
      message: `Yükleme talebi oluşturuldu. Lütfen verilen IBAN ve Referans Koduna FAST ile transfer yapıp dekont yükleyin.`,
      depositId: newDeposit.id,
    };
  };

  const uploadDepositReceipt = (depositId: string, fileName: string, note?: string) => {
    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: 'receipt_uploaded',
          receiptFileName: fileName,
          receiptNote: note,
        };
      }
      return d;
    }));

    logAudit(
      'Dekont Yüklendi',
      currentUser.username,
      `${depositId} nolu havale için dekont yüklendi. Finansçı onayına sunuldu.`,
      'financier'
    );

    return { success: true, message: 'Dekont yüklendi! Finansçı kontrol edip kriptoyu bakiyenize aktaracaktır.' };
  };

  const financierApproveDeposit = (depositId: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return { success: false, message: 'Talep bulunamadı.' };

    // Credit buyer balance
    setUsers(prev => prev.map(u => {
      if (u.id === deposit.buyerId) {
        return { ...u, balanceUSDT: Number((u.balanceUSDT + deposit.amountUSDT).toFixed(2)) };
      }
      return u;
    }));

    // Release financier exposure and reward financier fee
    setFinanciers(prev => prev.map(f => {
      if (f.financierId === deposit.financierId) {
        const nextExp = Math.max(0, f.activeExposureUSDT - deposit.amountUSDT);
        return {
          ...f,
          activeExposureUSDT: Number(nextExp.toFixed(2)),
          availableCapacityUSDT: Number((f.collateralUSDT - nextExp).toFixed(2)),
        };
      }
      return f;
    }));

    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        return { ...d, status: 'verified_credited' };
      }
      return d;
    }));

    // Record On-Chain Crypto Transaction
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const depositTx: CryptoTransaction = {
      id: 'ctx-' + Date.now(),
      txHash: '0x' + randomHex,
      network: 'BEP-20',
      type: 'deposit',
      fromAddress: '0xFinancier_Pool_' + deposit.financierId.slice(-4),
      toAddress: '0xBuyer_Vault_' + deposit.buyerId.slice(-4),
      amountUSDT: deposit.amountUSDT,
      feeUSDT: 0.2,
      confirmations: 15,
      requiredConfirmations: 15,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(48938000 + Math.random() * 5000),
      relatedDepositId: deposit.id,
      note: `FAST / Havale karşılığı (${deposit.amountTRY.toLocaleString()} TRY) bakiye yüklemesi tamamlandı`,
    };
    setCryptoTransactions(prev => [depositTx, ...prev]);

    // Send confirmation to deposit conversation if exists
    const conv = conversations.find(c => c.referenceId === deposit.id);
    if (conv) {
      const doneMsg: ChatMessageItem = {
        id: 'msg-' + Date.now(),
        conversationId: conv.id,
        senderId: deposit.financierId,
        senderName: deposit.financierName,
        senderRole: 'financier',
        text: `💰 HAVALE TEYİT EDİLDİ: ${deposit.amountTRY.toLocaleString()} TRY banka hesabımıza ulaştı. ${deposit.amountUSDT} USDT anında cüzdanınıza aktarıldı. İyi alışverişler!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemEvent: true,
        systemEventType: 'payment_confirmed',
        isEncrypted: true,
      };
      setMessages(prev => [...prev, doneMsg]);
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, escrowStatus: 'verified_credited' } : c));
    }

    sendTelegramPush(
      deposit.buyerId,
      `🔔 [NOKTAG BOT]: 💰 BAKİYE YÜKLENDİ! Finansçı FAST işleminizi onayladı. ${deposit.amountUSDT} USDT hesabınıza aktarıldı.`
    );

    logAudit(
      'IBAN Havalesi Onaylandı & USDT Yüklendi',
      deposit.financierName,
      `${deposit.id} nolu talep için ${deposit.amountTRY} TRY teyit edildi. ${deposit.amountUSDT} USDT alıcı (${deposit.buyerName}) cüzdanına tanımlandı.`,
      'financier'
    );

    return { success: true, message: `Banka havalesi onaylandı ve ${deposit.amountUSDT} USDT alıcının hesabına aktarıldı!` };
  };

  // COLLATERAL (TEMİNAT / GÜVENCE BEDELİ)
  const depositCollateral = (amountUSDT: number) => {
    if (currentUser.balanceUSDT < amountUSDT) {
      return { success: false, message: 'Yetersiz bakiye. Önce cüzdanınıza bakiye yükleyin.' };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balanceUSDT: Number((u.balanceUSDT - amountUSDT).toFixed(2)),
          collateralUSDT: Number((u.collateralUSDT + amountUSDT).toFixed(2)),
        };
      }
      return u;
    }));

    if (currentUser.role === 'financier') {
      setFinanciers(prev => prev.map(f => {
        if (f.financierId === currentUser.id) {
          const newCollateral = f.collateralUSDT + amountUSDT;
          return {
            ...f,
            collateralUSDT: newCollateral,
            availableCapacityUSDT: newCollateral - f.activeExposureUSDT,
          };
        }
        return f;
      }));
    }

    logAudit(
      'Güvence Bedeli Yatırıldı',
      currentUser.username,
      `${amountUSDT} USDT teminat havuzuna eklendi.`,
      'collateral'
    );

    return { success: true, message: `${amountUSDT} USDT Güvence Bedeli başarıyla kilitlendi.` };
  };

  const withdrawCollateral = (amountUSDT: number) => {
    const availableCollateral = currentUser.collateralUSDT - currentUser.activeExposureUSDT;
    if (amountUSDT > availableCollateral) {
      return { 
        success: false, 
        message: `Çekilemez! Açıkta olan işlemleriniz sebebiyle serbest teminatınız: ${availableCollateral.toFixed(2)} USDT.` 
      };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balanceUSDT: Number((u.balanceUSDT + amountUSDT).toFixed(2)),
          collateralUSDT: Number((u.collateralUSDT - amountUSDT).toFixed(2)),
        };
      }
      return u;
    }));

    if (currentUser.role === 'financier') {
      setFinanciers(prev => prev.map(f => {
        if (f.financierId === currentUser.id) {
          const newCollateral = f.collateralUSDT - amountUSDT;
          return {
            ...f,
            collateralUSDT: newCollateral,
            availableCapacityUSDT: newCollateral - f.activeExposureUSDT,
          };
        }
        return f;
      }));
    }

    logAudit(
      'Güvence Bedeli Çekildi',
      currentUser.username,
      `${amountUSDT} USDT serbest teminat ana bakiyeye aktarıldı.`,
      'collateral'
    );

    return { success: true, message: `${amountUSDT} USDT güvence bedelinden ana cüzdana aktarıldı.` };
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAudit('Sistem Ayarları Güncellendi', 'Admin', JSON.stringify(newSettings), 'admin');
  };

  const toggleUserBan = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isBanned;
        logAudit(
          nextState ? 'Kullanıcı Askıya Alındı' : 'Kullanıcı Yasağı Kaldırıldı',
          'Admin',
          `${u.username} hesabı ${nextState ? 'donduruldu' : 'açıldı'}.`,
          'admin'
        );
        return { ...u, isBanned: nextState };
      }
      return u;
    }));
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setFinanciers(INITIAL_FINANCIERS);
    setDeposits(INITIAL_DEPOSITS);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setConversations(INITIAL_CONVERSATIONS);
    setMessages(INITIAL_CHAT_MESSAGES);
    setCryptoTransactions(INITIAL_CRYPTO_TRANSACTIONS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        orders,
        financiers,
        deposits,
        settings,
        auditLogs,
        conversations,
        messages,
        cryptoTransactions,
        telegramNotifications,
        selectedConversationId,
        activeView,
        userLocation,
        setActiveView,
        setUserLocation,
        switchUser,
        setSelectedConversationId,
        sendTelegramPush,
        markTelegramPushRead,
        sendMessage,
        openOrderConversation,
        openDepositConversation,
        executeCryptoDeposit,
        executeCryptoWithdrawal,
        createOrder,
        fulfillLiveDrop,
        confirmOrderReceipt,
        openDispute,
        adminResolveDispute,
        createProduct,
        requestFiatDeposit,
        uploadDepositReceipt,
        financierApproveDeposit,
        depositCollateral,
        withdrawCollateral,
        updateSettings,
        toggleUserBan,
        resetAllData,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
