/* ================================================
   HKBP ARCO — Data Store (refactored)
   Data loaded from separated JSON files via DataStorage
   ================================================ */

const AppData = {
  users: [],

  khotbah: [],
  renungan: [],
  blogs: [],

  jadwal: [
    { id: 1, nama: 'Ibadah Minggu', hari: 'Minggu', waktu: '09:00 - 11:30', tempat: 'Gedung Gereja Utama', kategori: 'Ibadah', deskripsi: 'Ibadah umum bersama seluruh jemaat.', rutin: true },
    { id: 2, nama: 'Sekolah Minggu', hari: 'Minggu', waktu: '09:00 - 10:00', tempat: 'Ruang Sekolah Minggu', kategori: 'Ibadah', deskripsi: 'Kelas kebaktian untuk anak-anak usia 3-12 tahun.', rutin: true },
    { id: 3, nama: 'Ibadah Pemuda/i (Naposo)', hari: 'Sabtu', waktu: '17:00 - 19:00', tempat: 'Aula Gereja', kategori: 'Ibadah', deskripsi: 'Ibadah dan persekutuan pemuda-pemudi gereja.', rutin: true },
    { id: 4, nama: 'Persekutuan Doa', hari: 'Rabu', waktu: '19:00 - 20:30', tempat: 'Gedung Gereja', kategori: 'Doa', deskripsi: 'Persekutuan doa bersama seluruh jemaat.', rutin: true },
    { id: 5, nama: 'Latihan Paduan Suara', hari: 'Jumat', waktu: '19:30 - 21:00', tempat: 'Gedung Gereja', kategori: 'Pelayanan', deskripsi: 'Latihan koor untuk persiapan ibadah Minggu.', rutin: true },
    { id: 6, nama: 'Paskah - Ibadah Kebangkitan', hari: 'Minggu, 20 Apr 2026', waktu: '06:00 - 08:00', tempat: 'Gedung Gereja Utama', kategori: 'Ibadah', deskripsi: 'Ibadah Kebangkitan Kristus - Paskah 2026.', rutin: false },
    { id: 7, nama: 'Retreat Pemuda', hari: 'Sabtu-Minggu, 26-27 Apr 2026', waktu: 'Full Day', tempat: 'Villa Puncak', kategori: 'Kegiatan Khusus', deskripsi: 'Retreat tahunan untuk pemuda-pemudi HKBP ARCO.', rutin: false },
    { id: 8, nama: 'Ibadah Kaum Ibu (Ina)', hari: 'Kamis', waktu: '10:00 - 12:00', tempat: 'Aula Gereja', kategori: 'Ibadah', deskripsi: 'Persekutuan dan ibadah khusus kaum ibu.', rutin: true },
    { id: 9, nama: 'Ibadah Kaum Bapak (Ama)', hari: 'Sabtu', waktu: '07:00 - 09:00', tempat: 'Aula Gereja', kategori: 'Ibadah', deskripsi: 'Persekutuan dan ibadah khusus kaum bapak.', rutin: true },
    { id: 10, nama: 'Rapat Majelis', hari: 'Minggu ke-2 setiap bulan', waktu: '13:00 - 15:00', tempat: 'Ruang Rapat Gereja', kategori: 'Organisasi', deskripsi: 'Rapat bulanan majelis gereja.', rutin: true },
  ],

  warta: [
    { id: 1, minggu: '2026-04-12', judul: 'Warta Jemaat — Minggu Paskah II', isi: '1. Ibadah Paskah akan dilangsungkan pada 20 April 2026 pukul 06:00 WIB.\n2. Pendaftaran Retreat Pemuda dibuka hingga 18 April 2026.\n3. Persembahan bulan Maret: Rp 14.200.000.\n4. Jemaat yang ingin mendaftarkan anak untuk Baptisan harap menghubungi sekretariat.', dibuatOleh: 'St. P. Manalu' },
    { id: 2, minggu: '2026-04-05', judul: 'Warta Jemaat — Minggu Paskah I', isi: '1. Latihan paduan suara untuk ibadah Paskah setiap Jumat pukul 19:30.\n2. Pengumpulan zakat dan kolekte khusus Paskah.\n3. Rapat Majelis dijadwalkan pada Minggu kedua bulan April.\n4. Ucapan terima kasih kepada semua pelayan yang terlibat dalam ibadah.', dibuatOleh: 'St. P. Manalu' }
  ],

  tataIbadah: [
    { id: 1, minggu: '2026-04-12', judul: 'Tata Ibadah Minggu Paskah II', isi: '• Prapersiapan & Doa Pribadi\n• Nyanyian Pembuka: KJ 182 — "Bangunlah, Hai Jiwa"\n• Votum & Salam\n• Nyanyian Pujian: KJ 21 — "Kami Puji dengan Riang"\n• Hukum Tuhan & Pengakuan Dosa\n• Berita Anugerah & Petunjuk Hidup Baru\n• Nyanyian: KJ 244\n• Doa Syafaat\n• Pembacaan Alkitab: Roma 15:13\n• Khotbah\n• Nyanyian: KJ 393\n• Doa & Berkat\n• Nyanyian Penutup: KJ 428 — "Tuhan, Tolonglah"', dibuatOleh: 'St. P. Manalu' },
    { id: 2, minggu: '2026-04-05', judul: 'Tata Ibadah Minggu Paskah I', isi: '• Prapersiapan & Doa Pribadi\n• Nyanyian Pembuka: KJ 175 — "Kristus Telah Bangkit"\n• Votum & Salam\n• Nyanyian Pujian: KJ 180 — "Dia Bangkit"\n• Hukum Tuhan & Pengakuan Dosa\n• Berita Anugerah\n• Nyanyian: KJ 252\n• Doa Syafaat\n• Pembacaan Alkitab: 1 Korintus 13:4-7\n• Khotbah\n• Nyanyian: KJ 400\n• Sakramen Perjamuan Kudus\n• Doa & Berkat\n• Nyanyian Penutup: KJ 456', dibuatOleh: 'St. P. Manalu' }
  ],

  keuangan: {
    ringkasan: { totalPemasukan: 85750000, totalPengeluaran: 62340000, saldo: 23410000 },
    bulanan: [
      { bulan: 'Jan', pemasukan: 12500000, pengeluaran: 9800000 },
      { bulan: 'Feb', pemasukan: 11800000, pengeluaran: 10200000 },
      { bulan: 'Mar', pemasukan: 14200000, pengeluaran: 11500000 },
      { bulan: 'Apr', pemasukan: 13750000, pengeluaran: 9840000 },
      { bulan: 'Mei', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Jun', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Jul', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Agu', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Sep', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Okt', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Nov', pemasukan: 0, pengeluaran: 0 },
      { bulan: 'Des', pemasukan: 0, pengeluaran: 0 },
    ],
    transaksi: []
  },

  dokumentasiDrive: {
    rootFolderId: '1QqF5u4_c9eTwEj_bgDlLDPjsz-MaIfII',
    folders: [
      { nama: 'Ibadah Minggu', folderId: '1uF94o6SkD3-z3IJShurlrBlLYL2s3lJq', files: [{ name: '2.jpeg', id: '1Xv6hK0bCbI7xH2aQfT03eqS1RgY4K3AI' }, { name: '4.jpeg', id: '14q8WzPlR5kHnNvTdY0mJjR2bK1cX9oVP' }] },
      { nama: 'Pelantikan Seksi', folderId: '1dEijMZVpbsabk7u7IgA4i2-COtEkj5VS', files: [{ name: '1.jpeg', id: '1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV' }, { name: '5.jpeg', id: '1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oPqRs' }] },
      { nama: 'Sumbangan Jemaat', folderId: '1PwcaAq-wMs5DbwlyiFTdZyKK1mmPMwtB', files: [{ name: '3.jpeg', id: '1tU2vW3xY4zA5bC6dE7fG8hI9jK0lMnOp' }] }
    ]
  },

  dokumentasi: [
    { id: 1, judul: 'Ibadah Paskah 2025', kategori: 'Ibadah', deskripsi: 'Dokumentasi ibadah Paskah tahun 2025', tanggal: '2025-04-20' },
    { id: 2, judul: 'Natal 2025', kategori: 'Natal', deskripsi: 'Perayaan Natal bersama jemaat', tanggal: '2025-12-25' },
    { id: 3, judul: 'Baptisan Kudus', kategori: 'Sakramen', deskripsi: 'Sakramen Baptisan Kudus Maret 2026', tanggal: '2026-03-08' },
    { id: 4, judul: 'Retreat Pemuda 2025', kategori: 'Kegiatan', deskripsi: 'Kegiatan retreat tahunan pemuda HKBP ARCO', tanggal: '2025-11-15' },
    { id: 5, judul: 'Sidi 2026', kategori: 'Sakramen', deskripsi: 'Peneguhan Sidi (Konfirmasi) 2026', tanggal: '2026-02-22' },
    { id: 6, judul: 'HUT Gereja ke-15', kategori: 'Perayaan', deskripsi: 'Perayaan HUT ke-15 HKBP ARCO', tanggal: '2025-09-14' },
  ],

  kontak: {
    alamat: 'Jl. RAYA KEADILAN KOMPLEK ARCO DEPOK GD. SERBA GUNA IKUK RT 04/RW 05, DEPOK 16434',
    telepon: '(021) 7990-1234',
    email: 'arcohkbp@gmail.com',
    instagram: '@hkbparco',
    facebook: 'HKBP ARCO Depok',
    youtube: 'HKBP ARCO Channel',
    mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d106.83!3d-6.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTUnMDAuMCJTIDEwNsKwNTAnMDAuMCJF!5e0!3m2!1sid!2sid!4v1'
  },

  // Blog character limit
  BLOG_MAX_CHARS: 2000,
};

// Export for use
if (typeof module !== 'undefined') module.exports = AppData;
