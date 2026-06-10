**VİDEOLAR:** [Drive Linki](https://drive.google.com/drive/folders/13Y2IwWvYogK-kv9zs1NPm-ETGjbJQ7Fr?usp=sharing)

1. HAFTA : [Youtube Linki](https://youtu.be/lvVEl3hBleU)
2. HAFTA : [Youtube Linki](https://youtu.be/tHKlP1ZimBc)
3. HAFTA : [Youtube Linki](https://youtu.be/FnZGFShntzo)
4. HAFTA : [Youtube Linki](https://youtu.be/T0CL_7FdPJg)
5. HAFTA : [Youtube Linki](https://youtu.be/YC8c2SyJU5E)
6. HAFTA : [Youtube Linki](https://youtu.be/ILBTqzbYQPk)
7. HAFTA : [Youtube Linki](https://youtu.be/6-a4ZJM0FZg)
8. HAFTA : [Youtube Linki](https://youtu.be/FEgZYQsXYp4)
9. HAFTA : [Youtube Linki](https://youtu.be/1qgIbU2vEX0)
10. HAFTA : [Youtube Linki](https://youtu.be/_TxhHZGeLJc)



# EsnafPay

Esnaf ve müşteri arasındaki veresiye borç takibini dijitalleştiren mobil uygulama.

---


## Hafta 1 — Kimlik Doğrulama & Rol Yönetimi

- Kayıt ekranı: ad, telefon, şifre ve rol seçimi (esnaf / müşteri)
- Giriş ekranı: telefon + şifre ile giriş
- Role göre yönlendirme: esnaf → müşteri listesi, müşteri → borç özeti

---

## Hafta 2 — Esnaf & Müşteri Yönetimi

- Müşteri listesi: arama, istatistik kartları, renkli avatarlar
- Yeni müşteri ekleme (ad, telefon, adres, not)
- Müşteri düzenleme ve silme (onay modalı ile)
- Müşteri detay sayfası: borç ve taksit alanları hazır
- Kayıt ekranına dükkan adı alanı eklendi (sadece esnafta görünür)
- Çıkış butonuna onay modalı eklendi
- Sayfa yenilemeye gerek kalmadan liste otomatik güncelleniyor

---

## Hafta 3 — Borç Kaydı

- Yeni borç ekleme: tutar, açıklama, tarih, tek seferlik veya taksitli seçimi
- Borç eklenince toplam bakiye otomatik güncellenir, geçmiş tarih sırasıyla listelenir
- Borç düzenleme ve silme (onay modalı ile)

---

## Hafta 4 — Taksit Planı

- Taksitli borç eklendiğinde taksitler otomatik oluşuyor (aylık vadelerle)
- Taksit ekranı: teal renkli başlık, ilerleme çubuğu, kaç taksit ödendiği ve kalan tutar
- Her taksit için durum renklendirmesi: yeşil (ödendi), turuncu (yaklaşan), gri (bekliyor)
- Ödendi / Geri Al butonlarıyla taksit durumu tek dokunuşla değişiyor
- Taksit ödenince müşterinin toplam borcu otomatik güncelleniyor

---

## Hafta 5 — Müşteri Paneli & Ödeme Bildirimi

- Müşteri ana ekranı: toplam borç, esnaf sayısı ve yaklaşan ödeme istatistikleri
- Eşleştiği tüm esnaflar listelenir (telefon numarası üzerinden otomatik eşleşme)
- Yaklaşan taksit uyarı kartı: esnaf adı, tutar ve kaç gün kaldığı
- Müşteri esnafa ödeme bildirimi gönderebilir (borç seçimi + tutar + mesaj)
- Esnaf panelinde bekleyen bildirimler listelenir, onayla / reddet butonlarıyla işlem yapılır
- Onaylanan ödeme bildiriminde ilgili taksit otomatik olarak ödendi işaretlenir, toplam borç güncellenir

---

## Hafta 6 — Mesajlaşma

- Esnaf ve müşteri arasında uygulama içi anlık mesajlaşma
- Mesajlar ekranı: tüm bağlantılar listelenir (mesaj olmasa bile), son mesaj ve saati gösterilir
- Her iki taraf da konuşmayı başlatabilir (WhatsApp benzeri akış)
- Mesaj baloncukları: gönderen turuncu, karşı taraf gri
- Gün bazlı gruplama (Bugün, Dün, tarih)
- 5 saniyede bir otomatik yenileme ile gerçek zamanlı görünüm
- Esnaf detay sayfasında müşterinin toplam borcu chat ekranında gösterilir
- Okunmamış mesaj sayısı rozet ile gösterilir, Mesajlar sekmesinde okunmayan kişi kalın görünür
- Alt nav Mesajlar ikonunda okunmamış toplam sayı (9+ ile sınırlı)

---

## Hafta 7 — Otomatik Hatırlatmalar & Push Bildirimleri

- Taksit tarihine 1 gün kala (saat 09:00) esnaf ve müşteriye otomatik hatırlatma
- Müşteri ödeme bildirimi gönderince esnaf anlık push bildirim alır
- Esnafın onay/reddi müşteriye push bildirim olarak düşer
- Müşteri ana ekranında "Son Bildirimlerim" bölümü: gönderdiği bildirimlerin durumu (Bekliyor/Onaylandı/Reddedildi)
- Yarın vadesi gelen taksitler uyarı kartıyla gösterilir (esnaf: sarı, müşteri: kırmızı)
- Mobil cihazda (Expo Go) push bildirimler, web'de uygulama içi uyarı kartları

---

## Hafta 8 — UX İyileştirmeleri & Profil Ekranı

- Profil ekranı: baş harf avatarı, rol rozeti (Esnaf / Müşteri), ad ve dükkan adı düzenleme
- Ad değiştirilince esnafın müşteri listesindeki isim de otomatik güncellenir
- Çıkış onay modalı profil ekranında da mevcut
- Kayıt ekranında eksik alan ve kısa şifre için anlık hata mesajları
- Giriş ekranında Alert yerine inline hata kutusu
- Müşteri ve esnaf ana ekranlarındaki Profil ve Borçlar nav butonları aktif edildi

---

## Hafta 9 — Test & Hata Düzeltmeleri

- Borç Geçmişi ekranı: tüm borç kayıtları log şeklinde listelenir (tutar, açıklama, tarih, durum)
- Özet chips: toplam kayıt, açık borç tutarı (kırmızı), ödenen (yeşil)
- Esnaf müşteri bazlı, müşteri esnaf bazlı borçları görebilir
- Müşteri detay sayfasındaki alt nav butonları (Borçlar, Mesajlar, Profil) düzeltildi
- Müşteri adı güncellenince bağlı tüm Customer kayıtları da senkronize edilir

---

## Hafta 10 — Final Hazırlığı

- Farklı esnaf-müşteri ilişkileri ve çeşitli borç/taksit senaryolarıyla örnek veriler girildi
- Tüm özellikler uçtan uca test edildi; sunum akışı prova edildi
