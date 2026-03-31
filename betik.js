// Menü Açma/Kapama İşlemi
const menuTetikleyici = document.getElementById('menu-tetikleyici');
const yanMenu = document.getElementById('yan-menu');

menuTetikleyici.addEventListener('click', () => {
    // "acik" sınıfı varsa siler, yoksa ekler
    yanMenu.classList.toggle('acik');
});

// Örnek İlanları Tekrar Ekleyelim (Görseli test etmek için)
const ilanlar = [
    { baslik: "Mühendislik Hesap Makinesi", kategori: "Eşya", fiyat: 500, aciklama: "Casio fx-991ES Plus, çok temiz." },
    { baslik: "Algoritma Ders Notları", kategori: "Ders Notu", fiyat: 50, aciklama: "Vize ve final garantili notlar." },
    { baslik: "Yurt Oda Arkadaşı", kategori: "İlan", fiyat: 0, aciklama: "3. yurt 2. blok için arkadaş aranıyor." }
];

// Elementleri Seçelim
const ilanModal = document.getElementById('ilan-modal');
const ilanBtn = document.querySelector('.menu-oge:nth-child(2)'); // "İlan" butonu
const kapatBtn = document.querySelector('.kapat-btn');
const ilanFormu = document.getElementById('ilan-formu');

// Modal'ı Aç / Kapat
ilanBtn.onclick = () => {
    ilanModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Arka plan kaymasın
};

// Kapatma kısmı
kapatBtn.onclick = () => {
    ilanModal.style.display = "none";
    document.body.style.overflow = "auto"; // Arka plan tekrar kayabilsin
};
// Form Gönderildiğinde
ilanFormu.onsubmit = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    // Formdaki verileri al
    const yeniIlan = {
        baslik: document.getElementById('ilan-baslik').value,
        kategori: document.getElementById('ilan-kategori').value,
        fiyat: document.getElementById('ilan-fiyat').value,
        aciklama: document.getElementById('ilan-aciklama').value
    };

    // Mevcut listeye ekle (Frontend tarafında geçici tutulur)
    ilanlar.unshift(yeniIlan); // Yeni ilanı başa ekle
    ilanlariGoster(); // Listeyi güncelle

    // Formu temizle ve kapat
    ilanFormu.reset();
    ilanModal.style.display = "none";
};

function ilanlariGoster() {
    const kutu = document.getElementById('ilanlar-kutusu');
    kutu.innerHTML = ""; // Önce temizle
    ilanlar.forEach(ilan => {
        kutu.innerHTML += `
            <div class="kart">
                <small>${ilan.kategori}</small>
                <h3>${ilan.baslik}</h3>
                <p>${ilan.aciklama}</p>
                <strong style="display:block; margin-top:10px;">${ilan.fiyat} ₺</strong>
            </div>
        `;
    });
}

ilanlariGoster();