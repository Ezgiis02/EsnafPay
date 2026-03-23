# EsnafPay

Esnaf ve müşteri arasındaki veresiye borç takibini dijitalleştiren mobil uygulama.
React Native (Expo) + Node.js + MongoDB ile geliştirilmektedir.

---

## Hafta 1 — Kimlik Doğrulama & Rol Yönetimi

### Yapılanlar

- **Kayıt Ekranı:** Ad, telefon ve şifre ile hesap oluşturma
- **Rol Seçimi:** Kayıt sırasında Esnaf veya Müşteri rolü seçimi
- **Giriş Ekranı:** Telefon + şifre ile giriş
- **Oturum Kalıcılığı:** Uygulama kapanıp açılınca oturum korunuyor (AsyncStorage)
- **Role Göre Yönlendirme:** Esnaf → müşteri listesi ekranı, Müşteri → borç özeti ekranı
- **Backend API:** Node.js + Express ile `/register` ve `/login` endpointleri
- **Veritabanı:** MongoDB — kullanıcı modeli, şifre bcrypt ile hashleniyor

### Demo

[![Hafta 1 Demo](https://img.shields.io/badge/YouTube-Hafta%201%20Demo-red?logo=youtube)](YOUTUBE_LINK_BURAYA)

> Video yüklendikten sonra `YOUTUBE_LINK_BURAYA` kısmını gerçek link ile değiştir.

---

## Teknik Yapı

```
EsnafPay/
├── EsnafPayApp/          # React Native (Expo)
│   └── src/
│       ├── screens/      # LoginScreen, RegisterScreen, EsnafHomeScreen, MusteriHomeScreen
│       ├── navigation/   # AppNavigator
│       ├── context/      # AuthContext
│       ├── api/          # client.js (axios)
│       └── theme/        # colors.js
└── backend/              # Node.js + Express
    ├── models/           # User.js (Mongoose)
    ├── routes/           # auth.js
    └── server.js
```

## Kurulum

### Backend
```bash
cd backend
npm install
npm run dev
```
> MongoDB'nin yerel olarak çalışıyor olması gerekir.

### Frontend
```bash
cd EsnafPayApp
npm install
npx expo start
```
