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

- Test senaryoları release bazında gruplandırılır: R1, R2, R3
- Her release için ayrı Excel sheet oluşturulur
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
Test Case No: TC-[HikayeNo]-[SıraNo]  örn: TC-ST6-01
Başlık:       [Kısa açıklama]
Tip:          positive / negative / performance / security
Hikaye:       ST[No]
Ön Koşul:     [Başlangıç durumu]
Adımlar:
  1. [Adım]
  2. [Adım]
  ...
Beklenen Sonuç: [Ne olması gerektiği]
Durum:        pending
```

---

## Çıktı Formatı

- Test senaryosu Excel (.xlsx) formatında üretilir
- Her test case bir satır olarak gösterilir
- Sütunlar: Test Case No | Başlık | Tip | Hikaye | Ön Koşul | Adımlar | Beklenen Sonuç | Durum
- Tip sütununa göre renk kodlaması:
  - Positive: Yeşil
  - Negative: Kırmızı
  - Security: Mor
  - Boundary: Turuncu
  - Performance: Mavi
- Durum sütunu: pending / passed / failed / blocked
- **3 sheet — release bazında:**
  - Sheet 1: R1 — MVP
  - Sheet 2: R2 — İyileştirme
  - Sheet 3: R3 — Gelişmiş

---

## Veritabanı Yapısı

Test senaryoları `dokumanlar` tablosunda `test_senaryosu` tipiyle saklanır.
Test case'leri dokümanın `icerik` alanında JSON formatında tutulur.

```json
{
  "test_cases": [
    {
      "no": "TC-ST6-01",
      "title": "...",
      "type": "positive",
      "story_id": "ST6",
      "precondition": "...",
      "steps": ["...", "..."],
      "expected_result": "...",
      "status": "pending"
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
