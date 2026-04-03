const yanMenu = document.getElementById('yan-menu');
const menuTetikleyici = document.getElementById('menu-tetikleyici');
const ilanModal = document.getElementById('ilan-modal');
const ilanBtn = document.getElementById('ilan-paylas-tetikleyici');
const kapatBtn = document.querySelector('.kapat-btn');
const ilanFormu = document.getElementById('ilan-formu');
const ilanlarKutusu = document.getElementById('ilanlar-kutusu');
const detayModal = document.getElementById('ilan-detay-modal');
const detayKapatBtn = document.querySelector('.detay-kapat-btn');
const detayYorumInput = document.getElementById('detay-yorum-input');
const detayYorumGonderBtn = document.getElementById('detay-yorum-gonder-btn');
const filtreButonlari = document.querySelectorAll('.filtre-btn');
const durumDegistirBtn = document.getElementById('durum-degistir-btn');

let ilanlar = [];
let seciliIlan = null;
let yanitlanacakYorumId = null; 
let suAnkiKategori = "Hepsi";

const aktifKullanici = localStorage.getItem('unishare_kullanici');

async function ilanlariVeritabanindanGetir() {
    try {
        const url = aktifKullanici ? `http://localhost:8000/ilanlar?kullanici_adi=${aktifKullanici}` : `http://localhost:8000/ilanlar`;
        const cevap = await fetch(url);
        if (cevap.ok) {
            ilanlar = await cevap.json();
            ilanlariGoster();
        }
    } catch (hata) {
        console.error("Sistem-Hatası: İlanlar çekilemedi", hata);
    }
}

async function ilaniGetirVeAc(ilanId) {
    try {
        const cevap = await fetch(`http://localhost:8000/ilan-detay/${ilanId}?kullanici_adi=${aktifKullanici || ''}`);
        if(cevap.ok) {
            const ilan = await cevap.json();
            detaylariAc(ilan);
        }
    } catch (hata) {}
}

document.addEventListener('DOMContentLoaded', () => {
    ilanlariVeritabanindanGetir();
});

menuTetikleyici.onclick = () => yanMenu.classList.toggle('acik');

if(ilanBtn) {
    ilanBtn.onclick = () => { 
        if(!aktifKullanici) return alert("Sistem-Uyarisi: İlan paylaşmak için giriş yapmalısınız!");
        ilanModal.style.display = "block"; 
        document.body.style.overflow = "hidden"; 
        document.body.classList.add('modal-acik');
    };
}

kapatBtn.onclick = () => { ilanModal.style.display = "none"; document.body.style.overflow = "auto"; document.body.classList.remove('modal-acik'); };
detayKapatBtn.onclick = () => { detayModal.style.display = "none"; document.body.style.overflow = "auto"; yanitlanacakYorumId = null; };

window.onclick = (e) => { 
    if (e.target.classList.contains('modal')) { 
        ilanModal.style.display = "none"; 
        detayModal.style.display = "none"; 
        document.body.style.overflow = "auto";
        document.body.classList.remove('modal-acik'); 
        yanitlanacakYorumId = null;
    }
};

function ilanlariGoster() {
    ilanlarKutusu.innerHTML = "";
    if (ilanlar.length === 0) {
        ilanlarKutusu.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Şu an yayında hiç ilan yok.</p>";
        return;
    }

    const gosterilecekIlanlar = suAnkiKategori === "Hepsi" ? ilanlar : ilanlar.filter(ilan => ilan.kategori === suAnkiKategori);

    gosterilecekIlanlar.forEach(ilan => {
        const kart = document.createElement('div');
        kart.className = 'kart';
        
        kart.addEventListener('click', (e) => {
            if (!e.target.closest('.kart-alt-bilgi')) detaylariAc(ilan);
        });

        const durumSinifi = ilan.aktif ? 'durum-yayinda' : 'durum-kapali';
        const durumMetni = ilan.aktif ? 'Yayında' : 'Yayında Değil';
        
        // YENİ EKLENDİ: Kaydetme İkonu kartın altına yerleştirildi
        kart.innerHTML = `
            <div class="durum-etiket ${durumSinifi}">${durumMetni}</div>
            <span class="kategori-etiket">${ilan.kategori}</span>
            <h3>${ilan.baslik}</h3>
            <p style="font-size:0.8rem; color:#7f8c8d; margin-bottom:10px;">Paylaşan: ${ilan.yazar}</p>
            <div class="fiyat">${ilan.fiyat} ₺</div>
            <div class="kart-alt-bilgi" style="display:flex; align-items:center;">
                <span class="begeni-tetikleyici" data-id="${ilan.id}" style="margin-right:15px; cursor:pointer;">
                    <i class="${ilan.begenildi ? 'fas begenildi' : 'far'} fa-heart"></i> 
                    <span class="sayi">${ilan.begeni}</span>
                </span>
                <span><i class="fas fa-comment"></i> ${ilan.yorumlar.length}</span>
                
                <span class="kaydet-tetikleyici" data-id="${ilan.id}" style="margin-left:auto; cursor:pointer; color:#34495e; font-size:1.1rem;">
                    <i class="${ilan.kaydedildi ? 'fas' : 'far'} fa-bookmark"></i>
                </span>
            </div>
        `;
        ilanlarKutusu.appendChild(kart);
    });

    document.querySelectorAll('.begeni-tetikleyici').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            if(!aktifKullanici) return alert("Sistem-Uyarisi: Beğenmek için giriş yapmalısınız!");
            begeniIstegiGonder(parseInt(btn.getAttribute('data-id')));
        };
    });

    // YENİ EKLENDİ: Küçük Kartlardaki Kaydetme Butonu Olayı
    document.querySelectorAll('.kaydet-tetikleyici').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            if(!aktifKullanici) return alert("Sistem-Uyarisi: Kaydetmek için giriş yapmalısınız!");
            kaydetIstegiGonder(parseInt(btn.getAttribute('data-id')));
        };
    });
}

