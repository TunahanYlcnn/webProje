from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import os
import time 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı Bağlantısı
def get_db_connection():
    retries = 5  # 5 kere deneyeceğiz
    while retries > 0:
        try:
            conn = psycopg2.connect(
                host="db",
                database="unishare",
                user="user",
                password="password"
            )
            return conn
        except psycopg2.OperationalError:
            retries -= 1
            print(f"Sistem-Bilgi: Veritabanı henüz hazır değil, bekleniyor... (Kalan deneme: {retries})")
            time.sleep(2) # 2 saniye bekle ve tekrar dene
    
    # 5 deneme sonunda hala bağlanamazsa hata fırlat
    raise Exception("Sistem-Hatası: Veritabanına bağlanılamadı!")

# Veritabanı Tablolarını Oluştur (Uygulama başlarken bir kez çalışır)
conn = get_db_connection()
cur = conn.cursor()
cur.execute('''
    CREATE TABLE IF NOT EXISTS kullanicilar (
        id SERIAL PRIMARY KEY,
        eposta TEXT UNIQUE NOT NULL,
        kullanici_adi TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS ilanlar (
        id SERIAL PRIMARY KEY,
        kullanici_adi TEXT REFERENCES kullanicilar(kullanici_adi) ON DELETE CASCADE,
        baslik TEXT NOT NULL,
        kategori TEXT NOT NULL,
        fiyat NUMERIC NOT NULL,
        aciklama TEXT NOT NULL,
        durum TEXT DEFAULT 'yayinda'
    );

    CREATE TABLE IF NOT EXISTS begeniler (
        id SERIAL PRIMARY KEY,
        ilan_id INTEGER REFERENCES ilanlar(id) ON DELETE CASCADE,
        kullanici_adi TEXT REFERENCES kullanicilar(kullanici_adi) ON DELETE CASCADE,
        UNIQUE(ilan_id, kullanici_adi)
    );

    CREATE TABLE IF NOT EXISTS yorumlar (
        id SERIAL PRIMARY KEY,
        ilan_id INTEGER REFERENCES ilanlar(id) ON DELETE CASCADE,
        kullanici_adi TEXT REFERENCES kullanicilar(kullanici_adi) ON DELETE CASCADE,
        metin TEXT NOT NULL
    );
''')
conn.commit()
cur.close()
conn.close()

# Veri Modelleri
class KullaniciKayit(BaseModel):
    eposta: str
    kullanici_adi: str
    sifre: str

class KullaniciGiris(BaseModel):
    kullanici_adi: str
    sifre: str

class KullaniciGuncelle(BaseModel):
    eski_kullanici_adi: str
    yeni_kullanici_adi: str

class SifreGuncelle(BaseModel):
    kullanici_adi: str
    eski_sifre: str
    yeni_sifre: str

class IlanKayit(BaseModel):
    kullanici_adi: str
    baslik: str
    kategori: str
    fiyat: float
    aciklama: str

class BegeniIslem(BaseModel):
    ilan_id: int
    kullanici_adi: str

class YorumKayit(BaseModel):
    ilan_id: int
    kullanici_adi: str
    metin: str

# ==========================================
# GİRİŞ VE KAYIT İŞLEMLERİ
# ==========================================
@app.post("/kayit")
async def kayit_ol(kullanici: KullaniciKayit):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO kullanicilar (eposta, kullanici_adi, sifre) VALUES (%s, %s, %s)",
            (kullanici.eposta, kullanici.kullanici_adi, kullanici.sifre)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"mesaj": "Kayıt başarıyla tamamlandı!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı veya e-posta zaten kayıtlı!")

@app.post("/giris")
async def giris_yap(kullanici: KullaniciGiris):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM kullanicilar WHERE kullanici_adi = %s AND sifre = %s",
        (kullanici.kullanici_adi, kullanici.sifre)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user:
        return {"mesaj": "Giriş başarılı", "durum": "tamam"}
    else:
        raise HTTPException(status_code=401, detail="Hatalı kullanıcı adı veya şifre!")

# ==========================================
# ANA SAYFA VE GENEL İLAN İŞLEMLERİ
# ==========================================
@app.post("/ilan-paylas")
async def ilan_paylas(ilan: IlanKayit):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO ilanlar (kullanici_adi, baslik, kategori, fiyat, aciklama) VALUES (%s, %s, %s, %s, %s)",
        (ilan.kullanici_adi, ilan.baslik, ilan.kategori, ilan.fiyat, ilan.aciklama)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Sistem-Bilgi: İlan başarıyla veritabanına kaydedildi!"}

