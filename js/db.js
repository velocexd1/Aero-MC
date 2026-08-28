// Shared DB using localStorage (replace with real backend later)
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem('aeromc_users') || '[]'),
  saveUsers: (u) => localStorage.setItem('aeromc_users', JSON.stringify(u)),

  getOrders: () => JSON.parse(localStorage.getItem('aeromc_orders') || '[]'),
  saveOrders: (o) => localStorage.setItem('aeromc_orders', JSON.stringify(o)),

  getCurrentUser: () => JSON.parse(localStorage.getItem('aeromc_current_user') || 'null'),
  setCurrentUser: (u) => localStorage.setItem('aeromc_current_user', JSON.stringify(u)),
  logout: () => localStorage.removeItem('aeromc_current_user'),

  register(username, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    if (users.find(u => u.username === username)) return { ok: false, msg: 'Username already taken.' };
    const user = { id: Date.now(), username, email, password, role: 'user', joined: new Date().toISOString() };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser({ id: user.id, username, email, role: user.role });
    return { ok: true };
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    this.setCurrentUser({ id: user.id, username: user.username, email, role: user.role });
    return { ok: true, role: user.role };
  },

  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift({ ...order, id: Date.now(), date: new Date().toISOString(), status: 'pending' });
    this.saveOrders(orders);
  },

  // Seed admin if not exists
  seedAdmin() {
    const users = this.getUsers();
    if (!users.find(u => u.role === 'admin')) {
      users.push({ id: 1, username: 'admin', email: 'admin@aeromc.fun', password: 'admin123', role: 'admin', joined: new Date().toISOString() });
      this.saveUsers(users);
    }
  }
};

DB.seedAdmin();
