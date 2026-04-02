# Python'ın resmi hafif sürümünü kullanıyoruz
FROM python:3.10-slim

# Docker içinde çalışacağımız klasörü belirliyoruz
WORKDIR /app

# Önce kütüphane listesini kopyalayıp yüklüyoruz
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sonra tüm kodlarımızı içeri kopyalıyoruz
COPY . .

# Uygulamayı 8000 portunda dış dünyaya açıyoruz
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]