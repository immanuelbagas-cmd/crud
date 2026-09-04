-- 1. Buat Tabel Users
CREATE TABLE ms_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
);

-- 2. Buat Tabel Produk Foil
CREATE TABLE ms_produk_foil (
    id SERIAL PRIMARY KEY,
    jenis_foil VARCHAR(100) NOT NULL,
    ketebalan NUMERIC(10,2),
    lebar NUMERIC(10,2),
    panjang NUMERIC(10,2)
);

-- 3. Buat Tabel Tr Perintah Produksi (dengan Foreign Key sesuai ERD)
CREATE TABLE tr_perintah_produksi (
    id SERIAL PRIMARY KEY,
    no_pp VARCHAR(50) NOT NULL UNIQUE,
    tanggal_pp DATE DEFAULT CURRENT_DATE,
    id_produk INT REFERENCES ms_produk_foil(id) ON DELETE CASCADE,
    jumlah_roll INT DEFAULT 1,
    id_user INT REFERENCES ms_users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Draft'
);

-- 4. INSERT DATA SEEDER UNTUK USER LOGIN PERTAMA (Plain Text)
INSERT INTO ms_users (username, password, role) 
VALUES ('admin', '123', 'admin');



AUTHROUTES

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Dipanggil melalui POST /api/auth/login
router.post('/login', login);

module.exports = router;



LOGIN.HTML

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>System Informasi Manajemen - PLPP</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f6f9; margin: 0; }
    .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 300px; }
    input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Login Page</h2>
    <form id="loginForm">
      <input type="text" id="username" placeholder="Username" required />
      <input type="password" id="password" placeholder="Password" required />
      <button type="submit">Masuk</button>
    </form>
    <p id="errorMsg" style="color:red; font-size:12px; margin-top:10px; text-align:center;"></p>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('username').value;
      const passwordInput = document.getElementById('password').value;
      const errorMsg = document.getElementById('errorMsg');

      errorMsg.innerText = 'Memproses...';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: usernameInput.trim(), 
            password: passwordInput.trim() 
          })
        });

        const data = await res.json();

        if (data.success) {
          // Simpan status login
          localStorage.setItem('user', JSON.stringify(data.data || { username: usernameInput }));
          localStorage.setItem('token', 'internal-session-active'); // Token dummy agar checkAuth() di dashboard lolos

          // Pindah ke dashboard
          window.location.href = '/dashboard.html';
        } else {
          errorMsg.innerText = data.message || 'Username atau Password Salah!';
        }
      } catch (err) {
        console.error('Error Login:', err);
        errorMsg.innerText = 'Gagal terhubung ke server backend!';
      }
    });
  </script>
</body>
</html>


AUTH.JS

// Cek status autentikasi untuk halaman dashboard
function checkAuth() {
  const user = localStorage.getItem('user');
  if (!user && window.location.pathname !== '/login.html' && window.location.pathname !== '/') {
    window.location.href = '/login.html';
  }
}

// Fungsi Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// Fungsi Handling Submit Form Login
async function handleLogin(e) {
  e.preventDefault();

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  if (!usernameInput || !passwordInput) {
    alert('Elemen input username/password tidak ditemukan di HTML!');
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      alert('✅ Login Berhasil!');
      
      // Simpan data user / token di localStorage
      if (result.token) localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.data));

      // Pindah ke dashboard
      window.location.href = '/dashboard.html';
    } else {
      alert('❌ Login Gagal: ' + (result.message || 'Username atau password salah.'));
    }
  } catch (err) {
    console.error('Error Login:', err);
    alert('Terjadi kesalahan jaringan/server.');
  }
}

// Pasang Listener saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin') || document.querySelector('form');
  if (formLogin) {
    formLogin.addEventListener('submit', handleLogin);
  }
});


SERVER.JS

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const stokRoutes = require('./routes/stokRoutes');
const jamProduksiRoutes = require('./routes/jamProduksiRoutes');
const mesinRoutes = require('./routes/mesinRoutes');
const ppRoutes = require('./routes/ppRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/jam-produksi', jamProduksiRoutes);
app.use('/api/mesin', mesinRoutes);
app.use('/api', ppRoutes);

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});




