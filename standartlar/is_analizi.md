# KurgemX — İş Analizi Dokümanı Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `is_analizi`
- **Amaç:** Tüm release'lerdeki hikayelerin kapsam, kabul kriterleri, sistem gereksinimleri ve teknik detaylarını tek bir dokümanda belgeler
- **Hedef kitle:** İş birimi (tüm bölümler) + Teknik ekip (tüm bölümler)
- **Üretim zamanı:** Hikaye haritası oluşturulduktan sonra
- **Üretim adedi:** Proje başına bir doküman

---

## Bölüm Yapısı (5 Bölüm — Değiştirilemez)

### Bölüm 1: Doküman Genel Bilgileri
- Proje adı
- Kapsanan hikayeler listesi (tüm hikayeler, release bazında gruplandırılmış)
- Tahmini süre (toplam)
- Öncelik
- Hazırlayan
- Tarih
- Onay durumu
- Sonraki güncelleme

### Bölüm 2: Hikaye Bazında Kapsam ve Kabul Kriterleri

Release'ler alt bölümler halinde gruplandırılır:

#### 2.1 R1 — MVP
Her hikaye için şu sırayla:
1. Kullanıcı hikayesi (AKTÖR / İHTİYAÇ / FAYDA formatında)
2. Kapsam tablosu (içinde ✅ / dışında ❌)
3. Kabul kriterleri (sadeleştirilmiş format — aşağıya bakın)
4. İş kuralları (BR-XXX — ilgili kriterin hemen altında)

#### 2.2 R2 — İyileştirme
Aynı yapı R2 hikayelerine uygulanır.

#### 2.3 R3 — Gelişmiş
Aynı yapı R3 hikayelerine uygulanır.

### Bölüm 3: Sistem Gereksinimleri
Proje genelinde geçerli olan gereksinimler bu bölümde ele alınır.

**3.1 Fonksiyonel Olmayan Gereksinimler**

Her release için değerlendirilmeli; ilgili olmayanlar atlanabilir:

| Konu | Açıklama |
|------|---------|
| Performans | Yanıt süresi hedefleri, eş zamanlı kullanıcı kapasitesi |
| Responsive / Mobil uyum | Tüm cihazlarda çalışma gereksinimleri |
| Uptime / Güvenilirlik | Kesintisiz çalışma süresi hedefi |
| Erişilebilirlik | WCAG standartları |
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

## Ekran Tasarımları

Bu dokümanda ekran mockup'ı yer almamaktadır.
Tüm ekran tasarımları için KurgemX'te üretilen prototipe bakınız.

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

BR-001 · [İş Kuralı Başlığı]
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
