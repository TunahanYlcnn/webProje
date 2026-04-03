// 1. Element Seçimleri
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

// 2. Veriler (Artık Boş, Veritabanından Dolacak)
let ilanlar = [];
let seciliIlan = null;
let yanitlanacakYorumIndex = null; 
let suAnkiKategori = "Hepsi";

// Kullanıcının kim olduğunu öğrenelim
const aktifKullanici = localStorage.getItem('unishare_kullanici');

// ==========================================
// YENİ EKLENEN: VERİTABANINDAN İLANLARI ÇEK
// ==========================================
async function ilanlariVeritabanindanGetir() {
    try {
        // Backend'e aktifKullanici'yi de gönderiyoruz ki bizim beğendiğimiz ilanları bilsin
        const url = aktifKullanici ? `http://localhost:8000/ilanlar?kullanici_adi=${aktifKullanici}` : `http://localhost:8000/ilanlar`;
        const cevap = await fetch(url);
        
        if (cevap.ok) {
            ilanlar = await cevap.json();
            ilanlariGoster();
            
            // Eğer detay modalı şu an açıksa, içindeki yorum/beğeni verilerini anında yenile
            if (detayModal.style.display === "flex" && seciliIlan) {
                const guncelIlan = ilanlar.find(i => i.id === seciliIlan.id);
                if (guncelIlan) detaylariAc(guncelIlan);
            }
        }
    } catch (hata) {
        console.error("Sistem-Hatası: İlanlar çekilemedi", hata);
    }
}

// Sayfa yüklendiğinde ilanları getir
document.addEventListener('DOMContentLoaded', () => {
    ilanlariVeritabanindanGetir();
});

// 3. Temel Navigasyon
menuTetikleyici.onclick = () => yanMenu.classList.toggle('acik');

if(ilanBtn) {
    ilanBtn.onclick = () => { 
        if(!aktifKullanici) {
            alert("Sistem-Uyarisi: İlan paylaşmak için giriş yapmalısınız!");
            return;
        }
        ilanModal.style.display = "block"; 
        document.body.style.overflow = "hidden"; 
        document.body.classList.add('modal-acik');
    };
}

kapatBtn.onclick = () => { ilanModal.style.display = "none"; document.body.style.overflow = "auto"; document.body.classList.remove('modal-acik'); };
detayKapatBtn.onclick = () => { detayModal.style.display = "none"; document.body.style.overflow = "auto"; };

window.onclick = (e) => { 
    if (e.target.classList.contains('modal')) { 
        ilanModal.style.display = "none"; 
        detayModal.style.display = "none"; 
        document.body.style.overflow = "auto";
        document.body.classList.remove('modal-acik'); 
    }
};

// 4. İlanları Listele
function ilanlariGoster() {
    ilanlarKutusu.innerHTML = "";
    
    if (ilanlar.length === 0) {
        ilanlarKutusu.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Şu an yayında hiç ilan yok.</p>";
        return;
    }

    const gosterilecekIlanlar = suAnkiKategori === "Hepsi" 
        ? ilanlar 
        : ilanlar.filter(ilan => ilan.kategori === suAnkiKategori);

    gosterilecekIlanlar.forEach(ilan => {
        const kart = document.createElement('div');
        kart.className = 'kart';
        
        kart.addEventListener('click', (e) => {
            if (!e.target.closest('.kart-alt-bilgi')) {
                detaylariAc(ilan);
            }
        });

        const durumSinifi = ilan.aktif ? 'durum-yayinda' : 'durum-kapali';
        const durumMetni = ilan.aktif ? 'Yayında' : 'Yayında Değil';
        
        kart.innerHTML = `
            <div class="durum-etiket ${durumSinifi}">${durumMetni}</div>
            <span class="kategori-etiket">${ilan.kategori}</span>
            <h3>${ilan.baslik}</h3>
            <p style="font-size:0.8rem; color:#7f8c8d; margin-bottom:10px;">Paylaşan: ${ilan.yazar}</p>
            <div class="fiyat">${ilan.fiyat} ₺</div>
            <div class="kart-alt-bilgi">
                <span class="begeni-tetikleyici" data-id="${ilan.id}">
                    <i class="${ilan.begenildi ? 'fas begenildi' : 'far'} fa-heart"></i> 
                    <span class="sayi">${ilan.begeni}</span>
                </span>
                <span><i class="fas fa-comment"></i> ${ilan.yorumlar.length}</span>
            </div>
        `;
        ilanlarKutusu.appendChild(kart);
    });

    // Küçük kartlardaki kalp butonlarına tıklama
    document.querySelectorAll('.begeni-tetikleyici').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            if(!aktifKullanici) return alert("Sistem-Uyarisi: Beğenmek için giriş yapmalısınız!");
            const id = parseInt(btn.getAttribute('data-id'));
            begeniIstegiGonder(id);
        };
    });
}

// 5. Filtre Butonları
filtreButonlari.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filtre-btn.aktif').classList.remove('aktif');
        btn.classList.add('aktif');
        suAnkiKategori = btn.getAttribute('data-kategori');
        ilanlariGoster();
    });
});

