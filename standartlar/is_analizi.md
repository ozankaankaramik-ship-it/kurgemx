# KurgemX — İş Analizi Dokümanı Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `is_analizi`
- **Amaç:** Tüm release'lerdeki hikayelerin kabul kriterleri, sistem gereksinimleri ve teknik detaylarını tek bir dokümanda belgeler
- **Hedef kitle:** İş birimi (tüm bölümler) + Teknik ekip (tüm bölümler)
- **Üretim zamanı:** Hikaye haritası oluşturulduktan sonra
- **Üretim adedi:** Proje başına bir doküman

---

## Hikaye Seçim Kuralı

Bu dokümana yalnızca yazılımı kullanan kişilerin (son kullanıcı, yönetici, iş birimi vb.) bakış açısından yazılmış hikayeler dahil edilir.

Şu tür hikayeler bu dokümana eklenmez — bunlar mimari ve teknik dokümanlara aittir:
- Veritabanı kurulumu ve şema oluşturma
- Sunucu ve altyapı yapılandırması
- CI/CD pipeline kurulumu
- Güvenlik sertifikaları ve ortam değişkenleri
- Yedekleme ve kurtarma altyapısı

Her hikaye için kapsam tablosu oluşturulmaz.

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

### Bölüm 2: Hikaye Bazında Kabul Kriterleri

> Bu bölümde kullanılan kısaltmalar:
> - **ST:** Story — Hikaye
> - **AC:** Acceptance Criteria — Kabul Kriteri *(Hikaye bazında ilgili hikayenin altında sıralanmıştır)*
> - **BR:** Business Rule — İş Kuralı *(Varsa ilgili AC altında belirtilmiştir)*
> - **[P]:** Positive — Başarılı / mutlu yol kriteri
> - **[N]:** Negative — Hata / olumsuz durum kriteri
> - **[B]:** Boundary — Sınır / kenar durum
> - **[S]:** Security — Güvenlik ve doğrulama

Release'ler alt bölümler halinde gruplandırılır:

#### 2.1 R1 — MVP
Her hikaye için şu sırayla:
1. Kullanıcı hikayesi (AKTÖR / İHTİYAÇ / FAYDA formatında)
2. Kabul kriterleri (sadeleştirilmiş format — aşağıya bakın)
3. İş kuralları (BR-XXX — yalnızca gerekli olduğunda, ilgili kriterin hemen altında)

#### 2.2 R2 — İyileştirme
Aynı yapı R2 hikayelerine uygulanır.

#### 2.3 R3 — Gelişmiş
Aynı yapı R3 hikayelerine uygulanır.

#### Ekran Tasarımları Notu
Bölüm 2'nin sonuna, tüm hikayelerden sonra şu notu ekle:

> **Ekran Tasarımları:** Bu dokümanda ekran mockup'ı yer almamaktadır. Tüm ekran tasarımları için KurgemX'te üretilen prototipe bakınız.

### Bölüm 3: Sistem Gereksinimleri
Proje genelinde geçerli olan gereksinimler bu bölümde ele alınır.

**3.1 Fonksiyonel Olmayan Gereksinimler**

İlgili olmayanlar atlanabilir:

| Konu | Açıklama |
|------|---------|
| Performans | Yanıt süresi hedefleri, eş zamanlı kullanıcı kapasitesi |
| Responsive / Mobil uyum | Tüm cihazlarda çalışma gereksinimleri |
| Uptime / Güvenilirlik | Kesintisiz çalışma süresi hedefi |
| Erişilebilirlik | WCAG standartları |
| Loglama ve izlenebilirlik | Günlükleme, izleme, ölçüm gereksinimleri |

**3.2 Geçiş Gereksinimleri**

İlgili olmayanlar atlanabilir:

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

### Bölüm 5: Teknik Detaylar *(yalnızca teknik ekip)*
- Temel API uç noktaları (özet düzeyde)
- Güvenlik notları
- Entegrasyon noktaları (varsa)

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
- `[P]` — başarılı / mutlu yol kriterleri (en az 1)
- `[N]` — hata kriterleri (en az 1)
- `[B]` — sınır / kenar durumlar (gerektiğinde)
- `[S]` — güvenlik ve doğrulama (KVKK içeren hikayelerde zorunlu)

