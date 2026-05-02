/* ================================================
   HKBP ARCO — Storage Manager
   Internal website storage with JSON export/import
   ================================================ */

const DataStorage = {
  // File paths for JSON data
  FILES: {
    users: 'data/users.json',
    blogs: 'data/blogs.json',
    renungan: 'data/renungan.json',
    khotbah: 'data/khotbah.json',
    keuangan: 'data/keuangan.json',
  },

  // localStorage keys
  LS_KEYS: {
    blogs: 'hkbp_blogs',
    renungan: 'hkbp_renungan',
    khotbah: 'hkbp_khotbah',
    keuangan: 'hkbp_keuangan',
    warta: 'hkbp_warta',
    tataIbadah: 'hkbp_tata_ibadah',
    users: 'hkbp_users',
  },

  /* ---------- Simple SHA-256 Hash ---------- */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_hkbp_arco_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /* ---------- Fetch JSON from local file ---------- */
  async fetchJSON(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`DataStorage: Could not fetch ${filePath}:`, err.message);
      return null;
    }
  },

  /* ---------- localStorage helpers ---------- */
  loadLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('DataStorage: localStorage quota exceeded', e);
    }
  },

  /* ---------- Load data with priority: localStorage > JSON file ---------- */
  async loadData(type) {
    // First check localStorage for user-modified data
    const lsKey = this.LS_KEYS[type];
    const localData = this.loadLocal(lsKey, null);
    if (localData) return localData;

    // Fallback to JSON file
    const filePath = this.FILES[type];
    if (filePath) {
      const fileData = await this.fetchJSON(filePath);
      if (fileData) return fileData;
    }

    return null;
  },

  /* ---------- Save data to localStorage ---------- */
  saveData(type, data) {
    const lsKey = this.LS_KEYS[type];
    if (lsKey) {
      this.saveLocal(lsKey, data);
    }
  },

  /* ---------- Export data as JSON file download ---------- */
  exportJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /* ---------- Import data from JSON file ---------- */
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (err) {
          reject(new Error('Format file JSON tidak valid.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsText(file);
    });
  },

  /* ---------- Export to CSV ---------- */
  exportCSV(headers, rows, filename) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const str = String(cell).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /* ---------- Generate PDF-ready print ---------- */
  printReport(contentHTML, title) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; padding: 24px; color: #1a1a2e; font-size: 11px; }
          .report-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px double #1e3bb3; }
          .report-header h1 { font-size: 18px; font-weight: 800; color: #1e3bb3; }
          .report-header h2 { font-size: 14px; font-weight: 600; margin-top: 4px; }
          .report-header p { font-size: 10px; color: #666; margin-top: 4px; }
          .report-meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 10px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #1e3bb3; color: white; padding: 8px 6px; text-align: left; font-weight: 600; font-size: 10px; }
          td { padding: 6px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
          tr:nth-child(even) { background: #f7fafc; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
          .total-row { font-weight: 700; background: #eef2ff !important; border-top: 2px solid #1e3bb3; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .summary-box { padding: 12px; border-radius: 8px; text-align: center; }
          .summary-box.income-bg { background: #ecfdf5; border: 1px solid #a7f3d0; }
          .summary-box.expense-bg { background: #fef2f2; border: 1px solid #fecaca; }
          .summary-box.balance-bg { background: #eef2ff; border: 1px solid #c7d2fe; }
          .summary-box .label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .summary-box .value { font-size: 14px; font-weight: 800; margin-top: 4px; }
          .section-title { font-size: 12px; font-weight: 700; margin: 16px 0 8px; color: #1e3bb3; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .footer-print { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #888; text-align: center; }
          .signature-area { display: flex; justify-content: space-between; margin-top: 48px; padding: 0 40px; }
          .signature-box { text-align: center; min-width: 150px; }
          .signature-box .line { border-top: 1px solid #333; margin-top: 60px; padding-top: 4px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; size: A4; }
          }
        </style>
      </head>
      <body>
        ${contentHTML}
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  },

  /* ---------- Initialize: load all data from files into AppData ---------- */
  async initializeAll() {
    // Load users
    const users = await this.loadData('users');
    if (users) {
      // users.json has { _meta, users: [...] } structure
      AppData.users = users.users || users;
    }

    // Load content data
    const blogs = await this.loadData('blogs');
    if (blogs) AppData.blogs = blogs;

    const renungan = await this.loadData('renungan');
    if (renungan) AppData.renungan = renungan;

    const khotbah = await this.loadData('khotbah');
    if (khotbah) AppData.khotbah = khotbah;

    const keuangan = await this.loadData('keuangan');
    if (keuangan) AppData.keuangan = keuangan;

    const warta = this.loadLocal(this.LS_KEYS.warta, null);
    if (warta) AppData.warta = warta;

    const tataIbadah = this.loadLocal(this.LS_KEYS.tataIbadah, null);
    if (tataIbadah) AppData.tataIbadah = tataIbadah;

    const driveCfg = this.loadLocal('hkbp_drive_cfg', null);
    if (driveCfg) AppData.dokumentasiDrive = driveCfg;

    // Hash default passwords on first run
    await this._ensurePasswordsHashed();
  },

  /* ---------- Ensure all passwords are hashed ---------- */
  async _ensurePasswordsHashed() {
    if (!AppData.users || AppData.users.length === 0) return;

    let needsSave = false;
    for (const user of AppData.users) {
      // If password field exists (plain text), hash it and move to passwordHash
      if (user.password && !user.passwordHash) {
        user.passwordHash = await this.hashPassword(user.password);
        delete user.password;
        needsSave = true;
      }
      // If passwordHash contains placeholder, hash the default password
      if (user.passwordHash && user.passwordHash.includes(']pending')) {
        const defaultPasswords = {
          admin: 'admin123',
          pendeta: 'pendeta123',
          bendahara: 'bendahara123',
          sekretaris: 'sekretaris123',
          kontributor: 'kontributor123',
          jemaat: 'jemaat123'
        };
        const pwd = defaultPasswords[user.username] || user.username + '123';
        user.passwordHash = await this.hashPassword(pwd);
        needsSave = true;
      }
    }

    if (needsSave) {
      this.saveData('users', { _meta: { description: 'HKBP ARCO User Credentials (hashed)', hashAlgorithm: 'SHA-256+salt', lastUpdated: new Date().toISOString().slice(0, 10) }, users: AppData.users });
    }
  },

  /* ---------- Persist helpers ---------- */
  persistBlogs() { this.saveData('blogs', AppData.blogs); },
  persistRenungan() { this.saveData('renungan', AppData.renungan); },
  persistKhotbah() { this.saveData('khotbah', AppData.khotbah); },
  persistKeuangan() { this.saveData('keuangan', AppData.keuangan); },
  persistWarta() { this.saveData('warta', AppData.warta); },
  persistTataIbadah() { this.saveData('tataIbadah', AppData.tataIbadah); },
  persistUsers() {
    this.saveData('users', { _meta: { description: 'HKBP ARCO User Credentials (hashed)', hashAlgorithm: 'SHA-256+salt', lastUpdated: new Date().toISOString().slice(0, 10) }, users: AppData.users });
  },
};
