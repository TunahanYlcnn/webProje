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

function sekmeAc(hedefKatmanId) {
    const butonlar = document.querySelectorAll('.profil-sekme-btn');
    butonlar.forEach(btn => btn.classList.remove('aktif'));
    event.currentTarget.classList.add('aktif');

    const katmanlar = document.querySelectorAll('.profil-katman');
    katmanlar.forEach(k => k.classList.remove('aktif'));
    document.getElementById(hedefKatmanId).classList.add('aktif');

    if (hedefKatmanId === 'katman-ilanlarim') ilanlarimiGetir();
    else if (hedefKatmanId === 'katman-begendiklerim') begendiklerimiGetir();
    else if (hedefKatmanId === 'katman-yorumlarim') yorumlarimiGetir();
    else if (hedefKatmanId === 'katman-kaydedilenler') kaydedilenleriGetir(); // YENİ EKLENDİ
}

async function ilanlarimiGetir() {
    const liste = document.getElementById('profil-ilanlar-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";
    try {
        const cevap = await fetch('http://localhost:8000/profil/ilanlar/' + aktifKullanici);
        const veriler = await cevap.json();
        if (veriler.length === 0) { liste.innerHTML = '<p style="text-align:center;">Henüz hiç ilan paylaşmadınız.</p>'; return; }
        liste.innerHTML = "";
        veriler.forEach(ilan => {
            const durumMetni = ilan.durum === 'yayinda' ? 'Yayında (Gizle)' : 'Gizli (Yayınla)';
            const renk = ilan.durum === 'yayinda' ? '#f39c12' : '#7f8c8d';
            liste.innerHTML += `
                <div class="ilan-karti" id="ilan-${ilan.id}" onclick="ilaniGetirVeAc(${ilan.id})" style="cursor:pointer; transition:0.3s;">
                    <h3>${ilan.baslik}</h3>
                    <p>${ilan.aciklama}</p>
                    <p style="font-size:0.8rem; font-weight:bold; color:${renk}; margin-top:5px;">Durum: ${ilan.durum.toUpperCase()}</p>
                    <div class="ilan-yonetim-alani" onclick="event.stopPropagation()">
                        <button class="btn-durum" style="background:${renk}" onclick="durumDegistir(${ilan.id})">${durumMetni}</button>
                        <button class="btn-sil" onclick="ilanSil(${ilan.id})"><i class="fas fa-trash"></i> Sil</button>
                    </div>
                </div>`;
        });
    } catch (hata) {}
}

async function ilanSil(ilanId) {
    if (!confirm("Sistem-Uyarisi: İlan ve bağlı her şey silinecek. Onaylıyor musun?")) return;
    try {
        const cevap = await fetch('http://localhost:8000/ilan-sil/' + ilanId, { method: 'DELETE' });
        if (cevap.ok) { document.getElementById('ilan-' + ilanId).remove(); alert("Sistem-Mesaji: İlan silindi."); }
    } catch (hata) {}
}

async function durumDegistir(ilanId) {
    try {
        const cevap = await fetch('http://localhost:8000/ilan-durum/' + ilanId, { method: 'PUT' });
        if (cevap.ok) ilanlarimiGetir(); 
    } catch (hata) {}
}

async function begendiklerimiGetir() {
    const liste = document.getElementById('profil-begendiklerim-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";
    try {
        const cevap = await fetch('http://localhost:8000/profil/begendiklerim/' + aktifKullanici);
        const veriler = await cevap.json();
        if (veriler.length === 0) { liste.innerHTML = '<p style="text-align:center;">Henüz bir ilan beğenmediniz.</p>'; return; }
        liste.innerHTML = "";
        veriler.forEach(ilan => {
            liste.innerHTML += `
                <div class="ilan-karti" id="begeni-${ilan.id}" onclick="ilaniGetirVeAc(${ilan.id})" style="cursor:pointer; transition:0.3s;">
                    <h3>${ilan.baslik}</h3>
                    <p>${ilan.aciklama}</p>
                    <div class="ilan-yonetim-alani" onclick="event.stopPropagation()">
                        <button class="btn-sil" style="width:100%" onclick="begeniKaldir(${ilan.id})"><i class="fas fa-heart-broken"></i> Beğenmekten Vazgeç</button>
                    </div>
                </div>`;
        });
    } catch (hata) {}
}

async function begeniKaldir(ilanId) {
    try {
        const cevap = await fetch(`http://localhost:8000/begeni-kaldir/${ilanId}/${aktifKullanici}`, { method: 'DELETE' });
        if (cevap.ok) document.getElementById('begeni-' + ilanId).remove();
    } catch (hata) {}
}

// YENİ EKLENDİ: Kaydedilenleri Getirme
async function kaydedilenleriGetir() {
    const liste = document.getElementById('profil-kaydedilenler-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";
    try {
        const cevap = await fetch('http://localhost:8000/profil/kaydedilenler/' + aktifKullanici);
        const veriler = await cevap.json();
        if (veriler.length === 0) { liste.innerHTML = '<p style="text-align:center;">Henüz bir ilan kaydetmediniz.</p>'; return; }
        liste.innerHTML = "";
        veriler.forEach(ilan => {
            liste.innerHTML += `
                <div class="ilan-karti" id="kaydedilen-${ilan.id}" onclick="ilaniGetirVeAc(${ilan.id})" style="cursor:pointer; transition:0.3s;">
                    <h3>${ilan.baslik}</h3>
                    <p>${ilan.aciklama}</p>
                    <div class="ilan-yonetim-alani" onclick="event.stopPropagation()">
                        <button class="btn-sil" style="width:100%; background:#2c3e50;" onclick="kaydetKaldir(${ilan.id})"><i class="fas fa-bookmark"></i> Kaydedilenlerden Çıkar</button>
                    </div>
                </div>`;
        });
    } catch (hata) {}
}

async function kaydetKaldir(ilanId) {
    try {
        const cevap = await fetch(`http://localhost:8000/kaydet-kaldir/${ilanId}/${aktifKullanici}`, { method: 'DELETE' });
        if (cevap.ok) document.getElementById('kaydedilen-' + ilanId).remove();
    } catch (hata) {}
}

async function yorumlarimiGetir() {
    const liste = document.getElementById('profil-yorumlar-listesi');
    liste.innerHTML = "<p>Yükleniyor...</p>";
    try {
        const cevap = await fetch('http://localhost:8000/profil/yorumlar/' + aktifKullanici);
        const veriler = await cevap.json();
        if (veriler.length === 0) { liste.innerHTML = '<p style="text-align:center;">Henüz yorum yapmadınız.</p>'; return; }
        liste.innerHTML = "";
        veriler.forEach(yorum => {
            liste.innerHTML += `
                <div class="ilan-karti" onclick="ilaniGetirVeAc(${yorum.ilan_id})" style="cursor:pointer; transition:0.3s;">
                    <span style="font-size:0.8rem; color:#7f8c8d;">İlan: ${yorum.ilan_baslik}</span>
                    <p style="font-weight:bold; margin-top:5px;"><i class="fas fa-comment-dots"></i> "${yorum.metin}"</p>
                </div>`;
        });
    } catch (hata) {}
}

async function kullaniciAdiGuncelle() {
    const yeniAd = document.getElementById('yeni-kullanici-adi').value;
    if (yeniAd.length < 3) return alert("Sistem-Uyarisi: Kullanıcı adı çok kısa!");
    try {
        const cevap = await fetch('http://localhost:8000/hesap-isim-guncelle', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eski_kullanici_adi: aktifKullanici, yeni_kullanici_adi: yeniAd })
        });
        if (cevap.ok) { alert("Sistem-Mesaji: Kullanıcı adın güncellendi."); cikisYap(true); } 
        else { alert("Sistem-Hatası: Bu isim alınmış olabilir."); }
    } catch (hata) {}
}

