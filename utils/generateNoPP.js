const db = require('../config/db');

async function generateNoPP() {
  try {
    const today = new Date();
    
    // Ambil Hari, Bulan, Tahun saat ini
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    // Hitung total PP yang sudah terbuat pada HARI INI
    // Agar urutan 4 digit (0001) ter-reset setiap hari baru
    const countQuery = `
      SELECT COUNT(*) FROM tr_perintah_produksi 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    const result = await db.query(countQuery);
    const nextNumber = parseInt(result.rows[0].count, 10) + 1;

    // Format 4 digit angka di depan (0001, 0002, dst.)
    const counter4Digit = String(nextNumber).padStart(4, '0');

    // Susun sesuai format: 0000/PBT-INS/HH/BB/TTTT
    const no_pp = `${counter4Digit}/PBT-INS/${dd}/${mm}/${yyyy}`;

    return no_pp;
  } catch (error) {
    console.error('Error generating No PP:', error);
    throw error;
  }
}

module.exports = generateNoPP;