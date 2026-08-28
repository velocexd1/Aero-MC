function getStorePrices() {
  return JSON.parse(localStorage.getItem('aeromc_prices') || '{}');
}
function getRankPrice(id) {
  const p = getStorePrices()['rank_' + id];
  return p || 'Price TBA';
}
function getCoinPrice(id) {
  const p = getStorePrices()['coin_' + id];
  return p || 'Price TBA';
}

const RANKS = [
  { id: 'vip', name: 'VIP', icon: '⚡', perks: ['Custom prefix [VIP]', 'Access to /fly', 'Color chat', '2x XP boost', 'VIP kit daily'] },
  { id: 'elite', name: 'Elite', icon: '🌊', perks: ['Custom prefix [Elite]', 'All VIP perks', '/nick command', '3x XP boost', 'Elite kit daily', 'Priority queue'], featured: true },
  { id: 'legend', name: 'Legend', icon: '🔥', perks: ['Custom prefix [Legend]', 'All Elite perks', 'Custom join message', '5x XP boost', 'Legend kit daily', 'Private warp'] },
  { id: 'aero', name: 'Aero', icon: '✈', perks: ['Custom prefix [Aero]', 'All Legend perks', 'Staff-like commands', '10x XP boost', 'Aero kit daily', 'Custom particle trail', 'Exclusive AeroMC badge'] },
];

const COINS = [
  { id: 'c500', amount: '500', icon: '🪙' },
  { id: 'c1000', amount: '1,000', icon: '💰' },
  { id: 'c2500', amount: '2,500', icon: '💎' },
  { id: 'c5000', amount: '5,000', icon: '👑' },
];

let pendingPurchase = null;

// Render ranks
function renderRanks() {
  const grid = document.getElementById('ranksGrid');
  grid.innerHTML = RANKS.map(r => `
    <div class="rank-card ${r.featured ? 'featured' : ''}" onclick="buyItem('rank', '${r.id}', '${r.name} Rank', '${getRankPrice(r.id)}')">
      <div class="rank-icon">${r.icon}</div>
      <div class="rank-name">${r.name}</div>
      <div class="rank-price">${getRankPrice(r.id)} <span>/ one-time</span></div>
      <ul class="rank-perks">${r.perks.map(p => `<li>${p}</li>`).join('')}</ul>
      <button class="btn btn-primary" style="width:100%">Buy ${r.name}</button>
    </div>
  `).join('');
}

// Render coins
function renderCoins() {
  const grid = document.getElementById('coinsGrid');
  grid.innerHTML = COINS.map(c => `
    <div class="coin-card" onclick="buyItem('coins', '${c.id}', '${c.amount} AeroMC Coins', '${getCoinPrice(c.id)}')">
      <div class="coin-icon">${c.icon}</div>
      <div class="coin-amount">${c.amount}</div>
      <div class="coin-label">AeroMC Coins</div>
      <div class="coin-price">${getCoinPrice(c.id)}</div>
      <button class="btn btn-primary" style="width:100%;margin-top:0.75rem">Buy Now</button>
    </div>
  `).join('');
}

// Auth UI
function updateAuthUI() {
  const user = DB.getCurrentUser();
  const nav = document.getElementById('navAuth');
  if (user) {
    nav.innerHTML = `
      <span style="color:var(--text-muted);font-size:0.85rem">👤 ${user.username}</span>
      <button class="btn btn-outline" onclick="DB.logout();updateAuthUI()">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <button class="btn btn-outline" onclick="openModal('login')">Login</button>
      <button class="btn btn-primary" onclick="openModal('register')">Register</button>
    `;
  }
}

// Modals
function openModal(name) {
  document.getElementById(name + 'Modal').classList.add('active');
}
function closeModal(name) {
  document.getElementById(name + 'Modal').classList.remove('active');
  clearAlerts();
}
function switchModal(from, to) {
  closeModal(from);
  setTimeout(() => openModal(to), 150);
}

function clearAlerts() {
  document.querySelectorAll('.alert').forEach(a => { a.className = 'alert'; a.textContent = ''; });
}

function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'alert ' + type;
}

// Auth handlers
function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!email || !pass) return showAlert('loginAlert', 'Please fill all fields.', 'error');
  const res = DB.login(email, pass);
  if (!res.ok) return showAlert('loginAlert', res.msg, 'error');
  closeModal('login');
  updateAuthUI();
  showToast('Welcome back to AeroMC! 🚀');
}

function handleRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPassword').value;
  if (!username || !email || !pass) return showAlert('registerAlert', 'Please fill all fields.', 'error');
  const res = DB.register(username, email, pass);
  if (!res.ok) return showAlert('registerAlert', res.msg, 'error');
  closeModal('register');
  updateAuthUI();
  showToast('Welcome to AeroMC! ✈');
}

// Purchase
function buyItem(type, id, name, price) {
  const user = DB.getCurrentUser();
  if (!user) {
    openModal('login');
    return;
  }
  pendingPurchase = { type, id, name, price, buyer: user.username };
  document.getElementById('purchaseTitle').textContent = 'Buy ' + name;
  document.getElementById('purchaseDesc').textContent = 'Price: ' + price + ' — Complete your AeroMC purchase';
  document.getElementById('purchaseUsername').value = user.username;
  openModal('purchase');
}

function submitPurchase() {
  const username = document.getElementById('purchaseUsername').value.trim();
  const method = document.getElementById('purchaseMethod').value;
  const txn = document.getElementById('purchaseTxn').value.trim();
  if (!username || !txn) return showToast('Please fill all fields.');
  DB.addOrder({ ...pendingPurchase, username, method, txn });
  closeModal('purchase');
  showToast('Order submitted! AeroMC team will activate your rank shortly. ✈');
  pendingPurchase = null;
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// Init
renderRanks();
renderCoins();
updateAuthUI();
