// Function untuk Menampilkan/Sembunyikan Input Manual
window.toggleCustomFoilInput = function(val) {
  const groupBaru = document.getElementById('groupFoilBaru');
  if (!groupBaru) return;

  if (String(val) === 'CUSTOM') {
    groupBaru.style.display = 'block';
    const inputEl = document.getElementById('jenis_foil_baru');
    if (inputEl) inputEl.focus();
  } else {
    groupBaru.style.display = 'none';
  }
};

// Function Load Dropdown Master Foil
async function loadProdukOptions() {
  const token = localStorage.getItem('token');
  const select = document.getElementById('produk_id');
  if (!select) return;

  try {
    const res = await fetch('/api/foil', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 401 || res.status === 403) {
      select.innerHTML = '<option value="">-- Session Expired --</option>';
      return;
    }

    const result = await res.json();
    let items = result.success && Array.isArray(result.data) ? result.data : [];

    let options = `<option value="">-- Pilih Jenis Foil --</option>`;

    items.forEach(item => {
      options += `<option value="${item.id}">${item.jenis_foil}</option>`;
    });

    options += `<option value="CUSTOM" style="font-weight: bold; color: #2563eb;">+ Ketik / Tambah Jenis Foil Baru...</option>`;

    select.innerHTML = options;
  } catch (err) {
    console.error('Gagal memuat produk foil:', err);
    select.innerHTML = '<option value="">-- Gagal Memuat Data --</option>';
  }
}

// FUNCTION UTAMA: LOAD DATA TABEL PERINTAH PRODUKSI (PP)
async function loadPPData() {
  const token = localStorage.getItem('token');
  const tbody = document.getElementById('tblPPBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/pp', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      if (result.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">Belum ada data Perintah Produksi.</td></tr>`;
        return;
      }

      let htmlRows = '';
      result.data.forEach(item => {
        // Tentukan Badge Status
        let badgeColor = '#6c757d'; // default gray (DRAFT)
        if (item.status_pp === 'ACC_PIMPINAN' || item.status_pp === 'APPROVED') badgeColor = '#198754'; // green
        if (item.status_pp === 'REJECTED') badgeColor = '#dc3545'; // red

        htmlRows += `
          <tr>
            <td><strong>${item.no_pp || '-'}</strong></td>
            <td>${item.no_po_sakti || '-'}</td>
            <td>${item.jenis_foil || '-'}</td>
            <td>${item.qty || 0} Roll</td>
            <td>
              <span style="background-color: ${badgeColor}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${item.status_pp || 'DRAFT'}
              </span>
            </td>
            <td>
              <button onclick="accPPData(${item.id})" style="background: #198754; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ACC
              </button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = htmlRows;
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Gagal memuat data PP: ${result.message || ''}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loadPPData:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Terjadi kesalahan jaringan/server.</td></tr>`;
  }
}

// Function ACC PP
async function accPPData(id) {
  const token = localStorage.getItem('token');
  if (!confirm('Apakah Anda yakin ingin menyetujui (ACC) PP ini?')) return;

  try {
    const res = await fetch(`/api/pp/acc/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status_acc: 'ACC_PIMPINAN' })
    });

    const result = await res.json();
    if (result.success) {
      alert('✅ Status PP Berhasil Di-ACC!');
      await loadPPData();
    } else {
      alert('❌ Gagal ACC: ' + result.message);
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi saat ACC.');
  }
}

// Function Handler Submit Form PP
async function handlePPSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const selectFoil = document.getElementById('produk_id');
  const produkIdVal = selectFoil ? selectFoil.value : '';

  const inputEl = document.getElementById('jenis_foil_baru') 
               || document.getElementById('jenis_foil_kustom')
               || document.querySelector('#groupFoilBaru input');

  const teksFoilKustom = inputEl ? inputEl.value.trim() : '';

  if (!produkIdVal) {
    alert('Harap pilih Jenis Foil terlebih dahulu!');
    return;
  }

  const isCustom = (produkIdVal === 'CUSTOM');
  if (isCustom && !teksFoilKustom) {
    alert('Harap ketik nama Jenis Foil Baru pada kolom yang tersedia!');
    if (inputEl) inputEl.focus();
    return;
  }

  const payload = {
    no_po_sakti: document.getElementById('no_po_sakti').value,
    produk_id: produkIdVal,
    jenis_foil_baru: isCustom ? teksFoilKustom : '',
    qty: document.getElementById('qty').value
  };

  try {
    const res = await fetch('/api/pp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      alert(`✅ Perintah Produksi berhasil dibuat!\nNomor PP Anda: ${result.data.no_pp}`);
      
      // Reset Form
      document.getElementById('formPP').reset();
      
      // Sembunyikan input manual
      window.toggleCustomFoilInput(''); 
      
      // PASTI RE-LOAD KEDUA DATA (Dropdown + Tabel Bawah)
      await loadProdukOptions();
      await loadPPData();

    } else {
      alert('❌ Gagal: ' + (result.message || 'Terjadi kesalahan pada server'));
    }
  } catch (err) {
    console.error('Error submit PP:', err);
    alert('Terjadi kesalahan koneksi ke server.');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const formPP = document.getElementById('formPP');
  if (formPP) {
    formPP.addEventListener('submit', handlePPSubmit);
  }

  loadProdukOptions();
  loadPPData();
});