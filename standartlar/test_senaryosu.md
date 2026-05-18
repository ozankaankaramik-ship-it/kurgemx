# KurgemX — Test Senaryosu Standartları

Bu dosyayı okumadan önce `genel.md` dosyasını oku ve oradaki kuralları da uygula.

---

## Doküman Hakkında

- **Doküman tipi kodu:** `test_senaryosu`
- **Amaç:** Hikaye gruplarına karşılık gelen test case topluluğunu belgeler
- **Hedef kitle:** Test ekibi, İş Analisti, Geliştirici
- **Üretim zamanı:** Analiz dokümanı onaylandıktan sonra, geliştirme öncesi veya sırasında

---

## Yapısal Tanımlar

- **Test Senaryosu:** Hikaye gruplarına karşılık gelen test case topluluğu
  - Örn: "ST6+ST7+ST8 Proje Yönetimi Test Senaryosu"
- **Test Case:** Tek bir hikayeye karşılık gelen test adımı
  - Bir senaryonun altında birden fazla test case olabilir

---

## Gruplama Kuralı

- Test senaryoları tek bir Excel dosyasında, tek sheet'te üretilir
- Release bilgisi ayrı bir kolon olarak gösterilir — kullanıcı filtreler
- Tek bir iş analizi dokümanı → tek bir test senaryosu Excel dosyası

---

## Test Case Tipleri

| Tip | Kod | Açıklama |
|-----|-----|---------|
| Olumlu | positive | Başarılı akış testi |
| Olumsuz | negative | Hata durumu testi |
| Performans | performance | Yanıt süresi, yük testi |
| Güvenlik | security | Yetkilendirme, veri güvenliği |

---

## Test Case Sayıları

Her hikaye için **5 TC** hedeflenir:

| Tip | Adet | Kural |
|-----|------|-------|
| Positive | 2 | Her hikayede zorunlu |
| Negative | 2 | Her hikayede zorunlu |
| Security | 1 | Yalnızca KVKK/güvenlik içeren hikayelerde |
| Boundary | 1 | Yalnızca sınır durumu olan hikayelerde |

- Güvenlik veya sınır durumu yoksa hikaye başına minimum 4 TC üretilir
- Performans TC'leri yalnızca kritik hikayelerde eklenir (ödeme, giriş, yüksek hacimli işlemler)

---

## Durum Değerleri

- `pending` — henüz çalıştırılmadı
- `passed` — test başarılı
- `failed` — test başarısız
- `blocked` — bağımlılık nedeniyle çalıştırılamıyor

---

## Test Case Formatı

```
Test Case No:   TC-[HikayeNo]-[SıraNo]  örn: TC-ST6-01
AC No:          AC-[SıraNo]  örn: AC-001
AC Metni:       [AC'nin olduğu gibi tam metni]
AC Tip:         positive / negative / security / boundary / performance
Release:        R1 / R2 / R3
Test Ön Koşul:  [Başlangıç durumu]
Test Adımlar:
  1. [Adım]
  2. [Adım]
  ...
Beklenen Sonuç: [Ne olması gerektiği]
Durum:          pending
```

---

## AC — TC Eşleştirme Kuralı

Her test case, türetildiği kabul kriterinin numarasıyla eşleştirilir:

| AC Tipi | TC Tipi |
|---------|---------|
| AC [Positive] | positive TC |
| AC [Negative] | negative TC |
| AC [Security] | security TC |
| AC [Boundary] | boundary TC |

- Bir AC'den birden fazla TC türetilebilir
- Her TC mutlaka bir AC ile ilişkilendirilir

---

## Çıktı Formatı

- Test senaryosu Excel (.xlsx) formatında üretilir
- Tek sheet, tüm release'ler bir arada
- Her test case bir satır olarak gösterilir
- Renk kodlaması uygulanmaz

### Üst Bilgi Alanı

Excel'in en üstüne şu bilgiler eklenir, sonra boş satır, sonra tablo başlar:

**Türkçe projede:**
```
[Proje Adı] — Test Senaryoları                   Hazırlayan: KurgemX
Tarih: [YYYY-MM-DD]  |  Toplam TC: [N]
Kısaltmalar: TC — Test Senaryosu  |  AC — Kabul Kriteri  |  ST — Hikaye  |  R — Sürüm
```

**İngilizce projede:**
```
[Proje Adı] — Test Scenarios                     Prepared by: KurgemX
Date: [YYYY-MM-DD]  |  Total TC: [N]
Abbreviations: TC — Test Case  |  AC — Acceptance Criteria  |  ST — Story  |  R — Release
```

- Proje adı ve "Hazırlayan/Prepared by: KurgemX" aynı satırda, sağa hizalanmış
- İkinci satırda tarih ve toplam TC sayısı
- Üçüncü satırda kısaltmalar
- Tüm başlık ve etiketler projeDili parametresine göre Türkçe veya İngilizce üretilir
- Üst bilgi alanı düz metin hücresi olarak üretilir, tablo formatında değil

### Sütun Sırası

| TC No | Release | AC No | AC Metni | AC Tip | Test Ön Koşul | Test Adımlar | Beklenen Sonuç | Durum |
|-------|---------|-------|----------|--------|---------------|--------------|----------------|-------|

- Durum sütunu: pending / passed / failed / blocked
- Release ve AC Tip sütunları Excel filtresiyle ayrılabilir

---

## Veritabanı Yapısı

Test senaryoları `dokumanlar` tablosunda `test_senaryosu` tipiyle saklanır.
Test case'leri dokümanın `icerik` alanında JSON formatında tutulur.

```json
{
  "test_cases": [
    {
      "no": "TC-ST1-01",
      "ac_no": "AC-001",
      "ac_metni": "...",
      "ac_tip": "positive",
      "release": "R1",
      "test_on_kosul": "...",
      "test_adimlar": ["...", "..."],
      "beklenen_sonuc": "...",
      "durum": "pending"
    }
  ]
}
```

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
