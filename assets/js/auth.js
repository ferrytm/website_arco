/* ================================================
   HKBP ARCO — Auth Module
   ================================================ */

const Auth = {
  STORAGE_KEY: 'hkbp_arco_user',

  // Permission matrix
  permissions: {
    admin:       { khotbah: 'full', renungan: 'full', jadwal: 'full', dokumentasi: 'full', blog: 'full', keuangan: 'full', warta: 'full', tataIbadah: 'full', dashboard: true },
    pendeta:     { khotbah: 'write', renungan: 'write', jadwal: 'read', dokumentasi: 'read', blog: 'write', keuangan: 'read', warta: 'read', tataIbadah: 'read', dashboard: true },
    bendahara:   { khotbah: 'read', renungan: 'read', jadwal: 'read', dokumentasi: 'read', blog: 'read', keuangan: 'full', warta: 'read', tataIbadah: 'read', dashboard: true },
    sekretaris:  { khotbah: 'write', renungan: 'write', jadwal: 'write', dokumentasi: 'write', blog: 'write', keuangan: 'read', warta: 'full', tataIbadah: 'full', dashboard: true },
    kontributor: { khotbah: 'write', renungan: 'write', jadwal: 'read', dokumentasi: 'write', blog: 'write', keuangan: 'read', warta: 'read', tataIbadah: 'read', dashboard: true },
    jemaat:      { khotbah: 'read', renungan: 'read', jadwal: 'read', dokumentasi: 'read', blog: 'read', keuangan: 'read', warta: 'read', tataIbadah: 'read', dashboard: false },
  },

  login(username, password) {
    const user = AppData.users.find(u => u.username === username && u.password === password);
    if (user) {
      const sessionUser = { id: user.id, name: user.name, role: user.role, initial: user.initial, username: user.username };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }
    return { success: false, message: 'Username atau password salah.' };
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    window.location.hash = '#beranda';
    updateNavUI();
  },

  getCurrentUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  hasPermission(section, level) {
    // level: 'read' | 'write' | 'full'
    const user = this.getCurrentUser();
    if (!user) return false;
    const perm = this.permissions[user.role];
    if (!perm) return false;
    const sectionPerm = perm[section];
    if (!sectionPerm) return false;
    if (level === 'read') return true; // all logged-in users can read
    if (level === 'write') return sectionPerm === 'write' || sectionPerm === 'full';
    if (level === 'full') return sectionPerm === 'full';
    return false;
  },

  canAccessDashboard() {
    const user = this.getCurrentUser();
    if (!user) return false;
    const perm = this.permissions[user.role];
    return perm && perm.dashboard === true;
  },

  canAccess(section) {
    if (section !== 'keuangan') return true; // public pages
    return this.isLoggedIn();
  },

  getRoleName(role) {
    const names = {
      admin: 'Administrator',
      pendeta: 'Pendeta',
      bendahara: 'Bendahara',
      sekretaris: 'Sekretaris',
      kontributor: 'Kontributor',
      jemaat: 'Jemaat'
    };
    return names[role] || role;
  }
};
