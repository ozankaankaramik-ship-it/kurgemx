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
  - Örn: "H6+H7+H8 Proje Yönetimi Test Senaryosu"
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
| Olumlu | pozitif | Başarılı akış testi |
| Olumsuz | negatif | Hata durumu testi |
| Performans | performans | Yanıt süresi, yük testi |
| Güvenlik | guvenlik | Yetkilendirme, veri güvenliği |

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

- `bekliyor` — henüz çalıştırılmadı
- `gecti` — test başarılı
- `basarisiz` — test başarısız
- `bloke` — bağımlılık nedeniyle çalıştırılamıyor

---

## Test Case Formatı

```
Test Case No: TC-[HikayeNo]-[SıraNo]  örn: TC-H6-01
Başlık:       [Kısa açıklama]
Tip:          pozitif / negatif / performans / guvenlik
Hikaye:       H[No]
Ön Koşul:     [Başlangıç durumu]
Adımlar:
  1. [Adım]
  2. [Adım]
  ...
Beklenen Sonuç: [Ne olması gerektiği]
Durum:        bekliyor
```

---

## Çıktı Formatı

- Test senaryosu dokümanı Excel (.xlsx) formatında üretilir
- Her test case bir satır olarak gösterilir
- Sütunlar: Test Case No | Başlık | Tip | Hikaye | Ön Koşul | Adımlar | Beklenen Sonuç | Durum
- Tip sütununa göre renk kodlaması uygulanır:
  - Olumlu (pozitif): Yeşil
  - Olumsuz (negatif): Kırmızı
  - Performans: Turuncu
  - Güvenlik: Mor
- Durum sütunu: bekliyor / gecti / basarisiz / bloke
- Her hikaye grubu için ayrı sekme (sheet) oluşturulur

---

## Veritabanı Yapısı

Test senaryoları `dokumanlar` tablosunda `test_senaryosu` tipiyle saklanır.
Test case'leri dokümanın `icerik` alanında JSON formatında tutulur.

```json
{
  "test_caseleri": [
    {
      "no": "TC-H6-01",
      "baslik": "...",
      "tip": "pozitif",
      "hikaye_id": "H6",
      "on_kosul": "...",
      "adimlar": ["...", "..."],
      "beklenen_sonuc": "...",
      "durum": "bekliyor"
    }
  ]
}
```
