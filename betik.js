// 1. Elementleri Seçelim
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

// 2. Başlangıç Verileri
let ilanlar = [
    { id: 1, baslik: "Mühendislik Hesap Makinesi", kategori: "Eşya", fiyat: 500, aciklama: "Casio fx-991ES Plus, tertemiz.", begeni: 12, yorumlar: ["Hala satılık mı?", "Fiyatta pazarlık olur mu?"] },
    { id: 2, baslik: "Algoritma Notları", kategori: "Ders Notu", fiyat: 50, aciklama: "Vize ve final için tam kapsamlı.", begeni: 45, yorumlar: ["Harika notlar!"] }
];

let seciliIlan = null;

// 3. Menü Yönetimi
menuTetikleyici.onclick = () => yanMenu.classList.toggle('acik');

// 4. Modal Yönetimi
ilanBtn.onclick = () => { ilanModal.style.display = "block"; document.body.style.overflow = "hidden"; };
kapatBtn.onclick = () => { ilanModal.style.display = "none"; document.body.style.overflow = "auto"; };
detayKapatBtn.onclick = () => { detayModal.style.display = "none"; document.body.style.overflow = "auto"; };

window.onclick = (e) => { if (e.target.classList.contains('modal')) { 
    ilanModal.style.display = "none"; 
    detayModal.style.display = "none"; 
    document.body.style.overflow = "auto"; 
}};

// 5. İlanları Göster
function ilanlariGoster() {
    ilanlarKutusu.innerHTML = "";
    ilanlar.forEach(ilan => {
        const kart = document.createElement('div');
        kart.className = 'kart';
        kart.onclick = () => detaylariAc(ilan);
        kart.innerHTML = `
            <span class="kategori-etiket">${ilan.kategori}</span>
            <h3>${ilan.baslik}</h3>
            <div class="fiyat">${ilan.fiyat} ₺</div>
            <div class="kart-alt-bilgi">
                <span><i class="fas fa-heart"></i> ${ilan.begeni}</span>
                <span><i class="fas fa-comment"></i> ${ilan.yorumlar.length}</span>
            </div>
        `;
        ilanlarKutusu.appendChild(kart);
    });
}

// 6. Detay Modalını Aç (Instagram Stili)
function detaylariAc(ilan) {
    seciliIlan = ilan;
    document.getElementById('detay-baslik').innerText = ilan.baslik;
    document.getElementById('detay-kategori').innerText = ilan.kategori;
    document.getElementById('detay-aciklama').innerText = ilan.aciklama;
    document.getElementById('detay-fiyat').innerText = ilan.fiyat + " ₺";
    document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
    document.getElementById('detay-yorum-sayisi').innerText = ilan.yorumlar.length;

    const liste = document.getElementById('detay-yorumlar-listesi');
    liste.innerHTML = "";
    ilan.yorumlar.forEach(y => {
        const yDiv = document.createElement('div');
        yDiv.className = 'yorum';
        yDiv.innerHTML = `<strong>Öğrenci</strong> ${y}`;
        liste.appendChild(yDiv);
    });

    detayModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

// 7. Yorum Gönderme
function yorumGonder() {
    const metin = detayYorumInput.value.trim();
    if (metin !== "" && seciliIlan) {
        seciliIlan.yorumlar.push(metin);
        detayYorumInput.value = "";
        detaylariAc(seciliIlan); // Görünümü tazele
        ilanlariGoster(); // Ana sayfadaki sayacı tazele
    }
}

detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };
detayYorumGonderBtn.onclick = yorumGonder;

// 8. Yeni İlan Paylaş
ilanFormu.onsubmit = (e) => {
    e.preventDefault();
    const yeni = {
        id: Date.now(),
        baslik: document.getElementById('ilan-baslik').value,
        kategori: document.getElementById('ilan-kategori').value,
        fiyat: document.getElementById('ilan-fiyat').value,
        aciklama: document.getElementById('ilan-aciklama').value,
        begeni: 0,
        yorumlar: []
    };
    ilanlar.unshift(yeni);
    ilanlariGoster();
    ilanFormu.reset();
    ilanModal.style.display = "none";
    document.body.style.overflow = "auto";
};

ilanlariGoster();