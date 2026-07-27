## 📄 1. Ringkasan Projek

Projek ini merupakan **E-Commerce Backend API** tingkat menengah (*Medium Difficulty*) yang dibangun untuk menangani seluruh operasi server-side pada aplikasi toko online. 

Melalui API ini, sistem dapat mengelola autentikasi pengguna secara aman, memfasilitasi penjelajahan produk, mengelola keranjang belanja pengguna, memproses transaksi keuangan menggunakan Stripe API, serta menyediakan fitur lacak pesanan berbasis tugas (*Task Operations*) dengan validasi skema data yang ketat.

## 🛠️ 2. Teknologi / Tools yang Digunakan

### Core Stack
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB, ODM: Mongoose
- **Payment Gateway:** Stripe API
- **Authentication:** JSON Web Token (JWT) & Bcrypt.js

### Tools & Utilities
- **Development Environment:** Visual Studio Code
- **API Testing & Debugging:** Postman
- **Environment Management:** `dotenv`
- **Version Control:** Git & GitHub

## 🎯 3. API Responsibilities

### 🛒 Product and Cart
- **List Products:** Menampilkan katalog produk beserta detail harganya.
- **Cart Management:** Menambahkan dan menghapus item dari keranjang belanja pengguna yang terautentikasi.

### 💳 Payments
- **Payment Intent Processing:** Membuat dan memproses sesi pembayaran digital secara aman via Stripe API (*server-to-server*).

### 🔐 User Management
- **Sign Up & Log In:** Registrasi akun baru dan autentikasi pengguna.
- **Secure Endpoints:** Memproteksi rute privat menggunakan verifikasi JWT Bearer Token.

### 🚚 Task Operations (CRUD Tracking Order)
- **Create Task:** Menambahkan task pelacakan pesanan baru (contoh: Title: *"Track Order #123"*, Description: *"Pesanan telah diterima oleh pembeli"*).
- **Read Tasks:**
  - Menampilkan seluruh task milik pengguna yang terautentikasi.
  - Filter task berdasarkan status (*delivered*, *pending*, dll) atau kategori.
  - mengambil detail single task berdasarkan ID.
- **Update Task:** Memperbarui detail pelacakan atau mengubah status pesanan via ID dengan validasi Enum Schema.
- **Delete Task:** Menghapus data task pesanan berdasarkan ID.

## 🏗️ 4. Arsitektur Sistem

Aplikasi ini menggunakan pola arsitektur **MVC (Model-View-Controller)** yang memisahkan tanggung jawab kode secara modular:

```text
               +-----------------------------------+
               |        CLIENT / POSTMAN           |
               +-----------------------------------+
                                 |
                       (HTTP Request + Bearer Token)
                                 v
               +-----------------------------------+
               |        EXPRESS.JS BACKEND         |
               |                                   |
               |  [ Auth Middleware ] (JWT Check)  |
               +-----------------------------------+
                 /               |               \
                /                |                \
               v                 v                 v
   +---------------+   +---------------+   +-------------------+
   | Task Controller|  | Cart Controller|  | Payment Controller|
   +---------------+   +---------------+   +-------------------+
           |                   |                     |
           v                   v                     v
   +--------------------------------+      +-------------------+
   |        MONGODB DATABASE        |      |    STRIPE API     |
   | (User, Cart, Product, Task)    |      |  (Gateway Eksternal)
   +--------------------------------+      +-------------------+

⚠️ 5. Kekurangan / Batasan Sistem Saat Ini
- Meskipun sistem telah berjalan dengan baik, terdapat beberapa aspek yang masih bisa ditingkatkan:

- Belum Ada Webhook Stripe: Konfirmasi pembayaran saat ini masih bergantung pada respons langsung (synchronous), belum menggunakan Stripe Webhooks untuk menangani event pembayaran asynchronously secara real-time.

- Refresh Token Belum Diterapkan: Sistem autentikasi saat ini hanya mengandalkan satu Access Token JWT tanpa mekanisme Refresh Token untuk rotasi sesi login yang lebih aman.

- Penyimpanan Gambar Produk: Produk saat ini masih menggunakan URL string eksternal dan belum terintegrasi dengan penyedia penyimpanan cloud (seperti Cloudinary atau AWS S3).

- Cachening Layer: Belum menggunakan Caching (seperti Redis) untuk mempercepat query GET katalog produk.