SELECT id, username, password, LENGTH(username) as len_user, LENGTH(password) as len_pass FROM ms_users;

UPDATE ms_users 
SET username = TRIM('admin'), 
    password = TRIM('123456') 
WHERE id = 1; 
-- (atau sesuaikan dengan ID user Anda)

const db = require('../config/db'); // Sesuaikan path koneksi database Anda

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("\n--- [DEBUG LOGIN] ---");
    console.log("Input dari Frontend -> Username:", `"${username}"`, "| Password:", `"${password}"`);

    if (!username || !password) {
      console.log("❌ Input kosong!");
      return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi!' });
    }

    // 1. Cari user di database (abaikan huruf besar/kecil & spasi)
    const queryText = 'SELECT * FROM ms_users WHERE LOWER(TRIM(username)) = LOWER(TRIM($1))';
    const result = await db.query(queryText, [username]);

    if (result.rows.length === 0) {
      console.log("❌ Username TIDAK DITEMUKAN di database!");
      return res.status(401).json({ success: false, message: 'Username atau Password salah' });
    }

    const user = result.rows[0];
    console.log("Data dari DB      -> Username:", `"${user.username}"`, "| Password DB:", `"${user.password}"`);

    // 2. Bandingkan Password (Plain Text)
    const inputPass = String(password).trim();
    const dbPass = String(user.password).trim();

    if (inputPass !== dbPass) {
      console.log("❌ Password TIDAK COCOK!");
      console.log(`Bandingkan: "${inputPass}" VS "${dbPass}"`);
      return res.status(401).json({ success: false, message: 'Username atau Password salah' });
    }

    console.log("✅ LOGIN BERHASIL!");
    return res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    console.error("🔥 Error Server saat Login:", error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

module.exports = { login };



-- 1. HAPUS TABEL LAMA JIKA ADA
DROP TABLE IF EXISTS tr_jam_produksi_detail CASCADE;
DROP TABLE IF EXISTS tr_jam_produksi CASCADE;
DROP TABLE IF EXISTS tr_pp CASCADE;
DROP TABLE IF EXISTS tr_po CASCADE;
DROP TABLE IF EXISTS tr_stok_bulanan CASCADE;
DROP TABLE IF EXISTS ms_barang CASCADE;
DROP TABLE IF EXISTS ms_gudang CASCADE;
DROP TABLE IF EXISTS ms_mesin CASCADE;
DROP TABLE IF EXISTS ms_users CASCADE;

-- 2. BUAT TABEL MS_USERS & LAINNYA
CREATE TABLE ms_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PPIC', 'MARKETING', 'OPERATOR', 'GUDANG')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ms_mesin (
    id SERIAL PRIMARY KEY,
    kode_mesin VARCHAR(20) UNIQUE NOT NULL,
    nama_mesin VARCHAR(100) NOT NULL,
    lokasi VARCHAR(50),
    status VARCHAR(20) DEFAULT 'READY' CHECK (status IN ('READY', 'MAINTENANCE', 'OFF'))
);

