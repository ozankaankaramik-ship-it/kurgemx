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

## Tablo Yapısı

- **Sütunlar:** Destanlar (Epic'ler)
- **Satırlar:** Sürümler (Release'ler)
- Hikayeler ilgili destan sütunu altında, ilgili sürüm satırında gösterilir
- Her hücrede birden fazla hikaye yer alabilir (yatay düzende)
- Markdown tablo formatında hazırlanır

---

## Sabit Destanlar (Her Projede Zorunlu)

Son iki destan her hikaye haritasında bulunur ve kullanıcı tarafından silinemez:

1. **Fonksiyonel Olmayan Gereksinimler (Epic)** — her zaman sondan ikinci
2. **Geçiş Gereksinimleri (Epic)** — her zaman son

Diğer destanlar projenin ihtiyaçlarına göre kullanıcı tarafından belirlenir.

---

## Hikaye Formatı

- Hikaye haritasında özet format: `...yapabilme`
  - Örn: "Giriş yapabilme", "Proje oluşturabilme"
- Hikaye numaraları: H1, H2, H3 ... (metin, integer değil)
- Tabloda kısa format: `H6 · Yeni proje oluşturabilme (S2)`
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
- Sprint numaraları: S1, S2, S3 ...
- Her sprint'teki önerilen hikaye sayısı: 5-9
- Sprint odak alanı belirtilir: örn. "S2 — Proje yönetimi + hikaye haritalama"

### Altyapı Önce Prensibi
Sprint planlaması geliştirici bakış açısıyla yapılır: **altyapı önce, özellik sonra.**
- İlk sprint her zaman temel altyapıdır (kimlik doğrulama, veritabanı, güvenlik)
- Her sprint sonunda gerçekten çalışan, deploy edilebilir bir ürün hedeflenir
- Bir sprint'teki hikayeler bir sonraki sprint'in ön koşulunu oluşturursa bu bağımlılık sprint planı özetinde belirtilir

---

## Sürüm Planlaması

| Sürüm | Kod | Hikaye Sayısı | Açıklama |
|-------|-----|---------------|---------|
| R1 | MVP | 7-10 hikaye | Temel işlevler, piyasaya çıkış |
| R2 | İyileştirme | 8-12 hikaye | Kullanıcı geri bildirimleri, ek özellikler |
| R3 | Gelişmiş | 10-15 hikaye | İleri özellikler, entegrasyonlar |

**KVKK ve güvenlik hikayeleri her zaman R1 — MVP'de, tercihen ilk sprint'te ele alınmalıdır.**

---

## Fonksiyonel Olmayan Gereksinimler Destanı — Zorunlu Hikayeler

Bu destanda mutlaka şu konular ele alınmalıdır:

- **Performans** — yanıt süresi, eş zamanlı kullanıcı kapasitesi
- **Responsive / Mobil uyumlu tasarım** — tüm cihazlarda çalışma
- **Uptime / Sistem güvenilirliği** — kesintisiz çalışma süresi
- **Erişilebilirlik** — WCAG standartları (R2'de ele alınabilir)
- **Loglama ve izlenebilirlik** — günlükleme, izleme, ölçümler

---

## Geçiş Gereksinimleri Destanı — Değerlendirilecek Hikayeler

Bu destanda şu konular değerlendirilmeli, ilgili olmayanlar boş bırakılabilir:

- Kullanıcı eğitimi ve onboarding
- Mevcut verinin / dokümanın sisteme aktarımı
- Geri dönüş (rollback) planı
- İletişim planı

---

## Çıktı Yapısı

### 1. Hikaye Haritası Tablosu

```
| Release | [Destan 1] | ... | Fonksiyonel Olmayan Gereksinimler | Geçiş Gereksinimleri |
|---------|------------|-----|-----------------------------------|----------------------|
| R1 — MVP | H1 · ... (S1) | | H_x · ... (S2) | H_x · ... (S_x) |
| R2 — İyileştirme | H_x · ... (S6) | | H_x · ... (S6) | |
| R3 — Gelişmiş | H_x · ... (S9) | | | |
```

### 2. Sprint Planı Özeti

```
| Sprint | Odak Alanı | Hikayeler | Hikaye Sayısı | Süre |
|--------|------------|-----------|---------------|------|
| S1 | Temel altyapı | H1, H2, H3 | x | 2 hafta |
| S2 | ... | ... | x | 2 hafta |
```

### 3. Genel Özet Tablosu

```
| Sürüm | Hikaye Sayısı | Sprint Aralığı | Sprint Sayısı | Süre |
|-------|---------------|----------------|---------------|------|
| R1 — MVP | | S1 → S_x | | |
| R2 — İyileştirme | | | | |
| R3 — Gelişmiş | | | | |
| Toplam | | | | |
```

---

## Yazım İlkeleri

- Dil: Kullanıcının tercih ettiği dilde üretilir (Türkçe veya İngilizce)
  - Kullanıcı Türkçe seçtiyse: Tamamen Türkçe. Teknik terimler parantez içinde İngilizce verilebilir. Terminoloji: Destan (Epic), Hikaye (Story), Sürüm (Release), Sprint
  - Kullanıcı İngilizce seçtiyse: Standart uluslararası terimler kullanılır (Epic, Story, Release, Sprint)
- Geliştirici bakışı: Sprint sıralaması teknik önceliğe göre yapılmalı, altyapı her zaman önce gelir
- KVKK / Güvenlik: Her zaman R1 — MVP'de, tercihen ilk sprint'te ele alınmalı
- INVEST: Her hikaye bağımsız, değerli, tahmin edilebilir ve test edilebilir olmalı