async function sifreGuncelle() {
    const mevcut = document.getElementById('mevcut-sifre').value;
    const yeni = document.getElementById('yeni-sifre').value;
    if(!mevcut || !yeni) return;
    try {
        const cevap = await fetch('http://localhost:8000/hesap-sifre-guncelle', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kullanici_adi: aktifKullanici, eski_sifre: mevcut, yeni_sifre: yeni })
        });
        if (cevap.ok) { document.getElementById('mevcut-sifre').value = ''; document.getElementById('yeni-sifre').value = ''; alert("Şifre değişti.");}
    } catch (hata) {}
}

async function hesapSil() {
    if (confirm("Sistem-Uyarisi: Hesabı silmeyi onaylıyor musun?")) {
        try {
            const cevap = await fetch('http://localhost:8000/hesap-sil/' + aktifKullanici, { method: 'DELETE' });
            if (cevap.ok) { localStorage.removeItem('unishare_kullanici'); window.location.href = "index.html"; }
        } catch (hata) {}
    }
}

function cikisYap(dogrudanCikis = false) {
    if(dogrudanCikis || confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        localStorage.removeItem('unishare_kullanici');
        window.location.href = "index.html";
    }
}

const detayModal = document.getElementById('ilan-detay-modal');
const detayKapatBtn = document.querySelector('.detay-kapat-btn');
const modalDurumDegistirBtn = document.getElementById('durum-degistir-btn');
const detayYorumInput = document.getElementById('detay-yorum-input');
const detayYorumGonderBtn = document.getElementById('detay-yorum-gonder-btn');
let seciliIlan = null;
let yanitlanacakYorumId = null;

