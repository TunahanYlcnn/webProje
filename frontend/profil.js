// profil.js - UniShare Profil ve Hesap Yönetimi
let aktifKullanici = "";

document.addEventListener('DOMContentLoaded', () => {
    aktifKullanici = localStorage.getItem('unishare_kullanici');
    kimlikKontroluYap();
    
    const isimAlanlari = document.querySelectorAll('#profil-kullanici-adi');
    isimAlanlari.forEach(alan => alan.innerText = aktifKullanici);

    ilanlarimiGetir();
});

function kimlikKontroluYap() {
    if (!aktifKullanici) {
        alert("Sistem-Uyarisi: Lütfen önce giriş yapın!");
        window.location.href = "index.html";
    }
}

// ==========================================
// SEKME YÖNETİMİ
// ==========================================
function sekmeAc(hedefKatmanId) {
    const butonlar = document.querySelectorAll('.profil-sekme-btn');
    butonlar.forEach(btn => btn.classList.remove('aktif'));
    event.currentTarget.classList.add('aktif');

    const katmanlar = document.querySelectorAll('.profil-katman');
    katmanlar.forEach(k => k.classList.remove('aktif'));
    document.getElementById(hedefKatmanId).classList.add('aktif');

    if (hedefKatmanId === 'katman-ilanlarim') {
        ilanlarimiGetir();
    } else if (hedefKatmanId === 'katman-begendiklerim') {
        begendiklerimiGetir();
    } else if (hedefKatmanId === 'katman-yorumlarim') {
        yorumlarimiGetir();
    }
}

