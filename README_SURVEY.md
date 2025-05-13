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

### Kategori Bazlı Puanlama Sistemi

Anket yanıtlarına göre takviye önerileri sunmak için kategori bazlı puanlama sistemi geliştirilmiştir:

1. **Kategorilere Ayırma ve Puanlama**:

   - Her soru kategorize edilmiştir (beyin, kalp, uyku, eklem vb.)
   - Kategori önemi için katsayılar belirlenmiştir (örn: beyin ve kalp 1.2, uyku ve eklem 1.1)
   - Her soruya yanıt verildiğinde, ilgili supplementler puan kazanır
   - Önemli sorular (aim) diğer sorulara göre daha yüksek ağırlığa sahiptir (15 vs 10)

2. **Kategori Katsayıları**:

   - Beyin ve Kalp: 1.2 (yüksek öncelik)
   - Uyku ve Eklem: 1.1 (orta-yüksek öncelik)
   - Bağışıklık, Enerji, Sindirim: 1.0 (orta öncelik)
   - Deri, Göz, Saç: 0.9 (orta-düşük öncelik)
   - Genel sorular: 0.8 (düşük öncelik)

3. **Birincil Sağlık Hedefi**:

   - Kullanıcının birincil sağlık hedefi (soru 24) önemli rol oynar
   - Seçilen hedef kategorisine ait supplementler 20 ek puan kazanır
   - Hedef kategorisine ait supplementler öncelikli olarak önerilir

4. **En Uygun Supplementlerin Seçimi**:

   - Tüm supplementler puanlarına göre sıralanır
   - En yüksek puanlı 3 supplement kullanıcıya önerilir
   - Eğer 3'ten az öneri varsa, kullanıcının birincil hedefine göre ek öneriler eklenir
   - Hala 3'ten az ise genel popüler supplementlerden eksik tamamlanır

5. **Kullanıcı Seçimi ve Sepete Ekleme**:

   - Kullanıcı önerilen supplementlerden istediklerini seçebilir
   - Seçim sonrası sepete ekleme onaylanır ve sepete eklenir

6. **Cevaplara Göre Puan Sistemi**:

   - Her soru için belirlenmiş cevaplar, belirli takviyeler için puan üretir
   - Örneğin:
     - "Haftada kaç kere balık yiyorsunuz?" sorusuna "Asla" cevabı, Omega-3 takviyesine puan ekler
     - "Göz kuruluğu yaşıyor musunuz?" sorusuna "Evet" cevabı, Omega-3 takviyesine puan ekler
     - "Stres seviyenizi nasıl tanımlarsınız?" sorusuna "Sürekli stres halindeyim" cevabı, Ashwagandha takviyesine puan ekler
   - Puanlar şu şekilde hesaplanır:
     - `Puan = Soru Ağırlığı(10/15) * Kategori Katsayısı(0.8-1.2)`
     - Normal sorular 10 baz puan, hedef (aim) soruları 15 baz puan
     - Bu puan kategori katsayısıyla çarpılır (örneğin beyin sağlığı için 1.2, genel sorular için 0.8)

7. **Negatif Puanlama**:

   - Sistem şu anda negatif puanlama içermemektedir
   - Her cevap yalnızca belirtilen takviyeler için pozitif puan üretir
   - Belirli bir takviyeye puan eklenmeyen cevaplar, puanlama sisteminde dikkate alınmaz

8. **Eşleşme Mekanizması**:
   - Sistem, kullanıcı cevabını ve önerilen takviyeye bağlanan anahtar kelimeyi eşleştirir
   - Örneğin "uykuya dalmakta güçlük çekiyorum" cevabı "uykuya dalmakta" anahtar kelimesi ile eşleşirse, ilgili takviye puan alır
   - Çoklu seçim sorularında her seçenek ayrı ayrı değerlendirilir

Bu algoritma, kullanıcıların bireysel ihtiyaçlarına göre özelleştirilmiş ve daha doğru takviye önerileri sunmak üzere tasarlanmıştır.

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
