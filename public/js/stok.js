async function loadStokData() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/stok/rekap?bulan=1&tahun=2026&gudang_id=1', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (result.success) {
      const tbody = document.getElementById('tblStokBody');
      tbody.innerHTML = result.data.map(item => `
        <tr>
          <td>${item.kode_barang}</td>
          <td>${item.nama_barang}</td>
          <td>${item.nama_gudang}</td>
          <td>${item.saldo_awal}</td>
          <td>${item.qty_debit}</td>
          <td>${item.qty_kredit}</td>
          <td><strong>${item.saldo_akhir}</strong></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Gagal mengambil data stok:', err);
  }
}