// ==========================================
// 1. İLANLARIM İŞLEMLERİ
// ==========================================
async function ilanlarimiGetir() {
    const liste = document.getElementById('profil-ilanlar-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";

    try {
        const cevap = await fetch('http://localhost:8000/profil/ilanlar/' + aktifKullanici);
        const veriler = await cevap.json();

        if (veriler.length === 0) {
            liste.innerHTML = '<p style="text-align:center;">Henüz hiç ilan paylaşmadınız.</p>';
            return;
        }

        liste.innerHTML = "";
        veriler.forEach(ilan => {
            const durumMetni = ilan.durum === 'yayinda' ? 'Yayında (Gizle)' : 'Gizli (Yayınla)';
            const renk = ilan.durum === 'yayinda' ? '#f39c12' : '#7f8c8d';

            // YENİ EKLENDİ: Kartın kendisine onclick eventi verdik, içindeki butonlara event.stopPropagation() ekledik
            liste.innerHTML += `
                <div class="ilan-karti" id="ilan-${ilan.id}" onclick="ilaniGetirVeAc(${ilan.id})" style="cursor:pointer; transition:0.3s;">
                    <h3>${ilan.baslik}</h3>
                    <p>${ilan.aciklama}</p>
                    <p style="font-size:0.8rem; font-weight:bold; color:${renk}; margin-top:5px;">Durum: ${ilan.durum.toUpperCase()}</p>
                    <div class="ilan-yonetim-alani" onclick="event.stopPropagation()">
                        <button class="btn-durum" style="background:${renk}" onclick="durumDegistir(${ilan.id})">${durumMetni}</button>
                        <button class="btn-sil" onclick="ilanSil(${ilan.id})"><i class="fas fa-trash"></i> Sil</button>
                    </div>
                </div>
            `;
        });
    } catch (hata) {
        liste.innerHTML = "<p>Sistem-Hatası: İlanlar çekilemedi.</p>";
    }
}

async function ilanSil(ilanId) {
    const onay = confirm("Sistem-Uyarisi: Bu ilanı silmek istediğinize emin misiniz? (Bağlı yorum ve beğeniler de silinecektir)");
    if (!onay) return;

    try {
        const cevap = await fetch('http://localhost:8000/ilan-sil/' + ilanId, { method: 'DELETE' });
        if (cevap.ok) {
            document.getElementById('ilan-' + ilanId).remove();
            alert("Sistem-Mesaji: İlan ve bağlı tüm veriler veritabanından silindi.");
        }
    } catch (hata) {
        alert("Sistem-Hatası: Silme işlemi başarısız oldu.");
    }
}

async function durumDegistir(ilanId) {
    try {
        const cevap = await fetch('http://localhost:8000/ilan-durum/' + ilanId, { method: 'PUT' });
        if (cevap.ok) {
            alert("Sistem-Mesaji: İlan durumu güncellendi.");
            ilanlarimiGetir(); 
        }
    } catch (hata) {
        alert("Sistem-Hatası: Durum güncellenemedi.");
    }
}

// ==========================================
// 2. BEĞENDİKLERİM İŞLEMLERİ
// ==========================================
async function begendiklerimiGetir() {
    const liste = document.getElementById('profil-begendiklerim-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";

    try {
        const cevap = await fetch('http://localhost:8000/profil/begendiklerim/' + aktifKullanici);
        const veriler = await cevap.json();

        if (veriler.length === 0) {
            liste.innerHTML = '<p style="text-align:center;">Henüz bir ilan beğenmediniz.</p>';
            return;
        }

        liste.innerHTML = "";
        veriler.forEach(ilan => {
            liste.innerHTML += `
                <div class="ilan-karti" id="begeni-${ilan.id}" onclick="ilaniGetirVeAc(${ilan.id})" style="cursor:pointer; transition:0.3s;">
                    <h3>${ilan.baslik}</h3>
                    <p>${ilan.aciklama}</p>
                    <div class="ilan-yonetim-alani" onclick="event.stopPropagation()">
                        <button class="btn-sil" style="width:100%" onclick="begeniKaldir(${ilan.id})"><i class="fas fa-heart-broken"></i> Beğenmekten Vazgeç</button>
                    </div>
                </div>
            `;
        });
    } catch (hata) {
        liste.innerHTML = "<p>Veriler çekilemedi.</p>";
    }
}

async function begeniKaldir(ilanId) {
    try {
        const cevap = await fetch(`http://localhost:8000/begeni-kaldir/${ilanId}/${aktifKullanici}`, { method: 'DELETE' });
        if (cevap.ok) {
            document.getElementById('begeni-' + ilanId).remove();
        }
    } catch (hata) {
        alert("Bağlantı hatası.");
    }
}

// ==========================================
// 3. YORUMLARIM İŞLEMLERİ
// ==========================================
async function yorumlarimiGetir() {
    const liste = document.getElementById('profil-yorumlar-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";
    
    try {
        const cevap = await fetch('http://localhost:8000/profil/yorumlar/' + aktifKullanici);
        const veriler = await cevap.json();

        if (veriler.length === 0) {
            liste.innerHTML = '<p style="text-align:center;">Henüz yorum yapmadınız.</p>';
            return;
        }

        liste.innerHTML = "";
        veriler.forEach(yorum => {
            // YENİ EKLENDİ: Artık yorum.ilan_id üzerinden doğruca o ilanın detayına gidebiliyoruz
            liste.innerHTML += `
                <div class="ilan-karti" onclick="ilaniGetirVeAc(${yorum.ilan_id})" style="cursor:pointer; transition:0.3s;">
                    <span style="font-size:0.8rem; color:#7f8c8d;">İlan: ${yorum.ilan_baslik}</span>
                    <p style="font-weight:bold; margin-top:5px;"><i class="fas fa-comment-dots"></i> "${yorum.metin}"</p>
                </div>
            `;
        });
    } catch (hata) {
        liste.innerHTML = "<p>Yorumlar getirilemedi.</p>";
    }
}

// ==========================================
// 4. HESAP AYARLARI İŞLEMLERİ
// ==========================================
async function kullaniciAdiGuncelle() {
    const yeniAd = document.getElementById('yeni-kullanici-adi').value;
    if (yeniAd.length < 3) return alert("Sistem-Uyarisi: Kullanıcı adı çok kısa!");

    try {
        const cevap = await fetch('http://localhost:8000/hesap-isim-guncelle', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eski_kullanici_adi: aktifKullanici, yeni_kullanici_adi: yeniAd })
        });
        
        if (cevap.ok) {
            alert("Sistem-Mesaji: Kullanıcı adın başarıyla güncellendi. Lütfen tekrar giriş yap.");
            cikisYap(true);
        } else {
            alert("Sistem-Hatası: Bu kullanıcı adı kullanılıyor olabilir.");
        }
    } catch (hata) {
        alert("Bağlantı hatası!");
    }
}

