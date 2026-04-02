// 1. Katman Değiştirme Fonksiyonu
function katmanDegistir(katmanId) {
    // Tüm katmanlardan 'aktif' sınıfını kaldır
    const katmanlar = document.querySelectorAll('.form-katmani');
    katmanlar.forEach(k => k.classList.remove('aktif'));

    // Seçilen katmana 'aktif' sınıfını ekle
    const secilenKatman = document.getElementById(katmanId);
    secilenKatman.classList.add('aktif');

    // Alt metni güncelle (Opsiyonel - Daha şık durur)
    const altMetin = document.getElementById('alt-metin');
    if(katmanId === 'katman-kayit') altMetin.innerText = "Aramıza katılmak için formu doldur.";
    else if(katmanId === 'katman-sifre') altMetin.innerText = "Şifreni sıfırlamana yardımcı olalım.";
    else altMetin.innerText = "Kampüs paylaşımlarına hızlıca ulaş.";
}

// 2. Giriş Formu Kontrolü
const girisFormu = document.getElementById('giris-formu');
girisFormu.onsubmit = (e) => {
    e.preventDefault();
    const kullanici = document.getElementById('giris-kullanici').value;
    const sifre = document.getElementById('giris-sifre').value;

    if (kullanici === "admin" && sifre === "1234") {
        window.location.href = "anaSayfa.html";
    } else {
        alert("Hatalı bilgiler! (İpucu: admin / 1234)");
    }
};

// 3. Kayıt ve Şifre Formu (Şimdilik sadece mesaj)
document.getElementById('kayit-formu').onsubmit = (e) => {
    e.preventDefault();
    alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    katmanDegistir('katman-giris');
};

document.getElementById('sifre-formu').onsubmit = (e) => {
    e.preventDefault();
    alert("Sıfırlama kodu e-postana gönderildi.");
    katmanDegistir('katman-giris');
};