// index.js - UniShare Giriş, Kayıt ve Katman Yönetimi

/**
 * 1. KATMAN DEĞİŞTİRME FONKSİYONU
 * Bu fonksiyon tanımlanmadığı için hata alıyordun. 
 * Sayfa yenilenmeden ekranlar arası geçişi sağlar.
 */
function katmanDegistir(katmanId) {
    // Tüm form katmanlarını gizle
    const katmanlar = document.querySelectorAll('.form-katmani');
    katmanlar.forEach(k => k.classList.remove('aktif'));

    // Seçilen katmanı göster
    const secilenKatman = document.getElementById(katmanId);
    if (secilenKatman) {
        secilenKatman.classList.add('aktif');
    }

    // Alt metni (açıklama) güncelle
    const altMetin = document.getElementById('alt-metin');
    if (altMetin) {
        if (katmanId === 'katman-kayit') {
            altMetin.innerText = "Aramıza katılmak için formu doldur.";
        } else if (katmanId === 'katman-sifre') {
            altMetin.innerText = "Şifreni sıfırlamana yardımcı olalım.";
        } else {
            altMetin.innerText = "Kampüs paylaşımlarına hızlıca ulaş.";
        }
    }
}

/**
 * 2. KAYIT FORMU KONTROLÜ
 */
const kayitFormu = document.getElementById('kayit-formu');
if (kayitFormu) {
    kayitFormu.onsubmit = async (e) => {
        e.preventDefault();
        
        // Inputlardan verileri güvenli bir şekilde alıyoruz
        const epostaInput = kayitFormu.querySelector('input[type="email"]');
        const kullaniciInput = kayitFormu.querySelector('input[placeholder="Kullanıcı Adı Seç"]');
        const sifreInput = kayitFormu.querySelector('input[placeholder="Şifre Oluştur"]');

        const eposta = epostaInput.value;
        const kullanici_adi = kullaniciInput.value;
        const sifre = sifreInput.value;

        try {
            const cevap = await fetch('http://localhost:8000/kayit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    eposta: eposta, 
                    kullanici_adi: kullanici_adi, 
                    sifre: sifre 
                })
            });

            const sonuc = await cevap.json();
            
            if (cevap.ok) {
                alert(sonuc.mesaj || "Kayıt başarıyla tamamlandı!");
                katmanDegistir('katman-giris'); // Başarılıysa giriş ekranına dön
            } else {
                // Backend'den gelen (kullanıcı adı zaten var vb.) hatayı göster
                alert("Hata: " + (sonuc.detail || "Kayıt yapılamadı."));
            }
        } catch (hata) {
            console.error("Hata detayı:", hata);
            alert("Sunucuya bağlanılamadı! Docker konteynerlerini kontrol et.");
        }
    };
}

/**
 * 3. GİRİŞ FORMU KONTROLÜ
 */
const girisFormu = document.getElementById('giris-formu');
if (girisFormu) {
    girisFormu.onsubmit = async (e) => {
        e.preventDefault();
        
        const kullanici_adi = document.getElementById('giris-kullanici').value;
        const sifre = document.getElementById('giris-sifre').value;

        try {
            const cevap = await fetch('http://localhost:8000/giris', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    kullanici_adi: kullanici_adi, 
                    sifre: sifre 
                })
            });

            const sonuc = await cevap.json();
            
            if (cevap.ok) {
                alert("Hoş geldin " + kullanici_adi);
                window.location.href = "anaSayfa.html"; // Ana sayfaya yönlendir
            } else {
                alert("Hata: " + (sonuc.detail || "Giriş bilgileri hatalı."));
            }
        } catch (hata) {
            console.error("Hata detayı:", hata);
            alert("Bağlantı hatası! Backend sunucusu (port 8000) çalışmıyor olabilir.");
        }
    };
}

/**
 * 4. ŞİFRE SIFIRLAMA (Simülasyon)
 */
const sifreFormu = document.getElementById('sifre-formu');
if (sifreFormu) {
    sifreFormu.onsubmit = (e) => {
        e.preventDefault();
        alert("Sıfırlama kodu e-postana gönderildi.");
        katmanDegistir('katman-giris');
    };
}