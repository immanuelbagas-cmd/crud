// Cek status autentikasi untuk halaman dashboard
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token && window.location.pathname !== '/login.html') {
    window.location.href = '/login.html';
  }
}

// Fungsi Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}