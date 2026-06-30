# KurgemX — Mimari Doküman Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `mimari`
- **Amaç:** Teknik mimari, sistem bileşenleri, veri akışları ve entegrasyonları belgeler
- **Hedef kitle:** Teknik ekip (geliştirici, mimar), Ürün Sahibi (genel bakış bölümü)
- **Üretim zamanı:** Proje başlangıcında, teknik tasarım aşamasında

---

## Bölüm Yapısı

### Bölüm 1: Proje Özeti
- Platform ve ürün adı
- Amaç ve hedef kitle
- Dil desteği
- Genel kapsam

### Bölüm 2: Teknik Altyapı
- Teknoloji yığını tablosu (Katman, Teknoloji, Açıklama)
- Seçim gerekçeleri

### Bölüm 3: Sistem Mimarisi
- Bileşenler ve sorumluluklar tablosu
- Veri akışları (geliştirme ve üretim)
- Sistem mimarisi diyagramı

### Bölüm 4: Veritabanı Şeması
- Tablo listesi ve açıklamaları
- İlişki diyagramı (ERD)
- RLS politikaları özeti

### Bölüm 5: Güvenlik
- Kimlik doğrulama yöntemi
- Yetkilendirme yapısı
- KVKK uyumu

### Bölüm 6: Kurulum ve Yapılandırma
- Ortam değişkenleri
- Tamamlanan adımlar
- Yapılacaklar

---

## KurgemX Teknik Yığını (Mevcut)

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js + Tailwind CSS |
| Hosting | Vercel |
| Veritabanı | Supabase (PostgreSQL) |
| AI Motoru | Anthropic Claude API |
| Versiyon Kontrolü | GitHub |
| Geliştirme Aracı | Claude Code (CLI) |
| Ödeme | Stripe (planlı) |

---

## Diagram Standartları

- Sistem mimarisi diyagramı her mimari dokümanda bulunur
- Bileşenler arası oklar veri akış yönünü gösterir
- Geliştirme akışı ve üretim akışı ayrı ayrı gösterilir

---

## Gizlilik Notu

- API anahtarları, şifreler ve token'lar dokümana yazılmaz
- Bunların nerede saklandığı belirtilir: "Vercel Environment Variables"
- Doküman footer'ında: "Gizli — Dahili Kullanım İçin" ibaresi yer alır
