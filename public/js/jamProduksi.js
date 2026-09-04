document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('tanggal');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  loadMesinOptions();
  loadJamProduksiData();

  const formJam = document.getElementById('formJamProduksi');
  if (formJam) {
    formJam.addEventListener('submit', handleJamProduksiSubmit);
  }
});

window.toggleNewMachineInput = function(val) {
  const groupBaru = document.getElementById('groupMesinBaru');
  const inputBaru = document.getElementById('nama_mesin_baru');
  if (!groupBaru) return;

  if (val === 'NEW') {
    groupBaru.style.display = 'block';
    if (inputBaru) inputBaru.setAttribute('required', 'required');
  } else {
    groupBaru.style.display = 'none';
    if (inputBaru) {
      inputBaru.removeAttribute('required');
      inputBaru.value = '';
    }
  }
};

async function loadMesinOptions() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/mesin', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (result.success) {
      const select = document.getElementById('mesin_id');
      if (!select) return;

      let options = `<option value="">-- Pilih Mesin --</option>`;
      result.data.forEach(m => {
        options += `<option value="${m.id}">${m.nama_mesin} (${m.kode_mesin})</option>`;
      });

      options += `<option value="NEW">+ Tambah Mesin Baru...</option>`;
      select.innerHTML = options;
    }
  } catch (err) {
    console.error('Gagal memuat master mesin:', err);
  }
}

async function loadJamProduksiData() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/jam-produksi', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (result.success) {
      const tbody = document.getElementById('tblJamBody');
      if (!tbody) return;

      if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada riwayat data jam produksi</td></tr>';
        return;
      }

      tbody.innerHTML = result.data.map(item => `
        <tr>
          <td>${item.nama_mesin} (${item.kode_mesin})</td>
          <td>${item.tanggal ? item.tanggal.split('T')[0] : '-'}</td>
          <td>${item.jam_mulai}</td>
          <td>${item.jam_selesai}</td>
          <td><strong>${item.total_jam} Jam</strong></td>
          <td>${item.keterangan || '-'}</td>
          <td style="display: flex; gap: 5px;">
            <button type="button" style="background: #ffc107; color: #000; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;" onclick="editJamProduksi(${item.id}, '${item.mesin_id}', '${item.tanggal ? item.tanggal.split('T')[0] : ''}', '${item.jam_mulai}', '${item.jam_selesai}', '${item.keterangan || ''}')">Edit</button>
            <button type="button" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;" onclick="deleteJamProduksi(${item.id})">Hapus</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Gagal mengambil data jam produksi:', err);
  }
}

window.deleteJamProduksi = async function(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data jam produksi ini?')) return;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/api/jam-produksi/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      alert('Data berhasil dihapus!');
      loadJamProduksiData();
    } else {
      alert('Gagal: ' + data.message);
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi saat menghapus data.');
  }
};

window.editJamProduksi = function(id, mesin_id, tanggal, jam_mulai, jam_selesai, keterangan) {
  const selectMesin = document.getElementById('mesin_id');
  if (selectMesin) {
    selectMesin.value = mesin_id;
    window.toggleNewMachineInput(mesin_id);
  }
  
  document.getElementById('tanggal').value = tanggal;
  document.getElementById('jam_mulai').value = jam_mulai;
  document.getElementById('jam_selesai').value = jam_selesai;
  document.getElementById('keterangan').value = keterangan;

  const form = document.getElementById('formJamProduksi');
  if (form) {
    form.dataset.editId = id;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerText = 'Update Jam Produksi';
  }
};

// Handler Submit Form Jam Produksi
async function handleJamProduksiSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  const token = localStorage.getItem('token');
  const form = e.target;
  const editId = form.dataset.editId;

  const inputBaru = document.getElementById('nama_mesin_baru');
  const payload = {
    mesin_id: document.getElementById('mesin_id').value,
    nama_mesin_baru: inputBaru ? inputBaru.value : '',
    tanggal: document.getElementById('tanggal').value,
    jam_mulai: document.getElementById('jam_mulai').value,
    jam_selesai: document.getElementById('jam_selesai').value,
    keterangan: document.getElementById('keterangan').value
  };

  const url = editId ? `/api/jam-produksi/${editId}` : '/api/jam-produksi';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      alert(editId ? 'Data berhasil diperbarui!' : 'Data jam produksi berhasil disimpan!');
      
      delete form.dataset.editId;
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.innerText = 'Simpan Jam Produksi';

      document.getElementById('jam_mulai').value = '';
      document.getElementById('jam_selesai').value = '';
      document.getElementById('keterangan').value = '';
      document.getElementById('mesin_id').value = '';
      window.toggleNewMachineInput('');

      await loadMesinOptions();
      await loadJamProduksiData();
    } else {
      alert('Gagal: ' + result.message);
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi ke server');
  }
}