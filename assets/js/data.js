/* ================================================
   HKBP ARCO — Mock Data Store
   ================================================ */

/* ---------- localStorage persistence ---------- */
const StorageHelper = {
  KEYS: {
    keuanganTransaksi: 'hkbp_keuangan_transaksi',
    warta: 'hkbp_warta',
    tataIbadah: 'hkbp_tata_ibadah',
    blogs: 'hkbp_blogs',
  },

  load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
  },

  // Call once at boot to merge persisted edits back into AppData
  hydrate() {
    const savedTransaksi = this.load(this.KEYS.keuanganTransaksi, null);
    if (savedTransaksi) AppData.keuangan.transaksi = savedTransaksi;

    const savedWarta = this.load(this.KEYS.warta, null);
    if (savedWarta) AppData.warta = savedWarta;

    const savedTataIbadah = this.load(this.KEYS.tataIbadah, null);
    if (savedTataIbadah) AppData.tataIbadah = savedTataIbadah;

    const savedBlogs = this.load(this.KEYS.blogs, null);
    if (savedBlogs) AppData.blogs = savedBlogs;
  },

  persistTransaksi() { this.save(this.KEYS.keuanganTransaksi, AppData.keuangan.transaksi); },
  persistWarta() { this.save(this.KEYS.warta, AppData.warta); },
  persistTataIbadah() { this.save(this.KEYS.tataIbadah, AppData.tataIbadah); },
  persistBlogs() { this.save(this.KEYS.blogs, AppData.blogs); },
};


