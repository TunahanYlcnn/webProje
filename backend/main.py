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
            print(f"Veritabanı henüz hazır değil, bekleniyor... (Kalan deneme: {retries})")
            time.sleep(2) # 2 saniye bekle ve tekrar dene
    
    # 5 deneme sonunda hala bağlanamazsa hata fırlat
    raise Exception("Veritabanına bağlanılamadı!")
# Veritabanı Tablosunu Oluştur (Uygulama başlarken bir kez çalışır)
conn = get_db_connection()
cur = conn.cursor()
cur.execute('''
    CREATE TABLE IF NOT EXISTS kullanicilar (
        id SERIAL PRIMARY KEY,
        eposta TEXT UNIQUE NOT NULL,
        kullanici_adi TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL
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