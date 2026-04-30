# KurgemX — İş Analizi Dokümanı Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `is_analizi`
- **Amaç:** Release bazında tüm hikayelerin kapsam, kabul kriterleri, sistem gereksinimleri ve teknik detaylarını belgeler
- **Hedef kitle:** İş birimi (tüm bölümler) + Teknik ekip (tüm bölümler)
- **Üretim zamanı:** Release başlangıcında, ilgili hikayelerin analizi tamamlandığında
- **Üretim adedi:** Her release için en fazla bir doküman (R1, R2, R3)

---

## Bölüm Yapısı (5 Bölüm — Değiştirilemez)

### Bölüm 1: Doküman Genel Bilgileri
- Proje adı
- Release (R1 — MVP / R2 — İyileştirme / R3 — Gelişmiş)
- Kapsanan hikayeler listesi (tüm release hikayeleri)
- Tahmini süre
- Öncelik
- Hazırlayan
- Tarih
- Onay durumu
- Sonraki güncelleme

### Bölüm 2: Hikaye Bazında Kapsam ve Kabul Kriterleri
Her hikaye için şu sırayla:
1. Kullanıcı hikayesi (AKTÖR / İHTİYAÇ / FAYDA formatında)
2. Kapsam tablosu (içinde ✅ / dışında ❌)
3. **Ekran mockup'ı** (kabul kriterlerinin hemen üstünde)
4. Kabul kriterleri (sadeleştirilmiş format — aşağıya bakın)
5. İş kuralları (BR-XXX — ilgili kriterin hemen altında)

### Bölüm 3: Sistem Gereksinimleri
Release genelinde geçerli olan, belirli bir hikayeye bağlı olmayan gereksinimler bu bölümde ele alınır.

**3.1 Fonksiyonel Olmayan Gereksinimler**

Her release için değerlendirilmeli; ilgili olmayanlar atlanabilir:

