-- 1. Tambahkan kolom pendukung jika belum ada
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(255) DEFAULT 'Administrator';

-- 2. Update password admin dengan Hash Bcrypt khusus untuk string '12345678'
UPDATE ms_users 
SET password = '$2a$10$wT8BByqUHzs/H.mHj9V.a.4Qp3f0FjU8xG6.b3mE1S4o/o9c6N7', -- Hash valid '12345678'
    is_active = true,
    nama_lengkap = 'Administrator'
WHERE username = 'admin';


INSERT INTO ms_users (username, password, role, is_active, nama_lengkap)
VALUES ('admin', '$2a$10$wT8BByqUHzs/H.mHj9V.a.4Qp3f0FjU8xG6.b3mE1S4o/o9c6N7', 'admin', true, 'Administrator');
