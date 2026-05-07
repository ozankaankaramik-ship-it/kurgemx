# KurgemX — Genel Doküman Standartları

Bu dosya tüm doküman tipleri için geçerli ortak kuralları içerir.
Doküman tipine özgü kurallar için ilgili dosyaya bakınız.

---

## Dil ve Ton

- Dil: Kullanıcının platformda seçtiği dilde üretilir
  - Tüm metin, başlık, tablo ve açıklamalar seçilen dilde yazılır
  - Teknik terimler gerektiğinde parantez içinde İngilizce verilebilir
- Ton: profesyonel, net, açık
- Detay seviyesi: iş birimi uygulama yapmadan anlayabilmeli
- Tüm bölümlerde aynı terminoloji kullanılır
- KVKK/Güvenlik konuları her zaman vurgulanır

---

## Platform Adı

- Platform adı: **KurgemX**
- KurgemX yalnızca şu yerlerde görünür: kapak sayfası, header ve footer
- Doküman içeriğinde (hikaye, kabul kriteri, iş kuralı, tablo vb.) KurgemX adı geçmez
- Header formatı: "KurgemX  |  [Proje Adı]  |  [Doküman Adı]"

---

## Evrensel Kısaltmalar

Dil seçiminden bağımsız, tüm dillerde aynı kısaltmalar kullanılır:

| Kısaltma | Açılım | Örnek |
|----------|--------|-------|
| ST | Story (Hikaye) | ST1, ST2, ST3 |
| SP | Sprint | SP1, SP2, SP3 |
| R | Release | R1, R2, R3 |
| AC | Acceptance Criteria (Kabul Kriteri) | AC-001, AC-002 |
| BR | Business Rule (İş Kuralı) | BR-001, BR-002 |
| TC | Test Case | TC-ST1-01 |

---

## Terminoloji

| Türkçe | İngilizce |
|--------|-----------|
| Destan | Epic |
| Hikaye | Story |
| Sürüm | Release |
| Hikaye Haritası | Story Map |
| Kabul Kriteri | Acceptance Criteria |
| İş Kuralı | Business Rule |

---

## Word Dokümanı Görsel Standartları

### Sayfa Yapısı
- Kağıt boyutu: A4 (11906 x 16838 DXA)
- Kenar boşlukları: 1080 DXA (tüm kenarlar)

### Renkler
- Başlık arka planı (H1): #1F3864 (koyu lacivert)
- Başlık yazı rengi (H1): Beyaz
- Başlık rengi (H2): #1F3864
- Vurgu rengi: #2E75B6
- Tablo başlık arka planı: #1F3864 (beyaz yazı)
- Tablo alt başlık arka planı: #D6E4F0 (lacivert yazı)
- Tablo satır arka planı: Beyaz

### Yazı Tipleri
- Gövde yazı tipi: Arial
- Varsayılan boyut: 20 (10pt)
- H1 boyutu: 28 (14pt)
- H2 boyutu: 24 (12pt)
- H3 boyutu: 22 (11pt)
- Tablo içi boyut: 18 (9pt)

### Ekran Görüntüleri
- Maksimum genişlik: 580px (Word sayfasına sığacak şekilde)
- EMU değeri: genişlik 5486400, yükseklik orantılı (`EMU_h = piksel_h * 914400 / 96`)
- Her görüntünün altına italik açıklama yazısı eklenir: "Şekil N — [Açıklama]"
- Görüntüler sayfada ortalanır

### Header ve Footer
- Header: "KurgemX  |  [Proje Adı]  |  [Doküman Adı]"
- Footer sol: "Gizli — Dahili Kullanım  |  Sürüm X.X  |  [Tarih]"
- Footer sağ: "Sayfa [N]"

---

## Referans: Evrensel Kısaltmalar (Word Dokümanı Sonu)

Her Word dokümanının son sayfasına aşağıdaki kısaltma tablosu eklenir.

| Kısaltma | Açılım | Örnek |
|----------|--------|-------|
| ST | Story (Hikaye) | ST1, ST2 |
| SP | Sprint | SP1, SP2 |
| R | Release | R1, R2, R3 |
| AC | Acceptance Criteria (Kabul Kriteri) | AC-001 |
| BR | Business Rule (İş Kuralı) | BR-001 |
| TC | Test Case | TC-ST1-01 |

---

## Doküman Versiyonlama

- İlk sürüm: 1.0
- Küçük güncellemeler: 1.1, 1.2 ...
- Yapısal değişiklikler: 2.0
- Footer'da sürüm numarası her zaman belirtilir

---

## Onay Durumları

- Bekliyor
- İncelemede
- Onaylandı
- Arşivlendi

---

## İş Birimi ve Teknik Ekip Ayrımı

Tüm dokümanlarda teknik bölümler açıkça işaretlenir:
> ⚠️ Bu bölüm yalnızca teknik ekip içindir. İş birimi bu bölümü atlayabilir.

İş birimi (Ürün Sahibi, İş Analisti) teknik bölüm hariç tüm bölümleri inceler ve onaylar.
