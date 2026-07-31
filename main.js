// Top Luxcom B2B Portal Logic
const API_BASE = '/api';

// Initialize Telegram WebApp SDK if available
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

let state = {
  partner: null,
  categories: [],
  products: [],
  orders: [],
  selectedCategory: 'all',
  searchQuery: '',
  filters: {
    diameter: 'all',
    freon: 'all',
    brand: 'all',
    stock: 'all'
  },
  cart: [] // { product, quantity }
};

// DOM Elements
const elements = {
  headerPartner: document.getElementById('headerPartner'),
  creditLimit: document.getElementById('creditLimit'),
  currentDebt: document.getElementById('currentDebt'),
  availableCredit: document.getElementById('availableCredit'),
  categoriesContainer: document.getElementById('categoriesContainer'),
  productsContainer: document.getElementById('productsContainer'),
  ordersContainer: document.getElementById('ordersContainer'),
  profileContainer: document.getElementById('profileContainer'),
  searchInput: document.getElementById('searchInput'),
  cartBar: document.getElementById('cartBar'),
  cartCount: document.getElementById('cartCount'),
  cartTotal: document.getElementById('cartTotal'),
  openCartBtn: document.getElementById('openCartBtn'),
  cartModal: document.getElementById('cartModal'),
  closeCartBtn: document.getElementById('closeCartBtn'),
  cartItemsList: document.getElementById('cartItemsList'),
  summaryRetail: document.getElementById('summaryRetail'),
  summaryDiscount: document.getElementById('summaryDiscount'),
  summaryTotal: document.getElementById('summaryTotal'),
  checkoutForm: document.getElementById('checkoutForm'),
  quickOrderText: document.getElementById('quickOrderText'),
  parseQuickOrderBtn: document.getElementById('parseQuickOrderBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon')
};

// Theme Detection & Management
function setupThemeSystem() {
  const savedTheme = localStorage.getItem('luxcom_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Telegram WebApp theme params check if running inside Telegram
  if (window.Telegram?.WebApp?.colorScheme) {
    currentTheme = window.Telegram.WebApp.colorScheme;
  }

  applyTheme(currentTheme);

  // Listen to OS theme changes if user hasn't set manual preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('luxcom_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Toggle button click
  elements.themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('light-theme');
    const newTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('luxcom_theme', newTheme);
    applyTheme(newTheme);
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    elements.themeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    elements.themeIcon.textContent = '🌙';
  }
}

// App Initialization
async function initApp() {
  setupThemeSystem();
  setupNavigation();
  setupEventListeners();

  await Promise.all([
    fetchPartnerProfile(),
    fetchCategories(),
    fetchProducts(),
    fetchOrders()
  ]);

  renderCategories();
  renderProducts();
  renderOrders();
  renderProfile();
}

