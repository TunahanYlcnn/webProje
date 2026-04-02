# Python'ın resmi hafif sürümünü kullanıyoruz
FROM python:3.10-slim

# Docker içinde çalışacağımız klasörü belirliyoruz
WORKDIR /app

# YENİ: PostgreSQL için gerekli olan sistem paketlerini yüklüyoruz
# libpq-dev ve gcc, Python'ın veritabanı sürücüsünü derlemesi için şarttır.
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Önce kütüphane listesini kopyalayıp yüklüyoruz
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sonra tüm kodlarımızı içeri kopyalıyoruz
COPY . .

# Uygulamayı 8000 portunda dış dünyaya açıyoruz
# --reload parametresi, sen kodda değişiklik yaptıkça sunucunun otomatik yenilenmesini sağlar (Geliştirme aşamasında çok işine yarar)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]