const AppData = {
  // ---- Users (for simulation) ----
  users: [
    { id: 1, username: 'admin', password: 'admin123', name: 'Admin Gereja', role: 'admin', initial: 'AG' },
    { id: 2, username: 'pendeta', password: 'pendeta123', name: 'Pdt. Marnala Silitonga', role: 'pendeta', initial: 'MS' },
    { id: 3, username: 'bendahara', password: 'bendahara123', name: 'St. L.H. Aritonang', role: 'bendahara', initial: 'TH' },
    { id: 4, username: 'sekretaris', password: 'sekretaris123', name: 'St. P. Manalu', role: 'sekretaris', initial: 'RM' },
    { id: 5, username: 'kontributor', password: 'kontributor123', name: 'Sdr Renaldo Manalu', role: 'kontributor', initial: 'MS' },
    { id: 6, username: 'jemaat', password: 'jemaat123', name: 'Andre Purba', role: 'jemaat', initial: 'AS' },
  ],

  // ---- Khotbah Mingguan ----
  khotbah: [
    {
      id: 1,
      judul: 'Hidup dalam Pengharapan Kristus',
      pendeta: 'Pdt. Marnala Silitonga',
      tanggal: '2026-04-05',
      ayat: 'Roma 15:13',
      teksAyat: '"Semoga Allah, sumber pengharapan, memenuhi kamu dengan segala sukacita dan damai sejahtera dalam iman, supaya kamu berlimpah-limpah dalam pengharapan oleh kuasa Roh Kudus."',
      isi: 'Pengharapan di dalam Kristus bukanlah sekadar harapan duniawi yang bisa pudar di setiap situasi. Pengharapan Kristus bersifat kekal dan kokoh karena didasarkan pada janji Allah yang tidak pernah berubah. Dalam kehidupan sehari-hari, kita seringkali menghadapi tantangan dan pergumulan yang membuat kita merasa lemah. Namun melalui firman-Nya, kita diingatkan bahwa Allah adalah sumber pengharapan kita. Melalui kuasa Roh Kudus, kita dimampukan untuk terus berlimpah dalam pengharapan, bukan karena kekuatan kita sendiri, tetapi karena kasih karunia-Nya yang sempurna.',
      kategori: 'Pengharapan'
    },
    {
      id: 2,
      judul: 'Kasih yang Mengubahkan',
      pendeta: 'Pdt. Marnala Silitonga',
      tanggal: '2026-03-29',
      ayat: '1 Korintus 13:4-7',
      teksAyat: '"Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong."',
      isi: 'Kasih yang sejati datang dari Allah. Kasih yang Paulus gambarkan dalam surat 1 Korintus bukan sekadar perasaan, melainkan komitmen yang melibatkan tindakan nyata. Kasih itu sabar dalam menunggu, murah hati dalam memberi, dan rendah hati dalam bersikap. Di tengah dunia yang penuh egoisme, Tuhan memanggil kita untuk menjadi agen kasih yang mengubahkan. Ketika kita mengasihi sesama, kita mencerminkan karakter Allah yang penuh kasih dan belas kasihan.',
      kategori: 'Kasih'
    },
    {
      id: 3,
      judul: 'Beriman di Tengah Badai Kehidupan',
      pendeta: 'Pdt. Marnala Silitonga',
      tanggal: '2026-03-22',
      ayat: 'Markus 4:39-40',
      teksAyat: '"Lalu bangunlah Yesus, hardiklah angin dan berkata kepada danau: Diam! Tenang! Lalu anginpun berhentilah dan danau menjadi teduh sekali."',
      isi: 'Murid-murid Yesus panik saat badai menerjang perahu mereka. Mereka lupa bahwa Yesus, Tuhan atas segala ciptaan, ada bersama mereka. Badai kehidupan akan selalu datang - masalah keuangan, kesehatan, keluarga, atau pekerjaan. Namun yg penting bukanlah besarnya badai, melainkan besarnya iman kita kepada Tuhan. Yesus tidak pernah berjanji bahwa hidup akan selalu tenang, tetapi Ia berjanji untuk selalu menyertai kita dalam setiap badai.',
      kategori: 'Iman'
    },
    {
      id: 4,
      judul: 'Pelayanan yang Berkenan',
      pendeta: 'Pdt. Marnala Silitonga',
      tanggal: '2026-03-15',
      ayat: 'Matius 25:40',
      teksAyat: '"Sesungguhnya segala sesuatu yang kamu lakukan untuk salah seorang dari saudaraku yang paling hina ini, kamu untuk Aku."',
      isi: 'Yesus mengajarkan bahwa pelayanan yang sejati bukan hanya di dalam gereja, tetapi di mana saja kita bertemu dengan sesama yang membutuhkan. Setiap tindakan kebaikan yang kita lakukan kepada orang lain, seolah-olah kita lakukan untuk Tuhan sendiri. Pelayanan yang berkenan di hadapan Tuhan adalah pelayanan yang dilakukan dengan rendah hati, penuh kasih, dan tanpa pamrih.',
      kategori: 'Pelayanan'
    }
  ],

  // ---- Renungan Harian ----
  renungan: [
    {
      id: 1,
      tanggal: '2026-04-09',
      judul: 'Setia di Hal Kecil',
      ayat: 'Lukas 16:10',
      teksAyat: '"Barangsiapa setia dalam perkara-perkara kecil, ia setia juga dalam perkara-perkara besar."',
      isi: 'Kesetiaan dimulai dari hal-hal kecil. Tuhan menaruh perhatian bukan hanya pada pencapaian besar kita, tetapi juga pada sikap hati dalam menjalani rutinitas harian. Ketika kita setia dalam doa pagi, dalam berkata jujur, dalam menepati janji - kita melatih karakter yang siap untuk tanggung jawab lebih besar. Hari ini, mari kita bertanya: apakah ada hal kecil yang Tuhan minta saya lakukan dengan setia?',
      penulis: 'Pdt. Marnala Silitonga'
    },
    {
      id: 2,
      tanggal: '2026-04-08',
      judul: 'Kekuatan dalam Kelemahan',
      ayat: '2 Korintus 12:9',
      teksAyat: '"Cukuplah kasih karunia-Ku bagimu, sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna."',
      isi: 'Seringkali kita merasa tidak layak atau tidak mampu. Kita melihat kekurangan kita dan berkecil hati. Namun Tuhan berkata bahwa justru di dalam kelemahan kita, kuasa-Nya dinyatakan dengan sempurna. Paradoks iman ini mengajarkan kita bahwa bergantung kepada Tuhan bukanlah kelemahan, melainkan kekuatan tertinggi. Biarlah hari ini kita berserah sepenuhnya kepada Tuhan.',
      penulis: 'Sdr. Renaldo Manalu'
    },
    {
      id: 3,
      tanggal: '2026-04-07',
      judul: 'Damai yang Melampaui Akal Budi',
      ayat: 'Filipi 4:7',
      teksAyat: '"Damai sejahtera Allah, yang melampaui segala akal, akan memelihara hati dan pikiranmu dalam Kristus Yesus."',
      isi: 'Di tengah kecemasan dan kekhawatiran hidup, Allah menawarkan damai yang tidak bisa dijelaskan oleh logika manusia. Damai ini bukan karena semua masalah sudah selesai, tetapi karena kita tahu siapa yang memegang kendali. Ketika kita menyerahkan segala kekuatiran kepada-Nya melalui doa dan ucapan syukur, Ia menjanjikan damai yang menjaga hati dan pikiran kita.',
      penulis: 'Pdt. Marnala Silitonga'
    },
    {
      id: 4,
      tanggal: '2026-04-06',
      judul: 'Pembaruan Setiap Hari',
      ayat: 'Ratapan 3:22-23',
      teksAyat: '"Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!"',
      isi: 'Setiap pagi adalah bukti kasih setia Tuhan. Tidak peduli betapa buruknya hari kemarin, pagi ini Tuhan memberikan halaman baru. Rahmat-Nya diperbaharui, kasih-Nya tetap membara, dan kesetiaan-Nya tak pernah goyah. Hari ini adalah kesempatan baru untuk memulai dengan sukacita dan iman yang segar.',
      penulis: 'Sdr. Renaldo Manalu'
    }
  ],

  // ---- Jadwal Kegiatan ----
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

  // ---- Blogs ----
  blogs: [
    {
      id: 1,
      judul: 'Sejarah Singkat HKBP ARCO',
      penulis: 'Admin Gereja',
      tanggal: '2026-03-20',
      kategori: 'Sejarah',
      ringkasan: 'Mengenal lebih dekat perjalanan berdirinya HKBP ARCO dari awal hingga saat ini, dari persekutuan kecil hingga menjadi jemaat yang bertumbuh.',
      isi: 'HKBP ARCO didirikan atas dasar kerinduan jemaat Batak di wilayah ARCO untuk memiliki tempat ibadah sendiri. Bermula dari persekutuan kecil di rumah salah satu jemaat, gereja ini terus bertumbuh dan berkembang. Dengan semangat "Horas" dan iman yang teguh, jemaat bergotong royong membangun gedung gereja. Kini HKBP ARCO telah menjadi bagian penting dari pelayanan HKBP di Jakarta, melayani ratusan jemaat dari berbagai latar belakang.',
      tags: ['sejarah', 'HKBP', 'gereja']
    },
    {
      id: 2,
      judul: 'Makna Paskah bagi Kehidupan Kristen',
      penulis: 'Pdt. Marnala Silitonga',
      tanggal: '2026-04-01',
      kategori: 'Rohani',
      ringkasan: 'Merenungkan makna sejati perayaan Paskah - kemenangan Kristus atas kematian dan dampaknya bagi kehidupan kita setiap hari.',
      isi: 'Paskah bukan sekadar hari libur atau tradisi tahunan. Paskah adalah perayaan atas kemenangan terbesar dalam sejarah manusia - kebangkitan Yesus Kristus dari kematian. Melalui kebangkitan-Nya, Yesus telah mengalahkan kuasa maut dan dosa, memberikan pengharapan hidup kekal bagi semua yang percaya kepada-Nya. Setiap hari, kita hidup dalam terang kebangkitan Kristus.',
      tags: ['paskah', 'rohani', 'renungan']
    },
    {
      id: 3,
      judul: 'Tips Menjaga Kesehatan Rohani Keluarga',
      penulis: 'Sdr. Renaldo Manalu',
      tanggal: '2026-03-15',
      kategori: 'Keluarga',
      ringkasan: 'Panduan praktis untuk membangun kehidupan rohani yang sehat dalam keluarga melalui ibadah keluarga, doa bersama, dan komunikasi.',
      isi: 'Keluarga adalah gereja kecil yang Tuhan percayakan kepada kita. Untuk menjaga kesehatan rohani keluarga, ada beberapa hal penting: Pertama, luangkan waktu untuk ibadah keluarga secara rutin. Kedua, biasakan berdoa bersama sebelum makan dan sebelum tidur. Ketiga, ciptakan komunikasi terbuka tentang iman dan pergumulan. Keempat, terlibat aktif dalam pelayanan gereja sebagai keluarga.',
      tags: ['keluarga', 'rohani', 'tips']
    },
    {
      id: 4,
      judul: 'Partangiangan: Kekuatan Doa dalam Budaya Batak',
      penulis: 'St. P. Manalu',
      tanggal: '2026-03-08',
      kategori: 'Budaya',
      ringkasan: 'Menggali makna partangiangan (doa) dalam budaya Batak dan bagaimana tradisi ini diperkaya oleh iman Kristen.',
      isi: 'Dalam budaya Batak, partangiangan memiliki posisi yang sangat penting. Doa dipanjatkan di setiap momen penting kehidupan - kelahiran, pernikahan, bahkan kematian. Ketika iman Kristen datang ke Tanah Batak melalui para misionaris, tradisi doa ini tidak hilang tetapi justru diperkaya. Partangiangan menjadi perpaduan indah antara warisan budaya dan iman Kristen yang hidup.',
      tags: ['budaya', 'batak', 'doa']
    }
  ],

  // ---- Warta Jemaat (weekly bulletin) ----
  warta: [
    {
      id: 1,
      minggu: '2026-04-12',
      judul: 'Warta Jemaat — Minggu Paskah II',
      isi: '1. Ibadah Paskah akan dilangsungkan pada 20 April 2026 pukul 06:00 WIB.\n2. Pendaftaran Retreat Pemuda dibuka hingga 18 April 2026.\n3. Persembahan bulan Maret: Rp 14.200.000.\n4. Jemaat yang ingin mendaftarkan anak untuk Baptisan harap menghubungi sekretariat.',
      dibuatOleh: 'St. P. Manalu'
    },
    {
      id: 2,
      minggu: '2026-04-05',
      judul: 'Warta Jemaat — Minggu Paskah I',
      isi: '1. Latihan paduan suara untuk ibadah Paskah setiap Jumat pukul 19:30.\n2. Pengumpulan zakat dan kolekte khusus Paskah.\n3. Rapat Majelis dijadwalkan pada Minggu kedua bulan April.\n4. Ucapan terima kasih kepada semua pelayan yang terlibat dalam ibadah.',
      dibuatOleh: 'St. P. Manalu'
    }
  ],

  // ---- Tata Ibadah (liturgy) ----
  tataIbadah: [
    {
      id: 1,
      minggu: '2026-04-12',
      judul: 'Tata Ibadah Minggu Paskah II',
      isi: '• Prapersiapan & Doa Pribadi\n• Nyanyian Pembuka: KJ 182 — "Bangunlah, Hai Jiwa"\n• Votum & Salam\n• Nyanyian Pujian: KJ 21 — "Kami Puji dengan Riang"\n• Hukum Tuhan & Pengakuan Dosa\n• Berita Anugerah & Petunjuk Hidup Baru\n• Nyanyian: KJ 244\n• Doa Syafaat\n• Pembacaan Alkitab: Roma 15:13\n• Khotbah\n• Nyanyian: KJ 393\n• Doa & Berkat\n• Nyanyian Penutup: KJ 428 — "Tuhan, Tolonglah"',
      dibuatOleh: 'St. P. Manalu'
    },
    {
      id: 2,
      minggu: '2026-04-05',
      judul: 'Tata Ibadah Minggu Paskah I',
      isi: '• Prapersiapan & Doa Pribadi\n• Nyanyian Pembuka: KJ 175 — "Kristus Telah Bangkit"\n• Votum & Salam\n• Nyanyian Pujian: KJ 180 — "Dia Bangkit"\n• Hukum Tuhan & Pengakuan Dosa\n• Berita Anugerah\n• Nyanyian: KJ 252\n• Doa Syafaat\n• Pembacaan Alkitab: 1 Korintus 13:4-7\n• Khotbah\n• Nyanyian: KJ 400\n• Sakramen Perjamuan Kudus\n• Doa & Berkat\n• Nyanyian Penutup: KJ 456',
      dibuatOleh: 'St. P. Manalu'
    }
  ],

  // ---- Keuangan (mock) ----
  keuangan: {
    ringkasan: {
      totalPemasukan: 85750000,
      totalPengeluaran: 62340000,
      saldo: 23410000
    },
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
    transaksi: [
      { id: 1, tanggal: '2026-04-06', keterangan: 'Persembahan Ibadah Minggu', jenis: 'masuk', jumlah: 8500000, kategori: 'Persembahan' },
      { id: 2, tanggal: '2026-04-06', keterangan: 'Kolekte Ibadah', jenis: 'masuk', jumlah: 3200000, kategori: 'Kolekte' },
      { id: 3, tanggal: '2026-04-05', keterangan: 'Pembayaran Listrik Gereja', jenis: 'keluar', jumlah: 1850000, kategori: 'Operasional' },
      { id: 4, tanggal: '2026-04-04', keterangan: 'Sumbangan Pembangunan', jenis: 'masuk', jumlah: 5000000, kategori: 'Sumbangan' },
      { id: 5, tanggal: '2026-04-03', keterangan: 'Gaji Koster', jenis: 'keluar', jumlah: 3500000, kategori: 'Gaji' },
      { id: 6, tanggal: '2026-04-02', keterangan: 'Dana Diakonia', jenis: 'keluar', jumlah: 2000000, kategori: 'Diakonia' },
      { id: 7, tanggal: '2026-04-01', keterangan: 'Perpuluhan Jemaat', jenis: 'masuk', jumlah: 4500000, kategori: 'Perpuluhan' },
      { id: 8, tanggal: '2026-03-30', keterangan: 'Pembelian Alat Kebersihan', jenis: 'keluar', jumlah: 750000, kategori: 'Operasional' },
      { id: 9, tanggal: '2026-03-29', keterangan: 'Persembahan Ibadah Minggu', jenis: 'masuk', jumlah: 7800000, kategori: 'Persembahan' },
      { id: 10, tanggal: '2026-03-28', keterangan: 'Perbaikan Sound System', jenis: 'keluar', jumlah: 4500000, kategori: 'Fasilitas' },
    ]
  },

  // ---- Dokumentasi / Galeri (Google Drive) ----
  dokumentasiDrive: {
    rootFolderId: '1QqF5u4_c9eTwEj_bgDlLDPjsz-MaIfII',
    folders: [
      {
        nama: 'Ibadah Minggu',
        folderId: '1uF94o6SkD3-z3IJShurlrBlLYL2s3lJq',
        files: [
          { name: '2.jpeg', id: '1Xv6hK0bCbI7xH2aQfT03eqS1RgY4K3AI' },
          { name: '4.jpeg', id: '14q8WzPlR5kHnNvTdY0mJjR2bK1cX9oVP' },
        ]
      },
      {
        nama: 'Pelantikan Seksi',
        folderId: '1dEijMZVpbsabk7u7IgA4i2-COtEkj5VS',
        files: [
          { name: '1.jpeg', id: '1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV' },
          { name: '5.jpeg', id: '1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oPqRs' },
        ]
      },
      {
        nama: 'Sumbangan Jemaat',
        folderId: '1PwcaAq-wMs5DbwlyiFTdZyKK1mmPMwtB',
        files: [
          { name: '3.jpeg', id: '1tU2vW3xY4zA5bC6dE7fG8hI9jK0lMnOp' },
        ]
      }
    ]
  },

  // ---- Dokumentasi legacy (kept for compatibility) ----
  dokumentasi: [
    { id: 1, judul: 'Ibadah Paskah 2025', kategori: 'Ibadah', deskripsi: 'Dokumentasi ibadah Paskah tahun 2025', tanggal: '2025-04-20' },
    { id: 2, judul: 'Natal 2025', kategori: 'Natal', deskripsi: 'Perayaan Natal bersama jemaat', tanggal: '2025-12-25' },
    { id: 3, judul: 'Baptisan Kudus', kategori: 'Sakramen', deskripsi: 'Sakramen Baptisan Kudus Maret 2026', tanggal: '2026-03-08' },
    { id: 4, judul: 'Retreat Pemuda 2025', kategori: 'Kegiatan', deskripsi: 'Kegiatan retreat tahunan pemuda HKBP ARCO', tanggal: '2025-11-15' },
    { id: 5, judul: 'Sidi 2026', kategori: 'Sakramen', deskripsi: 'Peneguhan Sidi (Konfirmasi) 2026', tanggal: '2026-02-22' },
    { id: 6, judul: 'HUT Gereja ke-15', kategori: 'Perayaan', deskripsi: 'Perayaan HUT ke-15 HKBP ARCO', tanggal: '2025-09-14' },
  ],

  // ---- Kontak ----
  kontak: {
    alamat: 'Jl. RAYA KEADILAN KOMPLEK ARCO DEPOK GD. SERBA GUNA IKUK RT 04/RW 05, DEPOK 16434',
    telepon: '(021) 7990-1234',
    email: 'arcohkbp@gmail.com',
    instagram: '@hkbparco',
    facebook: 'HKBP ARCO Depok',
    youtube: 'HKBP ARCO Channel',
    mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d106.83!3d-6.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTUnMDAuMCJTIDEwNsKwNTAnMDAuMCJF!5e0!3m2!1sid!2sid!4v1'
  }
};

// Export for use
if (typeof module !== 'undefined') module.exports = AppData;