if(detayKapatBtn) detayKapatBtn.onclick = () => { detayModal.style.display = "none"; document.body.style.overflow = "auto"; yanitlanacakYorumId = null; };
window.onclick = (e) => { if (e.target === detayModal) { detayModal.style.display = "none"; document.body.style.overflow = "auto"; yanitlanacakYorumId = null;} };

async function ilaniGetirVeAc(ilanId) {
    try {
        const cevap = await fetch(`http://localhost:8000/ilan-detay/${ilanId}?kullanici_adi=${aktifKullanici}`);
        if(cevap.ok) { const ilan = await cevap.json(); detaylariAc(ilan); }
    } catch (hata) {}
}

function detaylariAc(ilan) {
    seciliIlan = ilan;
    document.getElementById('detay-baslik').innerText = ilan.baslik;
    document.getElementById('detay-kategori').innerText = ilan.kategori;
    document.getElementById('detay-aciklama').innerText = ilan.aciklama;
    document.getElementById('detay-fiyat').innerText = ilan.fiyat + " ₺";
    document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
    document.getElementById('detay-yorum-sayisi').innerText = ilan.yorumlar.length;

    if(ilan.yazar === aktifKullanici) modalDurumDegistirBtn.style.display = "block";
    else modalDurumDegistirBtn.style.display = "none";

    const etiket = document.getElementById('detay-durum-etiket');
    etiket.innerText = ilan.aktif ? "Bu ilan şu an yayında" : "Bu ilan yayından kaldırıldı";
    etiket.className = `durum-etiket ${ilan.aktif ? 'durum-yayinda' : 'durum-kapali'}`;

    document.getElementById('modal-kalp').className = ilan.begenildi ? 'fas fa-heart begenildi' : 'far fa-heart';
    
    // YENİ EKLENDİ: Profil modalında da kaydet ikonunu doldur/boşalt
    document.getElementById('modal-kaydet').className = ilan.kaydedildi ? 'fas fa-bookmark' : 'far fa-bookmark';

    const liste = document.getElementById('detay-yorumlar-listesi');
    liste.innerHTML = "";
    
    ilan.yorumlar.forEach((y) => {
        const yDiv = document.createElement('div');
        yDiv.className = 'yorum-kapsayici';
        
        let yanitlarHtml = "";
        if (y.yanitlar && y.yanitlar.length > 0) {
            yanitlarHtml = `<div class="alt-yorumlar-kutusu">`;
            y.yanitlar.forEach(yanit => {
                yanitlarHtml += `
                    <div class="alt-yorum">
                        <strong>${yanit.yazar}</strong>
                        <span>${yanit.metin}</span>
                        <div class="yorum-alt-bilgi">
                            <span class="yorum-begeni ${yanit.begenildi ? 'aktif' : ''}" onclick="yorumBegeniYap(${yanit.id})">
                                ${yanit.begenildi ? 'Beğenildi' : 'Beğen'}
                            </span>
                            <span onclick="yanitla(${y.id}, '${yanit.yazar}')">Yanıtla</span>
                            <span style="font-weight:normal">${yanit.begeniSayisi} beğeni</span>
                        </div>
                    </div>`;
            });
            yanitlarHtml += `</div>`;
        }

        yDiv.innerHTML = `
            <div class="yorum">
                <strong>${y.yazar}</strong>
                <span>${y.metin}</span>
                <div class="yorum-alt-bilgi">
                    <span class="yorum-begeni ${y.begenildi ? 'aktif' : ''}" onclick="yorumBegeniYap(${y.id})">
                        ${y.begenildi ? 'Beğenildi' : 'Beğen'}
                    </span>
                    <span onclick="yanitla(${y.id}, '${y.yazar}')">Yanıtla</span>
                    <span style="font-weight:normal">${y.begeniSayisi} beğeni</span>
                </div>
            </div>
            ${yanitlarHtml}
        `;
        liste.appendChild(yDiv);
    });

    detayModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

if(modalDurumDegistirBtn) {
    modalDurumDegistirBtn.onclick = async () => {
        if (seciliIlan && seciliIlan.yazar === aktifKullanici) {
            try {
                const cevap = await fetch('http://localhost:8000/ilan-durum/' + seciliIlan.id, { method: 'PUT' });
                if(cevap.ok) {
                    ilaniGetirVeAc(seciliIlan.id); 
                    if(document.getElementById('katman-ilanlarim').classList.contains('aktif')) ilanlarimiGetir();
                }
            } catch (hata) {}
        }
    };
}

async function begeniYap(e) {
    if(e) e.stopPropagation();
    try {
        const cevap = await fetch('http://localhost:8000/begeni-yap', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ilan_id: seciliIlan.id, kullanici_adi: aktifKullanici })
        });
        if (cevap.ok) {
            ilaniGetirVeAc(seciliIlan.id); 
            if(document.getElementById('katman-begendiklerim').classList.contains('aktif')) begendiklerimiGetir();
        }
    } catch (hata) {}
}