@app.get("/ilanlar")
async def tum_ilanlari_getir(kullanici_adi: str = ""):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id, kullanici_adi, baslik, kategori, fiyat, aciklama 
        FROM ilanlar 
        WHERE durum = 'yayinda' 
        ORDER BY id DESC
    ''')
    ilanlar_db = cur.fetchall()
    
    sonuc = []
    for i in ilanlar_db:
        ilan_id = i[0]
        
        cur.execute("SELECT COUNT(*) FROM begeniler WHERE ilan_id = %s", (ilan_id,))
        begeni_sayisi = cur.fetchone()[0]
        
        begenildi = False
        if kullanici_adi:
            cur.execute("SELECT 1 FROM begeniler WHERE ilan_id = %s AND kullanici_adi = %s", (ilan_id, kullanici_adi))
            if cur.fetchone():
                begenildi = True
                
        cur.execute("SELECT id, kullanici_adi, metin FROM yorumlar WHERE ilan_id = %s ORDER BY id ASC", (ilan_id,))
        yorumlar_db = cur.fetchall()
        yorumlar_liste = [{"id": y[0], "yazar": y[1], "metin": y[2], "begeniSayisi": 0, "begenildi": False, "yanitlar": []} for y in yorumlar_db]
        
        sonuc.append({
            "id": ilan_id,
            "yazar": i[1],
            "baslik": i[2],
            "kategori": i[3],
            "fiyat": i[4],
            "aciklama": i[5],
            "begeni": begeni_sayisi,
            "begenildi": begenildi,
            "aktif": True,
            "yorumlar": yorumlar_liste
        })
        
    cur.close()
    conn.close()
    return sonuc

# YENİ EKLENDİ: Tek Bir İlanın Tüm Detaylarını Getirme Modeli (Profil Modalı İçin)
@app.get("/ilan-detay/{ilan_id}")
async def ilan_detay_getir(ilan_id: int, kullanici_adi: str = ""):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('SELECT id, kullanici_adi, baslik, kategori, fiyat, aciklama, durum FROM ilanlar WHERE id = %s', (ilan_id,))
    i = cur.fetchone()
    
    if not i:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Sistem-Hatası: İlan bulunamadı.")
        
    cur.execute("SELECT COUNT(*) FROM begeniler WHERE ilan_id = %s", (ilan_id,))
    begeni_sayisi = cur.fetchone()[0]
    
    begenildi = False
    if kullanici_adi:
        cur.execute("SELECT 1 FROM begeniler WHERE ilan_id = %s AND kullanici_adi = %s", (ilan_id, kullanici_adi))
        if cur.fetchone():
            begenildi = True
            
    cur.execute("SELECT id, kullanici_adi, metin FROM yorumlar WHERE ilan_id = %s ORDER BY id ASC", (ilan_id,))
    yorumlar_db = cur.fetchall()
    yorumlar_liste = [{"id": y[0], "yazar": y[1], "metin": y[2], "begeniSayisi": 0, "begenildi": False, "yanitlar": []} for y in yorumlar_db]
    
    sonuc = {
        "id": i[0],
        "yazar": i[1],
        "baslik": i[2],
        "kategori": i[3],
        "fiyat": i[4],
        "aciklama": i[5],
        "aktif": i[6] == 'yayinda',
        "begeni": begeni_sayisi,
        "begenildi": begenildi,
        "yorumlar": yorumlar_liste
    }
    cur.close()
    conn.close()
    return sonuc

@app.post("/begeni-yap")
async def begeni_islem(veri: BegeniIslem):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT 1 FROM begeniler WHERE ilan_id = %s AND kullanici_adi = %s", (veri.ilan_id, veri.kullanici_adi))
    var_mi = cur.fetchone()
    
    if var_mi:
        cur.execute("DELETE FROM begeniler WHERE ilan_id = %s AND kullanici_adi = %s", (veri.ilan_id, veri.kullanici_adi))
        durum = "kaldirildi"
    else:
        cur.execute("INSERT INTO begeniler (ilan_id, kullanici_adi) VALUES (%s, %s)", (veri.ilan_id, veri.kullanici_adi))
        durum = "eklendi"
        
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Sistem-Bilgi: Beğeni işlemi başarılı", "durum": durum}

@app.post("/yorum-yap")
async def yorum_yap(veri: YorumKayit):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO yorumlar (ilan_id, kullanici_adi, metin) VALUES (%s, %s, %s)", (veri.ilan_id, veri.kullanici_adi, veri.metin))
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Sistem-Bilgi: Yorum başarıyla kaydedildi"}

# ==========================================
# PROFİL: İLANLARIM İŞLEMLERİ
# ==========================================
@app.get("/profil/ilanlar/{kullanici_adi}")
async def profil_ilanlar(kullanici_adi: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, baslik, aciklama, durum FROM ilanlar WHERE kullanici_adi = %s ORDER BY id DESC", (kullanici_adi,))
    ilanlar = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": i[0], "baslik": i[1], "aciklama": i[2], "durum": i[3]} for i in ilanlar]

@app.delete("/ilan-sil/{ilan_id}")
async def ilan_sil(ilan_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM ilanlar WHERE id = %s", (ilan_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Sistem-Mesaji: İlan ve bağlı veriler silindi."}

@app.put("/ilan-durum/{ilan_id}")
async def ilan_durum(ilan_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT durum FROM ilanlar WHERE id = %s", (ilan_id,))
    mevcut_durum = cur.fetchone()[0]
    yeni_durum = 'kaldirildi' if mevcut_durum == 'yayinda' else 'yayinda'
    
    cur.execute("UPDATE ilanlar SET durum = %s WHERE id = %s", (yeni_durum, ilan_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"yeni_durum": yeni_durum}

# ==========================================
# PROFİL: BEĞENDİKLERİM İŞLEMLERİ
# ==========================================
@app.get("/profil/begendiklerim/{kullanici_adi}")
async def profil_begendiklerim(kullanici_adi: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT i.id, i.baslik, i.aciklama 
        FROM ilanlar i 
        JOIN begeniler b ON i.id = b.ilan_id 
        WHERE b.kullanici_adi = %s
    ''', (kullanici_adi,))
    ilanlar = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": i[0], "baslik": i[1], "aciklama": i[2]} for i in ilanlar]

