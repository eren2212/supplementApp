# Stripe Ödeme Entegrasyonu

Bu projede Stripe ödeme sistemi entegrasyonu, aşağıdaki yeteneklerle uygulanmıştır:

1. Tek seferlik sabit fiyatlı ürün satışı
2. Sepet içeriğine dayalı dinamik ödeme
3. Webhook ile ödeme durumu güncelleme

## Kurulum Adımları

### 1. Stripe Hesabı Oluşturun

- [Stripe Kontrol Paneli](https://dashboard.stripe.com)'ne kaydolun
- API anahtarlarınızı alın (publishable key ve secret key)

### 2. Çevre Değişkenlerini Ayarlayın

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Webhook Kurulumu

Geliştirme ortamında Stripe webhook'larını test etmek için:

1. [Stripe CLI](https://stripe.com/docs/stripe-cli)'yi indirin ve kurun
2. Aşağıdaki komutu çalıştırın:
   ```
   stripe login
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
3. Görüntülenen webhook secret'ı `.env` dosyanıza `STRIPE_WEBHOOK_SECRET` olarak ekleyin.

Canlı ortamda:

1. Stripe kontrol paneline gidin → Developers → Webhooks
2. Yeni bir endpoint ekleyin: `https://siteadresiniz.com/api/webhook/stripe`
3. Aşağıdaki olayları (events) dinleyin:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Oluşturulan webhook secret'ını `.env` dosyanıza ekleyin

## Kullanım

### Sabit Fiyatlı Ürün İçin Checkout

Premium üyelik sayfası `/payment/premium` adresinde bulunmaktadır. Kullanıcılar bu sayfadan 299 TL karşılığında premium üyelik satın alabilirler.

### Sepet İçin Checkout

Mevcut `/checkout` sayfası, sepet içeriğine dayalı dinamik ödeme işlemi sunar.

### Webhook İşlemleri

Webhook altyapısı şu olayları işler:

- `checkout.session.completed`: Sipariş durumunu "processing" olarak günceller
- `payment_intent.succeeded`: Ödeme kaydını "succeeded" olarak işaretler
- `payment_intent.payment_failed`: Ödeme kaydını "failed" olarak işaretler

## Dosya Yapısı

```
app/
├── api/
│   ├── checkout/route.ts             # Sepet checkout işlemi
│   ├── checkout-sessions/route.ts    # Sabit ürün checkout işlemi
│   └── webhook/stripe/route.ts       # Stripe webhook işleyici
├── (pages)/
│   ├── checkout/                     # Sepet checkout sayfaları
│   │   ├── success/page.tsx          # Başarılı ödeme sayfası
│   │   └── cancel/page.tsx           # İptal edilen ödeme sayfası
│   └── payment/
│       └── premium/page.tsx          # Premium üyelik satın alma sayfası
└── hooks/
    └── useStripeStatus.ts            # Ödeme durumu takip hook'u
```

## Test Kartları

Geliştirme ortamında aşağıdaki test kartlarını kullanabilirsiniz:

- **Başarılı Ödeme**: 4242 4242 4242 4242
- **Kimlik Doğrulama Gerekli**: 4000 0025 0000 3155
- **Reddedilen Ödeme**: 4000 0000 0000 9995

Tüm test kartları için:

- Son Kullanma Tarihi: Gelecekteki herhangi bir tarih
- CVC: Herhangi 3 rakam
- Posta Kodu: Herhangi 5 rakam

## API Endpoint'leri

### `/api/stripe` [POST]

Yeni bir ödeme işlemi başlatmak için kullanılır.

**Request:**

```json
{
  "amount": 100.5,
  "description": "Sipariş ödemesi",
  "paymentMethodId": "pm_..." // (İsteğe bağlı) Kaydedilmiş ödeme yöntemi için
}
```

**Response:**

```json
{
  "clientSecret": "pi_..."
}
```

### `/api/stripe` [GET]

Kullanıcının kayıtlı ödeme yöntemlerini almak için kullanılır.

**Response:**

```json
{
  "paymentMethods": [...]
}
```

## Veri Modeli

Projede Stripe entegrasyonu için aşağıdaki modeller kullanılmaktadır:

1. `User` modelinde `stripeCustomerId` alanı bulunmaktadır (müşteri kartlarını kaydetmek için).

2. `Payment` modeli ödeme kayıtlarını saklar:
   - id
   - userId
   - amount
   - paymentIntentId
   - status
   - description
   - createdAt

## Geliştirme Notları

- Canlı ortamda, test anahtarları yerine production anahtarlarını kullanın.
- Webhook kurulumu ile ödeme durumu değişikliklerini izleyebilirsiniz.
- Stripe Elements, PCI uyumluluğu sağlayarak kart bilgilerini güvenli şekilde işler.

## Kaynaklar

- [Stripe API Dokümantasyonu](https://stripe.com/docs/api)
- [Stripe.js ve Elements](https://stripe.com/docs/js)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
