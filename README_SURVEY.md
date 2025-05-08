# Sağlık Anketi Uygulaması

Bu uygulama, kullanıcıların sağlık durumlarına göre kişiselleştirilmiş takviye önerileri almasını sağlar.

## Özellikler

- **Optimize Edilmiş Sağlık Anketi**: Kullanıcılar, 15 soruluk bir anketi yanıtlayarak kendi sağlık profillerini oluşturabilirler.
- **Kişiselleştirilmiş Öneriler**: Anket yanıtlarına göre, her kullanıcıya en uygun 3 takviye önerilir.
- **Seçim İmkanı**: Kullanıcılar, önerilen takviyeleri inceleyebilir ve istediklerini seçebilirler.
- **Onay Mekanizması**: Sepete eklemeden önce son bir onay ekranı gösterilir.
- **Sepete Kolay Ekleme**: Onaylanan takviyeleri tek tıklamayla sepete ekleyebilirler.
- **Modal ve Sayfa Erişimi**: Ankete hem ana sayfadaki buton üzerinden (modal) hem de ayrı bir URL (/anket) üzerinden erişilebilir.

## Kullanım

Anket iki şekilde başlatılabilir:

1. **Takviyeler** sayfasındaki banner üzerinden "Bana Uygun Takviyeyi Bul" butonuna tıklayarak.
2. Ana menüden "Sağlık Anketi" seçeneğine tıklayarak.

## Teknik Yapı

### Bileşenler

- **SurveyModal.tsx**: Anket sorularını gösteren ve yanıtları işleyen modal bileşeni.
- **SurveyButton.tsx**: Anketi başlatan buton bileşeni.

### Sayfalar

- **/anket**: Tam sayfa anket deneyimi sunan sayfa.

### Veri Kaynakları

- **questions.ts**: Tüm anket sorularını içeren veri dosyası.
- **supplementFeatures.ts**: Takviyelerin özelliklerini içeren veri dosyası.

## Algoritma

1. Kullanıcı 15 sorudan oluşan anketi doldurur.
2. Yanıtlar, `suggestible_supplement` alanlarına göre işlenir.
3. Kullanıcının birincil sağlık hedefine uygun ek takviyeler önerilir.
4. En uygun 3 takviye belirlenir ve kullanıcıya gösterilir.
5. Kullanıcı önerilen takviyelerden istediklerini seçer.
6. Kullanıcı sepete eklemeden önce onay verir.
7. Onaylanan takviyeler sepete eklenir.

## Seçilen 15 Soru

Aşağıdaki 15 soru, kullanıcıların sağlık profilini en verimli şekilde belirlemek için seçilmiştir:

1. Haftada kaç kere et veya bakliyat yiyorsunuz?
2. Haftada kaç kere balık yiyorsunuz?
3. Haftada kaç porsiyon sebze-meyve yiyorsunuz?
4. Her gün en az 20-30 dakika doğrudan güneş ışığına maruz kalıyor musunuz?
5. Bu özel diyetlerden herhangi birini takip ediyor musunuz?
6. Herhangi bir alerjiniz var mı?
7. Şu anda herhangi bir ilaç kullanıyor musunuz?
8. Şu anda uyku kalitenizi nasıl değerlendirirsiniz?
9. Aşağıdaki ifadelerden hangisi sizin için en uygundur?
10. Enerji seviyenizi nasil tanımlarsınız?
11. Saçlarınızda incelme veya dökülme problemi var mı?
12. Günde 4 saatten fazla ekran karşısında vakit geçiriyor musunuz?
13. Göz kuruluğu yaşıyor musunuz?
14. Stres seviyenizi nasıl tanımlarsınız?
15. Birincil sağlık hedefinizi seçiniz