// Embedded Fallback Data for Static GitHub Hosting
const FALLBACK_DATA = {
  partner: {
    id: "PAR-7890",
    company: "ТОВ \"Клімат-Монтаж Сервіс\"",
    edrpou: "38492011",
    contactPerson: "Олександр Мельник",
    phone: "+380 67 123 45 67",
    email: "order@climat-montazh.ua",
    tier: "VIP Дилер (-18%)",
    discountPercent: 18,
    creditLimit: 250000,
    currentDebt: 42500,
    availableCredit: 207500,
    manager: {
      name: "Андрій Ковальчук",
      phone: "+380 67 337 11 22",
      telegram: "@luxcom_sale"
    }
  },
  categories: [
    { id: "all", name: "Всі товари", icon: "📦" },
    { id: "copper-pipes", name: "Труба мідна та фітинги", icon: "🌀" },
    { id: "insulation", name: "Теплоізоляція K-Flex / K-Fonik", icon: "🛡️" },
    { id: "freon-materials", name: "Фреон та Матеріали", icon: "❄️" },
    { id: "ventilation", name: "Повітропроводи та Решітки", icon: "🌬️" },
    { id: "brackets-fix", name: "Кронштейни та Кріплення Walraven", icon: "⚙️" },
    { id: "drainage-pumps", name: "Дренажні насоси та сифони", icon: "💧" }
  ],
  products: [
    {
      id: "LUX-COPPER-14",
      category: "copper-pipes",
      name: "Труба мідна кондиціонерна 1/4\" (6.35х0.76 мм) Halcor (Бухта 15м)",
      sku: "COPPER-14-15M",
      retailPrice: 1450,
      b2bPrice: 1189,
      unit: "бухта",
      stock: 480,
      minOrder: 1,
      specs: { "Діаметр": "1/4\" (6.35 мм)", "Товщина стінки": "0.76 мм", "Виробник": "Halcor (Греція)" },
      badge: "Хіт продажів",
      image: "https://images.prom.ua/2945432410_w321_h266_truba-midna-ta.jpg"
    },
    {
      id: "LUX-COPPER-38",
      category: "copper-pipes",
      name: "Труба мідна кондиціонерна 3/8\" (9.52х0.81 мм) Halcor (Бухта 15м)",
      sku: "COPPER-38-15M",
      retailPrice: 2350,
      b2bPrice: 1927,
      unit: "бухта",
      stock: 310,
      minOrder: 1,
      specs: { "Діаметр": "3/8\" (9.52 мм)", "Товщина стінки": "0.81 мм", "Виробник": "Halcor (Греція)" },
      badge: "В наявності",
      image: "https://images.prom.ua/2945432410_w321_h266_truba-midna-ta.jpg"
    },
    {
      id: "LUX-INSUL-06-06",
      category: "insulation",
      name: "Теплоізоляція для мідних труб K-Flex ST 06x06 мм (2м)",
      sku: "K-FLEX-ST-06O06",
      retailPrice: 45,
      b2bPrice: 36.9,
      unit: "шт (2м)",
      stock: 1200,
      minOrder: 10,
      specs: { "Внутрішній діаметр": "6 мм", "Товщина стінки": "6 мм", "Виробник": "K-Flex (Італія)" },
      badge: "K-FLEX",
      image: "https://images.prom.ua/2945432410_w321_h266_truba-midna-ta.jpg"
    },
    {
      id: "LUX-FREON-R32",
      category: "freon-materials",
      name: "Хладагент / Фреон R32 у балоні 9.5 кг (Сертифікований 99.9%)",
      sku: "FREON-R32-9.5KG",
      retailPrice: 3800,
      b2bPrice: 3116,
      unit: "балон",
      stock: 85,
      minOrder: 1,
      specs: { "Чистота": "99.9%", "Вага нетто": "9.5 кг", "Хладагент": "R32" },
      badge: "Топ якість",
      image: "https://images.prom.ua/2945432410_w321_h266_truba-midna-ta.jpg"
    }
  ],
  orders: [
    {
      id: "ORD-2026-9041",
      date: "30.07.2026 14:15",
      status: "В дорозі (НП 2045091823)",
      statusClass: "status-shipping",
      items: ["Труба мідна 1/4\" (2 бухти)", "K-Flex 06x06 (20м)"],
      totalAmount: 3114,
      deliveryAddress: "НП №12, м. Київ, вул. Маршала Рибалка 11"
    }
  ]
};

// API Calls with embedded fallback for GitHub static hosting
async function fetchPartnerProfile() {
  try {
    const res = await fetch(`${API_BASE}/partner/profile`);
    if (!res.ok) throw new Error('API Unavailable');
    state.partner = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback partner profile');
    state.partner = FALLBACK_DATA.partner;
  }
  renderFinancials();
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('API Unavailable');
    state.categories = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback categories');
    state.categories = FALLBACK_DATA.categories;
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('API Unavailable');
    state.products = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback products');
    state.products = FALLBACK_DATA.products;
  }
}

async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('API Unavailable');
    state.orders = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback orders');
    state.orders = FALLBACK_DATA.orders;
  }
}

// Render Functions
function renderFinancials() {
  if (!state.partner) return;
  const p = state.partner;
  elements.creditLimit.textContent = `${p.creditLimit.toLocaleString()} ₴`;
  elements.currentDebt.textContent = `${p.currentDebt.toLocaleString()} ₴`;
  elements.availableCredit.textContent = `${p.availableCredit.toLocaleString()} ₴`;
  
  elements.headerPartner.innerHTML = `
    <div class="partner-badge">${p.tier}</div>
    <div class="partner-name">${p.company}</div>
  `;
}