// 6. Detay Modalını Aç
function detaylariAc(ilan) {
    seciliIlan = ilan;
    document.getElementById('detay-baslik').innerText = ilan.baslik;
    document.getElementById('detay-kategori').innerText = ilan.kategori;
    document.getElementById('detay-aciklama').innerText = ilan.aciklama;
    document.getElementById('detay-fiyat').innerText = ilan.fiyat + " ₺";
    document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
    document.getElementById('detay-yorum-sayisi').innerText = ilan.yorumlar.length;

    if(ilan.yazar === aktifKullanici) {
        durumDegistirBtn.style.display = "block";
    } else {
        durumDegistirBtn.style.display = "none";
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
    
    ilan.yorumlar.forEach((y, index) => {
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
                    </div>`;
            });
            yanitlarHtml += `</div>`;
        }

        yDiv.innerHTML = `
            <div class="yorum">
                <strong>${y.yazar}</strong>
                <span>${y.metin}</span>
                <div class="yorum-alt-bilgi">
                    <span class="yorum-begeni ${y.begenildi ? 'aktif' : ''}" onclick="yorumBegeniYap(${index})">
                        ${y.begenildi ? 'Beğenildi' : 'Beğen'}
                    </span>
                    <span onclick="yanitla(${index}, '${y.yazar}')">Yanıtla</span>
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

// 7. Durum Değiştirme
durumDegistirBtn.onclick = async () => {
    if (seciliIlan && seciliIlan.yazar === aktifKullanici) {
        try {
            const cevap = await fetch('http://localhost:8000/ilan-durum/' + seciliIlan.id, { method: 'PUT' });
            if(cevap.ok) {
                alert("Sistem-Mesaji: İlan durumu güncellendi.");
                ilanlariVeritabanindanGetir(); // Veriyi baştan çek ve kapat
                detayModal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        } catch (hata) {
            alert("Bağlantı hatası.");
        }
    }
};

// 8. Beğeni İşlemleri (Gerçek Veritabanı Bağlantısı)
async function begeniIstegiGonder(ilanId) {
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Beğenmek için giriş yapmalısınız.");
    
    try {
        const cevap = await fetch('http://localhost:8000/begeni-yap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ilan_id: ilanId, kullanici_adi: aktifKullanici })
        });

        if (cevap.ok) {
            // Arka planda veritabanı güncellendiği an, taze veriyi baştan çektiriyoruz
            await ilanlariVeritabanindanGetir();
        }
    } catch (hata) {
        alert("Bağlantı hatası!");
    }
}

// Modaldaki kalbe basınca çalışacak
function begeniYap(e, element) {
    e.stopPropagation();
    begeniIstegiGonder(seciliIlan.id);
}

// Yorum beğenileri şimdilik UI seviyesinde bırakıldı (Geliştirilebilir)
function yorumBegeniYap(index) {
    const yorum = seciliIlan.yorumlar[index];
    yorum.begenildi = !yorum.begenildi;
    yorum.begeniSayisi += yorum.begenildi ? 1 : -1;
    detaylariAc(seciliIlan);
}

// 9. Yanıtla ve Yorum Gönder (Gerçek Veritabanı Bağlantısı)
function yanitla(index, kullaniciAdi) {
    yanitlanacakYorumIndex = index; 
    detayYorumInput.value = `@${kullaniciAdi} `;
    detayYorumInput.focus();
}

async function yorumGonder() {
    if(!aktifKullanici) return alert("Sistem-Uyarisi: Yorum yapmak için giriş yapmalısınız.");
    
    const metin = detayYorumInput.value.trim();
    if (metin === "" || !seciliIlan) return;

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
            yanitlanacakYorumIndex = null;
            // Veritabanından en güncel yorumları çek
            await ilanlariVeritabanindanGetir(); 
        }
    } catch (hata) {
        alert("Sistem-Hatası: Yorum gönderilemedi.");
    }
}

detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };
detayYorumGonderBtn.onclick = yorumGonder;

// ==========================================
// 10. İLAN PAYLAŞ (VERİTABANINA GÖNDER)
// ==========================================
ilanFormu.onsubmit = async (e) => {
    e.preventDefault();
    
    if(!aktifKullanici) {
        alert("Sistem-Hatası: İlan paylaşabilmek için önce giriş yapmalısınız.");
        return;
    }

    const baslik = document.getElementById('ilan-baslik').value;
    const kategori = document.getElementById('ilan-kategori').value;
    const fiyat = parseFloat(document.getElementById('ilan-fiyat').value);
    const aciklama = document.getElementById('ilan-aciklama').value;

    try {
        const cevap = await fetch('http://localhost:8000/ilan-paylas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kullanici_adi: aktifKullanici,
                baslik: baslik,
                kategori: kategori,
                fiyat: fiyat,
                aciklama: aciklama
            })
        });

        if (cevap.ok) {
            alert("Sistem-Mesaji: İlan başarıyla paylaşıldı!");
            ilanFormu.reset();
            ilanModal.style.display = "none";
            document.body.style.overflow = "auto";
            
            // Veritabanından güncel listeyi tekrar çek
            ilanlariVeritabanindanGetir();
        } else {
            alert("Sistem-Hatası: İlan paylaşılamadı.");
        }
    } catch (hata) {
        console.error("Sistem-Hatası:", hata);
        alert("Bağlantı hatası yaşandı.");
    }
};