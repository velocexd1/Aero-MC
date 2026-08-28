let pendingPurchase = null;

async function init() {
  await DB.seedAdmin();
  await renderLogo();
  await renderRanks();
  await renderCoins();
  updateAuthUI();
}

async function renderLogo() {
  const logo = await DB.getLogo();
  const placeholder = document.getElementById('logoPlaceholder');
  const logoImg = document.getElementById('logoImg');
  const footerLogo = document.getElementById('footerLogoImg');
  if (logo) {
    if (placeholder) placeholder.style.display = 'none';
    if (logoImg) { logoImg.src = logo; logoImg.style.display = 'block'; }
    if (footerLogo) { footerLogo.src = logo; footerLogo.style.display = 'inline-block'; }
  } else {
    if (placeholder) placeholder.style.display = 'flex';
    if (logoImg) logoImg.style.display = 'none';
    if (footerLogo) footerLogo.style.display = 'none';
  }
}

async function renderRanks() {
  const [ranks, prices] = await Promise.all([DB.getRanks(), DB.getPrices()]);
  const grid = document.getElementById('ranksGrid');
  if (!ranks.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No ranks available yet.</p>'; return; }
  grid.innerHTML = ranks.map(r => {
    const price = prices['rank_' + r.id] || 'Price TBA';
    return `
    <div class="rank-card ${r.featured ? 'featured' : ''}" onclick="buyItem('rank','${r.id}','${r.name} Rank','${price}')">
      <div class="rank-icon">${r.icon}</div>
      <div class="rank-name">${r.name}</div>
      <div class="rank-price">${price} <span>/ one-time</span></div>
      <ul class="rank-perks">${r.perks.map(p => `<li>${p}</li>`).join('')}</ul>
      <button class="btn btn-primary" style="width:100%">Buy ${r.name}</button>
    </div>`;
  }).join('');
}

async function renderCoins() {
  const [coins, prices] = await Promise.all([DB.getCoins(), DB.getPrices()]);
  const grid = document.getElementById('coinsGrid');
  if (!coins.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No coin packs available yet.</p>'; return; }
  grid.innerHTML = coins.map(c => {
    const price = prices['coin_' + c.id] || 'Price TBA';
    return `
    <div class="coin-card" onclick="buyItem('coins','${c.id}','${c.amount} AeroMC Coins','${price}')">
      <div class="coin-icon">${c.icon}</div>
      <div class="coin-amount">${c.amount}</div>
      <div class="coin-label">AeroMC Coins</div>
      <div class="coin-price">${price}</div>
      <button class="btn btn-primary" style="width:100%;margin-top:0.75rem">Buy Now</button>
    </div>`;
  }).join('');
}

function updateAuthUI() {
  const user = DB.getCurrentUser();
  const nav = document.getElementById('navAuth');
  if (user) {
    nav.innerHTML = `
      <span style="color:var(--text-muted);font-size:0.85rem">👤 ${user.username}</span>
      <button class="btn btn-outline" onclick="DB.logout();updateAuthUI()">Logout</button>`;
  } else {
    nav.innerHTML = `
      <button class="btn btn-outline" onclick="openModal('login')">Login</button>
      <button class="btn btn-primary" onclick="openModal('register')">Register</button>`;
  }
}

function openModal(name) { document.getElementById(name + 'Modal').classList.add('active'); }
function closeModal(name) { document.getElementById(name + 'Modal').classList.remove('active'); clearAlerts(); }
function switchModal(from, to) { closeModal(from); setTimeout(() => openModal(to), 150); }
function clearAlerts() { document.querySelectorAll('.alert').forEach(a => { a.className = 'alert'; a.textContent = ''; }); }
function showAlert(id, msg, type) { const el = document.getElementById(id); el.textContent = msg; el.className = 'alert ' + type; }

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  if (!email || !pass) return showAlert('loginAlert', 'Please fill all fields.', 'error');
  showAlert('loginAlert', 'Logging in...', 'success');
  const res = await DB.login(email, pass);
  if (!res.ok) return showAlert('loginAlert', res.msg, 'error');
  closeModal('login'); updateAuthUI(); showToast('Welcome back to AeroMC! 🚀');
}

async function handleRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const pass     = document.getElementById('regPassword').value;
  if (!username || !email || !pass) return showAlert('registerAlert', 'Please fill all fields.', 'error');
  showAlert('registerAlert', 'Creating account...', 'success');
  const res = await DB.register(username, email, pass);
  if (!res.ok) return showAlert('registerAlert', res.msg, 'error');
  closeModal('register'); updateAuthUI(); showToast('Welcome to AeroMC! ✈');
}

function buyItem(type, id, name, price) {
  if (!DB.getCurrentUser()) { openModal('login'); return; }
  pendingPurchase = { type, id, name, price, buyer: DB.getCurrentUser().username };
  document.getElementById('purchaseTitle').textContent = 'Buy ' + name;
  document.getElementById('purchaseDesc').textContent  = 'Price: ' + price + ' — Complete your AeroMC purchase';
  document.getElementById('purchaseUsername').value    = DB.getCurrentUser().username;
  openModal('purchase');
}

async function submitPurchase() {
  const username = document.getElementById('purchaseUsername').value.trim();
  const method   = document.getElementById('purchaseMethod').value;
  const txn      = document.getElementById('purchaseTxn').value.trim();
  if (!username || !txn) return showToast('Please fill all fields.');
  showToast('Submitting order...');
  await DB.addOrder({ ...pendingPurchase, username, method, txn });
  closeModal('purchase');
  showToast('Order submitted! AeroMC team will activate your rank shortly. ✈');
  pendingPurchase = null;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
});

init();
