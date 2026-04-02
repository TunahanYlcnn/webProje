from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Frontend'in Backend ile konuşabilmesi için izin veriyoruz
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Tüm adreslere izin ver (Geliştirme aşamasında kolaylık sağlar)
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def merhaba():
    return {"durum": "Başarılı", "mesaj": "UniShare Backend Docker Üzerinde Çalışıyor!"}

@app.get("/giris-kontrol")
def giris_yap():
    # Şimdilik sadece bağlantı testi yapıyoruz
    return {"mesaj": "Backend'den selamlar! Giriş isteği ulaştı."}