@app.delete("/begeni-kaldir/{ilan_id}/{kullanici_adi}")
async def begeni_kaldir(ilan_id: int, kullanici_adi: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM begeniler WHERE ilan_id = %s AND kullanici_adi = %s", (ilan_id, kullanici_adi))
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Sistem-Mesaji: Beğeni kaldırıldı."}

# ==========================================
# PROFİL: YORUMLARIM İŞLEMLERİ
# ==========================================
@app.get("/profil/yorumlar/{kullanici_adi}")
async def profil_yorumlar(kullanici_adi: str):
    conn = get_db_connection()
    cur = conn.cursor()
    # YENİ EKLENDİ: Artık i.id (ilan_id) bilgisini de döndürüyor ki modalı açabilelim
    cur.execute('''
        SELECT y.id, i.baslik, y.metin, i.id 
        FROM yorumlar y 
        JOIN ilanlar i ON y.ilan_id = i.id 
        WHERE y.kullanici_adi = %s ORDER BY y.id DESC
    ''', (kullanici_adi,))
    yorumlar = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": y[0], "ilan_baslik": y[1], "metin": y[2], "ilan_id": y[3]} for y in yorumlar]

# ==========================================
# HESAP AYARLARI İŞLEMLERİ
# ==========================================
@app.put("/hesap-isim-guncelle")
async def isim_guncelle(veri: KullaniciGuncelle):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE kullanicilar SET kullanici_adi = %s WHERE kullanici_adi = %s", (veri.yeni_kullanici_adi, veri.eski_kullanici_adi))
        conn.commit()
        cur.close()
        conn.close()
        return {"mesaj": "İsim güncellendi"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı alınmış olabilir.")

@app.put("/hesap-sifre-guncelle")
async def sifre_degistir(veri: SifreGuncelle):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT sifre FROM kullanicilar WHERE kullanici_adi = %s", (veri.kullanici_adi,))
    gercek_sifre = cur.fetchone()
    
    if not gercek_sifre or gercek_sifre[0] != veri.eski_sifre:
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Mevcut şifreniz yanlış!")
        
    cur.execute("UPDATE kullanicilar SET sifre = %s WHERE kullanici_adi = %s", (veri.yeni_sifre, veri.kullanici_adi))
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Sistem-Mesaji: Şifreniz güncellendi"}

@app.delete("/hesap-sil/{kullanici_adi}")
async def hesap_kapat(kullanici_adi: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM kullanicilar WHERE kullanici_adi = %s", (kullanici_adi,))
    conn.commit()
    cur.close()
    conn.close()
    return {"mesaj": "Hesap silindi."}