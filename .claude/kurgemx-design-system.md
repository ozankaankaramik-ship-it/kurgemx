# KurgemX Tasarım Sistemi

## Renkler
- Birincil lacivert: #1F3864
- Mavi vurgu: #2E75B6
- Açık mavi: #EEF4FB
- Logo vurgu (m harfi): #7EB3E8
- Sayfa arka planı: #F9FAFB (gray-50)

## Navbar
- Arka plan: #1F3864, beyaz yazı
- Logo: "Kurge" + "m" (#7EB3E8) + "X" — beyaz
- Sağ: menü linkleri + kullanıcı adı + avatar (30px daire, #2E75B6)
- Yükseklik: 52px

## Butonlar
- Birincil: #1F3864 arka plan, beyaz yazı, border yok, 34px yükseklik, 12px font, font-weight 500
- İkincil: beyaz arka plan, 0.5px #2E75B6 border, #1F3864 yazı, hover #EEF4FB, 34px yükseklik
- Disabled: opacity 0.55, border gri, yazı gri
- Border radius: 8px (rounded-md)

## Kartlar
- Arka plan: beyaz
- Border: 0.5px solid #E5E7EB (çok ince)
- Border radius: 12px (rounded-xl)
- Padding: 18px 20px
- Kartlar arası boşluk: 4px (mb-1)

## Section Label'lar
- Font: 11px, font-weight 500, uppercase, letter-spacing 0.8px
- Renk: gri (#9CA3AF)
- Margin: üstte 14px, altta 8px

## Adım Numarası Dairesi
- Aktif: 22px çap, #1F3864 arka plan, beyaz yazı, 11px font, font-weight 500
- Pasif: 22px çap, gri arka plan, gri yazı, 0.5px gri border

## Action Bar (kart içi)
- Flex, space-between
- Sol: adım başlığı (13px, font-weight 500, gri) + açıklama (12px, gri, padding-left 30px)
- Sağ: buton

## Tablolar
- Başlık satırı: #1F3864 arka plan, beyaz yazı, 10px font, font-weight 500
- Sürüm/kategori sütunu: #D6E4F0 arka plan, #1F3864 yazı, font-weight 500
- Tüm border'lar: 0.5px
- Border radius: 8px (overflow hidden ile)

## Hikaye Badge'leri
- R1 (MVP): #EEF4FB arka plan, #B5D4F4 border, #0C447C yazı
- R2 (İyileştirme): #EAF3DE arka plan, #C0DD97 border, #27500A yazı
- R3 (Gelişmiş): #FAEEDA arka plan, #FAC775 border, #633806 yazı
- Font: 9px, border-radius 3px, padding 1px 5px

## Status Badge'leri
- Pending/Bekliyor: #F1EFE8 arka plan, #444441 yazı
- Done/Tamamlandı: #EAF3DE arka plan, #27500A yazı

## Tamamlayıcı Dokümanlar Bölümü
- Ana akıştan kesik çizgiyle ayrılır (border-dashed, 1.5px)
- "Optional / İsteğe Bağlı" gri badge ile etiketlenir
- İki kart yan yana (grid 2 kolon)

## Genel Kurallar
- Tüm font'lar: Inter veya sistem font-sans
- Body font: 13px
- Line height: 1.5
- Tüm renkler Tailwind arbitrary value ile yazılır: bg-[#1F3864]
- Hiçbir ekranda beyaz dışı arka plan rengi (dark mode desteklenmiyor şimdilik)
