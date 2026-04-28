# KurgemX — Genel Doküman Standartları

Bu dosya tüm doküman tipleri için geçerli ortak kuralları içerir.
Doküman tipine özgü kurallar için ilgili dosyaya bakınız.

---

## Dil ve Ton

- Tüm dokümanlar Türkçe yazılır
- Teknik terimler parantez içinde İngilizce verilebilir: örn. "kabul kriteri (acceptance criteria)"
- Ton: profesyonel, net, açık
- Detay seviyesi: iş birimi uygulama yapmadan anlayabilmeli
- Tüm bölümlerde aynı terminoloji kullanılır
- KVKK/Güvenlik konuları her zaman vurgulanır

---

## Platform Adı

- Platform adı: **KurgemX**
- Ayrı bir ürün adı kullanılmaz, her şey için KurgemX denir
- Doküman başlıklarında: "KurgemX — [Doküman Adı]" formatı kullanılır

---

## Terminoloji

| Türkçe | Kullanım |
|--------|---------|
| Destan | Epic |
| Hikaye | User Story |
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
- EMU değeri: genişlik 5486400, yükseklik orantılı
- Her görüntünün altına italik açıklama yazısı eklenir: "Şekil N — [Açıklama]"
- Tel çatı (wireframe) kullanılmaz; bunun yerine gerçekçi mockup görüntüleri kullanılır
- Görüntüler sayfada ortalanır

### Header ve Footer
- Header: "KurgemX  |  [Proje Adı]  |  [Doküman Adı]"
- Footer sol: "Gizli — Dahili Kullanım  |  Sürüm X.X  |  [Tarih]"
- Footer sağ: "Sayfa [N]"

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
