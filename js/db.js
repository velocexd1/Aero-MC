// ── JSONBin Config ────────────────────────────────────────
// 1. Go to https://jsonbin.io and create a free account
// 2. Create a new bin with this default JSON: {"users":[],"orders":[],"ranks":[],"coins":[],"prices":{},"logo":""}
// 3. Copy your BIN ID and API KEY and paste below
const JSONBIN_ID  = '6a911de7da38895dfe1aea90';   // e.g. 6650abc123def456
const JSONBIN_KEY = '$2a$10$JaC63U5FM3OndHgGdJpqz.pvvUKBSB9ETiIEr.fPafGM5urPjqQxO';  // e.g. $2a$10$...

const API = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;
const HEADERS = { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY };

// Local cache so UI feels instant
let _cache = null;

const DB = {
  async _get() {
    if (_cache) return _cache;
    const res = await fetch(API + '/latest', { headers: HEADERS });
    const json = await res.json();
    _cache = json.record;
    return _cache;
  },

  async _save(data) {
    _cache = data;
    await fetch(API, { method: 'PUT', headers: HEADERS, body: JSON.stringify(data) });
  },

  async getUsers()  { return (await this._get()).users  || []; },
  async getOrders() { return (await this._get()).orders || []; },
  async getRanks()  {
    const r = (await this._get()).ranks;
    if (r && r.length) return r;
    return [
      { id: 'vip',    name: 'VIP',    icon: '⚡', featured: false, perks: ['Custom prefix [VIP]', 'Access to /fly', 'Color chat', '2x XP boost', 'VIP kit daily'] },
      { id: 'elite',  name: 'Elite',  icon: '🌊', featured: true,  perks: ['Custom prefix [Elite]', 'All VIP perks', '/nick command', '3x XP boost', 'Elite kit daily', 'Priority queue'] },
      { id: 'legend', name: 'Legend', icon: '🔥', featured: false, perks: ['Custom prefix [Legend]', 'All Elite perks', 'Custom join message', '5x XP boost', 'Legend kit daily', 'Private warp'] },
      { id: 'aero',   name: 'Aero',   icon: '✈', featured: false, perks: ['Custom prefix [Aero]', 'All Legend perks', 'Staff-like commands', '10x XP boost', 'Aero kit daily', 'Custom particle trail', 'Exclusive AeroMC badge'] }
    ];
  },
  async getCoins()  {
    const c = (await this._get()).coins;
    if (c && c.length) return c;
    return [
      { id: 'c500',  amount: '500',   icon: '🪙' },
      { id: 'c1000', amount: '1,000', icon: '💰' },
      { id: 'c2500', amount: '2,500', icon: '💎' },
      { id: 'c5000', amount: '5,000', icon: '👑' }
    ];
  },
  async getPrices() { return (await this._get()).prices || {}; },
  async getLogo()   { return (await this._get()).logo   || ''; },

  getCurrentUser() { return JSON.parse(localStorage.getItem('aeromc_current_user') || 'null'); },
  setCurrentUser(u) { localStorage.setItem('aeromc_current_user', JSON.stringify(u)); },
  logout() { localStorage.removeItem('aeromc_current_user'); },

  async register(username, email, password) {
    const data = await this._get();
    if (data.users.find(u => u.email === email))    return { ok: false, msg: 'Email already registered.' };
    if (data.users.find(u => u.username === username)) return { ok: false, msg: 'Username already taken.' };
    const user = { id: Date.now(), username, email, password, role: 'user', joined: new Date().toISOString() };
    data.users.push(user);
    await this._save(data);
    this.setCurrentUser({ id: user.id, username, email, role: 'user' });
    return { ok: true };
  },

  async login(email, password) {
    const data = await this._get();
    const user = data.users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    this.setCurrentUser({ id: user.id, username: user.username, email, role: user.role });
    return { ok: true, role: user.role };
  },

  async addOrder(order) {
    const data = await this._get();
    data.orders.unshift({ ...order, id: Date.now(), date: new Date().toISOString(), status: 'pending' });
    await this._save(data);
  },

  async updateOrderStatus(id, status) {
    const data = await this._get();
    const o = data.orders.find(o => o.id === id);
    if (o) { o.status = status; await this._save(data); }
  },

  async deleteOrder(id) {
    const data = await this._get();
    data.orders = data.orders.filter(o => o.id !== id);
    await this._save(data);
  },

  async deleteUser(id) {
    const data = await this._get();
    data.users = data.users.filter(u => u.id !== id);
    await this._save(data);
  },

  async saveRanks(ranks) {
    const data = await this._get();
    data.ranks = ranks; await this._save(data);
  },

  async saveCoins(coins) {
    const data = await this._get();
    data.coins = coins; await this._save(data);
  },

  async savePrices(prices) {
    const data = await this._get();
    data.prices = prices; await this._save(data);
  },

  async saveLogo(logo) {
    const data = await this._get();
    data.logo = logo; await this._save(data);
  },

  async saveUsers(users) {
    const data = await this._get();
    data.users = users; await this._save(data);
  },

  async seedAdmin() {
    const data = await this._get();
    if (!data.users.find(u => u.role === 'admin')) {
      data.users.push({ id: 1, username: 'admin', email: 'admin@aeromc.fun', password: 'admin123', role: 'admin', joined: new Date().toISOString() });
      await this._save(data);
    }
  }
};
