// index.js - UniShare Giriş ve Katman Yönetimi

/**
 * 1. Katman Değiştirme Fonksiyonu
 * Sayfa yenilenmeden Giriş, Kayıt ve Şifremi Unuttum ekranları arasında geçiş yapar.
 */
function katmanDegistir(katmanId) {
    // Tüm form katmanlarını bul ve 'aktif' sınıfını kaldır (Hepsini gizle)
    const katmanlar = document.querySelectorAll('.form-katmani');
    katmanlar.forEach(k => k.classList.remove('aktif'));

    // Kullanıcının tıkladığı ilgili katmanı bul ve 'aktif' yaparak göster
    const secilenKatman = document.getElementById(katmanId);
    if (secilenKatman) {
        secilenKatman.classList.add('aktif');
    }

    // Alt metni (açıklama kısmını) şık bir şekilde güncelle
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
 * 2. Backend Bağlantı Testi Fonksiyonu (YENİ)
 * Bu fonksiyon, frontend ve backend'in Docker üzerinde birbiriyle 
 * konuşup konuşmadığını kontrol eder.
 */
async function backendSelamla() {
    try {
        // FastAPI backend'imize (8000 portu) bir istek gönderiyoruz
        const cevap = await fetch('http://localhost:8000/giris-kontrol');
        const veri = await cevap.json();
        
        // Backend'den gelen mesajı konsola yazdıralım (Test amaçlı)
        console.log("Backend Yanıtı:", veri.mesaj);
        return true;
    } catch (hata) {
        console.error("Backend bağlantı hatası:", hata);
        return false;
    }
}

/**
 * 3. Giriş Formu Kontrolü ve Backend Entegrasyonu
 */
const girisFormu = document.getElementById('giris-formu');
if (girisFormu) {
    girisFormu.onsubmit = async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle
        
        const kullanici = document.getElementById('giris-kullanici').value;
        const sifre = document.getElementById('giris-sifre').value;

        // ÖNCE: Backend çalışıyor mu diye bir selam verelim
        const baglantiDurumu = await backendSelamla();
        
        if (!baglantiDurumu) {
            alert("Dikkat: Backend (Mutfak) şu an kapalı! Docker'ı kontrol et.");
            return; // Backend kapalıysa devam etme
        }

        // ŞİMDİLİK: Mevcut admin kontrolünü koruyoruz
        if (kullanici === "admin" && sifre === "1234") {
            alert("Backend bağlantısı başarılı ve giriş izni verildi!");
            window.location.href = "anaSayfa.html";
        } else {
            alert("Hatalı bilgiler! (İpucu: admin / 1234)");
        }
    };
}

/**
 * 4. Kayıt Formu Kontrolü
 */
const kayitFormu = document.getElementById('kayit-formu');
if (kayitFormu) {
    kayitFormu.onsubmit = (e) => {
        e.preventDefault();
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        katmanDegistir('katman-giris');
    };
}

/**
 * 5. Şifre Sıfırlama Formu Kontrolü
 */
const sifreFormu = document.getElementById('sifre-formu');
if (sifreFormu) {
    sifreFormu.onsubmit = (e) => {
        e.preventDefault();
        alert("Sıfırlama kodu e-postana gönderildi.");
        katmanDegistir('katman-giris');
    };
}