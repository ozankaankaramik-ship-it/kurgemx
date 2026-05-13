# KurgemX — Prototip Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `prototip`
- **Amaç:** İş analizi dokümanındaki hikayelere dayalı, tıklanabilir HTML prototip üretir
- **Hedef kitle:** Ürün Sahibi, İş Analisti, Tasarımcı, Geliştirici
- **Üretim zamanı:** İş analizi dokümanı oluşturulduktan sonra
- **Üretim adedi:** Proje başına bir prototip

---

## Girdi

Prototip üretilirken şu bilgiler kullanılır:
- Proje adı ve detaylı açıklama
- Tüm hikayeler (R1 + R2 + R3) — hikaye no, adı, destanı, sprinti
- Her hikayenin **Positive [P]** kabul kriterleri

Negative, Boundary ve Security AC'ler prototipin kapsamı dışındadır — bunlar test senaryosunda ele alınır.

---

## Kapsam

- Tüm release'lerdeki hikayeler dahil edilir: R1, R2, R3
- Her hikaye için en az bir ekran üretilir
- Altyapı ve sistem hikayeleri dahil edilmez (bkz. `is_analizi.md` — Hikaye Seçim Kuralı)

---

## Tasarım Sistemi

### Renkler

| Amaç | Renk | Hex |
|------|------|-----|
| Primary (ana) | Koyu lacivert | #1F3864 |
| Accent (vurgu) | Mavi | #2E75B6 |
| Light bg (açık arka plan) | Açık mavi | #EEF4FB |
| Warning (uyarı/dikkat) | Turuncu | #F59E0B |
| Warning light bg | Açık turuncu | #FEF3C7 |
| Success (başarı) | Yeşil | #22C55E |
| Success light bg | Açık yeşil | #DCFCE7 |
| Error (hata) | Kırmızı | #EF4444 |
| Neutral bg | Açık gri | #F9FAFB |
| Border | Gri | #E5E7EB |
| Text primary | Koyu | #111827 |
| Text secondary | Orta | #6B7280 |

**Turuncu kullanım kuralları:**
- Nadir kullanılır — sadece dikkat gerektiren durumlarda
- "Pending", "In Review", "Bekliyor" gibi ara durumlar
- Uyarı bildirimleri ve dikkat çekilmesi gereken alanlar
- Ana navigasyon, buton ve başlıklarda kullanılmaz

### Yazı Tipi
- Font: System UI / Arial
- Başlık: 16px, font-weight 600
- Alt başlık: 14px, font-weight 500
- Gövde: 14px, font-weight 400
- Yardımcı metin: 12px, color text-secondary

### Durum Renkleri

| Durum | Arka Plan | Yazı |
|-------|-----------|------|
| Pending / Bekliyor | #FEF3C7 | #92400E |
| In Review / İncelemede | #EEF4FB | #1F3864 |
| Approved / Onaylandı | #DCFCE7 | #166534 |
| Rejected / Reddedildi | #FEE2E2 | #991B1B |

---

## Yapı

### Navigasyon
- **Sol menü** (sabit, 240px genişlik):
  - Proje adı üstte
  - Menü yapısı YZ tarafından mantıksal olarak gruplandırılır — destanlara birebir uymak zorunda değildir, proje akışına göre kullanıcı dostu bir yapı kurulur
  - İlk seviyede maksimum 10 item gösterilir
  - Her grubun altında ilgili ekranlar ikinci seviyede listelenir
  - Aktif ekran vurgulanır
  - Release bilgisi (R1/R2/R3) küçük badge olarak gösterilir
- **İçerik alanı** (kalan alan):
  - Aktif ekran gösterilir
  - Üstte ekran başlığı ve ilgili hikaye no'ları
  - Altında ekran içeriği

### Responsive
- Tüm prototipler responsive üretilir — desktop ve mobil uyumlu
- Kullanıcıya platform seçimi sunulmaz; ekranlar her cihazda çalışır
- Desktop (1024px+): Sol menü sabit, içerik alanı geniş
- Tablet (768px-1023px): Sol menü daraltılır, içerik alanı uyum sağlar
- Mobile (767px ve altı): Sol menü hamburger menüye dönüşür, içerik tam genişliğe çıkar, form elemanları dikey düzene geçer, dokunma alanları büyür (min 44px)
- Kullanıcıya şu bilgi gösterilir: "Ekranlar mobil uyumlu responsive ekranlardır."

