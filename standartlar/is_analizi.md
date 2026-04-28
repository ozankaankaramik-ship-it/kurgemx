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

## Bölüm Yapısı (5 Bölüm — Değiştirilemez)

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
Her hikaye için:
- Kullanıcı hikayesi (AKTÖR / İHTİYAÇ / FAYDA formatında)
- İş gereksinimi
- Kapsam içinde ✅ / Kapsam dışında ❌
- Kabul kriterleri (hibrit format — aşağıya bakın)
- İş kuralları (İK-XXX — ilgili kriterin hemen altında)

### Bölüm 3: Etki Analizi
- Bloke olan hikayeler tablosu
- Etkilenen iş süreçleri
- Riskler tablosu (Risk, Olasılık, Etki, Azaltım Stratejisi)

### Bölüm 4: Ekran Görüntüleri
- Her ekran için başlık ve kısa açıklama
- Mockup görüntüsü (genel.md'deki görüntü standartlarına uygun)
- Şekil numarası ve açıklama yazısı
- Duyarlı tasarım notu: Mobil / Tablet / Masaüstü

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
- İHTİYAÇ her zaman `-meli` / `-malı` ile biter
- AKTÖR rol bazlıdır (isim değil): "İş analisti olarak", "Yönetici olarak"
- FAYDA somut bir iş değeri ifade eder

---

## Kabul Kriteri Formatı (Hibrit)

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

[Düz cümle: Koşul + eylem + beklenen sonuç. Teknik olmayan
kişilerin anlayabileceği dilde. Teknik terim kullanılırsa
parantez içinde açıkla.]

KOŞUL:  [Başlangıç durumu — sistem ve kullanıcı durumu]
EYLEM:  [Kullanıcının yaptığı işlem]
SONUÇ:
  • [Beklenen sonuç 1]
  • [Beklenen sonuç 2]
  • [Beklenen sonuç 3]

İK-001 · [İş Kuralı Başlığı]  ← sadece bu kritere ait iş kuralı varsa
[Kural detayı, koşullar, istisnalar. Somut örneklerle açıkla.]
```

### Örnek

```
KR-001 — Başarılı Proje Oluşturma [Başarılı]

Kullanıcı oturum açmış durumdayken proje adı ve açıklama
girerek "Oluştur" butonuna tıkladığında proje başarıyla
oluşturulur ve proje detay ekranına yönlendirilir.

KOŞUL:  Kullanıcı oturum açmış; Yeni Proje formu açık
EYLEM:  Geçerli proje adı ve açıklama girilir; Oluştur'a tıklanır
SONUÇ:
  • Proje veritabanına kaydedilir
  • Kullanıcı proje detay ekranına yönlendirilir
  • Başarı bildirimi gösterilir

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
| Format | Hibrit (düz cümle + tablo) | Adım adım teknik |

Kabul kriteri **ne** olacağını söyler, test case **nasıl** doğrulanacağını.

```
Kabul Kriteri SONUÇ:
  • Proje veritabanına kaydedilir

Test Case Adımları:
  1. Tarayıcıda /projects/new adresine git
  2. "Ad" alanına "Test Projesi" yaz
  3. "Oluştur" butonuna tıkla
  4. Supabase'de projects tablosunu kontrol et
  5. Yeni kaydın oluştuğunu doğrula
```

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
- Gerçekçi mockup görüntüleri kullanılır (HTML → PNG)
- Görüntü boyutu: genişlik max 580px, EMU: 5486400
- Her görüntünün altında: "Şekil N — [Ekran adı ve kısa açıklama]" (italik, ortalı)
- Her ekranın hangi kabul kriteriyle ilişkili olduğu belirtilir
- Duyarlı tasarım notu: Mobil / Tablet / Masaüstü

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
- Bölüm 1, 2, 3 ve 4 iş birimi onayı için hazırlanmıştır
- Bölüm 5 teknik ekip içindir, atlanabilir
- Kabul kriterleri ve iş kuralları iş birimi tarafından onaylanmalıdır

**Teknik Ekip için:**
- Tüm bölümler okunmalıdır
- Bölüm 5 uygulama için kritiktir
- Kabul kriterleri test case'lerinin temelini oluşturur
