# KurgemX — İş Analizi Dokümanı Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `is_analizi`
- **Amaç:** Hikaye bazında kapsam, kabul kriterleri, iş kuralları ve teknik detayları belgeler
- **Hedef kitle:** İş birimi (tüm bölümler) + Teknik ekip (tüm bölümler)
- **Üretim zamanı:** Sprint planlaması öncesi, ilgili hikayelerin analizi tamamlandığında

---

## Analiz Dokümanı Karar Kılavuzu

Bu kurallar yalnızca analiz dokümanları için geçerlidir.

**Temel kural:**
- 1 sprint → minimum 1 analiz dokümanı
- Hikayelerin birbiriyle ilgisine göre 1 sprint için birden fazla analiz dokümanı önerilebilir

**Tek doküman önerilir:**
- Hikayeler aynı sprint'teyse
- Hikayeler birbirine sıkı bağımlıysa
- Aynı teknik altyapıyı paylaşıyorlarsa

**Ayrı doküman önerilir:**
- Hikayeler farklı destanlardan geliyorsa
- Hikayeler bağımsız onay süreçleri gerektiriyorsa
- Farklı paydaşlara sunulacaksa

**Not:** Kullanıcı her zaman bu öneriyi geçersiz kılabilir.

---

## Bölüm Yapısı (4 Bölüm — Değiştirilemez)

### Bölüm 1: Doküman Genel Bilgileri
- Proje adı
- Doküman kapsamı (sprint / hikaye / release bazında)
- Sprint no
- Release
- Kapsanan hikayeler listesi
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
5. İş kuralları (İK-XXX — ilgili kriterin hemen altında)

### Bölüm 3: Etki Analizi
- Bloke olan hikayeler tablosu
- Etkilenen iş süreçleri
- Riskler tablosu (Risk, Olasılık, Etki, Azaltım Stratejisi)

### Bölüm 4: Teknik Detaylar ve Entegrasyonlar *(yalnızca teknik ekip)*
- API uç noktaları (istek/yanıt örnekleri JSON formatında)
- Veritabanı şeması (tablo yapıları, RLS politikaları)
- Güvenlik uygulaması
- Entegrasyon noktaları tablosu

> **Not:** Ekran Görüntüleri artık ayrı bir bölüm değildir. Her ekran, ilgili hikayenin kabul kriterlerinin hemen üstünde yer alır.

---

## Kullanıcı Hikayesi Formatı

```
AKTÖR:    [Rol] olarak
İHTİYAÇ: [Eylem] yapabilmeliyim
FAYDA:   Böylece [sonuç/değer] gerçekleştirebilirim
```

**Kurallar:**
- İHTİYAÇ her zaman `-meli` / `-malı` ile biter
- AKTÖR rol bazlıdır (isim değil): "İş analisti olarak", "Yönetici olarak"
- FAYDA somut bir iş değeri ifade eder

---

## Kabul Kriteri Formatı (Sadeleştirilmiş)

"Senaryo" kelimesi kullanılmaz — test senaryolarıyla karışmaması için "kriter" denir.

### Numaralandırma
- Format: `KR-[SıraNo]` — örn. KR-001, KR-002
- Numaralar doküman genelinde devam eder, hikaye değişince sıfırlanmaz
- KR → Kabul Kriteri, TC → Test Case, İK → İş Kuralı

### Kriter Tipleri
- `[Başarılı]` — başarılı / mutlu yol kriterleri (en az 2)
- `[Olumsuz]` — hata kriterleri (en az 2)
- `[Sınır]` — sınır / kenar durumlar
- `[Güvenlik]` — güvenlik ve doğrulama (KVKK içeren hikayelerde zorunlu)

### Kriter Başına Minimum / Maksimum
- Her hikaye için: minimum 4, maksimum 8 kabul kriteri

### Format

```
KR-001 — [Kriter Başlığı] [Tip Etiketi]

[Tek düz cümle: koşul + eylem + beklenen sonuç.
Teknik olmayan kişilerin anlayabileceği dilde yazılır.
KOŞUL / EYLEM / SONUÇ blokları kullanılmaz.]

İK-001 · [İş Kuralı Başlığı]  ← sadece bu kritere ait iş kuralı varsa
[Kural detayı, koşullar, istisnalar. Somut örneklerle açıkla.]
```

### Örnek

```
KR-001 — Başarılı Proje Oluşturma [Başarılı]

Kullanıcı zorunlu alanları doldurup "Proje Oluştur" butonuna tıkladığında
proje veritabanına kaydedilir, proje detay ekranına yönlendirilir ve
başarı bildirimi gösterilir.

İK-001 · Proje adı zorunluluğu
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

Kabul kriteri **ne** olacağını söyler, test case **nasıl** doğrulanacağını.

---

## İş Kuralı Formatı

```
İK-XXX · [Kural Başlığı]
[Kural detayı, koşullar, istisnalar, somut örnekler]
```

**Kurallar:**
- Numaralandırma proje genelinde sıralıdır (İK-001, İK-002 ...)
- İş kuralları ilgili kabul kriterinin hemen altında yer alır — ayrı bölüm olmaz
- Aynı iş kuralı birden fazla kriterde geçerliyse tekrar yazılmaz, "İK-XXX geçerlidir" yaz
- Kategoriler: Kimlik Doğrulama, Veri Güvenliği/KVKK, İş Süreci, Raporlama/Denetim

---

## Kapsam Tablosu Formatı

| ✅ Kapsam İçinde | ❌ Kapsam Dışında |
|-----------------|-----------------|
| [Özellik] | [Özellik] → H-XX kapsamında ele alınacak |

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
- Referans satırı: `İlgili kriterler: KR-XXX, KR-YYY | Tasarım: Masaüstü · Tablet · Mobil`
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

- Dil: Kullanıcının tercih ettiği dilde üretilir (Türkçe veya İngilizce)
  - Kullanıcı Türkçe seçtiyse: Tamamen Türkçe. Teknik terimler parantez içinde İngilizce verilebilir. Terminoloji: Destan (Epic), Hikaye (Story), Sürüm (Release), Kabul Kriteri (Acceptance Criteria), İş Kuralı (Business Rule)
  - Kullanıcı İngilizce seçtiyse: Standart uluslararası terimler kullanılır
- Ton: Profesyonel, net, açık. Teknik olmayan paydaşların anlayabileceği dil
- KVKK/Güvenlik: İlgili hikayelerde güvenlik kriterleri ve iş kuralları mutlaka yer alır
- Teknik terim açıklaması: OTP, JWT, RLS gibi terimler ilk geçtiklerinde parantez içinde açıklanır
- Bütünü gör: Bir hikayenin diğerleriyle ilişkisi etki analizinde ve kapsam dışında mutlaka belirtilir

---

## Doküman Kullanım Notu

**İş Birimi (Ürün Sahibi, İş Analisti) için:**
- Bölüm 1, 2 ve 3 iş birimi onayı için hazırlanmıştır
- Bölüm 4 teknik ekip içindir, atlanabilir
- Kabul kriterleri ve iş kuralları iş birimi tarafından onaylanmalıdır

**Teknik Ekip için:**
- Tüm bölümler okunmalıdır
- Bölüm 4 uygulama için kritiktir
- Kabul kriterleri test case'lerinin temelini oluşturur
