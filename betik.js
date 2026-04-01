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
const filtreButonlari = document.querySelectorAll('.filtre-btn');
const durumDegistirBtn = document.getElementById('durum-degistir-btn');

// 2. Veriler
let ilanlar = [
    { 
        id: 1, 
        baslik: "Mühendislik Hesap Makinesi", 
        kategori: "Eşya", 
        fiyat: 500, 
        aciklama: "Casio fx-991ES Plus, tertemiz.", 
        begeni: 12, 
        begenildi: false,
        aktif: true,
        yorumlar: [
            { 
                id: 101, 
                yazar: "Öğrenci 1", 
                metin: "Hala satılık mı?", 
                begeniSayisi: 2, 
                begenildi: false,
                yanitlar: [{ yazar: "Satıcı", metin: "Evet, hala duruyor." }] 
            }
        ] 
    },
    { 
        id: 2, 
        baslik: "Algoritma Notları", 
        kategori: "Ders Notu", 
        fiyat: 50, 
        aciklama: "Vize ve final için tam kapsamlı.", 
        begeni: 45, 
        begenildi: false,
        aktif: true,
        yorumlar: [
            { id: 102, yazar: "Öğrenci 2", metin: "Harika notlar!", begeniSayisi: 5, begenildi: false, yanitlar: [] }
        ] 
    }
];

let seciliIlan = null;
let yanitlanacakYorumIndex = null; 
let suAnkiKategori = "Hepsi";

// 3. Temel Navigasyon
menuTetikleyici.onclick = () => yanMenu.classList.toggle('acik');
ilanBtn.onclick = () => { ilanModal.style.display = "block"; document.body.style.overflow = "hidden"; document.body.classList.add('modal-acik');};
kapatBtn.onclick = () => { ilanModal.style.display = "none"; document.body.style.overflow = "auto"; document.body.classList.add('modal-acik'); };
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

    document.querySelectorAll('.begeni-tetikleyici').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            const ilan = ilanlar.find(i => i.id === id);
            begeniIslemi(ilan, btn.querySelector('i'), btn.querySelector('.sayi'));
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
durumDegistirBtn.onclick = () => {
    if (seciliIlan) {
        seciliIlan.aktif = !seciliIlan.aktif;
        detaylariAc(seciliIlan); 
        ilanlariGoster(); 
    }
};

// 8. Beğeni İşlemleri
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
    if (detayModal.style.display === "flex") {
        document.getElementById('detay-begeni-sayisi').innerText = ilan.begeni;
        document.getElementById('modal-kalp').className = ilan.begenildi ? 'fas fa-heart begenildi' : 'far fa-heart';
    }
}

function begeniYap(e, element) {
    e.stopPropagation();
    const sayiElementi = document.getElementById('detay-begeni-sayisi');
    begeniIslemi(seciliIlan, element, sayiElementi);
    ilanlariGoster();
}

function yorumBegeniYap(index) {
    const yorum = seciliIlan.yorumlar[index];
    if (yorum.begenildi) {
        yorum.begeniSayisi--;
        yorum.begenildi = false;
    } else {
        yorum.begeniSayisi++;
        yorum.begenildi = true;
    }
    detaylariAc(seciliIlan);
}

// 9. Yanıtla ve Yorum Gönder
function yanitla(index, kullaniciAdi) {
    yanitlanacakYorumIndex = index; 
    detayYorumInput.value = `@${kullaniciAdi} `;
    detayYorumInput.focus();
}

function yorumGonder() {
    const metin = detayYorumInput.value.trim();
    if (metin === "" || !seciliIlan) return;

    if (yanitlanacakYorumIndex !== null && metin.includes("@")) {
        seciliIlan.yorumlar[yanitlanacakYorumIndex].yanitlar.push({
            yazar: "Sen",
            metin: metin
        });
        yanitlanacakYorumIndex = null; 
    } else {
        seciliIlan.yorumlar.push({
            id: Date.now(),
            yazar: "Sen",
            metin: metin,
            begeniSayisi: 0,
            begenildi: false,
            yanitlar: []
        });
    }

    detayYorumInput.value = "";
    detaylariAc(seciliIlan);
    ilanlariGoster();
}

detayYorumInput.onkeypress = (e) => { if (e.key === 'Enter') yorumGonder(); };
detayYorumGonderBtn.onclick = yorumGonder;

// 10. İlan Paylaş (Düzeltildi)
ilanFormu.onsubmit = (e) => {
    e.preventDefault();
    const yeni = {
        id: Date.now(),
        baslik: document.getElementById('ilan-baslik').value,
        kategori: document.getElementById('ilan-kategori').value,
        fiyat: document.getElementById('ilan-fiyat').value,
        aciklama: document.getElementById('ilan-aciklama').value,
        begeni: 0, 
        yorumlar: [], 
        begenildi: false,
        aktif: true 
    };
    ilanlar.unshift(yeni);
    ilanlariGoster();
    ilanFormu.reset();
    ilanModal.style.display = "none";
    document.body.style.overflow = "auto";
};

ilanlariGoster();