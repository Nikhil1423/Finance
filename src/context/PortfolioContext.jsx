import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PortfolioContext = createContext();

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

export function PortfolioProvider({ children }) {
  // Load initial portfolios from localStorage or default
  const [portfolios, setPortfolios] = useState(() => {
    try {
      const saved = localStorage.getItem('analysis_portfolios_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse local portfolios', e);
    }
    return DEFAULT_PORTFOLIOS;
  });

  const [activePortfolioId, setActivePortfolioId] = useState(() => {
    try {
      const savedActive = localStorage.getItem('analysis_active_portfolio_id');
      if (savedActive) return savedActive;
    } catch {}
    return 'port-1';
  });

  const [backendConnected, setBackendConnected] = useState(false);

  // Sync with Express backend on initial mount safely
  useEffect(() => {
    async function fetchBackendPortfolios() {
      try {
        const res = await fetch('/api/portfolios');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setBackendConnected(true);
            setPortfolios(prev => {
              const prevHasStocks = prev.some(p => p.stocks && p.stocks.length > 0);
              const backendHasStocks = json.data.some(p => p.stocks && p.stocks.length > 0);
              if (!prevHasStocks && backendHasStocks) {
                return json.data;
              }
              return prev;
            });
            return;
          }
        }
      } catch {
        // Backend offline; continue using localStorage seamlessly
      }
      setBackendConnected(false);
    }
    fetchBackendPortfolios();
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('analysis_portfolios_v2', JSON.stringify(portfolios));
    } catch (e) {
      console.error('Error saving portfolios to localStorage', e);
    }
  }, [portfolios]);

  useEffect(() => {
    try {
      localStorage.setItem('analysis_active_portfolio_id', activePortfolioId);
    } catch {}
  }, [activePortfolioId]);

  // Active portfolio getter
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0] || DEFAULT_PORTFOLIOS[0];

  // Backward-compatible flat portfolio stocks list
  const portfolio = activePortfolio?.stocks || [];

  // Create a new portfolio
  const createPortfolio = async (name, description = '') => {
    const newPort = {
      id: `port-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      stocks: []
    };

    setPortfolios(prev => [...prev, newPort]);
    setActivePortfolioId(newPort.id);

    // Sync to backend if available
    try {
      await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
    } catch {}

    return newPort;
  };

  // Update existing portfolio metadata
  const updatePortfolio = async (id, { name, description }) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        name: name !== undefined ? name.trim() : p.name,
        description: description !== undefined ? description.trim() : p.description
      };
    }));

    try {
      await fetch(`/api/portfolios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
    } catch {}
  };

  // Delete a portfolio
  const deletePortfolio = async (id) => {
    if (portfolios.length <= 1) {
      alert('You must have at least one portfolio.');
      return false;
    }

    setPortfolios(prev => {
      const remaining = prev.filter(p => p.id !== id);
      if (activePortfolioId === id) {
        setActivePortfolioId(remaining[0]?.id || 'port-1');
      }
      return remaining;
    });

    try {
      await fetch(`/api/portfolios/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  };

  // Add stock to a specific portfolio (defaults to active portfolio)
  const addStockToPortfolio = async (targetPortfolioId = activePortfolioId, stockData) => {
    const pId = targetPortfolioId || activePortfolioId;
    const ticker = stockData.ticker.toUpperCase().trim();

    const buyPrice = Number(stockData.buyPrice || stockData.currentPrice) || 0;
    const currentPrice = Number(stockData.currentPrice || stockData.buyPrice) || buyPrice;
    const targetPrice = Number(stockData.targetPrice || stockData.myBuyTarget) || Math.round(buyPrice * 1.25);
    const quantity = Number(stockData.quantity) > 0 ? Number(stockData.quantity) : 10;

    const stockEntry = {
      ticker,
      name: stockData.name || ticker,
      sector: stockData.sector || 'NSE / BSE Listed',
      buyPrice,
      currentPrice,
      targetPrice,
      quantity,
      notes: (stockData.notes || '').trim(),
      conviction: stockData.conviction || 'High (50% Tier)',
      addedAt: new Date().toISOString().split('T')[0]
    };

    setPortfolios(prev => prev.map(p => {
      if (p.id !== pId) return p;
      const existingIdx = p.stocks.findIndex(s => s.ticker === ticker);
      let updatedStocks;
      if (existingIdx >= 0) {
        updatedStocks = [...p.stocks];
        updatedStocks[existingIdx] = { ...updatedStocks[existingIdx], ...stockEntry };
      } else {
        updatedStocks = [...p.stocks, stockEntry];
      }
      return { ...p, stocks: updatedStocks };
    }));

    // Sync to backend
    try {
      await fetch(`/api/portfolios/${pId}/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockEntry)
      });
    } catch {}
  };

  // Update existing stock properties in portfolio (quantity, buyPrice, targetPrice, notes, conviction)
  const updateStockInPortfolio = async (targetPortfolioId = activePortfolioId, ticker, updatedFields) => {
    const pId = targetPortfolioId || activePortfolioId;
    const cleanTicker = ticker.toUpperCase().trim();

    setPortfolios(prev => prev.map(p => {
      if (p.id !== pId) return p;
      return {
        ...p,
        stocks: p.stocks.map(s => {
          if (s.ticker !== cleanTicker) return s;
          return {
            ...s,
            ...updatedFields,
            buyPrice: updatedFields.buyPrice !== undefined ? Number(updatedFields.buyPrice) : s.buyPrice,
            targetPrice: updatedFields.targetPrice !== undefined ? Number(updatedFields.targetPrice) : s.targetPrice,
            quantity: updatedFields.quantity !== undefined ? Number(updatedFields.quantity) : s.quantity
          };
        })
      };
    }));

    // Sync to backend if available
    try {
      await fetch(`/api/portfolios/${pId}/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: cleanTicker, ...updatedFields })
      });
    } catch {}
  };

  // Remove stock from portfolio
  const removeStockFromPortfolio = async (targetPortfolioId = activePortfolioId, ticker) => {
    const pId = targetPortfolioId || activePortfolioId;
    const cleanTicker = ticker.toUpperCase().trim();

    setPortfolios(prev => prev.map(p => {
      if (p.id !== pId) return p;
      return {
        ...p,
        stocks: p.stocks.filter(s => s.ticker !== cleanTicker)
      };
    }));

    try {
      await fetch(`/api/portfolios/${pId}/stocks/${cleanTicker}`, { method: 'DELETE' });
    } catch {}
  };

  // Clear all stocks in portfolio
  const clearPortfolio = async (targetPortfolioId = activePortfolioId) => {
    const pId = targetPortfolioId || activePortfolioId;
    setPortfolios(prev => prev.map(p => {
      if (p.id !== pId) return p;
      return { ...p, stocks: [] };
    }));
  };

  // Backward compatibility helpers
  const addToPortfolio = (stock, notes = '', myBuyTarget = null, conviction = 'High (50% Tier)') => {
    addStockToPortfolio(activePortfolioId, {
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      buyPrice: stock.currentPrice,
      targetPrice: myBuyTarget || Math.round(stock.currentPrice * 1.2),
      notes,
      conviction
    });
  };

  const removeFromPortfolio = (ticker) => {
    removeStockFromPortfolio(activePortfolioId, ticker);
  };

  const isSaved = (ticker) => {
    const clean = ticker.toUpperCase().trim();
    return activePortfolio?.stocks?.some(s => s.ticker === clean) || false;
  };

  const isSavedInAnyPortfolio = (ticker) => {
    const clean = ticker.toUpperCase().trim();
    return portfolios.some(p => p.stocks?.some(s => s.ticker === clean));
  };

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      activePortfolioId,
      activePortfolio,
      portfolio,
      setActivePortfolioId,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
      addStockToPortfolio,
      updateStockInPortfolio,
      removeStockFromPortfolio,
      clearPortfolio,
      addToPortfolio,
      removeFromPortfolio,
      isSaved,
      isSavedInAnyPortfolio,
      backendConnected
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
