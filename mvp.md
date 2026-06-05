# **WEN \- Water-Energy Nexus Karar Destek Sistemi**

> **Güncel özet:** [prodocs/MVP.md](./prodocs/MVP.md)

## **Faz 1: MVP Kapsam Dokümanı**

**Proje Sahibi:** Business Product Owner

**Teknik Sorumlu:** Technical Product Owner

**Versiyon:** 1.0

**Tarih:** Nisan 2026

## **1\. Giriş ve Amaç**

Bu döküman, WEN projesinin Faz 1 (MVP) kapsamını tanımlar. MVP'nin temel amacı, Bursa Organize Sanayi Bölgesi (BOSB) pilot tesisinde su ve enerji tüketim verilerini entegre ederek, "bilgi-eylem" boşluğunu kapatacak bir karar destek mekanizması kurmaktır.

## **2\. Hedef Kullanıcı Personaları**

### **2.1. Persona A: Stratejik Karar Verici (Fabrika Müdürü/Direktör)**

* **İhtiyaç:** Karmaşık teknik veriden arındırılmış, savunulabilir ve hızlı karar almayı sağlayan özet göstergeler.  
* **Kullanım Amacı:** Toplantı hazırlığı, maliyet öngörüsü ve kriz yönetimi.

### **2.2. Persona B: Teknik Operatör (Çevre Mühendisi/Teknisyen)**

* **İhtiyaç:** Anlık veri takibi, detaylı trend analizi ve teknik anomali tespiti.  
* **Kullanım Amacı:** Operasyonel verimlilik, bakım planlaması ve raporlama.

## **3\. MVP Özellik Seti (Must-Have)**

### **3.1. Modül 1: Nexus Dashboard (Görselleştirme)**

* **Anlık İzleme:** Su ($m^3/saat$) ve enerji ($kWh$) verilerinin eş zamanlı tek ekranda gösterimi.  
* **Dinamik Nexus Oranı:** Her veri paketinde hesaplanan $kWh/m^3$ oranının görselleştirilmesi.  
* **Rol Bazlı Görünüm:** Kullanıcı tipine göre otomatik özelleşen (Özet vs. Detay) arayüz katmanları.

### **3.2. Modül 2: Anomali ve Akıllı Uyarı Sistemi**

* **Eşik Yönetimi:** Kullanıcı tarafından belirlenebilen alt ve üst sınır (Threshold) yönetimi.  
* **Push & Mail Bildirimi:** Limit aşımlarında gecikmesiz uyarı iletimi.  
* **Smart Summary:** "Tesis X'te %20 sapma tespit edildi, kaçak riski yüksek" gibi doğal dilde (NLP tabanlı) uyarı metinleri.

### **3.3. Modül 3: Kod Kırmızı Kriz Protokolü**

* **Hiyerarşik Seviyeler:** Sarı (Gözlem), Turuncu (Hazırlık) ve Kırmızı (Aksiyon) statüleri.  
* **Aksiyon Rehberi:** Kriz anında ekranda beliren adım adım uygulanacak prosedür listesi.  
* **Dijital Kayıt (Audit Trail):** Kriz anındaki tüm etkileşimlerin zaman damgalı olarak loglanması.

### **3.4. Modül 4: Veri Simülasyonu ve ESG Raporlama**

* **BOSB Simülasyonu:** Gerçek veri akışının kesilmesi durumunda Bursa OSB parametrelerine uygun sentetik veri üretimi.  
* **ESG Çıktısı:** Yeşil Mutabakat uyumlu Kapsam 3 emisyon verilerini içeren aylık PDF rapor üretimi.

## **4\. Teknik Kısıtlar ve Altyapı**

* **Veri Protokolü:** MQTT (Mosquitto) üzerinden asenkron veri alımı.  
* **Veritabanı:** Zaman serisi verileri için **TimescaleDB**, ilişkisel veriler için **PostgreSQL**.  
* **Backend & Frontend:** FastAPI (Python) ve React (TypeScript).  
* **Barındırma:** Dockerize edilmiş konteyner yapısı (On-premise veya Cloud).

## **5\. Başarı Kriterleri (KPIs)**

* **Sistem Doğruluğu:** Anomali bildirimlerinde %85 doğruluk payı.  
* **Operasyonel Hız:** Kriz müdahale sürelerinde manuel sürece göre en az %50 iyileşme.  
* **Kullanıcı Adaptasyonu:** Hedef kullanıcıların %70'inin haftalık aktif kullanımı.

## **6\. MVP Takvimi ve Milestones**

* **Hafta 1-2:** Veri şeması ve MQTT broker kurulumu.  
* **Hafta 3-5:** Backend API ve Dashboard (M1) geliştirilmesi.  
* **Hafta 6-8:** Anomali motoru ve Kriz protokolü (M2 & M3) entegrasyonu.  
* **Hafta 9-10:** Simülasyon testleri, PDF raporlama ve UAT (Kullanıcı Kabul Testleri).

*Bu döküman WEN projesinin Faz 1 çerçevesini belirler. MVP sonrası özellikler (Tahminleme, AI entegrasyonu vb.) Faz 2 kapsamında değerlendirilecektir.*

