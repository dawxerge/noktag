export type UserRole = 'customer' | 'seller' | 'financier' | 'admin';

export type DropType = 'dead_drop' | 'live_drop';

export type EscrowStatus = 
  | 'payment_pending'
  | 'in_escrow'
  | 'preparing_live_drop'
  | 'drop_ready'
  | 'buyer_confirmed'
  | 'disputed'
  | 'refunded_to_buyer'
  | 'released_to_seller'
  | 'cancelled';

export interface Reputation {
  rating: number; // 1.0 - 5.0
  totalTrades: number;
  completedTrades: number;
  disputeCount: number;
  disputeLossCount: number;
  trustScore: number; // 0 - 100
  memberSince: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  username: string;
  telegramHandle?: string;
  role: UserRole;
  balanceUSDT: number;
  collateralUSDT: number; // Güvence bedeli (Satıcı ve Finansçılar için)
  activeExposureUSDT: number; // Açıkta olan işlem toplamı
  reputation: Reputation;
  avatarUrl?: string;
  isBanned?: boolean;
}

export interface DropCoordinates {
  city: string;
  district: string;
  lat?: number;
  lng?: number;
  addressHint: string;
  stealthInstructions: string;
  photoUrl?: string;
  revealedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  priceUSDT: number;
  dropType: DropType;
  city: string;
  district: string;
  lat?: number;
  lng?: number;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerTrustScore: number;
  sellerCollateral: number;
  prepTimeMinutes: number; // Live drop için hazırlık süresi (örneğin 90 dk)
  stock: number;
  imageUrl: string;
  createdAt: string;
  deadDropCoordinates?: DropCoordinates; // Dead drop ise önceden hazır koordinat
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productPriceUSDT: number;
  dropType: DropType;
  city: string;
  district: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  escrowStatus: EscrowStatus;
  platformFeeUSDT: number;
  sellerNetUSDT: number;
  createdAt: string;
  prepDeadline?: string; // Live drop için teslimat son zamanı
  dropDeliveredAt?: string;
  autoConfirmDeadline?: string; // Zula teslim edildikten sonra otomatik onay süresi
  dropCoordinates?: DropCoordinates; // Zula koordinat ve fotoğrafları
  buyerNotes?: string; // Live drop için alıcının tercih ettiği semt/bölge notu
  disputeReason?: string;
  disputeEvidence?: string[];
  disputeOpenedAt?: string;
  disputeResolutionNotes?: string;
  disputeWinner?: 'buyer' | 'seller' | 'split';
  buyerRatingGiven?: number;
  buyerFeedback?: string;
}

export interface FinancierOffer {
  id: string;
  financierId: string;
  financierName: string;
  financierRating: number;
  financierTrustScore: number;
  collateralUSDT: number;
  activeExposureUSDT: number;
  availableCapacityUSDT: number; // Collateral - Exposure
  commissionRatePercent: number; // örneğin %4.5
  supportedBanks: string[];
  minAmountTRY: number;
  maxAmountTRY: number;
  exchangeRateTRYPerUSDT: number; // örn: 38.50 TRY
  isOnline: boolean;
  averageSpeedMinutes: number;
}

export interface FiatDepositRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  financierId: string;
  financierName: string;
  amountTRY: number;
  amountUSDT: number;
  commissionRate: number;
  feeAmountTRY: number;
  bankName: string;
  iban: string;
  ibanOwner: string;
  referenceCode: string;
  status: 'pending_payment' | 'receipt_uploaded' | 'verified_credited' | 'disputed' | 'cancelled';
  createdAt: string;
  receiptNote?: string;
  receiptFileName?: string;
}

export interface SystemSettings {
  platformName: string;
  domain: string;
  platformFeePercent: number; // Varsayılan %3
  autoConfirmHours: number; // 24 saat
  minSellerCollateralUSDT: number; // 100 USDT
  minFinancierCollateralUSDT: number; // 500 USDT
  liveDropMaxPrepTimeHours: number; // 6 saat
  telegramBotUsername: string;
  escrowDisputeArbitrationFee: number; // %0 veya %1
  emergencyMaintenance: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  type: 'escrow' | 'collateral' | 'dispute' | 'financier' | 'admin' | 'crypto';
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isSystemEvent?: boolean;
  systemEventType?: 'escrow_lock' | 'live_drop_ready' | 'receipt_uploaded' | 'dispute_opened' | 'released' | 'refunded' | 'payment_confirmed' | 'drop_ready';
  attachment?: {
    name: string;
    type: 'image' | 'document' | 'location_proof' | 'coordinate' | 'receipt';
    url?: string;
    size?: string;
    exifStripped?: boolean;
  };
  burnAfterReading?: boolean;
  burnTimerMinutes?: number;
  burned?: boolean;
  isEncrypted?: boolean;
}

export interface Conversation {
  id: string;
  type: 'order_escrow' | 'fiat_deposit' | 'dispute_arbitration' | 'direct';
  title: string;
  subtitle: string;
  referenceId?: string; // Order ID or Deposit ID
  participants: {
    userId: string;
    username: string;
    role: UserRole;
    avatarUrl?: string;
  }[];
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
  escrowAmountUSDT?: number;
  escrowStatus?: EscrowStatus | string;
  isEncrypted: boolean;
  autoDestructHours?: number;
  isLocked?: boolean;
}

export interface CryptoTransaction {
  id: string;
  txHash: string;
  network: 'TRC-20' | 'BEP-20' | 'ERC-20' | 'Polygon';
  type: 
    | 'escrow_lock' 
    | 'escrow_release' 
    | 'escrow_refund' 
    | 'deposit' 
    | 'withdrawal' 
    | 'collateral_deposit' 
    | 'collateral_withdrawal' 
    | 'platform_fee';
  fromAddress: string;
  toAddress: string;
  amountUSDT: number;
  feeUSDT: number;
  confirmations: number;
  requiredConfirmations: number;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  blockNumber: number;
  relatedOrderId?: string;
  relatedDepositId?: string;
  note?: string;
}

