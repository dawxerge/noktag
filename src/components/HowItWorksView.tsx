import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  User, 
  Store, 
  Building2, 
  Scale, 
  MapPin, 
  Zap, 
  Clock, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  ArrowRight, 
  Send, 
  FileText, 
  Eye, 
  EyeOff, 
  Terminal, 
  Compass,
  DollarSign,
  Layers,
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';

type RoleTab = 'customer' | 'seller' | 'financier' | 'admin';

export const HowItWorksView: React.FC = () => {
  const { setActiveView, switchUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<RoleTab>('customer');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [simulationStep, setSimulationStep] = useState<number>(1);

  // Role details mapping
  const roleInfo = {
    customer: {
      badge: 'MÜŞTERİ / ALICI PROTOKOLÜ',
      title: 'Müşteri Olarak noktag.com Nasıl Kullanılır?',
      color: 'emerald',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/20',
      textColor: 'text-emerald-400',
      accentBg: 'bg-emerald-500',
      summary: 'Tamamen anonim, güvenli escrow koruması altında hazır veya canlı zula ile teslimat alma rehberi.'
    },
    seller: {
      badge: 'ZULA SATICISI PROTOKOLÜ',
      title: 'Satıcı Olarak İlan Verme ve Zula Hazırlama',
      color: 'amber',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/20',
      textColor: 'text-amber-400',
      accentBg: 'bg-amber-500',
      summary: 'Teminat kilitli açık işlem kapasitesi, Dead Drop koordinat yükleme ve Live Drop geri sayımlı zula operasyonu.'
    },
    financier: {
      badge: 'P2P FİNANSÇI PROTOKOLÜ',
      title: 'Finansçı Olarak IBAN-to-Crypto Masası İşletme',
      color: 'purple',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/20',
      textColor: 'text-purple-400',
      accentBg: 'bg-purple-500',
      summary: 'Kriptosu olmayan alıcılardan FAST/Havale kabul edip USDT tanımlayarak her işlemden %3-%5 komisyon kazanma.'
    },
    admin: {
      badge: 'HAKEM VE YÖNETİCİ PROTOKOLÜ',
      title: 'Sistem Yöneticisi ve Hakem Karar Masası',
      color: 'red',
      borderColor: 'border-red-500/40',
      bgColor: 'bg-red-950/20',
      textColor: 'text-red-400',
      accentBg: 'bg-red-500',
      summary: 'Otomatik çalışan emanet sisteminde anlaşmazlık (dispute) durumlarında delil inceleme ve fon yönetimi.'
    }
  };

  const currentRoleData = roleInfo[selectedRole];

  // FAQs per role
  const faqs = {
    customer: [
      {
        q: 'Param sistemde nasıl güvende tutuluyor?',
        a: 'Sipariş verdiğiniz an ödediğiniz tutar doğrudan satıcıya gitmez. noktag.com Akıllı Escrow (Emanet) havuzunda kilitlenir. Zula koordinatlarını alıp ürünü fiziksel olarak bulup elinize alana kadar paranız güvendedir. Siz "Teslim Aldım & Onayla" butonuna basmadan veya 24 saatlik yasal süre dolmadan satıcı parayı çekemez.'
      },
      {
        q: 'Dead Drop (Hazır Zula) ile Live Drop (Canlı Zula) arasındaki fark nedir?',
        a: 'Dead Drop, satıcının daha önceden güvenli bir noktaya yerleştirip mühürlediği hazır zuladır; satın aldığınız anda koordinatları ve şifreli fotoğrafı açılır. Live Drop ise sizin siparişinizin ardından satıcının belirlediği süre (örn. 60-90 dakika) içerisinde bulunduğunuz semtin yakınındaki güvenli bir koordinata giderek özel olarak bıraktığı zuladır.'
      },
      {
        q: 'Zulayı belirtilen koordinatta bulamazsam ne yapmalıyım?',
        a: 'Koordinat sayfasındaki "Sorun Bildir / İtiraz Aç (Dispute)" butonuna basarak itiraz başlatabilirsiniz. Gerekçenizi ve olay yerinin fotoğrafını yüklediğiniz an emanetteki para dondurulur ve Admin Hakem Masası incelemeye alır. Haklı bulunursanız paranız %100 cüzdanınıza iade edilir.'
      },
      {
        q: 'Kripto param (USDT) yoksa nasıl alışveriş yaparım?',
        a: 'Sitedeki "Finansçılar (IBAN to Crypto)" menüsüne girin. Güvence bedeli yatırmış onaylı bir finansçıyı seçerek belirtilen IBAN\'a FAST/Havale gönderin (referans kodunu yazarak). Dekontu sisteme yüklediğinizde finansçı onaylar ve USDT bakiyeniz anında hesabınıza yüklenir.'
      }
    ],
    seller: [
      {
        q: 'Güvence Bedeli (Teminat) kuralı nedir ve neden zorunludur?',
        a: 'noktag.com üzerinde hiçbir satıcı, yatırdığı güvence bedelinden (collateral) daha fazla tutarda açıkta sipariş tutamaz (Açık Siparişler ≤ Teminat). Bu kural, satıcıların para toplayıp kaçmasını (Exit-Scam) engeller. Örneğin 1,000 USDT teminatınız varsa, toplam 1,000 USDT\'lik sipariş alabilirsiniz. Alıcılar teslim aldıkça teminat kapasiteniz anında yeniden açılır.'
      },
      {
        q: 'Canlı Zula (Live Drop) hazırlarken süre aşılırsa ne olur?',
        a: 'Live Drop ilanınızda belirttiğiniz hazırlık süresi (örn. 60 dakika) sipariş anında geri sayım olarak başlar. Belirlenen sürede zula koordinatı yüklenmezse, alıcı siparişi tek tıkla iptal edip parasını geri alabilir ve satıcının güven puanı düşer.'
      },
      {
        q: 'Zula fotoğraflarını yüklerken nelere dikkat etmeliyim?',
        a: 'noktag.com sunucuları fotoğrafların EXIF verilerini (cihaz modeli, GPS izi, çekim tarihi) otomatik olarak temizler. Yine de satıcı olarak çevrede plaka, güvenlik kamerası veya sokak sakinlerinin görünmediği, yalnızca alıcının zula kutusunu bulmasını sağlayacak net ve gizli açılı çekimler yapmalısınız.'
      },
      {
        q: 'Kazandığım para ne zaman hesabıma geçer?',
        a: 'Alıcı koordinatları aldıktan sonra ürünü teslim alıp onayladığı an, %3 platform komisyonu kesilerek net tutar anında satıcı cüzdan bakiyenize yansır ve dilediğiniz zaman harici TRC20/TON cüzdanınıza çekebilirsiniz.'
      }
    ],
    financier: [
      {
        q: 'Finansçı olarak sistemde nasıl para kazanırım?',
        a: 'Kripto kullanmayı bilmeyen veya acil yükleme yapmak isteyen alıcılar, sizin ilan ettiğiniz döviz kuru ve komisyon oranından (örn. %3.5 - %5.0) IBAN\'ınıza Türk Lirası gönderir. Siz gelen FAST havalesini mobil bankacılığınızdan kontrol edip onayladığınızda, komisyonunuz cebinizde kalır.'
      },
      {
        q: 'Finansçılar için teminat nasıl işler?',
        a: 'Finansçı sisteme belirli bir USDT teminatı kilitler (örn. 3,000 USDT). Bir alıcı sizden 5,000 TL yükleme talebi açtığında, bu tutarın karşılığı olan USDT teminatınızdan bloke edilir. Alıcı parayı gönderip dekont yüklediğinde siz onaylarsınız ve bloke çözülüp alıcıya aktarılır.'
      },
      {
        q: 'Banka hesabımın MASAK veya banka tarafından bloke olmasını nasıl önlerim?',
        a: '1) Alıcılara asla banka açıklamasına "kripto", "noktag", "usdt" gibi kelimeler yazdırmayın. Sistem her işleme benzersiz bir kod (örn. NK-4912) verir, yalnızca bu kod yazılmalıdır. 2) Günde tek bir IBAN üzerinden çok sayıda işlem yapmak yerine sistemdeki IBAN rotasyonunu kullanın.'
      }
    ],
    admin: [
      {
        q: 'Sistem ne zaman otomatik çalışır, ne zaman admin müdahalesi gerekir?',
        a: 'Siparişler, zula koordinatlarının iletilmesi, otomatik 24 saatlik onay süresi ve komisyon kesintileri %100 otomatiktir. Admin yalnızca alıcı veya satıcı "İtiraz (Dispute)" açtığında Hakem Masası olarak devreye girer.'
      },
      {
        q: 'Hakem Masası anlaşmazlıkları nasıl çözer?',
        a: 'Admin panelinde alıcının şikayeti, yüklediği olay yeri fotoğrafları, satıcının zula koordinatları ve gizlilik talimatları karşılaştırılır. Admin: 1) Alıcı Haklı (Parayı alıcıya iade et), 2) Satıcı Haklı (Parayı satıcıya aktar), 3) 50/50 Uzlaşma (Parayı eşit bölüştür) kararlarından birini gerekçesiyle uygular.'
      },
      {
        q: 'Sistem komisyonları ve süreler nereden değiştirilir?',
        a: 'Yönetici Panelindeki "Yüzdeler & Parametreler" sekmesinden platform komisyon oranı (%0 - %20), otomatik onay süresi (saat) ve asgari teminat limitleri canlı olarak güncellenebilir.'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Tactical Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        {/* Cyber grid & glowing radial backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-100 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NOKTAG.COM PROTOKOL REHBERİ & AKADEMİ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Sıfır-Güven (Zero-Trust) <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Canlı & Hazır Zula Escrow Nasıl Çalışır?
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
            noktag.com, alıcı ve satıcının birbirini tanımasına gerek kalmadan, kripto emanet ve fiziksel zula 
            teknolojisiyle güvenli alışveriş yapmasını sağlayan merkeziyetsiz mantıkla çalışan bir platformdur.
          </p>

          {/* Key Metric Badges */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-mono">
            <div className="bg-white/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>%100 Kilitli Emanet (Escrow)</span>
            </div>
            <div className="bg-white/80 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-zinc-800">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Teminat Kadar Açık İşlem Limiti</span>
            </div>
            <div className="bg-white/80 border border-purple-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-zinc-800">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>IBAN to Crypto P2P Masaları</span>
            </div>
            <div className="bg-white/80 border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-zinc-800">
              <Send className="w-4 h-4 text-zinc-700" />
              <span>Anlık Telegram Bot Uyarıları</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: SYSTEM-WIDE INTERACTIVE CYCLE DIAGRAM */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              1. noktag.com 4 Adımlı Akıllı Döngüsü
            </h2>
            <p className="text-xs text-zinc-500 font-mono">
              Paranızın ve ürününüzün adım adım sistemdeki güvenli yolculuğu:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {/* Step 1 */}
          <div className="bg-white border border-zinc-200 hover:border-emerald-500/50 p-4 rounded-2xl space-y-3 transition-all group relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900 text-sm">Bakiye & Sipariş</h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Müşteri USDT ile veya Finansçı IBAN'ına FAST atarak bakiye yükler. Dead veya Live Drop ürününü seçip sipariş verir.
              </p>
            </div>
            <div className="p-2 rounded bg-white text-[10px] text-emerald-400 border border-emerald-500/20">
              ⚡ Tutar Escrow Havuzuna Kilitlenir
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-zinc-200 hover:border-amber-500/50 p-4 rounded-2xl space-y-3 transition-all group relative">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900 text-sm">Zula Operasyonu</h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Hazır zula ise anında, Canlı zula ise satıcının belirlediği sürede (örn. 60 dk) bölgeye bırakılarak GPS & kanıt yüklenir.
              </p>
            </div>
            <div className="p-2 rounded bg-white text-[10px] text-amber-400 border border-amber-500/20">
              📍 Şifreli Koordinatlar Alıcıya Açılır
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-zinc-200 hover:border-zinc-200 p-4 rounded-2xl space-y-3 transition-all group relative">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900 text-sm">Fiziksel Teslim Alma</h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Alıcı GPS koordinatına ve kamuflaj ipucuna göre noktaya gidip zula kutusunu alır ve içeriği kontrol eder.
              </p>
            </div>
            <div className="p-2 rounded bg-white text-[10px] text-zinc-700 border border-zinc-200">
              ⏱️ 24 Saatlik İnceleme & Onay Süresi
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-zinc-200 hover:border-purple-500/50 p-4 rounded-2xl space-y-3 transition-all group relative">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900 text-sm">Çözülme / Hakem</h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Alıcı onayladığında fonlar satıcıya geçer (%3 komisyon kesilir). Sorun varsa itiraz açılır, Admin Hakem Masası çözer.
              </p>
            </div>
            <div className="p-2 rounded bg-white text-[10px] text-purple-400 border border-purple-500/20">
              ✅ Güven Puanları Otomatik Güncellenir
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPREHENSIVE ROLE SELECTOR & DETAILED HELP CENTER */}
      <div className="space-y-6">
        <div className="border-b border-zinc-200 pb-2">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-700" />
            2. Rolünüze Göre Detaylı Kullanım Kılavuzu
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            İncelemek istediğiniz aktörün kılavuzunu seçin:
          </p>
        </div>

        {/* Role Select Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <button
            onClick={() => setSelectedRole('customer')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'customer'
                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <User className="w-4 h-4 text-emerald-400" />
              <span>MÜŞTERİ</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Alışveriş & Zula Bulma</div>
          </button>

          <button
            onClick={() => setSelectedRole('seller')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'seller'
                ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <Store className="w-4 h-4 text-amber-400" />
              <span>SATICI</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Teminat & Zula Bırakma</div>
          </button>

          <button
            onClick={() => setSelectedRole('financier')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'financier'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>FİNANSÇI (P2P)</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">IBAN'dan Kripto Masası</div>
          </button>

          <button
            onClick={() => setSelectedRole('admin')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'admin'
                ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-500/10'
                : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <Scale className="w-4 h-4 text-red-400" />
              <span>HAKEM & ADMİN</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">İtirazlar & Fon Yönetimi</div>
          </button>
        </div>

        {/* Selected Role Deep-Dive View */}
        <div className={`border ${currentRoleData.borderColor} ${currentRoleData.bgColor} rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <span className={`text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-zinc-200 ${currentRoleData.textColor}`}>
                {currentRoleData.badge}
              </span>
              <h3 className="text-2xl font-bold text-zinc-900 mt-2">
                {currentRoleData.title}
              </h3>
              <p className="text-xs text-zinc-700 font-mono mt-1">
                {currentRoleData.summary}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedRole === 'customer') switchUser('usr-customer-1');
                  else if (selectedRole === 'seller') switchUser('usr-seller-1');
                  else if (selectedRole === 'financier') switchUser('usr-financier-1');
                  else switchUser('usr-admin-1');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-black ${currentRoleData.accentBg} hover:opacity-90 transition-all flex items-center gap-1.5`}
              >
                <span>Bu Role Geç ve Dene</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Detailed Step-by-Step for the chosen role */}
          {selectedRole === 'customer' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                    Bakiye Yükleme (Kripto veya IBAN)
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Eğer elinizde USDT varsa cüzdan adresinize doğrudan aktarın. Yoksa "Finansçılar" sekmesine girip dilediğiniz finansçının IBAN'ına FAST atarak dakikalar içinde USDT yükleyin.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                    Zula Seçimi (Live vs Dead)
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Pazar yerinde şehir ve semtinize göre filtreleyin. Anında almak istiyorsanız <strong>Dead Drop</strong>, yakınınızdaki güvenli bir noktaya bırakılmasını istiyorsanız <strong>Live Drop</strong> seçip sipariş notu ekleyin.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                    Zulayı Alma ve Onaylama
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Koordinat ve ipucu belirdiğinde noktaya gidip paketi alın. Ürünü kontrol ettikten sonra "Teslim Aldım & Onayla"ya basın. Eğer kutu yerinde yoksa panik yapmayın, hemen "İtiraz Aç (Dispute)"a tıklayın.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'seller' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                    Güvence Bedeli (Teminat) Kilitleme
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Satış yapabilmek için satıcı paneline teminat yatırın. Yatırılan teminat kadar açık işlem hakkınız olur (Örn: 1000 USDT teminat = Max 1000 USDT açıkta sipariş).
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                    İlan Oluşturma (Dead & Live Drop)
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Dead Drop için önceden hazırladığınız GPS koordinatı ve fotoğrafı girin. Live Drop için müşterinin istediği bölgeye göre hazırlayabileceğiniz süreyi (örn. 60 dk) tanımlayın.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
                    Canlı Zula Teslimi & Tahsilat
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Live sipariş geldiğinde geri sayım süresi içinde zulayı bırakıp panelden koordinatları girin. Alıcı onayladığında fonlar hesabınıza net olarak aktarılır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'financier' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-purple-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">1</span>
                    Teminat ve Masa Açılışı
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Finansçı olmak için sisteme USDT teminatı yatırın. Komisyon oranınızı (örn. %4) ve desteklediğiniz bankaları ilan edin.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-purple-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">2</span>
                    FAST Havale Kabulü & Referans Kodu
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Müşteri talep açtığında karşılık gelen USDT teminatınızdan bloke edilir. Müşteri açıklamaya sistem referans kodunu yazarak parayı gönderir ve dekont yükler.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-purple-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">3</span>
                    Mobil Bankacılık Onayı & Kazanç
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Bankanıza gelen FAST tutarını kontrol edip panelden "Onayla"ya basın. USDT müşteriye aktarılır, komisyon kârınız cebinizde kalır, teminat limitiniz yeniden açılır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">1</span>
                    Hakem Masası İncelemesi
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Alıcı zulanın yerinde olmadığını iddia edip itiraz açtığında emanetteki fonlar kilitlenir. Admin delilleri, GPS kayıtlarını ve fotoğrafları inceler.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">2</span>
                    Karar Verme ve Fon Dağıtımı
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Admin delillere göre 3 karar verebilir: Alıcıya %100 iade, Satıcıya %100 serbest bırakma veya şüpheli/kısmi durumlarda %50-%50 eşit bölüştürme.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
                  <div className="text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">3</span>
                    Komisyon ve Risk Denetimi
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    Sistem komisyon yüzdesini belirler. Açık işlem limiti riskli sınıra (%80 üzeri) ulaşan veya itiraz kaybetme oranı yüksek aktörleri tek tıkla dondurur.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE LIVE DROP SIMULATION TOOL */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-700 font-bold">
              <Sparkles className="w-4 h-4" />
              İNTERAKTİF SİMÜLASYON DENEYİMİ
            </div>
            <h3 className="text-xl font-bold text-zinc-900">
              Canlı Zula (Live Drop) Satın Alma Adım Adım Simülasyonu
            </h3>
            <p className="text-xs text-zinc-500 font-mono">
              Aşağıdaki adımlara tıklayarak bir siparişin gerçekte nasıl işlediğini canlı görün:
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500">Simülasyon Aşaması:</span>
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-black font-bold">
              Adım {simulationStep} / 4
            </span>
          </div>
        </div>

        {/* Step Progression Tabs */}
        <div className="grid grid-cols-4 gap-2 font-mono text-xs">
          <button
            onClick={() => setSimulationStep(1)}
            className={`py-2 px-3 rounded-xl border text-center transition-all ${
              simulationStep === 1
                ? 'bg-zinc-800 text-black font-bold border-cyan-400'
                : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900'
            }`}
          >
            1. Sipariş & Emanet
          </button>
          <button
            onClick={() => setSimulationStep(2)}
            className={`py-2 px-3 rounded-xl border text-center transition-all ${
              simulationStep === 2
                ? 'bg-zinc-800 text-black font-bold border-cyan-400'
                : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900'
            }`}
          >
            2. Canlı Hazırlık
          </button>
          <button
            onClick={() => setSimulationStep(3)}
            className={`py-2 px-3 rounded-xl border text-center transition-all ${
              simulationStep === 3
                ? 'bg-zinc-800 text-black font-bold border-cyan-400'
                : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900'
            }`}
          >
            3. GPS & Şifre Çözümü
          </button>
          <button
            onClick={() => setSimulationStep(4)}
            className={`py-2 px-3 rounded-xl border text-center transition-all ${
              simulationStep === 4
                ? 'bg-zinc-800 text-black font-bold border-cyan-400'
                : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900'
            }`}
          >
            4. Onay & Çözülme
          </button>
        </div>

        {/* Interactive Step Display */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 font-mono text-xs space-y-4">
          {simulationStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-700">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> Emanet Kilidi Devrede
                </span>
                <span className="text-zinc-400">Tutar: 85.00 USDT</span>
              </div>
              <p className="text-zinc-700 leading-relaxed">
                Alıcı "Kadıköy / Moda Sahili civarında tenha bir köşe" notuyla sipariş verir. 85 USDT alıcının cüzdanından düşülerek Escrow havuzuna kilitlenir. Satıcının 1,200 USDT'lik teminatından 85 USDT bloke edilir.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setSimulationStep(2)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-1"
                >
                  <span>Sonraki Adım: Satıcı Bildirimi</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {simulationStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-700">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-spin" /> Canlı Hazırlık Süresi (60 Dakika Geri Sayım)
                </span>
                <span className="text-zinc-400">Kalan Süre: 42:15</span>
              </div>
              <p className="text-zinc-700 leading-relaxed">
                Satıcının telefonuna Telegram üzerinden "YENİ CANLI ZULA TALEBİ: Moda Sahili" bildirimi düşer. Satıcı zula paketini su geçirmez mıknatıslı kutuya yerleştirir ve alıcının semtine doğru yola çıkar.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setSimulationStep(3)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-1"
                >
                  <span>Sonraki Adım: Zula Bırakıldı</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {simulationStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-700">
                <span className="text-zinc-700 font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Koordinatlar Açıldı & Alıcı Bildirimi
                </span>
                <span className="text-zinc-400">GPS: 40.9875° N, 29.0258° E</span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1 text-zinc-700">
                <div>İpucu: "Moda Çay Bahçesi arkasındaki taş istinat duvarı, 3. oyukta mat siyah mıknatıslı kutu."</div>
                <div>Gizlilik: "Kimseyle göz teması kurmadan 2 saniyede elinizle alabilirsiniz."</div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSimulationStep(4)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-1"
                >
                  <span>Sonraki Adım: Teslim ve Ödeme</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {simulationStep === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-700">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> İşlem Başarıyla Tamamlandı
                </span>
                <span className="text-emerald-400 font-bold">+82.45 USDT Satıcıya Aktarıldı</span>
              </div>
              <p className="text-zinc-700 leading-relaxed">
                Alıcı kutuyu alıp içeriği onaylar. 85 USDT'den %3 platform komisyonu (2.55 USDT) kesilir, 82.45 USDT satıcının çekilebilir bakiyesine geçer. Satıcının ve alıcının güven puanları artar.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setSimulationStep(1)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-white font-bold rounded-lg"
                >
                  Simülasyonu Baştan Başlat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: ROLE SPECIFIC FREQUENTLY ASKED QUESTIONS */}
      <div className="space-y-4">
        <div className="border-b border-zinc-200 pb-2">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            3. {currentRoleData.badge} - Sıkça Sorulan Sorular
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            En çok merak edilen operasyonel ve güvenlik sorularının yanıtları:
          </p>
        </div>

        <div className="space-y-2">
          {faqs[selectedRole].map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-mono font-bold text-white hover:text-zinc-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-zinc-700">Q{idx + 1}.</span>
                    {item.q}
                  </span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-700" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-700 leading-relaxed font-sans border-t border-zinc-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: OPSEC & PHYSICAL SECURITY PROTOCOLS */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-zinc-800 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Fiziksel Zula & Çevrim İçi Gizlilik Kuralları (OPSEC)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
            <div className="text-emerald-400 font-bold">1. Otomatik EXIF Temizleme</div>
            <p className="text-zinc-500 text-[11px]">
              Yüklenen fotoğraflardan cihazın IMEI, marka, çekim açısı ve tarih damgaları sistemimiz tarafından silinir.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
            <div className="text-amber-400 font-bold">2. Tenha ve Güvenli Noktalar</div>
            <p className="text-zinc-500 text-[11px]">
              Zulalar asla özel mülklere veya güvenlik kamerasının görüş alanına konulmaz; halka açık, kamufle köşelere yerleştirilir.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
            <div className="text-zinc-700 font-bold">3. Sıfır İletişim İzi</div>
            <p className="text-zinc-500 text-[11px]">
              Alıcı ve satıcı birbirinin telefon numarasını veya gerçek kimliğini asla görmez. Tüm haberleşme şifreli sistem üzerindendir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