// YENİ EKLENDİ: Profil Modalında Kaydetme
async function kaydetYap(e) {
    if(e) e.stopPropagation();
    try {
        const cevap = await fetch('http://localhost:8000/kaydet-yap', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ilan_id: seciliIlan.id, kullanici_adi: aktifKullanici })
        });
        if (cevap.ok) {
            ilaniGetirVeAc(seciliIlan.id); 
            if(document.getElementById('katman-kaydedilenler').classList.contains('aktif')) kaydedilenleriGetir();
        }
    } catch (hata) {}
}

async function yorumBegeniYap(yorumId) {
    try {
        const cevap = await fetch('http://localhost:8000/yorum-begeni-yap', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ yorum_id: yorumId, kullanici_adi: aktifKullanici })
        });
        if(cevap.ok) ilaniGetirVeAc(seciliIlan.id);
    } catch(hata) {}
}

function yanitla(yorumId, kullaniciAdi) {
    yanitlanacakYorumId = yorumId; 
    detayYorumInput.value = `@${kullaniciAdi} `;
    detayYorumInput.focus();
}

async function yorumGonder() {
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Yorum yapmak için giriş yapmalısınız.");
    
    const metin = detayYorumInput.value.trim();
    if (metin === "" || !seciliIlan) return;

    const gonderilecekVeri = {
        ilan_id: seciliIlan.id,
        kullanici_adi: aktifKullanici,
        metin: metin
    };
    
    if (yanitlanacakYorumId !== null) {
        gonderilecekVeri.parent_id = yanitlanacakYorumId;
    }

    try {
        const cevap = await fetch('http://localhost:8000/yorum-yap', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gonderilecekVeri)
        });

        if (cevap.ok) {
            detayYorumInput.value = "";
            yanitlanacakYorumId = null;
            ilaniGetirVeAc(seciliIlan.id); // Modalı yenile
            if(document.getElementById('katman-yorumlarim').classList.contains('aktif')) yorumlarimiGetir();
        }
    } catch (hata) {
        alert("Sistem-Hatası: Yorum gönderilemedi.");
    }
}

if(detayYorumGonderBtn) detayYorumGonderBtn.onclick = yorumGonder;
if(detayYorumInput) detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };