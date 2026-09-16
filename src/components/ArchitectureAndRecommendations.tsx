import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Scale, 
  Send,
  Database,
  EyeOff
} from 'lucide-react';

export const ArchitectureAndRecommendations: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Document Header */}
      <div className="border-b border-zinc-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>noktag.com Mühendislik & İş Modeli Mimarisi</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          noktag.com Sistem Mimarisi, Güvenlik Protokolleri ve Stratejik Öneriler
        </h1>
        <p className="text-sm text-zinc-500 font-mono">
          Escrow Emanet Havuzları • Canlı/Ölü Zula Gizliliği • Finansçı IBAN-to-Crypto Ağı • Teminat Matematiği
        </p>
      </div>

      {/* SECTION 1: SYSTEM OVERVIEW & WORKFLOW */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
          <Cpu className="w-5 h-5" />
          <h2>1. Uçtan Uca Sistem Mimarisi ve Veri Akışı</h2>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">
          noktag.com, 4 ana aktör (Alıcı Müşteri, Zula Satıcısı, IBAN Finansçısı, Sistem Yöneticisi/Hakem) arasında 
          sıfır-güven (zero-trust) prensibiyle çalışan bir emanet pazaryeridir.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-1">
            <div className="text-emerald-400 font-bold">1. Giriş / Bakiye</div>
            <p className="text-zinc-500 text-[11px]">
              Kriptosu olan USDT (TRC20/TON) ile, olmayan Finansçı IBAN'ına FAST göndererek hesabına anında bakiye yükler.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-1">
            <div className="text-amber-400 font-bold">2. Emanet Kilidi</div>
            <p className="text-zinc-500 text-[11px]">
              Alıcı ürünü seçtiğinde fonlar alıcıdan çekilir ve Escrow havuzuna kilitlenir. Satıcının teminat kapasitesi kontrol edilir.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-1">
            <div className="text-zinc-700 font-bold">3. Zula Teslimi</div>
            <p className="text-zinc-500 text-[11px]">
              Dead drop ise koordinat anında açılır. Live drop ise satıcı belirlenen sürede (örn. 60 dk) bölgeye bırakıp GPS ve fotoğraf yükler.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-1">
            <div className="text-purple-400 font-bold">4. Çözülme / Hakem</div>
            <p className="text-zinc-500 text-[11px]">
              Alıcı 24 saat içinde onaylarsa fonlar satıcıya geçer (komisyon kasaya kalır). İtiraz olursa Admin Hakem Masası delilleri inceler.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: GÜVENCE BEDELİ (COLLATERAL) MATEMATİĞİ */}
      <div className="bg-white border border-amber-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
          <Lock className="w-5 h-5" />
          <h2>2. Güvence Bedeli (Teminat) ve "Exit-Scam" Koruma Formülü</h2>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">
          Klasik pazaryerlerinde satıcılar ilk birkaç ay dürüst davranıp yüksek itibar topladıktan sonra 
          yüksek hacimli sipariş alıp kaçarlar (Exit Scam). noktag.com bunu <strong>Katı Teminat Eşitliği</strong> ile matematiksel olarak imkansız kılar.
        </p>

        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs font-mono space-y-2">
          <div className="text-amber-300 font-bold">Temel Kural Formülü:</div>
          <div className="p-3 bg-white rounded-lg text-emerald-400 text-sm font-bold">
            Toplam Açık İşlem Tutarı (Active Exposure) ≤ Kilitli Güvence Bedeli (Collateral)
          </div>
          <p className="text-zinc-500 text-[11px]">
            Örnek: Bir satıcı 1,000 USDT güvence bedeli yatırdıysa, sistem ona eş zamanlı olarak toplam tutarı 1,000 USDT'yi geçmeyen sipariş kabul etme izni verir.
            Siparişler alıcılar tarafından teslim alınıp onaylandıkça satıcının açık işlem kapasitesi yeniden serbest kalır.
          </p>
        </div>

        <div className="space-y-2 text-xs text-zinc-700">
          <h4 className="font-semibold text-zinc-900">Finansçılar İçin Teminat Güvencesi:</h4>
          <p className="leading-relaxed">
            Müşteri bir finansçıya 5,000 TRY göndermek istediğinde, sistem finansçının yatırdığı USDT teminatından bu miktarın karşılığı olan ~130 USDT'yi alıcı adına bloke eder.
            Finansçı bankadan parayı alıp kaçamaz, çünkü sistemdeki teminatı zaten rehin alınmıştır. Müşteri dekont yüklediğinde finansçı onaylamazsa Admin devreye girip bloke edilen USDT'yi alıcıya aktarır.
          </p>
        </div>
      </div>

      {/* SECTION 3: LIVE DROP & DEAD DROP SECURITY */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-zinc-700 font-bold text-lg">
          <Zap className="w-5 h-5" />
          <h2>3. Live Drop (Canlı Zula) ve Dead Drop (Hazır Zula) Güvenlik Protokolleri</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
            <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Dead Drop (Hazır Zula) Önerileri:
            </div>
            <ul className="text-zinc-700 space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li><strong>Mıknatıslı & Kamufle Kapsüller:</strong> Metal yüzeyler, taş duvar aralıkları veya saksı altları gibi sokaktan geçenlerin fark edemeyeceği alanlar.</li>
              <li><strong>Şifreli Kriptolama:</strong> Koordinatlar ve fotoğraflar sunucuda asimetrik anahtarla (AES-256) şifrelenmeli, yalnızca alıcı ödemeyi escrowa kilitlediğinde çözülmelidir.</li>
              <li><strong>Maksimum Bekleme Süresi:</strong> Hazır zulalar 72 saatten fazla açık alanda kalırsa çalınma riski artacağından, satıcıya periyodik kontrol zorunluluğu getirilmelidir.</li>
            </ul>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2">
            <div className="text-zinc-700 font-bold text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Live Drop (Canlı Zula) Önerileri:
            </div>
            <ul className="text-zinc-700 space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li><strong>Bölge Yarıçapı (Radius):</strong> Alıcı tam ev adresini değil, semt veya 500m-1km yarıçaplı güvenli bir çevre belirtmelidir (örneğin "Moda Parkı civarı").</li>
              <li><strong>Geri Sayım Sayacı (Countdown):</strong> Satıcı siparişi kabul ettiğinde hazırlık süresi (örneğin 60-90 dakika) başlar. Süre aşılırsa alıcı tek tuşla siparişi iptal edip parasını geri alabilir.</li>
              <li><strong>EXIF & Metadata Temizliği:</strong> Satıcının yüklediği fotoğrafların EXIF verileri (cihaz seri no, çekim saati, telefon modeli) sunucu tarafından anında sıfırlanmalıdır.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 4: FINANCIER & MASAK/BANKING RISKS */}
      <div className="bg-white border border-purple-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-purple-400 font-bold text-lg">
          <Building2 className="w-5 h-5" />
          <h2>4. Finansçılar İçin MASAK ve Banka Bloke Koruma Protokolü</h2>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">
          Türkiye'de ve globalde P2P banka transferi yapan kişilerin en büyük riski "Banka Blokesi", "Şüpheli İşlem Bildirimi (MASAK)" veya 
          ters ibraz (chargeback) dolandırıcılığıdır. noktag.com finansçılarını korumak için şu kuralları tavsiye ediyoruz:
        </p>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
            <div className="text-white font-bold">1. Rastgele Üretilen Referans Kodu Zorunluluğu:</div>
            <p className="text-zinc-500 text-[11px]">
              Alıcı banka açıklamasına asla "noktag", "kripto", "usdt" gibi kelimeler yazamaz. Sistem her işleme benzersiz bir kod (örneğin <code>NK-9923</code>) atar. Açıklama sadece bu kod olmalıdır.
            </p>
          </div>

          <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
            <div className="text-white font-bold">2. İsim & Kimlik Eşleşmesi (Fraud Önleme):</div>
            <p className="text-zinc-500 text-[11px]">
              Üçüncü şahıs hesaplarından yapılan transferler yasaklanmalıdır. Parayı gönderen banka hesabı sahibi ile noktag.com kullanıcısının adı uyuşmalıdır.
            </p>
          </div>

          <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
            <div className="text-white font-bold">3. Finansçı Havuz Rotasyonu:</div>
            <p className="text-zinc-500 text-[11px]">
              Tek bir IBAN'a günde 20'den fazla FAST transferi gelmesi banka algoritmasını tetikler. Finansçı paneline birden fazla IBAN ekleyip otomatik rotasyonla dağıtması sağlanmalıdır.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: REPUTATION SCORE MATHEMATICAL MODEL */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
          <ShieldCheck className="w-5 h-5" />
          <h2>5. İtibar ve Güven Puanı (Reputation Trust Score) Modeli</h2>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">
          Tüm aktörler (Satıcı, Finansçı, Müşteri) şeffaf bir güven skoruna sahip olmalıdır. Güven puanı sadece yıldız ortalaması değil, ağırlıklı bir formüldür:
        </p>

        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs font-mono space-y-2">
          <div className="text-zinc-700 font-bold">Güven Skoru (0 - 100) Hesaplama Bileşenleri:</div>
          <ul className="text-zinc-500 space-y-1 text-[11px] list-disc list-inside">
            <li><strong>Tamamlanan İşlem Hacmi (%40):</strong> Başarıyla biten işlemler güveni artırır.</li>
            <li><strong>Anlaşmazlık Kayıp Oranı (%30):</strong> Hakem tarafından aleyhine karar verilen her itiraz -10 puan düşürür.</li>
            <li><strong>Ortalama Yıldız Puanı (%20):</strong> Alıcıların verdiği 1-5 yıldız değerlendirmeleri.</li>
            <li><strong>Kilitli Teminat Miktarı (%10):</strong> Yüksek teminat yatıran aktörün platforma bağlılığı ödüllendirilir.</li>
          </ul>
        </div>
      </div>

      {/* SECTION 6: TELEGRAM BOT INTEGRATION STRATEGY */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-zinc-700 font-bold text-lg">
          <Send className="w-5 h-5" />
          <h2>6. Telegram Botu ve Telegram Mini App (TMA) Hibrit Stratejisi</h2>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">
          Kullanıcı deneyimi açısından sadece metin komutları (/start, /market) yetersiz kalır. En modern ve güvenli yaklaşım <strong>Telegram Mini App (TMA)</strong> entegrasyonudur:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-1">
            <div className="text-sky-300 font-bold">Chatbot (Metin & Push):</div>
            <p className="text-zinc-500 text-[11px]">
              "Zulanız hazırlandı! Koordinatları görmek için tıklayın", "Yeni havale dekontu geldi", "Escrow serbest bırakıldı" gibi kritik anlık uyarılar için Telegram Bot bildirimleri.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-1">
            <div className="text-emerald-300 font-bold">Mini App (Görsel Deneyim):</div>
            <p className="text-zinc-500 text-[11px]">
              Telegram içinden tek tuşla açılan harita, zula fotoğrafları, filtreler ve tek tıkla satın alım yapmayı sağlayan WebApp arayüzü.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