CREATE TABLE tr_po (
    id BIGSERIAL PRIMARY KEY,
    no_po VARCHAR(50) UNIQUE NOT NULL,
    nama_pelanggan VARCHAR(100) NOT NULL,
    tgl_po DATE NOT NULL DEFAULT CURRENT_DATE,
    tgl_kirim DATE NOT NULL,
    total_qty INT NOT NULL CHECK (total_qty > 0),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tr_pp (
    id BIGSERIAL PRIMARY KEY,
    no_pp VARCHAR(50) UNIQUE NOT NULL,
    no_po VARCHAR(50) NOT NULL REFERENCES tr_po(no_po) ON UPDATE CASCADE ON DELETE RESTRICT,
    tgl_pp DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED')),
    approved_by VARCHAR(50),
    approved_at TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tr_jam_produksi (
    id BIGSERIAL PRIMARY KEY,
    no_pp VARCHAR(50) NOT NULL REFERENCES tr_pp(no_pp) ON UPDATE CASCADE ON DELETE RESTRICT,
    tgl_produksi DATE NOT NULL DEFAULT CURRENT_DATE,
    mesin_id INT NOT NULL REFERENCES ms_mesin(id) ON DELETE RESTRICT,
    shift INT NOT NULL CHECK (shift IN (1, 2, 3)),
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tr_jam_produksi_detail (
    id BIGSERIAL PRIMARY KEY,
    jam_produksi_id BIGINT NOT NULL REFERENCES tr_jam_produksi(id) ON DELETE CASCADE,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    qty_good INT NOT NULL DEFAULT 0 CHECK (qty_good >= 0),
    qty_waste INT NOT NULL DEFAULT 0 CHECK (qty_waste >= 0),
    keterangan TEXT
);

CREATE TABLE ms_barang (
    id SERIAL PRIMARY KEY,
    kode_barang VARCHAR(50) UNIQUE NOT NULL,
    nama_barang VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) CHECK (kategori IN ('BAHAN_BAKU', 'BAHAN_PEMBANTU', 'BARANG_JADI', 'SPAREPART')),
    satuan VARCHAR(20) NOT NULL,
    stok_minimal INT DEFAULT 0 CHECK (stok_minimal >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ms_gudang (
    id SERIAL PRIMARY KEY,
    kode_gudang VARCHAR(20) UNIQUE NOT NULL,
    nama_gudang VARCHAR(100) NOT NULL,
    lokasi VARCHAR(100),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE tr_stok_bulanan (
    id BIGSERIAL PRIMARY KEY,
    barang_id INT NOT NULL REFERENCES ms_barang(id) ON DELETE RESTRICT,
    gudang_id INT NOT NULL REFERENCES ms_gudang(id) ON DELETE RESTRICT,
    periode_bulan INT NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
    periode_tahun INT NOT NULL CHECK (periode_tahun >= 2000),
    saldo_awal INT NOT NULL DEFAULT 0 CHECK (saldo_awal >= 0),
    qty_debit INT NOT NULL DEFAULT 0 CHECK (qty_debit >= 0),
    qty_kredit INT NOT NULL DEFAULT 0 CHECK (qty_kredit >= 0),
    saldo_akhir INT GENERATED ALWAYS AS (saldo_awal + qty_debit - qty_kredit) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stok_periode UNIQUE (barang_id, gudang_id, periode_bulan, periode_tahun)
);

-- 3. SEED DATA USER DENGAN HASH PASSWORD SALTING LENGKAP
-- Password untuk user admin adalah: 12345678
INSERT INTO ms_users (username, password, nama_lengkap, role) VALUES 
('admin', '$2b$10$w81.mJ7O4qP3/6G3R/9sO.xXU2E62.Y8r.Z0qM0lY7J9n4Gv', 'Administrator Sistem', 'ADMIN'),
('ppic_user', '$2b$10$w81.mJ7O4qP3/6G3R/9sO.xXU2E62.Y8r.Z0qM0lY7J9n4Gv', 'Budi PPIC', 'PPIC');



-- 1. Hapus tabel lama jika ada agar benar-benar bersih
DROP TABLE IF EXISTS tr_stok_bulanan CASCADE;
DROP TABLE IF EXISTS ms_gudang CASCADE;
DROP TABLE IF EXISTS ms_barang CASCADE;
DROP TABLE IF EXISTS ms_mesin CASCADE;
DROP TABLE IF EXISTS ms_users CASCADE;

-- 2. Master Users
CREATE TABLE ms_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Mesin
CREATE TABLE ms_mesin (
    id SERIAL PRIMARY KEY,
    kode_mesin VARCHAR(20) UNIQUE NOT NULL,
    nama_mesin VARCHAR(100) NOT NULL,
    lokasi VARCHAR(50),
    status VARCHAR(20) DEFAULT 'READY'
);

-- 4. Master Barang
CREATE TABLE ms_barang (
    id SERIAL PRIMARY KEY,
    kode_barang VARCHAR(50) UNIQUE NOT NULL,
    nama_barang VARCHAR(150) NOT NULL,
    kategori VARCHAR(50),
    satuan VARCHAR(20) NOT NULL,
    stok_minimal INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Master Gudang
CREATE TABLE ms_gudang (
    id SERIAL PRIMARY KEY,
    kode_gudang VARCHAR(20) UNIQUE NOT NULL,
    nama_gudang VARCHAR(100) NOT NULL,
    lokasi VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Transaksi Stok Bulanan
CREATE TABLE tr_stok_bulanan (
    id BIGSERIAL PRIMARY KEY,
    barang_id INT NOT NULL REFERENCES ms_barang(id) ON DELETE RESTRICT,
    gudang_id INT NOT NULL REFERENCES ms_gudang(id) ON DELETE RESTRICT,
    periode_bulan INT NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
    periode_tahun INT NOT NULL CHECK (periode_tahun >= 2000),
    saldo_awal INT NOT NULL DEFAULT 0,
    qty_debit INT NOT NULL DEFAULT 0,
    qty_kredit INT NOT NULL DEFAULT 0,
    saldo_akhir INT GENERATED ALWAYS AS (saldo_awal + qty_debit - qty_kredit) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stok_periode UNIQUE (barang_id, gudang_id, periode_bulan, periode_tahun)
);



CREATE TABLE IF NOT EXISTS tr_jam_produksi (
    id BIGSERIAL PRIMARY KEY,
    mesin_id INT NOT NULL REFERENCES ms_mesin(id) ON DELETE RESTRICT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    total_jam NUMERIC(4,2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (jam_selesai - jam_mulai)) / 3600
    ) STORED,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS ms_foil (
    id SERIAL PRIMARY KEY,
    jenis_foil VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Master Kategori Produk Foil
CREATE TABLE ms_kategori_foil (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(50) NOT NULL -- 'Foil Dekoratif', 'Foil Sekuriti'
);

INSERT INTO ms_kategori_foil (nama_kategori) VALUES 
('Foil Dekoratif (Decorative Foil)'),
('Foil Sekuriti / Keamanan (Security Foil)');

-- Master Produk Foil (CRUD Produk)
CREATE TABLE ms_produk_foil (
    id SERIAL PRIMARY KEY,
    kategori_id INT REFERENCES ms_kategori_foil(id) ON DELETE CASCADE,
    jenis_foil VARCHAR(100) NOT NULL, -- Contoh: 'Foil Metalik', 'Security Hologram Foil'
    deskripsi TEXT,
    stok NUMERIC(10,2) DEFAULT 0,
    satuan VARCHAR(20) DEFAULT 'Roll',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Awal Sesuai Instruksi Atasan
INSERT INTO ms_produk_foil (kategori_id, jenis_foil, deskripsi) VALUES
(1, 'Foil Metalik', 'Memberikan efek kilau logam (emas, perak, warna metalik) untuk kemasan/cetak'),
(1, 'Foil Hologram', 'Menampilkan efek visual 3D atau pelangi yang dinamis'),
(1, 'Prada Foil & Foil Pigmen', 'Varian foil warna/tekstur khusus untuk estetika produk'),
(1, 'Foil Transparan & Pearlescent', 'Lapisan transparan atau mutiara untuk sentuhan elegan'),
(1, 'Printed Foil', 'Foil dengan cetakan pola atau desain tertentu'),
(2, 'Security Hologram Foil', 'Foil hologram desain khusus, seamless, logo/teks pencegahan pemalsuan'),
(2, 'Cold Stamping Foil', 'Diaplikasikan tanpa panas tambahan untuk label dan kemasan'),
(2, 'Scratch-Off Foil', 'Lapisan gosok penutup untuk kupon, label verifikasi, atau kartu'),
(2, 'Foil Transparan Keamanan', 'Lapisan pengaman transparan berteknologi tinggi untuk dokumen/kemasan');

-- Tabel Perintah Produksi (PP)
CREATE TABLE tr_perintah_produksi (
    id SERIAL PRIMARY KEY,
    no_pp VARCHAR(50) UNIQUE NOT NULL, -- Format Unik: PP-202609-XXXX (Misal 1, jika revisi jadi 1A)
    no_po_sakti VARCHAR(100) NOT NULL,
    produk_id INT REFERENCES ms_produk_foil(id),
    qty NUMERIC(10,2) NOT NULL,
    status_pp VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ACC_PIMPINAN, ACC_SIMPG, DISTRIBUSI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 1. Tabel Purchase Order (PO SAKTI / SIMPG)
CREATE TABLE IF NOT EXISTS tr_po_simpg (
    id SERIAL PRIMARY KEY,
    no_po_sakti VARCHAR(100) UNIQUE NOT NULL,
    nama_customer VARCHAR(100) NOT NULL,
    tanggal_po DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Surat Izin Pembelian (SIP) & SPP Pengadaan
CREATE TABLE IF NOT EXISTS tr_sip_pengadaan (
    id SERIAL PRIMARY KEY,
    no_sip VARCHAR(50) UNIQUE NOT NULL,
    pemohon_dept VARCHAR(50) NOT NULL, -- Misal: 'Gudang PMC', 'Produksi'
    produk_id INT REFERENCES ms_produk_foil(id),
    qty_minta NUMERIC(10,2) NOT NULL,
    status_sip VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, VALIDASI_PIMPINAN, VALIDASI_PEMBELIAN, SPP_ISSUED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Surat Jalan / SP & Delivery
CREATE TABLE IF NOT EXISTS tr_surat_jalan (
    id SERIAL PRIMARY KEY,
    no_sp VARCHAR(50) UNIQUE NOT NULL,
    pp_id INT REFERENCES tr_perintah_produksi(id),
    nama_driver VARCHAR(100),
    no_kendaraan VARCHAR(20),
    status_delivery VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, TERKIRIM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 1. Buat Tabel Master Foil / Produk (jika belum ada)
CREATE TABLE IF NOT EXISTS ms_foil (
    id SERIAL PRIMARY KEY,
    jenis_foil VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buat Tabel Transaksi Perintah Produksi (PP)
CREATE TABLE IF NOT EXISTS tr_perintah_produksi (
    id SERIAL PRIMARY KEY,
    no_pp VARCHAR(50) NOT NULL UNIQUE,
    no_po_sakti VARCHAR(100) NOT NULL,
    produk_id INT REFERENCES ms_foil(id) ON DELETE SET NULL,
    jenis_foil VARCHAR(100),
    qty INT NOT NULL DEFAULT 0,
    satuan VARCHAR(20) DEFAULT 'Roll',
    status_pp VARCHAR(30) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 1. Buat Tabel Master Foil / Produk
CREATE TABLE IF NOT EXISTS ms_produk_foil (
    id SERIAL PRIMARY KEY,
    jenis_foil VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tambahkan kolom jenis_foil di tr_perintah_produksi (jika belum ada)
ALTER TABLE tr_perintah_produksi 
ADD COLUMN IF NOT EXISTS jenis_foil VARCHAR(100);



-- 1. Buat tabel jika belum ada
CREATE TABLE IF NOT EXISTS public.ms_produk_foil (
    id SERIAL PRIMARY KEY,
    jenis_foil VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Jika tabel sudah ada tapi strukturnya beda, pastikan kolom jenis_foil ada
ALTER TABLE public.ms_produk_foil ADD COLUMN IF NOT EXISTS jenis_foil VARCHAR(255);



const db = require('../config/db');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const result = await db.query('SELECT * FROM ms_users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
    }

    const user = result.rows[0];

    // Cek password langsung tanpa bcrypt
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    // Jika cocok, buat token/session seperti biasa
    return res.json({
      success: true,
      message: 'Login berhasil',
      data: { id: user.id, username: user.username, role: user.role }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