async function sifreGuncelle() {
    const mevcut = document.getElementById('mevcut-sifre').value;
    const yeni = document.getElementById('yeni-sifre').value;
    
    if(!mevcut || !yeni) return alert("Sistem-Uyarisi: Lütfen tüm alanları doldurun.");

    try {
        const cevap = await fetch('http://localhost:8000/hesap-sifre-guncelle', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kullanici_adi: aktifKullanici, eski_sifre: mevcut, yeni_sifre: yeni })
        });

        const sonuc = await cevap.json();
        if (cevap.ok) {
            alert(sonuc.mesaj);
            document.getElementById('mevcut-sifre').value = '';
            document.getElementById('yeni-sifre').value = '';
        } else {
            alert(sonuc.detail);
        }
    } catch (hata) {
        alert("Bağlantı hatası.");
    }
}

async function hesapSil() {
    const onay = confirm("Sistem-Uyarisi: DİKKAT! Hesabınızı silmek geri alınamaz! Bütün ilanlarınız, yorumlarınız ve beğenileriniz veritabanından kalıcı olarak silinecektir. Onaylıyor musunuz?");
    if (onay) {
        try {
            const cevap = await fetch('http://localhost:8000/hesap-sil/' + aktifKullanici, { method: 'DELETE' });
            if (cevap.ok) {
                localStorage.removeItem('unishare_kullanici');
                alert("Sistem-Mesaji: Hesabınız ve tüm verileriniz başarıyla silindi. Hoşçakalın!");
                window.location.href = "index.html";
            }
        } catch (hata) {
            alert("Sistem-Hatası: Silme işlemi başarısız oldu.");
        }
    }
}

function cikisYap(dogrudanCikis = false) {
    if(dogrudanCikis || confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        localStorage.removeItem('unishare_kullanici');
        window.location.href = "index.html";
    }
}

// ==========================================
// YENİ EKLENDİ: MODAL VE İLAN DETAY İŞLEMLERİ
// ==========================================
const detayModal = document.getElementById('ilan-detay-modal');
const detayKapatBtn = document.querySelector('.detay-kapat-btn');
const modalDurumDegistirBtn = document.getElementById('durum-degistir-btn');
const detayYorumInput = document.getElementById('detay-yorum-input');
const detayYorumGonderBtn = document.getElementById('detay-yorum-gonder-btn');
let seciliIlan = null;

if(detayKapatBtn) {
    detayKapatBtn.onclick = () => { detayModal.style.display = "none"; document.body.style.overflow = "auto"; };
}

window.onclick = (e) => { 
    if (e.target === detayModal) { 
        detayModal.style.display = "none"; 
        document.body.style.overflow = "auto"; 
    }
};

// Arka plandan o tek ilanı eksiksiz olarak çeken fonksiyon
async function ilaniGetirVeAc(ilanId) {
    try {
        const cevap = await fetch(`http://localhost:8000/ilan-detay/${ilanId}?kullanici_adi=${aktifKullanici}`);
        if(cevap.ok) {
            const ilan = await cevap.json();
            detaylariAc(ilan);
        } else {
            alert("Sistem-Hatası: İlan bulunamadı (Büyük ihtimalle silinmiş).");
        }
    } catch (hata) {
        console.error("Sistem-Hatası:", hata);
    }
}

