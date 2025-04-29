# Stripe Ödeme Entegrasyonu

Bu proje, Next.js ve Stripe API kullanarak ödeme entegrasyonunu içerir. Aşağıda entegrasyon adımları ve kullanımı ile ilgili detaylar bulunmaktadır.

## Kurulum

1. Stripe hesabı oluşturun: [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)

2. Stripe Dashboard'dan API anahtarlarınızı alın:

   - Publishable Key (pk*test*...)
   - Secret Key (sk*test*...)

3. `.env` dosyasına anahtarları ekleyin:

   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. Projeyi kurun ve başlatın:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

## Kullanım

Projenin ödeme işlemini kullanmak için aşağıdaki yönergeleri izleyin:

1. `/payment` sayfasına yönlendirme yapın ve query parametreleri ile ödeme tutarını ve açıklamasını gönderin:

   ```javascript
   router.push(
     `/payment?amount=${amount}&description=Sipariş ödemesi&returnUrl=/success-page`
   );
   ```

2. `/payment` sayfası otomatik olarak Stripe ödeme formunu gösterecek ve kredi kartı bilgilerini alacaktır.

3. Ödeme başarılı olduğunda, `returnUrl` parametresinde belirtilen URL'e yönlendirileceksiniz.

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
