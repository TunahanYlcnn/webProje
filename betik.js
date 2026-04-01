// 1. Element Seçimleri
const yanMenu = document.getElementById('yan-menu');
const menuTetikleyici = document.getElementById('menu-tetikleyici');
const ilanModal = document.getElementById('ilan-modal');
const ilanBtn = document.querySelector('.menu-oge:nth-child(2)');
const kapatBtn = document.querySelector('.kapat-btn');
const ilanFormu = document.getElementById('ilan-formu');
const ilanlarKutusu = document.getElementById('ilanlar-kutusu');
const detayModal = document.getElementById('ilan-detay-modal');
const detayKapatBtn = document.querySelector('.detay-kapat-btn');
const detayYorumInput = document.getElementById('detay-yorum-input');
const detayYorumGonderBtn = document.getElementById('detay-yorum-gonder-btn');

// 2. Veriler
let ilanlar = [
    { id: 1, baslik: "Mühendislik Hesap Makinesi", kategori: "Eşya", fiyat: 500, aciklama: "Casio fx-991ES Plus, tertemiz.", begeni: 12, yorumlar: ["Hala satılık mı?"], begenildi: false },
    { id: 2, baslik: "Algoritma Notları", kategori: "Ders Notu", fiyat: 50, aciklama: "Vize ve final için tam kapsamlı.", begeni: 45, yorumlar: ["Harika!"], begenildi: false }
];

let seciliIlan = null;

// 3. Temel Navigasyon
menuTetikleyici.onclick = () => yanMenu.classList.toggle('acik');
ilanBtn.onclick = () => { ilanModal.style.display = "block"; document.body.style.overflow = "hidden"; };
kapatBtn.onclick = () => { ilanModal.style.display = "none"; document.body.style.overflow = "auto"; };
detayKapatBtn.onclick = () => { detayModal.style.display = "none"; document.body.style.overflow = "auto"; };

window.onclick = (e) => { 
    if (e.target.classList.contains('modal')) { 
        ilanModal.style.display = "none"; 
        detayModal.style.display = "none"; 
        document.body.style.overflow = "auto"; 
    }
};

// 4. İlanları Listele (DÜZELTİLDİ)
function ilanlariGoster() {
    ilanlarKutusu.innerHTML = "";
    ilanlar.forEach(ilan => {
        const kart = document.createElement('div');
        kart.className = 'kart';
        
        // KARTIN KENDİSİNE TIKLANINCA MODAL AÇILIR
        kart.addEventListener('click', (e) => {
            // Eğer tıklanan şey bir buton veya ikon değilse modalı aç
            if (!e.target.closest('.kart-alt-bilgi')) {
                detaylariAc(ilan);
            }
        });
        
        kart.innerHTML = `
            <span class="kategori-etiket">${ilan.kategori}</span>
            <h3>${ilan.baslik}</h3>
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

    // Beğeni butonlarına olay dinleyici ekle
    document.querySelectorAll('.begeni-tetikleyici').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); // Kartın tıklanma olayını engeller
            const id = parseInt(btn.getAttribute('data-id'));
            const ilan = ilanlar.find(i => i.id === id);
            begeniIslemi(ilan, btn.querySelector('i'), btn.querySelector('.sayi'));
        };
    });
}

// 5. Detay Modalını Aç
function detaylariAc(ilan) {
    seciliIlan = ilan;
    document.getElementById('detay-baslik').innerText = ilan.baslik;
    document.getElementById('detay-kategori').innerText = ilan.kategori;
    document.getElementById('detay-aciklama').innerText = ilan.aciklama;
    document.getElementById('detay-fiyat').innerText = ilan.fiyat + " ₺";
    document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
    document.getElementById('detay-yorum-sayisi').innerText = ilan.yorumlar.length;

    const modalKalp = document.getElementById('modal-kalp');
    modalKalp.className = ilan.begenildi ? 'fas fa-heart begenildi' : 'far fa-heart';

    const liste = document.getElementById('detay-yorumlar-listesi');
    liste.innerHTML = "";
    ilan.yorumlar.forEach(y => {
        liste.innerHTML += `<div class="yorum"><strong>Öğrenci</strong><span>${y}</span></div>`;
    });

    detayModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

// 6. Beğeni İşlemi (TEK MERKEZDEN YÖNETİM)
function begeniIslemi(ilan, kalpIkonu, sayiElementi) {
    if (!ilan) return;

    if (ilan.begenildi) {
        ilan.begeni--;
        ilan.begenildi = false;
        kalpIkonu.className = 'far fa-heart';
    } else {
        ilan.begeni++;
        ilan.begenildi = true;
        kalpIkonu.className = 'fas fa-heart begenildi';
    }

    if (sayiElementi) sayiElementi.innerText = ilan.begeni;
    
    // Eğer detay modalı açıksa oradaki değerleri de güncelle
    if (detayModal.style.display === "flex") {
        document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
        document.getElementById('modal-kalp').className = ilan.begenildi ? 'fas fa-heart begenildi' : 'far fa-heart';
    }
}

// Modal içindeki beğeni butonu için global fonksiyon
function begeniYap(e, element) {
    e.stopPropagation();
    const sayiElementi = document.getElementById('detay-begeni-sayisi');
    begeniIslemi(seciliIlan, element, sayiElementi);
    ilanlariGoster(); // Ana sayfadaki kartları güncelle
}

// 7. Yorum ve İlan Formu (Aynı Kaldı)
function yorumGonder() {
    const metin = detayYorumInput.value.trim();
    if (metin !== "" && seciliIlan) {
        seciliIlan.yorumlar.push(metin);
        detayYorumInput.value = "";
        detaylariAc(seciliIlan);
        ilanlariGoster();
    }
}

detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };
detayYorumGonderBtn.onclick = yorumGonder;

ilanFormu.onsubmit = (e) => {
    e.preventDefault();
    const yeni = {
        id: Date.now(),
        baslik: document.getElementById('ilan-baslik').value,
        kategori: document.getElementById('ilan-kategori').value,
        fiyat: document.getElementById('ilan-fiyat').value,
        aciklama: document.getElementById('ilan-aciklama').value,
        begeni: 0, yorumlar: [], begenildi: false
    };
    ilanlar.unshift(yeni);
    ilanlariGoster();
    ilanFormu.reset();
    ilanModal.style.display = "none";
    document.body.style.overflow = "auto";
};

ilanlariGoster();