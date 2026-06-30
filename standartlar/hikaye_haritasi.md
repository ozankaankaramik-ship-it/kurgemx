# KurgemX — Hikaye Haritası Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `hikaye_haritasi`
- **Amaç:** Proje kapsamını destan ve hikayeler bazında görselleştirir, release ve sprint planlaması yapar
- **Hedef kitle:** Ürün Sahibi, İş Analisti, Proje Yöneticisi
- **Üretim zamanı:** Proje başlangıcında, gereksinim toplama sonrası

---

## Terminoloji

| KurgemX Terimi | Açıklama |
|----------------|---------|
| Destan | Epic — büyük işlevsel alan |
| Hikaye | User Story — tek sprint'e sığan iş parçası |
| Sürüm | Release — R1 MVP, R2 İyileştirme, R3 Gelişmiş |
| Sprint | İki haftalık geliştirme döngüsü |

---

## Evrensel Kısaltmalar

Tüm dillerde aynı kısaltmalar kullanılır:

| Kısaltma | Açılım | Örnek |
|----------|--------|-------|
| ST | Story (Hikaye) | ST1, ST2, ST3 |
| SP | Sprint | SP1, SP2, SP3 |
| R | Release | R1, R2, R3 |
| AC | Acceptance Criteria (Kabul Kriteri) | AC-001, AC-002 |
| BR | Business Rule (İş Kuralı) | BR-001, BR-002 |
| TC | Test Case | TC-ST1-01 |
| U | User (Kullanıcı) | U1, U2, U3 |

---

## Proje Büyüklüğü ve Hikaye Sayısı

Hikaye haritası oluşturulmadan önce proje büyüklüğü belirlenir. YZ projenin detaylı açıklamasına göre büyüklüğü otomatik önerir; kullanıcı değiştirebilir. Hikaye sayısı proje büyüklüğüne göre sınırlandırılır.

| Proje Büyüklüğü | Hikaye Sayısı |
|----------------|---------------|
| Küçük | 1 – 5 hikaye |
| Orta | 6 – 15 hikaye |
| Büyük | 16 – 40 hikaye |

**Maksimum hikaye sayısı: 40.** Bu sınır aşılmamalıdır.

---

## Hikaye Kapsam Kuralı

Hikaye haritasına yalnızca **yazılımı kullanan kişilerin (son kullanıcı, yönetici, iş birimi vb.) bakış açısından yazılmış hikayeler** dahil edilir.

Aşağıdaki hikayeler hikaye haritasına **dahil edilmez** — bu konular mimari ve teknik dokümanlara aittir:
- Veritabanı kurulumu ve şema oluşturma
- Sunucu ve altyapı yapılandırması
- CI/CD pipeline kurulumu
- Güvenlik sertifikaları ve ortam değişkenleri
- Yedekleme ve kurtarma altyapısı

---

## Kullanıcı Tanımlama Kuralı

Hikaye haritası oluşturulmadan önce, projeyi kullanacak **kullanıcı tipleri (U1, U2, U3...)** belirlenir. YZ proje açıklamasından bu kullanıcı tiplerini otomatik çıkarır; kullanıcı düzenleyebilir.

**Kullanıcı tipi yalnızca geliştirilecek çözümü fiilen kullanacak kişileri kapsar** — son kullanıcı, yönetici, onaylayıcı, sistem yöneticisi gibi roller dahildir.