filtreButonlari.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filtre-btn.aktif').classList.remove('aktif');
        btn.classList.add('aktif');
        suAnkiKategori = btn.getAttribute('data-kategori');
        ilanlariGoster();
    });
});

function detaylariAc(ilan) {
    seciliIlan = ilan;
    document.getElementById('detay-baslik').innerText = ilan.baslik;
    document.getElementById('detay-kategori').innerText = ilan.kategori;
    document.getElementById('detay-aciklama').innerText = ilan.aciklama;
    document.getElementById('detay-fiyat').innerText = ilan.fiyat + " ₺";
    document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
    document.getElementById('detay-yorum-sayisi').innerText = ilan.yorumlar.length;

    durumDegistirBtn.style.display = (ilan.yazar === aktifKullanici) ? "block" : "none";

    const etiket = document.getElementById('detay-durum-etiket');
    etiket.innerText = ilan.aktif ? "Bu ilan şu an yayında" : "Bu ilan yayından kaldırıldı";
    etiket.className = `durum-etiket ${ilan.aktif ? 'durum-yayinda' : 'durum-kapali'}`;

    document.getElementById('modal-kalp').className = ilan.begenildi ? 'fas fa-heart begenildi' : 'far fa-heart';
    
    // YENİ EKLENDİ: Modal içindeki kaydet ikonunu güncelle
    document.getElementById('modal-kaydet').className = ilan.kaydedildi ? 'fas fa-bookmark' : 'far fa-bookmark';

    const liste = document.getElementById('detay-yorumlar-listesi');
    liste.innerHTML = "";
    
    ilan.yorumlar.forEach(y => {
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

durumDegistirBtn.onclick = async () => {
    if (seciliIlan && seciliIlan.yazar === aktifKullanici) {
        try {
            const cevap = await fetch('http://localhost:8000/ilan-durum/' + seciliIlan.id, { method: 'PUT' });
            if(cevap.ok) {
                alert("Sistem-Mesaji: İlan durumu güncellendi.");
                ilanlariVeritabanindanGetir(); 
                detayModal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        } catch (hata) {}
    }
};

async function begeniIstegiGonder(ilanId) {
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Beğenmek için giriş yapmalısınız.");
    try {
        const cevap = await fetch('http://localhost:8000/begeni-yap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ilan_id: ilanId, kullanici_adi: aktifKullanici })
        });
        if (cevap.ok) await ilanlariVeritabanindanGetir();
    } catch (hata) {}
}

function begeniYap(e) {
    e.stopPropagation();
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Beğenmek için giriş yapmalısınız.");
    begeniIstegiGonder(seciliIlan.id);
    ilaniGetirVeAc(seciliIlan.id);
}

// YENİ EKLENDİ: Kaydetme İsteği Gönder (Hem kart hem modal kullanır)
async function kaydetIstegiGonder(ilanId) {
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Kaydetmek için giriş yapmalısınız.");
    try {
        const cevap = await fetch('http://localhost:8000/kaydet-yap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ilan_id: ilanId, kullanici_adi: aktifKullanici })
        });
        if (cevap.ok) await ilanlariVeritabanindanGetir();
    } catch (hata) {}
}

// YENİ EKLENDİ: Modaldaki kaydet butonuna tıklama
function kaydetYap(e) {
    e.stopPropagation();
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Kaydetmek için giriş yapmalısınız.");
    kaydetIstegiGonder(seciliIlan.id);
    ilaniGetirVeAc(seciliIlan.id); // Modalı anında yenile ki ikon dolsun
}

async function yorumBegeniYap(yorumId) {
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Beğenmek için giriş yapmalısınız.");
    try {
        const cevap = await fetch('http://localhost:8000/yorum-begeni-yap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ yorum_id: yorumId, kullanici_adi: aktifKullanici })
        });
        if(cevap.ok) {
            ilaniGetirVeAc(seciliIlan.id); 
        }
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
            ilaniGetirVeAc(seciliIlan.id); 
            ilanlariVeritabanindanGetir(); 
        }
    } catch (hata) {
        alert("Sistem-Hatası: Yorum gönderilemedi.");
    }
}

detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };
detayYorumGonderBtn.onclick = yorumGonder;

ilanFormu.onsubmit = async (e) => {
    e.preventDefault();
    if(!aktifKullanici) return alert("Sistem-Hatası: İlan paylaşabilmek için önce giriş yapmalısınız.");

    try {
        const cevap = await fetch('http://localhost:8000/ilan-paylas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kullanici_adi: aktifKullanici,
                baslik: document.getElementById('ilan-baslik').value,
                kategori: document.getElementById('ilan-kategori').value,
                fiyat: parseFloat(document.getElementById('ilan-fiyat').value),
                aciklama: document.getElementById('ilan-aciklama').value
            })
        });

        if (cevap.ok) {
            alert("Sistem-Mesaji: İlan başarıyla paylaşıldı!");
            ilanFormu.reset();
            ilanModal.style.display = "none";
            document.body.style.overflow = "auto";
            ilanlariVeritabanindanGetir();
        }
    } catch (hata) {}
};