### Kriter Başına Minimum / Maksimum
- Her hikaye için: **minimum 2, maksimum 6** kabul kriteri

### AC Yazım İlkeleri
- Her AC **maksimum 15 kelime** olsun
- AC başlığı üretilmez — sadece numara ve tip etiketi yazılır
- AC "ne olur" sorusunu yanıtlar — "nasıl yapılır" sorusunu değil
- Şunlar AC'ye yazılmaz:
  * Teknik uygulama detayları (selfie mi video mu, OTP mi SMS mi)
  * Rol listeleri ve parantez içi açıklamalar
  * "...amacıyla", "...butonuna tıkladığında" gibi metni uzatan kalıplar
  * Sayısal limitler ve süreler (bunlar BR'a aittir)
- Zorunlu tipler: 1 P, 1 N
- S yalnızca KVKK/güvenlik içeren hikayelerde ekle

### Format

```
AC-001 [P] : [Maksimum 15 kelime. "Ne olur" sorusunu yanıtlar. Teknik detay, rol listesi ve sayısal limit içermez.]

BR-001 : [Maksimum 2 cümle. Sayısal limitler ve kısıtlar burada belirtilir. Başlık yazılmaz.]
```

### Örnek

```
AC-001 [P] : Doğru kimlik bilgileriyle giriş yapılır, ana panele yönlendirilir.
AC-002 [N] : Yanlış şifre girildiğinde giriş reddedilir ve hata mesajı gösterilir.
BR-001 : 5 ardışık hatalı girişte hesap 15 dakika kilitlenir.
```

**Kötü örnek → iyi örnek:**
```
❌ AC-001 — Başarılı Giriş [Positive]
   Şube yöneticisi ve uyum ekibi üyesi rolündeki kullanıcılar,
   e-posta ve şifre ile giriş yaptıktan sonra OTP kodunu
   girmeden sisteme erişemez. (22 kelime)

✅ AC-001 [S] : Yetkili roller şifre sonrası OTP doğrulaması olmadan giremez. (9 kelime)
```

---

## Kabul Kriteri ile Test Case Farkı

| | Kabul Kriteri | Test Case |
|---|---|---|
| Soru | Ne bekliyoruz? | Nasıl test edeceğiz? |
| Perspektif | İş perspektifi | Test ve doğrulama perspektifi |
| Odak | Onay odaklı | Uygulama odaklı |
| Kimin için | İş birimi + Teknik ekip | Test ekibi |
| Format | Kısa cümle (max 15 kelime) | Adım adım teknik |

---

## İş Kuralı Formatı

```
BR-XXX : [Kural metni — maksimum 2 cümle. Başlık yazılmaz.]
```

**Kurallar:**
- Numaralandırma proje genelinde sıralıdır (BR-001, BR-002 ...)
- İş kuralları yalnızca gerçekten gerekli olduğunda eklenir — her AC'ye zorunlu değildir
- İş kuralları ilgili kabul kriterinin hemen altında yer alır — ayrı bölüm olmaz
- Aynı iş kuralı birden fazla kriterde geçerliyse tekrar yazılmaz, "BR-XXX geçerlidir" yaz
- **Maksimum 2 cümle** — sayısal limitler ve kısıtlar burada belirtilir, teknik detay yazılmaz
- Kategoriler: Kimlik Doğrulama, Veri Güvenliği/KVKK, İş Süreci, Raporlama/Denetim

---

## Teknik Bölüm Standartları (Bölüm 5)

Bölüm 5 özet düzeyde tutulur — detaylı teknik bilgi mimari dokümana aittir.

- Temel API uç noktaları: sadece endpoint adı ve HTTP metodu
- Güvenlik notları: kimlik doğrulama yöntemi, yetkilendirme kuralları
- Entegrasyon noktaları: hangi sistemlerle entegrasyon gerektiği

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

---

## Doküman Kullanım Notu

**İş Birimi (Ürün Sahibi, İş Analisti) için:**
- Bölüm 1, 2, 3 ve 4 iş birimi onayı için hazırlanmıştır
- Bölüm 5 teknik ekip içindir, atlanabilir
- Kabul kriterleri ve sistem gereksinimleri iş birimi tarafından onaylanmalıdır

**Teknik Ekip için:**
- Tüm bölümler okunmalıdır
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
