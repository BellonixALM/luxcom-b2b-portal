import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'server_data.json');

function getData() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// API Routes
app.get('/api/partner/profile', (req, res) => {
  const data = getData();
  res.json(data.partner);
});

app.get('/api/categories', (req, res) => {
  const data = getData();
  res.json(data.categories);
});

app.get('/api/products', (req, res) => {
  const data = getData();
  const { category, search } = req.query;
  let products = data.products;

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }

  res.json(products);
});

app.get('/api/orders', (req, res) => {
  const data = getData();
  res.json(data.orders);
});

app.post('/api/orders', (req, res) => {
  const data = getData();
  const { items, delivery, paymentType, note, total } = req.body;

  const newOrder = {
    id: `TL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    total: total || items.reduce((sum, item) => sum + (item.b2bPrice * item.quantity), 0),
    status: 'processing',
    statusText: 'Обробляється менеджером',
    ttn: 'Очікує відправки',
    paymentType: paymentType || 'Безготівковий з ПДВ',
    delivery: delivery || 'Нова Пошта',
    itemsCount: items.length,
    items: items
  };

  data.orders.unshift(newOrder);
  saveData(data);

  res.status(201).json({
    success: true,
    message: 'Замовлення успішно створено!',
    order: newOrder
  });
});

// Optional Telegram Bot setup if token is provided
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (BOT_TOKEN) {
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

    bot.sendMessage(chatId, `Вітаємо у **Top Luxcom B2B Portal**! 💡\n\nВи увійшли як партнер: **ТОВ "ЕлектроТех Стандарт"**\nВаша персональна знижка: **-18%**\n\nНатисніть кнопку нижче, щоб відкрити B2B каталог та оформити замовлення.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Відкрити B2B Portal (Web App)',
              web_app: { url: webAppUrl }
            }
          ],
          [
            { text: '📊 Мій Баланс & Ліміт', callback_data: 'check_balance' },
            { text: '📞 Зв\'язок з менеджером', callback_data: 'call_manager' }
          ]
        ]
      }
    });
  });

  bot.on('callback_query', (query) => {
    const data = getData();
    if (query.data === 'check_balance') {
      const p = data.partner;
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(query.message.chat.id, `💼 **Фінансовий стан партнера**\n\n• Компанія: ${p.company}\n• Кредитний ліміт: **${p.creditLimit.toLocaleString()} грн**\n• Поточний борг: **${p.currentDebt.toLocaleString()} грн**\n• Доступно кредиту: **${p.availableCredit.toLocaleString()} грн**\n• Менеджер: ${p.manager.name} (${p.manager.phone})`, { parse_mode: 'Markdown' });
    } else if (query.data === 'call_manager') {
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(query.message.chat.id, `📞 Ваш персональний менеджер **${getData().partner.manager.name}** отримав повідомлення і зателефонує вам протягом 5 хвилин!`);
    }
  });

  console.log('Telegram Bot engine active');
}

app.listen(PORT, () => {
  console.log(`Top Luxcom B2B API Server running on port ${PORT}`);
});
