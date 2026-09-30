# Gunakan base image oven/bun versi alpine agar ringan
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy file package
COPY package.json bun.lock ./

# Install dependensi untuk production
RUN bun install --production

# Copy source code backend
COPY . .

# Hapus file lokal yang tidak diperlukan di runtime (opsional)
RUN rm -rf test-qa-full.js

# Expose port yang digunakan aplikasi
EXPOSE 5001

# Jalankan aplikasi (server.js ada di folder src)
CMD ["bun", "run", "src/server.js"]