// Gelen ilanı Modala Çizen Fonksiyon
function detaylariAc(ilan) {
    seciliIlan = ilan;
    document.getElementById('detay-baslik').innerText = ilan.baslik;
    document.getElementById('detay-kategori').innerText = ilan.kategori;
    document.getElementById('detay-aciklama').innerText = ilan.aciklama;
    document.getElementById('detay-fiyat').innerText = ilan.fiyat + " ₺";
    document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
    document.getElementById('detay-yorum-sayisi').innerText = ilan.yorumlar.length;

    // Eğer ilan benimse durum değiştirme butonunu göster
    if(ilan.yazar === aktifKullanici) {
        modalDurumDegistirBtn.style.display = "block";
    } else {
        modalDurumDegistirBtn.style.display = "none";
    }

    const etiket = document.getElementById('detay-durum-etiket');
    etiket.innerText = ilan.aktif ? "Bu ilan şu an yayında" : "Bu ilan yayından kaldırıldı";
    etiket.className = `durum-etiket ${ilan.aktif ? 'durum-yayinda' : 'durum-kapali'}`;
    etiket.style.position = "static";
    etiket.style.marginTop = "15px";

    const modalKalp = document.getElementById('modal-kalp');
    modalKalp.className = ilan.begenildi ? 'fas fa-heart begenildi' : 'far fa-heart';

    const liste = document.getElementById('detay-yorumlar-listesi');
    liste.innerHTML = "";
    
    ilan.yorumlar.forEach((y) => {
        const yDiv = document.createElement('div');
        yDiv.className = 'yorum-kapsayici';
        yDiv.innerHTML = `
            <div class="yorum">
                <strong>${y.yazar}</strong>
                <span>${y.metin}</span>
            </div>
        `;
        liste.appendChild(yDiv);
    });

    detayModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

// Modaldan Durum Değiştirme
if(modalDurumDegistirBtn) {
    modalDurumDegistirBtn.onclick = async () => {
        if (seciliIlan && seciliIlan.yazar === aktifKullanici) {
            try {
                const cevap = await fetch('http://localhost:8000/ilan-durum/' + seciliIlan.id, { method: 'PUT' });
                if(cevap.ok) {
                    alert("Sistem-Mesaji: İlan durumu güncellendi.");
                    ilaniGetirVeAc(seciliIlan.id); // Modalı Yenile
                    if(document.getElementById('katman-ilanlarim').classList.contains('aktif')) ilanlarimiGetir(); // Arkaplanı Yenile
                }
            } catch (hata) {}
        }
    };
}

// Modaldan Beğeni Yapma
async function begeniYap(e) {
    if(e) e.stopPropagation();
    try {
        const cevap = await fetch('http://localhost:8000/begeni-yap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ilan_id: seciliIlan.id, kullanici_adi: aktifKullanici })
        });

        if (cevap.ok) {
            ilaniGetirVeAc(seciliIlan.id); // Modalı yenile
            if(document.getElementById('katman-begendiklerim').classList.contains('aktif')) begendiklerimiGetir();
        }
    } catch (hata) {
        console.error("Bağlantı hatası:", hata);
    }
}

// Modaldan Yorum Yapma
async function yorumGonder() {
    const metin = detayYorumInput.value.trim();
    if (metin === "") return;

    try {
        const cevap = await fetch('http://localhost:8000/yorum-yap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ilan_id: seciliIlan.id,
                kullanici_adi: aktifKullanici,
                metin: metin
            })
        });

        if (cevap.ok) {
            detayYorumInput.value = "";
            ilaniGetirVeAc(seciliIlan.id); // Modalı yenile
            if(document.getElementById('katman-yorumlarim').classList.contains('aktif')) yorumlarimiGetir();
        }
    } catch (hata) {}
}

if(detayYorumGonderBtn) detayYorumGonderBtn.onclick = yorumGonder;
if(detayYorumInput) detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };