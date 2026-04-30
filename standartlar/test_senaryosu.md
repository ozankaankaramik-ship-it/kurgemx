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

- Hikayeler analiz dokümanında nasıl gruplandıysa test senaryoları da aynı şekilde gruplandırılır
- Tek bir analiz dokümanı → tek bir test senaryosu dokümanı

---

## Test Case Tipleri

| Tip | Kod | Açıklama |
|-----|-----|---------|
| Olumlu | positive | Başarılı akış testi |
| Olumsuz | negative | Hata durumu testi |
| Performans | performance | Yanıt süresi, yük testi |
| Güvenlik | security | Yetkilendirme, veri güvenliği |

---

## Test Case Sayıları (Öneri)

| Tip | Minimum | Maksimum |
|-----|---------|---------|
| Olumlu | 5 | 10 |
| Olumsuz | 10 | 15 |
| Performans | 3 | 5 |
| Güvenlik | 3 | 5 (gerekirse) |

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

- Test senaryosu dokümanı Excel (.xlsx) formatında üretilir
- Her test case bir satır olarak gösterilir
- Sütunlar: Test Case No | Başlık | Tip | Hikaye | Ön Koşul | Adımlar | Beklenen Sonuç | Durum
- Tip sütununa göre renk kodlaması uygulanır:
  - Olumlu (positive): Yeşil
  - Olumsuz (negative): Kırmızı
  - Performans (performance): Turuncu
  - Güvenlik (security): Mor
- Durum sütunu: pending / passed / failed / blocked
- Her hikaye grubu için ayrı sekme (sheet) oluşturulur

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