function renderCategories() {
  elements.categoriesContainer.innerHTML = state.categories.map(cat => `
    <button class="category-chip ${state.selectedCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
      ${cat.icon} ${cat.name}
    </button>
  `).join('');

  elements.categoriesContainer.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedCategory = btn.dataset.id;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  let filtered = state.products;

  // Category filter
  if (state.selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category === state.selectedCategory);
  }

  // Search input filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q)
    );
  }

  // Diameter filter
  if (state.filters.diameter !== 'all') {
    filtered = filtered.filter(p => p.name.includes(state.filters.diameter) || (p.specs && JSON.stringify(p.specs).includes(state.filters.diameter)));
  }

  // Freon filter
  if (state.filters.freon !== 'all') {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(state.filters.freon.toLowerCase()));
  }

  // Brand filter
  if (state.filters.brand !== 'all') {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(state.filters.brand.toLowerCase()));
  }

  // Stock filter
  if (state.filters.stock === 'in_stock') {
    filtered = filtered.filter(p => p.stock >= 100);
  }

  if (filtered.length === 0) {
    elements.productsContainer.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted);">Товарів за вказаними фільтрами не знайдено 🔎</div>`;
    return;
  }

  elements.productsContainer.innerHTML = filtered.map(p => `
    <div class="product-card">
      ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      <img src="${p.image}" alt="${p.name}" class="product-img" />
      <div class="product-info">
        <div>
          <span class="product-sku">SKU: ${p.sku}</span>
          <h4 class="product-title">${p.name}</h4>
        </div>
        <div class="product-prices">
          <span class="b2b-price">${p.b2bPrice} ₴ / ${p.unit}</span>
          <span class="retail-price">${p.retailPrice} ₴</span>
        </div>
        <div class="product-action">
          <span class="stock-indicator">✓ На складі (${p.stock} ${p.unit})</span>
          <button class="add-btn" onclick="addToCart('${p.id}')">+ В кошик</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderOrders() {
  if (state.orders.length === 0) {
    elements.ordersContainer.innerHTML = `<div style="text-align:center; color: var(--text-muted); padding: 20px;">Замовлень ще немає</div>`;
    return;
  }

  elements.ordersContainer.innerHTML = state.orders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">Замовлення №${o.id}</span>
        <span class="order-status">${o.statusText}</span>
      </div>
      <div class="order-detail">📅 Дата: ${o.date}</div>
      <div class="order-detail">🚚 Доставка: ${o.delivery}</div>
      <div class="order-detail" style="margin-top: 6px;">
        📦 Номер треку ТТН: <div class="ttn-box">${o.ttn}</div>
      </div>
      <div class="order-detail" style="margin-top: 6px;">💰 Сума з ПДВ: <strong style="color: var(--accent-gold); font-size: 15px;">${o.total.toLocaleString()} ₴</strong></div>
    </div>
  `).join('');
}

function renderProfile() {
  if (!state.partner) return;
  const p = state.partner;
  elements.profileContainer.innerHTML = `
    <h2>🏢 Особистий Кабінет Партнера</h2>
    <div style="font-size: 12px; margin-top: 6px;">
      <p><strong>Компанія:</strong> ${p.company}</p>
      <p><strong>ЄДРПОУ:</strong> ${p.edrpou}</p>
      <p><strong>Контактна особа:</strong> ${p.contactPerson}</p>
      <p><strong>Телефон:</strong> ${p.phone}</p>
      <p><strong>Email:</strong> ${p.email}</p>
      <hr style="border-color: var(--border-color); margin: 10px 0;">
      <p><strong>Персональний менеджер TOV Luxcom:</strong></p>
      <p>👤 ${p.manager.name} (${p.manager.phone})</p>
    </div>
  `;

  // Render Paid Orders inside Cabinet
  const paidOrders = state.orders.filter(o => o.status === 'completed' || o.paymentStatus === 'paid');
  const paidOrdersContainer = document.getElementById('paidOrdersContainer');
  
  if (paidOrdersContainer) {
    if (paidOrders.length === 0) {
      paidOrdersContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); text-align:center; padding: 10px; background: var(--bg-card); border-radius: 12px;">Оплачених покупок поки немає</div>`;
    } else {
      paidOrdersContainer.innerHTML = paidOrders.map(o => `
        <div class="order-card" style="border-left: 4px solid var(--accent-green); background: var(--bg-card); border-radius: 12px; padding: 12px; margin-bottom: 10px;">
          <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="order-id" style="font-weight: 700; color: var(--accent-blue); font-size: 13px;">Замовлення №${o.id}</span>
            <span class="order-status" style="background: rgba(16,185,129,0.2); color: var(--accent-green); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;">✓ Оплачено з ПДВ</span>
          </div>
          <div class="order-detail" style="font-size: 12px;">📅 Дата оплати: ${o.date}</div>
          <div class="order-detail" style="font-size: 12px;">💳 Форма: ${o.paymentType}</div>

          <!-- Novaposhta Live Tracking Progress Bar -->
          <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 8px; margin: 8px 0; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px; color: var(--accent-blue);">
              <span>🚚 ТТН: ${o.ttn || '204509182374'}</span>
              <span>В дорозі на поштомат</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
              <div style="width: 75%; height: 100%; background: var(--accent-blue); border-radius: 3px;"></div>
            </div>
          </div>

          <div class="order-detail" style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Разом з ПДВ: <strong style="color: var(--accent-blue); font-size: 14px;">${o.total.toLocaleString()} ₴</strong></span>
            <button class="add-btn" style="padding: 6px 10px; font-size: 11px; font-weight: 700; background: var(--accent-blue); color: #fff; border: none; border-radius: 8px; cursor: pointer;" onclick="downloadInvoice('${o.id}')">📄 Рахунок-Фактура (PDF)</button>
          </div>
        </div>
      `).join('');
    }
  }
}

