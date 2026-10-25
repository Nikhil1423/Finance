import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Persistent Data Storage Directory
const DATA_DIR = path.join(__dirname, 'data');
const PORTFOLIOS_FILE = path.join(DATA_DIR, 'portfolios.json');
const RULES_FILE = path.join(DATA_DIR, 'rules.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Seed Portfolios
const DEFAULT_PORTFOLIOS = [
  {
    id: 'port-1',
    name: 'Core Compounders (50% Tier)',
    description: 'High-conviction compounders for long-term wealth creation (50% Capital Tier)',
    createdAt: '2026-10-11',
    stocks: [
      {
        ticker: 'KALYANKJIL',
        name: 'Kalyan Jewellers India Ltd',
        sector: 'Consumer Discretionary',
        buyPrice: 510,
        targetPrice: 650,
        quantity: 100,
        notes: 'Accelerating FOCO franchise rollout, ROCE expanding to 21%, PEG < 1.0.',
        conviction: 'High (50% Tier)',
        addedAt: '2026-10-11'
      },
      {
        ticker: 'TCS',
        name: 'Tata Consultancy Services Ltd',
        sector: 'IT Services',
        buyPrice: 3820,
        targetPrice: 4600,
        quantity: 20,
        notes: 'Debt-free compounding machine, ROCE 64%, massive shareholder cash return.',
        conviction: 'High (50% Tier)',
        addedAt: '2026-10-11'
      }
    ]
  },
  {
    id: 'port-2',
    name: 'Growth Alpha (25% Tier)',
    description: 'Fast-growing midcaps with ROCE > 20% and 5-Year profit growth > 15%',
    createdAt: '2026-10-11',
    stocks: [
      {
        ticker: 'DIXON',
        name: 'Dixon Technologies Ltd',
        sector: 'Electronics Mfg',
        buyPrice: 12800,
        targetPrice: 16500,
        quantity: 5,
        notes: 'Leader in electronics EMS, continuous margin expansion from backward integration.',
        conviction: 'Medium (25% Tier)',
        addedAt: '2026-10-11'
      }
    ]
  },
  {
    id: 'port-3',
    name: 'Dip Watchlist & Opportunistic',
    description: 'Screened companies waiting for Buffett 20% Margin of Safety trigger price',
    createdAt: '2026-10-11',
    stocks: [
      {
        ticker: 'TITAN',
        name: 'Titan Company Ltd',
        sector: 'Consumer Discretionary',
        buyPrice: 3300,
        targetPrice: 4200,
        quantity: 0,
        notes: 'Wait for valuation correction near 200 EMA before initial accumulation.',
        conviction: 'Watchlist',
        addedAt: '2026-10-11'
      }
    ]
  }
];

// Helper to read portfolios safely
function readPortfolios() {
  try {
    if (!fs.existsSync(PORTFOLIOS_FILE)) {
      fs.writeFileSync(PORTFOLIOS_FILE, JSON.stringify(DEFAULT_PORTFOLIOS, null, 2));
      return DEFAULT_PORTFOLIOS;
    }
    const data = fs.readFileSync(PORTFOLIOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading portfolios file:', err);
    return DEFAULT_PORTFOLIOS;
  }
}

// Helper to write portfolios safely
function writePortfolios(portfolios) {
  try {
    fs.writeFileSync(PORTFOLIOS_FILE, JSON.stringify(portfolios, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing portfolios file:', err);
    return false;
  }
}

// Helper to read rules safely
function readRules() {
  try {
    if (!fs.existsSync(RULES_FILE)) {
      return null;
    }
    const data = fs.readFileSync(RULES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Helper to write rules safely
function writeRules(rules) {
  try {
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// API ROUTES
// ============================================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AlphaTerminal Masterclass Backend API',
    version: '2.0.0'
  });
});

// 2. Get All Portfolios
app.get('/api/portfolios', (req, res) => {
  const portfolios = readPortfolios();
  res.json({ success: true, count: portfolios.length, data: portfolios });
});

// 3. Create a New Portfolio
app.post('/api/portfolios', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Portfolio name is required' });
  }

  const portfolios = readPortfolios();
  const newPortfolio = {
    id: `port-${Date.now()}`,
    name: name.trim(),
    description: (description || '').trim(),
    createdAt: new Date().toISOString().split('T')[0],
    stocks: []
  };

  portfolios.push(newPortfolio);
  writePortfolios(portfolios);
  res.status(201).json({ success: true, data: newPortfolio });
});

// 4. Update Portfolio Details (Name / Description)
app.put('/api/portfolios/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const portfolios = readPortfolios();
  const index = portfolios.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }

  if (name) portfolios[index].name = name.trim();
  if (description !== undefined) portfolios[index].description = description.trim();

  writePortfolios(portfolios);
  res.json({ success: true, data: portfolios[index] });
});

// 5. Delete a Portfolio
app.delete('/api/portfolios/:id', (req, res) => {
  const { id } = req.params;
  let portfolios = readPortfolios();

  if (portfolios.length <= 1) {
    return res.status(400).json({ success: false, message: 'Cannot delete the only portfolio. Keep at least one.' });
  }

  const filtered = portfolios.filter(p => p.id !== id);
  if (filtered.length === portfolios.length) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }

  writePortfolios(filtered);
  res.json({ success: true, message: 'Portfolio deleted successfully', remaining: filtered.length });
});