---

## Ekran Kuralları

### Hikaye-Ekran Eşlemesi
- Her hikaye için ayrı ekran zorunlu değildir
- İlgili hikayeler mantıksal olarak tek ekranda gruplandırılabilir
- Bir ekran birden fazla hikayeyi kapsayabilir
- Bir hikaye birden fazla ekrana yayılabilir (çok adımlı formlar vb.)
- Eşleme YZ tarafından projeye özgü belirlenir

### Her Ekran İçin
1. **Başlık satırı:** Ekran adı + ilgili hikaye no'ları + sprint badge'i
2. **Ekran içeriği:** Hikayenin işlevine göre uygun UI:
   - Liste/tablo hikayeleri → veri tablosu
   - Form hikayeleri → doldurulabilir form
   - Detay hikayeleri → detay kartı
   - Dashboard hikayeleri → özet kartlar + grafik placeholder
3. **Positive AC'ler:** Her AC için ekranda karşılık gelen UI elemanı bulunur

### Zorunlu Alanlar
- Zorunlu form alanları `*` ile işaretlenir
- Zorunlu alanlar boş bırakıldığında hata mesajı gösterilir (kırmızı border + hata metni)

### Butonlar
- **Primary buton:** #1F3864 arka plan, beyaz yazı
- **Secondary buton:** Beyaz arka plan, #2E75B6 border ve yazı
- **Danger buton:** #EF4444 arka plan, beyaz yazı
- **Disabled:** opacity 0.4, cursor not-allowed

### Formlar
- Input yüksekliği: 38px
- Border: 1px solid #E5E7EB
- Focus border: 2px solid #2E75B6
- Border-radius: 6px
- Padding: 8px 12px

### Tablolar
- Başlık satırı: #1F3864 arka plan, beyaz yazı
- Satır zebra: beyaz / #F9FAFB
- Hover: #EEF4FB
- Border: 1px solid #E5E7EB

---

## Navigasyon ve Tıklanabilirlik

- Sol menüdeki her hikayeye tıklanınca ilgili ekran gösterilir
- Formlar doldurulabilir (gerçek veri gönderilmez)
- Butonlara tıklanınca başarı durumu simüle edilir:
  - "Kaydet" → başarı toast mesajı gösterilir
  - "Sil" → onay dialogu çıkar
  - "İptal" → önceki duruma döner
- Tablolarda sıralama simüle edilir (gerçek veri sıralanmaz)

---

## Çıktı Formatı

### Tek HTML Dosyası
- Tüm ekranlar tek `.html` dosyasında
- CSS ve JavaScript inline olarak dosyanın içinde
- Dış bağımlılık yok — sadece dosya açılınca çalışır
- Dosya adı: `prototip-[proje-adi].html`

### Deploy
- HTML dosyası Vercel'e veya herhangi bir statik hosting'e deploy edilebilir
- Link ile paylaşılabilir

---

## Üretim Sınırları

- Her hikaye için maksimum 1 ana ekran
- Maksimum 40 hikaye desteklenir
- Modal ve drawer'lar sadece kritik işlemler için (silme onayı, filtre paneli)
- Gerçek API bağlantısı yapılmaz — tüm veriler mock (sahte) olarak üretilir
- Grafik ve chart'lar placeholder olarak gösterilir

---

## Yazım İlkeleri

- Dil: Kullanıcının platformda seçtiği dilde üretilir
- Ekran metinleri, buton adları ve form etiketleri seçilen dilde yazılır
- Teknik placeholder metinler (Lorem Ipsum) kullanılmaz — gerçekçi örnek veriler kullanılır
- Türkçe projede örnek veriler Türkçe olur (Ahmet Yılmaz, 05xx xxx xx xx vb.)
- İngilizce projede örnek veriler İngilizce olur (John Smith, +1 555 000 0000 vb.)