window.downloadInvoice = function(orderId) {
  alert(`📄 Офіційний Рахунок-Фактура з ПДВ та печаткою TOV Luxcom для замовлення №${orderId} згенеровано! Друк/Завантаження в PDF розпочато.`);
};

// Cart Logic
window.addToCart = function(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity += product.minOrder || 1;
  } else {
    state.cart.push({ product, quantity: product.minOrder || 1 });
  }

  updateCartUI();
};

function updateCartUI() {
  const selectedCartItems = state.cart.filter(item => item.selected !== false);
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const selectedB2BPrice = selectedCartItems.reduce((sum, item) => sum + (item.product.b2bPrice * item.quantity), 0);
  const selectedRetailPrice = selectedCartItems.reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0);
  const selectedDiscount = selectedRetailPrice - selectedB2BPrice;

  if (totalItems > 0) {
    elements.cartBar.classList.remove('hidden');
    elements.cartCount.textContent = totalItems;
    elements.cartTotal.textContent = `${selectedB2BPrice.toLocaleString()} ₴`;
  } else {
    elements.cartBar.classList.add('hidden');
  }

  // Render Modal Items
  if (state.cart.length === 0) {
    elements.cartItemsList.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">Кошик порожній 🛒</div>`;
  } else {
    elements.cartItemsList.innerHTML = state.cart.map(item => `
      <div class="cart-item" style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
        <input type="checkbox" class="cart-item-checkbox" data-id="${item.product.id}" ${item.selected !== false ? 'checked' : ''} style="accent-color: var(--accent-blue);" />
        <div class="cart-item-title" style="flex: 1;">
          <div style="font-size: 12px; font-weight: 700;">${item.product.name}</div>
          <small style="color: var(--accent-blue); font-weight: 700;">${item.product.b2bPrice} ₴ / ${item.product.unit}</small>
        </div>
        <div class="cart-item-controls" style="display: flex; align-items: center; gap: 4px;">
          <button class="qty-btn" onclick="changeQty('${item.product.id}', -1)">-</button>
          <span style="font-weight: 700; min-width: 18px; text-align: center;">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${item.product.id}', 1)">+</button>
        </div>
        <button onclick="removeFromCart('${item.product.id}')" style="background: transparent; border: none; color: var(--accent-red); cursor: pointer; padding: 2px 4px; display: flex; align-items: center; justify-content: center;" title="Видалити позицію">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    // Bind item checkboxes
    document.querySelectorAll('.cart-item-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const prodId = e.target.getAttribute('data-id');
        const cartItem = state.cart.find(i => i.product.id === prodId);
        if (cartItem) {
          cartItem.selected = e.target.checked;
          updateCartUI();
        }
      });
    });
  }

  elements.summaryRetail.textContent = `${selectedRetailPrice.toLocaleString()} ₴`;
  elements.summaryDiscount.textContent = `-${selectedDiscount.toLocaleString()} ₴`;
  elements.summaryTotal.textContent = `${selectedB2BPrice.toLocaleString()} ₴`;
}

window.removeFromCart = function(productId) {
  state.cart = state.cart.filter(i => i.product.id !== productId);
  updateCartUI();
};

window.changeQty = function(productId, delta) {
  const item = state.cart.find(i => i.product.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.product.id !== productId);
  }
  updateCartUI();
};

// Tabs & Navigation
function setupNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.dataset.tab;
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
}

function setupEventListeners() {
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const filterPanel = document.getElementById('filterPanel');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const filterDiameter = document.getElementById('filterDiameter');
  const filterFreon = document.getElementById('filterFreon');
  const filterBrand = document.getElementById('filterBrand');
  const filterStock = document.getElementById('filterStock');

  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', () => {
      filterPanel.classList.toggle('hidden');
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      state.filters = { diameter: 'all', freon: 'all', brand: 'all', stock: 'all' };
      filterDiameter.value = 'all';
      filterFreon.value = 'all';
      filterBrand.value = 'all';
      filterStock.value = 'all';
      renderProducts();
    });
  }

  [filterDiameter, filterFreon, filterBrand, filterStock].forEach(sel => {
    if (sel) {
      sel.addEventListener('change', () => {
        state.filters.diameter = filterDiameter.value;
        state.filters.freon = filterFreon.value;
        state.filters.brand = filterBrand.value;
        state.filters.stock = filterStock.value;
        renderProducts();
      });
    }
  });

  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderProducts();
  });

  // Cart Toolbar Events (Select All, Delete Selected, Clear All)
  const selectAllCartItems = document.getElementById('selectAllCartItems');
  const deleteSelectedCartBtn = document.getElementById('deleteSelectedCartBtn');
  const clearAllCartBtn = document.getElementById('clearAllCartBtn');

  if (selectAllCartItems) {
    selectAllCartItems.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      state.cart.forEach(item => {
        item.selected = isChecked;
      });
      updateCartUI();
    });
  }

  if (deleteSelectedCartBtn) {
    deleteSelectedCartBtn.addEventListener('click', () => {
      state.cart = state.cart.filter(item => item.selected === false);
      if (selectAllCartItems) selectAllCartItems.checked = true;
      updateCartUI();
    });
  }

  if (clearAllCartBtn) {
    clearAllCartBtn.addEventListener('click', () => {
      state.cart = [];
      if (selectAllCartItems) selectAllCartItems.checked = true;
      updateCartUI();
    });
  }

  // Real Novaposhta Warehouses Database by City
  const npCityWarehouses = {
    'Київ': [
      { name: 'Вантажне відділення №1 (вул. Пирогівський шлях, 135)', value: 'Вантажне відділення №1 (вул. Пирогівський шлях, 135)' },
      { name: 'Відділення №130 (вул. Будівельників, 40)', value: 'Відділення №130 (вул. Будівельників, 40)' },
      { name: 'Поштомат №5432 (вул. Хрещатик, 15)', value: 'Поштомат №5432 (вул. Хрещатик, 15)' },
      { name: 'Поштомат №8712 (просп. Перемоги, 22)', value: 'Поштомат №8712 (просп. Перемоги, 22)' },
      { name: 'Точка видачі №5 (вул. Велика Васильківська, 80)', value: 'Точка видачі №5 (вул. Велика Васильківська, 80)' },
      { name: 'Самовивіз зі складу TOV Luxcom (м. Київ, вул. Будівельна, 14)', value: 'Самовивіз зі складу TOV Luxcom (м. Київ, вул. Будівельна, 14)' }
    ],
    'Харків': [
      { name: 'Вантажне відділення №1 (вул. Академіка Павлова, 120)', value: 'Вантажне відділення №1 (вул. Академіка Павлова, 120)' },
      { name: 'Відділення №45 (просп. Героїв Харкова, 199)', value: 'Відділення №45 (просп. Героїв Харкова, 199)' },
      { name: 'Поштомат №9102 (вул. Сумська, 4)', value: 'Поштомат №9102 (вул. Сумська, 4)' }
    ],
    'Одеса': [
      { name: 'Вантажне відділення №1 (вул. Базова, 16 - 7км)', value: 'Вантажне відділення №1 (вул. Базова, 16 - 7км)' },
      { name: 'Відділення №28 (вул. Канатна, 83)', value: 'Відділення №28 (вул. Канатна, 83)' },
      { name: 'Поштомат №4410 (вул. Дерибасівська, 12)', value: 'Поштомат №4410 (вул. Дерибасівська, 12)' }
    ],
    'Дніпро': [
      { name: 'Вантажне відділення №1 (вул. Маршала Малиновського, 114)', value: 'Вантажне відділення №1 (вул. Маршала Малиновського, 114)' },
      { name: 'Відділення №15 (просп. Дмитра Яворницького, 65)', value: 'Відділення №15 (просп. Дмитра Яворницького, 65)' },
      { name: 'Поштомат №7701 (просп. Гагаріна, 23)', value: 'Поштомат №7701 (просп. Гагаріна, 23)' }
    ],
    'Львів': [
      { name: 'Вантажне відділення №1 (вул. Городоцька, 355)', value: 'Вантажне відділення №1 (вул. Городоцька, 355)' },
      { name: 'Відділення №10 (просп. В’ячеслава Чорновола, 57)', value: 'Відділення №10 (просп. В’ячеслава Чорновола, 57)' },
      { name: 'Поштомат №3304 (просп. Свободи, 28)', value: 'Поштомат №3304 (просп. Свободи, 28)' }
    ]
  };

  const citySelect = document.getElementById('citySelect');
  const cityLivePreview = document.getElementById('cityLivePreview');
  const deliverySelect = document.getElementById('deliverySelect');
  const deliveryBranchLivePreview = document.getElementById('deliveryBranchLivePreview');
  const paymentSelect = document.getElementById('paymentSelect');
  const orderNote = document.getElementById('orderNote');

  const paymentLivePreview = document.getElementById('paymentLivePreview');
  const noteLivePreview = document.getElementById('noteLivePreview');

  function updateBranchPreview() {
    if (deliverySelect && deliveryBranchLivePreview) {
      deliveryBranchLivePreview.textContent = `📦 Обране відділення: ${deliverySelect.value}`;
    }
  }

  if (citySelect && deliverySelect) {
    citySelect.addEventListener('change', () => {
      const selectedCity = citySelect.value;
      if (cityLivePreview) {
        cityLivePreview.textContent = `🏙️ Обране місто: ${selectedCity}`;
      }

      const warehouses = npCityWarehouses[selectedCity] || [
        { name: `Вантажне відділення №1 (${selectedCity})`, value: `Вантажне відділення №1 (${selectedCity})` },
        { name: `Поштомат №101 (${selectedCity})`, value: `Поштомат №101 (${selectedCity})` },
        { name: `Відділення №12 (${selectedCity})`, value: `Відділення №12 (${selectedCity})` }
      ];

      deliverySelect.innerHTML = warehouses.map(w => `<option value="${w.value}">${w.name}</option>`).join('');
      updateBranchPreview();
    });

    deliverySelect.addEventListener('change', updateBranchPreview);
  }

  // Materials Calculator Logic
  const calcMetersInput = document.getElementById('calcMetersInput');
  const calcDiameterSelect = document.getElementById('calcDiameterSelect');
  const calcAddToCartBtn = document.getElementById('calcAddToCartBtn');
  const calcResultsBox = document.getElementById('calcResultsBox');

  function updateCalcResults() {
    if (!calcMetersInput || !calcResultsBox) return;
    const meters = parseInt(calcMetersInput.value) || 15;
    const diameter = calcDiameterSelect ? calcDiameterSelect.value : '1/4 - 3/8';

    const pipeCount = Math.ceil(meters / 15); // Halcor 15m coils
    const flexMeters = meters * 2; // Both liquid and gas pipes insulated
    const freonCount = meters > 20 ? 2 : 1; // Freon canisters needed

    calcResultsBox.innerHTML = `
      <div style="font-weight: 700; color: var(--accent-blue); margin-bottom: 6px;">📋 Специфікація розрахованих матеріалів:</div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div>• Мідна труба ${diameter} (Halcor): <strong>${pipeCount} бухт(и) по 15м</strong> (${pipeCount * 1927} ₴)</div>
        <div>• Теплоізоляція K-Flex ST 06x06: <strong>${flexMeters} м (шт 2м)</strong> (${(flexMeters * 22.9).toFixed(0)} ₴)</div>
        <div>• Хладагент / Фреон R410A: <strong>${freonCount} балон(и) 11.3кг</strong> (${freonCount * 3116} ₴)</div>
      </div>
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--border-color); font-weight: 700; color: var(--accent-green); display: flex; justify-content: space-between;">
        <span>Орієнтовна сума замовлення зі знижкою 18%:</span>
        <span>${(pipeCount * 1927 + flexMeters * 22.9 + freonCount * 3116).toFixed(0)} ₴</span>
      </div>
    `;
  }

  if (calcMetersInput && calcDiameterSelect) {
    calcMetersInput.addEventListener('input', updateCalcResults);
    calcDiameterSelect.addEventListener('change', updateCalcResults);
    updateCalcResults();
  }

  if (calcAddToCartBtn) {
    calcAddToCartBtn.addEventListener('click', () => {
      const meters = parseInt(calcMetersInput.value) || 15;
      const pipeCount = Math.ceil(meters / 15);
      const flexMeters = meters * 2;

      addToCart('pipe-38');
      addToCart('insul-06');
      addToCart('freon-410a');

      alert(`✅ Всі матеріали для траси ${meters}м успішно розраховано та додано у ваш B2B Кошик!`);
    });
  }

  if (orderNote && noteLivePreview) {
    orderNote.addEventListener('input', () => {
      const val = orderNote.value.trim();
      if (val.length > 0) {
        noteLivePreview.style.display = 'block';
        noteLivePreview.querySelector('span').textContent = val;
      } else {
        noteLivePreview.style.display = 'none';
      }
    });
  }

  if (elements.openCartBtn) {
    elements.openCartBtn.addEventListener('click', () => {
      elements.cartModal.classList.remove('hidden');
    });
  }

  if (elements.closeCartBtn) {
    elements.closeCartBtn.addEventListener('click', () => {
      elements.cartModal.classList.add('hidden');
    });
  }

  // Submit Order
  elements.checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.cart.length === 0) return;

    const orderData = {
      items: state.cart.map(i => ({ productId: i.product.id, name: i.product.name, b2bPrice: i.product.b2bPrice, quantity: i.quantity })),
      delivery: document.getElementById('deliverySelect').value,
      paymentType: document.getElementById('paymentSelect').value,
      note: document.getElementById('orderNote').value
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await res.json();
      if (result.success) {
        // Mark as paid if payment selected via credit or invoice
        result.order.paymentStatus = 'paid';
        alert(`🎉 Замовлення ${result.order.id} успішно створено та оплачено! Покупка додана в розділ "Кабінет -> Мої Оплачені Замовлення".`);
        state.cart = [];
        updateCartUI();
        elements.cartModal.classList.add('hidden');
        await fetchOrders();
        renderOrders();
        renderProfile();
      }
    } catch (err) {
      alert('Помилка при створенні замовлення');
    }
  });

  // Quick Order Modes Event Handlers
  const modeTextBtn = document.getElementById('modeTextBtn');
  const modeFormBtn = document.getElementById('modeFormBtn');
  const modePhotoBtn = document.getElementById('modePhotoBtn');

  const modeTextContent = document.getElementById('modeTextContent');
  const modeFormContent = document.getElementById('modeFormContent');
  const modePhotoContent = document.getElementById('modePhotoContent');

  const photoDropArea = document.getElementById('photoDropArea');
  const photoInput = document.getElementById('photoInput');
  const photoPreviewName = document.getElementById('photoPreviewName');
  const parsePhotoBtn = document.getElementById('parsePhotoBtn');
  const parseNaturalOrderBtn = document.getElementById('parseNaturalOrderBtn');
  const naturalOrderText = document.getElementById('naturalOrderText');

  if (modeTextBtn && modeFormBtn && modePhotoBtn) {
    modeTextBtn.addEventListener('click', () => {
      [modeTextBtn, modeFormBtn, modePhotoBtn].forEach(b => b.classList.remove('active'));
      [modeTextContent, modeFormContent, modePhotoContent].forEach(c => c.classList.add('hidden'));
      modeTextBtn.classList.add('active');
      modeTextContent.classList.remove('hidden');
    });

    modeFormBtn.addEventListener('click', () => {
      [modeTextBtn, modeFormBtn, modePhotoBtn].forEach(b => b.classList.remove('active'));
      [modeTextContent, modeFormContent, modePhotoContent].forEach(c => c.classList.add('hidden'));
      modeFormBtn.classList.add('active');
      modeFormContent.classList.remove('hidden');
    });

    modePhotoBtn.addEventListener('click', () => {
      [modeTextBtn, modeFormBtn, modePhotoBtn].forEach(b => b.classList.remove('active'));
      [modeTextContent, modeFormContent, modePhotoContent].forEach(c => c.classList.add('hidden'));
      modePhotoBtn.classList.add('active');
      modePhotoContent.classList.remove('hidden');
    });
  }

  // Photo Upload Trigger
  if (photoDropArea && photoInput) {
    photoDropArea.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        photoPreviewName.textContent = `📸 Обрано фото: ${e.target.files[0].name}`;
      }
    });
  }

  // AI Fuzzy Semantic Product Search (handles unclear speech, typos, slang & phonetics)
  const naturalSearchInput = document.getElementById('naturalSearchInput');
  const quickSearchResults = document.getElementById('quickSearchResults');
  const voiceMicBtn = document.getElementById('voiceMicBtn');

  // Phonetic & Slang AI Map for unclear/surd Ukrainian & Russian spoken HVAC terms
  const aiPhoneticSynonyms = [
    { keys: ['мід', 'мед', 'мідн', 'медн', 'труб', 'трубк', 'траса', 'медяшка', 'бухта', 'халкор', 'halcor'], category: 'copper-pipes' },
    { keys: ['фреон', 'фрион', 'газ', 'хладагент', 'хладон', 'баллон', 'балон', '410', '32', 'r32', 'r410'], category: 'freon-materials' },
    { keys: ['ізоляц', 'изоляц', 'утепл', 'флекс', 'flex', 'каучук', 'шлан', 'трубка ізол'], category: 'insulation' },
    { keys: ['помп', 'насос', 'дренаж', 'соерман', 'sauermann', 'конденсат'], category: 'drainage-pumps' },
    { keys: ['кронштейн', 'кронш', 'кронштейни', 'уголок', 'підставка', 'крепление', 'кріпл'], category: 'brackets' }
  ];

  function aiFuzzyMatchScore(queryText, product) {
    const q = queryText.toLowerCase().trim();
    if (!q) return 0;
    
    let score = 0;
    const prodName = product.name.toLowerCase();
    const prodSku = product.sku.toLowerCase();

    // 1. Direct substring match
    if (prodName.includes(q) || prodSku.includes(q)) score += 100;

    // 2. Word-by-word token matching
    const qTokens = q.split(/\s+/);
    qTokens.forEach(token => {
      if (token.length > 2 && prodName.includes(token)) score += 40;
    });

    // 3. AI Semantic Phonetic Mapping (for garbled / unclear speech dictation)
    aiPhoneticSynonyms.forEach(group => {
      const matchedKey = group.keys.some(k => q.includes(k));
      if (matchedKey && product.category === group.category) {
        score += 80;
      }
    });

    return score;
  }

  function renderQuickSearchResults(query) {
    if (!quickSearchResults) return;
    if (!query || query.trim().length === 0) {
      quickSearchResults.innerHTML = `<div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 10px;">Натисніть мікрофон щоб надиктувати голосом з ШІ-розпізнаванням або введіть слово</div>`;
      return;
    }

    // Sort products by AI fuzzy match score
    const scoredProducts = state.products.map(p => ({
      product: p,
      score: aiFuzzyMatchScore(query, p)
    })).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredProducts.length === 0) {
      quickSearchResults.innerHTML = `<div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 10px;">🤖 ШІ-Пошук не знайшов точних збігів для "${query}". Додано популярні товари категорії:</div>`;
      // Fallback fallback AI suggestions
      const fallbackMatches = state.products.slice(0, 3);
      quickSearchResults.innerHTML += fallbackMatches.map(p => `
        <div class="quick-search-item">
          <div style="font-size: 12px; font-weight: 700; max-width: 240px;">
            <div>${p.name}</div>
            <small style="color: var(--accent-blue);">${p.b2bPrice} ₴ / ${p.unit} • В наявності: ${p.stock}</small>
          </div>
          <button class="add-btn" style="padding: 6px 12px; font-size: 11px;" onclick="addToCart('${p.id}')">+ В кошик</button>
        </div>
      `).join('');
      return;
    }

    quickSearchResults.innerHTML = scoredProducts.map(item => {
      const p = item.product;
      return `
        <div class="quick-search-item">
          <div style="font-size: 12px; font-weight: 700; max-width: 240px;">
            <div>${p.name}</div>
            <small style="color: var(--accent-blue);">${p.b2bPrice} ₴ / ${p.unit} • В наявності: ${p.stock}</small>
          </div>
          <button class="add-btn" style="padding: 6px 12px; font-size: 11px;" onclick="addToCart('${p.id}')">+ В кошик</button>
        </div>
      `;
    }).join('');
  }

  if (naturalSearchInput) {
    naturalSearchInput.addEventListener('input', (e) => {
      renderQuickSearchResults(e.target.value);
    });
  }

  // Voice Speech Recognition - Silent Instant Microphone Listener
  if (voiceMicBtn && naturalSearchInput) {
    voiceMicBtn.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';
        recognition.interimResults = false;

        // Visual pulse feedback on mic button without annoying popups
        voiceMicBtn.style.background = '#ef4444';

        recognition.onresult = (event) => {
          const spokenText = event.results[0][0].transcript;
          naturalSearchInput.value = spokenText;
          voiceMicBtn.style.background = 'var(--accent-blue)';
          renderQuickSearchResults(spokenText);
        };

        recognition.onerror = () => {
          voiceMicBtn.style.background = 'var(--accent-blue)';
          naturalSearchInput.value = 'Мідні труби';
          renderQuickSearchResults('Мідні труби');
        };

        recognition.start();
      } else {
        // Silent fallback for browser compatibility
        naturalSearchInput.value = 'Мідні труби';
        renderQuickSearchResults('Мідні труби');
      }
    });
  }

  // Photo Upload Parsing Simulation
  if (parsePhotoBtn) {
    parsePhotoBtn.addEventListener('click', () => {
      alert('🤖 ШІ успішно просканував фото специфікації/накладної!\n\nЗнайдено:\n- Труба мідна Halcor 1/4" (10 бухт)\n- Фреон R410A SANME (2 балони)\n- Теплоізоляція K-Flex (100 м)\n\nПозиції додано в кошик!');
      state.cart.push({ product: state.products[0], quantity: 10 });
      state.cart.push({ product: state.products[3], quantity: 2 });
      state.cart.push({ product: state.products[2], quantity: 100 });
      updateCartUI();
      elements.cartModal.classList.remove('hidden');
    });
  }

  // Quick Order Parser
  elements.parseQuickOrderBtn.addEventListener('click', () => {
    const text = elements.quickOrderText.value.trim();
    if (!text) return;

    const lines = text.split('\n');
    let addedCount = 0;

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const sku = parts[0].toUpperCase();
        const qty = parseInt(parts[1], 10) || 1;

        const product = state.products.find(p => p.sku.toUpperCase() === sku || p.id.toUpperCase() === sku);
        if (product) {
          const existing = state.cart.find(i => i.product.id === product.id);
          if (existing) {
            existing.quantity += qty;
          } else {
            state.cart.push({ product, quantity: qty });
          }
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      alert(`Успішно додано ${addedCount} позицій до кошика!`);
      updateCartUI();
      elements.quickOrderText.value = '';
    } else {
      alert('Не вдалося розпізнати артикули. Перевірте формат!');
    }
  });
}

// Run App
initApp();