Aşağıdaki roller kullanıcı tipi olarak **tanımlanmaz** — bunlar projeyi üreten/yöneten taraftır, çözümü kullanan değil:
- Ürün Sahibi, İş Analisti, Proje Yöneticisi (KurgemX'i kullanan roller)
- Geliştirici, Test Mühendisi (üretim sürecindeki roller)

### Kullanıcılar Tablosu Formatı

| Kod | Kullanıcı Tipi | Açıklama |
|-----|----------------|---------|
| U1 | [Rol adı] | [Bu kullanıcının sistemle ne yaptığı, birincil hedefi] |
| U2 | [Rol adı] | [...] |

- Kod numaralandırması projeye özgüdür, U1'den başlar
- Her kullanıcı tipi açıklaması tek cümle, somut ve net olmalı
- Sistem/altyapı hikayeleri (bkz. Hikaye Kapsam Kuralı) herhangi bir kullanıcı tipine bağlanmaz

---

## Tablo Yapısı

- **Sütunlar:** Destanlar (Epic'ler)
- **Satırlar:** Sürümler (Release'ler)
- Hikayeler ilgili destan sütunu altında, ilgili sürüm satırında gösterilir
- Her hücrede birden fazla hikaye yer alabilir (yatay düzende)
- Markdown tablo formatında hazırlanır
- Destanlar projenin ihtiyaçlarına göre belirlenir; zorunlu sabit destan yoktur

---

## Hikaye Formatı

- Hikaye haritasında özet format: `...yapabilme`
  - Örn: "Giriş yapabilme", "Proje oluşturabilme"
- Hikaye numaraları: ST1, ST2, ST3 ... (metin, integer değil)
- Tabloda kısa format: `ST6 · Yeni proje oluşturabilme [U1]`
- Her hikaye, ilgili kullanıcı tipinin kodu ile etiketlenir — `[U1]`
- Birden fazla kullanıcı tipini ilgilendiren hikayelerde kodlar virgülle yazılır — `[U1,U2]`
- **Sprint bilgisi hikaye haritası tablosundaki kartlarda gösterilmez** — sprint planlaması ayrıca "Sprint Planı Özeti" tablosunda yer alır
- Durum bilgisi: Başlamadı / Çalışılıyor / Tamamlandı / Bloke

---

## INVEST Prensipleri

Her hikaye şu kriterleri karşılamalıdır:
- **I**ndependent: Bağımsız, tek başına geliştirilebilir
- **N**egotiable: Müzakere edilebilir kapsam
- **V**aluable: İş değeri üretir
- **E**stimable: Tahmin edilebilir
- **S**mall: Tek sprint'e sığar
- **T**estable: Test edilebilir kabul kriterleri var

İlişkili alt özellikler gereksiz yere parçalanmamalı, konsolide edilmelidir.

---

## Sprint Planlaması

- Her sprint 2 haftadır
- Sprint numaraları: SP1, SP2, SP3 ...
- Sprint odak alanı belirtilir: örn. "SP2 — Proje yönetimi + hikaye haritalama"
- Hikaye sayısı proje büyüklüğüne göre belirlenir (bkz. Proje Büyüklüğü tablosu)

### Altyapı Önce Prensibi
Sprint planlaması geliştirici bakış açısıyla yapılır: **altyapı önce, özellik sonra.**
- İlk sprint her zaman temel altyapıdır (kimlik doğrulama, veritabanı, güvenlik)
- Her sprint sonunda gerçekten çalışan, deploy edilebilir bir ürün hedeflenir
- Bir sprint'teki hikayeler bir sonraki sprint'in ön koşulunu oluşturursa bu bağımlılık sprint planı özetinde belirtilir

---

## Sürüm Planlaması

| Sürüm | Kod | Açıklama |
|-------|-----|---------|
| R1 | MVP | Temel işlevler, piyasaya çıkış |
| R2 | İyileştirme | Kullanıcı geri bildirimleri, ek özellikler |
| R3 | Gelişmiş | İleri özellikler, entegrasyonlar |

**KVKK ve güvenlik hikayeleri her zaman R1 — MVP'de, tercihen ilk sprint'te ele alınmalıdır.**

**Fonksiyonel olmayan gereksinimler ve geçiş gereksinimleri hikaye haritasında ayrı destan olarak yer almaz; analiz dokümanının "Sistem Gereksinimleri" bölümünde ele alınır.**

---

## Çıktı Yapısı

### 0. Kullanıcılar Tablosu

Hikaye haritasının en üstünde, destan-sürüm tablosundan önce yer alır:

```
| Kod | Kullanıcı Tipi | Açıklama |
|-----|----------------|---------|
| U1 | [Rol adı] | [Açıklama] |
| U2 | [Rol adı] | [Açıklama] |
```

### 1. Hikaye Haritası Tablosu

```
| Release | [Destan 1] | [Destan 2] | ... |
|---------|------------|------------|-----|
| R1 — MVP | ST1 · ... [U1] | ST6 · ... [U2] | |
| R2 — İyileştirme | ST_x · ... [U1] | | |
| R3 — Gelişmiş | ST_x · ... [U1,U2] | | |
```

### 2. Sprint Planı Özeti

```
| Sprint | Odak Alanı | Hikayeler | Hikaye Sayısı | Süre |
|--------|------------|-----------|---------------|------|
| SP1 | Temel altyapı | ST1, ST2, ST3 | x | 2 hafta |
| SP2 | ... | ... | x | 2 hafta |
```

### 3. Genel Özet Tablosu

```
| Sürüm | Hikaye Sayısı | Sprint Aralığı | Sprint Sayısı | Süre |
|-------|---------------|----------------|---------------|------|
| R1 — MVP | | SP1 → SP_x | | |
| R2 — İyileştirme | | | | |
| R3 — Gelişmiş | | | | |
| Toplam | | | | |
```

---

## Yazım İlkeleri

- Dil: Kullanıcının platformda seçtiği dilde üretilir
  - Tüm metin, başlık, tablo ve açıklamalar seçilen dilde yazılır
  - Kullanıcı Türkçe seçtiyse terminoloji: Destan (Epic), Hikaye (Story), Sürüm (Release), Sprint
  - Diğer dillerde standart uluslararası terimler kullanılır: Epic, Story, Release, Sprint
  - Kısaltmalar dil seçiminden bağımsız her zaman evrensel formatta kullanılır: ST, SP, R, AC, BR, TC, U
- Geliştirici bakışı: Sprint sıralaması teknik önceliğe göre yapılmalı, altyapı her zaman önce gelir
- KVKK / Güvenlik: Her zaman R1 — MVP'de, tercihen ilk sprint'te ele alınmalı
- INVEST: Her hikaye bağımsız, değerli, tahmin edilebilir ve test edilebilir olmalı
- Kullanıcı tipleri: Her hikaye en az bir kullanıcı koduyla (U1, U2...) etiketlenmeli; sadece çözümü kullanan kişiler kullanıcı tipi olarak tanımlanır

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
| U | User (Kullanıcı) | U1, U2, U3 |