// 6. Add a Stock to a Portfolio
app.post('/api/portfolios/:id/stocks', (req, res) => {
  const { id } = req.params;
  const { ticker, name, sector, buyPrice, targetPrice, quantity, notes, conviction } = req.body;

  if (!ticker) {
    return res.status(400).json({ success: false, message: 'Stock ticker is required' });
  }

  const portfolios = readPortfolios();
  const portfolio = portfolios.find(p => p.id === id);

  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }

  const cleanTicker = ticker.toUpperCase().trim();
  const existingStockIndex = portfolio.stocks.findIndex(s => s.ticker === cleanTicker);

  const stockEntry = {
    ticker: cleanTicker,
    name: name || cleanTicker,
    sector: sector || 'NSE / BSE Listed',
    buyPrice: Number(buyPrice) || 0,
    targetPrice: Number(targetPrice) || 0,
    quantity: Number(quantity) || 0,
    notes: (notes || '').trim(),
    conviction: conviction || 'High (50% Tier)',
    addedAt: new Date().toISOString().split('T')[0]
  };

  if (existingStockIndex >= 0) {
    // Update existing stock in this portfolio
    portfolio.stocks[existingStockIndex] = {
      ...portfolio.stocks[existingStockIndex],
      ...stockEntry
    };
  } else {
    // Add new stock
    portfolio.stocks.push(stockEntry);
  }

  writePortfolios(portfolios);
  res.json({ success: true, data: portfolio });
});

// 7. Remove a Stock from a Portfolio
app.delete('/api/portfolios/:id/stocks/:ticker', (req, res) => {
  const { id, ticker } = req.params;
  const portfolios = readPortfolios();
  const portfolio = portfolios.find(p => p.id === id);

  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }

  const cleanTicker = ticker.toUpperCase().trim();
  portfolio.stocks = portfolio.stocks.filter(s => s.ticker !== cleanTicker);

  writePortfolios(portfolios);
  res.json({ success: true, data: portfolio });
});

// 8. Get / Save Custom Marking Scheme Rules
app.get('/api/rules', (req, res) => {
  const rules = readRules();
  res.json({ success: true, data: rules });
});

app.post('/api/rules', (req, res) => {
  const rules = req.body;
  if (!rules) {
    return res.status(400).json({ success: false, message: 'Rules data required' });
  }
  writeRules(rules);
  res.json({ success: true, message: 'Rules saved successfully' });
});

// 9. Macro Rates Telemetry (Live Fallback)
app.get('/api/macro', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'gold', name: 'MCX Gold (10g 24K)', symbol: 'GOLD', price: 76240, change: '+0.85%', category: 'Commodity' },
      { id: 'silver', name: 'MCX Silver (1kg 999)', symbol: 'SILVER', price: 92450, change: '+1.42%', category: 'Commodity' },
      { id: 'usdinr', name: 'USD / INR Forex', symbol: 'USDINR', price: 83.98, change: '+0.04%', category: 'Currency' },
      { id: 'eurinr', name: 'EUR / INR Forex', symbol: 'EURINR', price: 91.82, change: '-0.15%', category: 'Currency' },
      { id: 'btc', name: 'Bitcoin (BTC/USD)', symbol: 'BTC', price: 62840, change: '+2.30%', category: 'Digital Asset' },
      { id: 'eth', name: 'Ethereum (ETH/USD)', symbol: 'ETH', price: 2450, change: '+1.75%', category: 'Digital Asset' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✓ AlphaTerminal Backend Server running on http://localhost:${PORT}`);
});
