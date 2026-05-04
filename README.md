# 🎓 UniShare: Üniversite İçi Yardımlaşma ve İlan Platformu

**UniShare**, üniversite öğrencilerinin kendi aralarında eşya alım-satımı yapabildiği, ders notlarını paylaşabildiği ve kampüs içi yardımlaşmayı dijitalleştiren kapsamlı bir **Full-Stack** platformdur. Proje, modern web teknolojileri ve konteynerize mimari kullanılarak ölçeklenebilir bir yapıda tasarlanmıştır.

---

## 🚀 Öne Çıkan Özellikler

*   **İlan Yönetimi:** Kategorize edilmiş (Eşya, Kitap, Ders Notu vb.) ilan oluşturma ve yönetme.
*   **Gerçek Zamanlı Etkileşim:** Öğrenciler arası hızlı iletişim ve ilan takibi.
*   **Modern Kimlik Doğrulama:** Güvenli kullanıcı kayıt ve giriş sistemleri.
*   **Konteynerize Altyapı:** Docker desteği sayesinde her ortamda sorunsuz kurulum.

---

## 🏗️ Teknik Yığın (Tech Stack)

*   **Frontend:** html, css, js.
*   **Backend:** fastapi.
*   **Veritabanı:** PostgreSQL.
*   **Sunucu & Dağıtım:** **Docker** & Docker Compose.

---

## 🐳 Docker ile Kurulum (Hızlı Başlangıç)

Proje, geliştirme ve üretim ortamlarında tutarlılık sağlamak amacıyla tamamen **Docker** ile uyumlu hale getirilmiştir. Karmaşık veritabanı ve bağımlılık kurulumlarıyla uğraşmadan sistemi saniyeler içinde ayağa kaldırabilirsiniz.

### Gereksinimler
*   Docker Desktop
*   Docker Compose

### Adımlar
1.  **Depoyu Klonlayın:**
```bash
git clone https://github.com/TunahanYlcnn/UniShare.git
cd UniShare
```

2.  **Sistemi Tek Komutla Başlatın:**
```bash
docker-compose up --build
```
*Bu komut; backend servislerini, veritabanını ve frontend bileşenlerini otomatik olarak yapılandırır ve birbirine bağlar.*