| Konu | Açıklama |
|------|---------|
| Performans | Yanıt süresi hedefleri, eş zamanlı kullanıcı kapasitesi |
| Responsive / Mobil uyum | Tüm cihazlarda çalışma gereksinimleri |
| Uptime / Güvenilirlik | Kesintisiz çalışma süresi hedefi |
| Erişilebilirlik | WCAG standartları (R2'de ele alınabilir) |
| Loglama ve izlenebilirlik | Günlükleme, izleme, ölçüm gereksinimleri |

**3.2 Geçiş Gereksinimleri**

Her release için değerlendirilmeli; ilgili olmayanlar atlanabilir:

| Konu | Açıklama |
|------|---------|
| Kullanıcı eğitimi | Onboarding materyalleri, eğitim planı |
| Veri aktarımı | Mevcut veri veya dokümanların sisteme taşınması |
| Geri dönüş planı | Rollback senaryosu ve sorumlulukları |
| İletişim planı | Kullanıcılara ve paydaşlara duyuru planı |

### Bölüm 4: Etki Analizi
- Bloke olan hikayeler tablosu
- Etkilenen iş süreçleri
- Riskler tablosu (Risk, Olasılık, Etki, Azaltım Stratejisi)

### Bölüm 5: Teknik Detaylar ve Entegrasyonlar *(yalnızca teknik ekip)*
- API uç noktaları (istek/yanıt örnekleri JSON formatında)
- Veritabanı şeması (tablo yapıları, RLS politikaları)
- Güvenlik uygulaması
- Entegrasyon noktaları tablosu

---

## Kullanıcı Hikayesi Formatı

```
AKTÖR:    [Rol] olarak
İHTİYAÇ: [Eylem] yapabilmeliyim
FAYDA:   Böylece [sonuç/değer] gerçekleştirebilirim
```

**Kurallar:**
- İHTİYAÇ her zaman `-meli` / `-malı` ile biter (Türkçe seçiliyse)
- AKTÖR rol bazlıdır (isim değil): "İş analisti olarak", "Yönetici olarak"
- FAYDA somut bir iş değeri ifade eder

---

## Kabul Kriteri Formatı (Sadeleştirilmiş)

### Numaralandırma
- Format: `AC-[SıraNo]` — örn. AC-001, AC-002
- Numaralar doküman genelinde devam eder, hikaye değişince sıfırlanmaz
- AC → Acceptance Criteria, BR → Business Rule, TC → Test Case

### Kriter Tipleri
- `[Positive]` — başarılı / mutlu yol kriterleri (en az 2)
- `[Negative]` — hata kriterleri (en az 2)
- `[Boundary]` — sınır / kenar durumlar
- `[Security]` — güvenlik ve doğrulama (KVKK içeren hikayelerde zorunlu)

### Kriter Başına Minimum / Maksimum
- Her hikaye için: minimum 4, maksimum 8 kabul kriteri

### Format

```
AC-001 — [Kriter Başlığı] [Tip Etiketi]

[Tek düz cümle: koşul + eylem + beklenen sonuç.
Teknik olmayan kişilerin anlayabileceği dilde yazılır.
KOŞUL / EYLEM / SONUÇ blokları kullanılmaz.]

BR-001 · [İş Kuralı Başlığı]  ← sadece bu kritere ait iş kuralı varsa
[Kural detayı, koşullar, istisnalar. Somut örneklerle açıkla.]
```

### Örnek

```
AC-001 — Başarılı Proje Oluşturma [Positive]

Kullanıcı zorunlu alanları doldurup "Proje Oluştur" butonuna tıkladığında
proje veritabanına kaydedilir, proje detay ekranına yönlendirilir ve
başarı bildirimi gösterilir.

BR-001 · Proje adı zorunluluğu
Proje adı boş veya yalnızca boşluktan oluşan değer kabul edilmez.
Maksimum 100 karakter.
```

---

## Kabul Kriteri ile Test Case Farkı

| | Kabul Kriteri | Test Case |
|---|---|---|
| Soru | Ne bekliyoruz? | Nasıl test edeceğiz? |
| Perspektif | İş perspektifi | Teknik perspektif |
| Odak | Onay odaklı | Uygulama odaklı |
| Kimin için | İş birimi + Teknik ekip | Test ekibi |
| Format | Düz açıklama cümlesi | Adım adım teknik |

---

## İş Kuralı Formatı

```
BR-XXX · [Kural Başlığı]
[Kural detayı, koşullar, istisnalar, somut örnekler]
```

**Kurallar:**
- Numaralandırma proje genelinde sıralıdır (BR-001, BR-002 ...)
- İş kuralları ilgili kabul kriterinin hemen altında yer alır — ayrı bölüm olmaz
- Aynı iş kuralı birden fazla kriterde geçerliyse tekrar yazılmaz, "BR-XXX geçerlidir" yaz
- Kategoriler: Kimlik Doğrulama, Veri Güvenliği/KVKK, İş Süreci, Raporlama/Denetim

---

## Kapsam Tablosu Formatı

| ✅ Kapsam İçinde | ❌ Kapsam Dışında |
|-----------------|-----------------|
| [Özellik] | [Özellik] → ST-XX kapsamında ele alınacak |

Kapsam dışındaki her madde için hangi hikayede ele alındığı mutlaka belirtilir.

---

## Ekran Görüntüsü Kuralları

- Tel çatı (ASCII wireframe) kullanılmaz
- Gerçekçi mockup görüntüleri kullanılır (HTML → PNG, wkhtmltoimage)
- Görüntü boyutu: genişlik 580px (Word'de), EMU genişlik: 5486400
- Yükseklik orantılı olarak hesaplanır: `EMU_h = piksel_h * 914400 / 96`
- Her görüntünün altında: `Şekil N — [Ekran adı ve kısa açıklama]` (italik, ortalı)
- **Zorunlu alanlar mockup'ta `*` ile işaretlenir**
- Ekran, ilgili hikayenin kabul kriterlerinin hemen üstünde gösterilir
- Referans satırı: `İlgili kriterler: AC-XXX, AC-YYY | Tasarım: Masaüstü · Tablet · Mobil`
- Duyarlı tasarım notu: Masaüstü / Tablet / Mobil

---

## Teknik Bölüm Standartları

### API Uç Noktası Formatı
```
[METHOD] /api/[endpoint]
İstek:  { alan: tip, ... }
Başarı: [HTTP kodu] — { ... }
Hata:   [HTTP kodu] — { "error": "..." }
```

### Veritabanı Şeması Tablosu
Sütunlar: Alan | Tip | Zorunlu | Açıklama

### RLS Politikaları
Her tablo için SELECT, INSERT, UPDATE, DELETE politikaları ayrı ayrı belirtilir.

---

## Yazım İlkeleri

- Dil: Kullanıcının platformda seçtiği dilde üretilir
  - Tüm metin, başlık, tablo ve açıklamalar seçilen dilde yazılır
  - Kullanıcı Türkçe seçtiyse terminoloji: Destan (Epic), Hikaye (Story), Sürüm (Release), Kabul Kriteri (Acceptance Criteria), İş Kuralı (Business Rule)
  - Diğer dillerde standart uluslararası terimler kullanılır
  - Kısaltmalar dil seçiminden bağımsız her zaman evrensel formatta kullanılır: ST, SP, R, AC, BR, TC
- Ton: Profesyonel, net, açık. Teknik olmayan paydaşların anlayabileceği dil
- KVKK/Güvenlik: İlgili hikayelerde güvenlik kriterleri ve iş kuralları mutlaka yer alır
- Teknik terim açıklaması: OTP, JWT, RLS gibi terimler ilk geçtiklerinde parantez içinde açıklanır
- Bütünü gör: Bir hikayenin diğerleriyle ilişkisi etki analizinde ve kapsam dışında mutlaka belirtilir

---

## Doküman Kullanım Notu

**İş Birimi (Ürün Sahibi, İş Analisti) için:**
- Bölüm 1, 2, 3 ve 4 iş birimi onayı için hazırlanmıştır
- Bölüm 5 teknik ekip içindir, atlanabilir
- Kabul kriterleri, iş kuralları ve sistem gereksinimleri iş birimi tarafından onaylanmalıdır

**Teknik Ekip için:**
- Tüm bölümler okunmalıdır
- Bölüm 5 uygulama için kritiktir
- Kabul kriterleri test case'lerinin temelini oluşturur

---

## Referans: Evrensel Kısaltmalar

| Kısaltma | Açılım | Örnek |
|----------|--------|-------|
| ST | Story (Hikaye) | ST1, ST2 |
| SP | Sprint | SP1, SP2 |
| R | Release | R1, R2, R3 |
| AC | Acceptance Criteria (Kabul Kriteri) | AC-001 |
| BR | Business Rule (İş Kuralı) | BR-001 |
| TC | Test Case | TC-ST1-01 |
