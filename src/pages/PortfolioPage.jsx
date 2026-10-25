import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { calculateStage1, calculateStage2, calculateValuations } from '../utils/scoringEngine';
import { INITIAL_STOCKS } from '../data/stocksData';
import {
  Bookmark,
  Plus,
  Trash2,
  Edit3,
  ArrowUpRight,
  PieChart,
  Search,
  CheckCircle2,
  FolderPlus,
  TrendingUp,
  Server,
  Folder,
  Layers,
  X,
  Target,
  DollarSign,
  Save,
  RotateCcw
} from 'lucide-react';

export default function PortfolioPage({ allStocks = INITIAL_STOCKS }) {
  const {
    portfolios,
    activePortfolioId,
    activePortfolio,
    setActivePortfolioId,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    addStockToPortfolio,
    updateStockInPortfolio,
    removeStockFromPortfolio,
    clearPortfolio,
    backendConnected
  } = usePortfolio();

  const navigate = useNavigate();

  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortName, setNewPortName] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

  const [showEditPortfolioModal, setShowEditPortfolioModal] = useState(false);
  const [editPortName, setEditPortName] = useState('');
  const [editPortDesc, setEditPortDesc] = useState('');

  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [selectedStockToAdd, setSelectedStockToAdd] = useState(null);
  const [stockBuyPrice, setStockBuyPrice] = useState('');
  const [stockTargetPrice, setStockTargetPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [stockConviction, setStockConviction] = useState('High (50% Tier)');
  const [stockNotes, setStockNotes] = useState('');

  // Edit individual stock state
  const [editingStock, setEditingStock] = useState(null);
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editTargetPrice, setEditTargetPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('10');
  const [editConviction, setEditConviction] = useState('High (50% Tier)');
  const [editNotes, setEditNotes] = useState('');

  const formatNum = (val, prefix = '₹ ') => {
    if (val === undefined || val === null || isNaN(val) || val === '') return '-';
    return `${prefix}${Number(val).toLocaleString()}`;
  };

  // Match stocks in the active portfolio to evaluation engine
  const currentStocksWithAnalysis = (activePortfolio?.stocks || []).map(item => {
    const matched = allStocks.find(s => s.ticker === item.ticker) || {
      ticker: item.ticker,
      name: item.name || item.ticker,
      sector: item.sector || 'NSE / BSE Listed',
      currentPrice: item.currentPrice || item.buyPrice || 100,
      pe: 22,
      industryPE: 20,
      roce: 20,
      roce5Y: 18,
      roe: 20,
      roe5Y: 18,
      salesGrowth1Y: 15,
      salesGrowth5Y: 12,
      profitGrowth1Y: 18,
      profitGrowth5Y: 15,
      opm1Y: 20,
      opm5Y: 18,
      debtToEquity: 0.2,
      currentRatio: 2.2,
      interestCoverage: 12,
      roa1Y: 14,
      roa5Y: 12,
      marketCap: 15000,
      eps: Math.round((item.buyPrice || 100) / 22)
    };

    const s1 = calculateStage1(matched);
    const s2 = calculateStage2(matched);
    const val = calculateValuations(matched);
    const totalScore = (s1.totalScore + s2.totalScore).toFixed(1);

    const buyPrice = Number(item.buyPrice) || matched.currentPrice || 100;
    const currentPrice = Number(item.currentPrice) || matched.currentPrice || buyPrice;
    const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 10;
    const investedAmount = buyPrice * qty;
    const currentAmount = currentPrice * qty;
    const profitLoss = currentAmount - investedAmount;
    const profitLossPct = investedAmount > 0 ? ((profitLoss / investedAmount) * 100).toFixed(1) : '0.0';

    return {
      ...item,
      fullStock: matched,
      buyPrice,
      currentPrice,
      quantity: qty,
      investedAmount,
      currentAmount,
      profitLoss,
      profitLossPct,
      stage1Score: s1.totalScore.toFixed(1),
      stage2Score: s2.totalScore.toFixed(1),
      totalScore,
      valuations: val
    };
  });

  // Calculate Portfolio Totals
  const totalInvested = currentStocksWithAnalysis.reduce((acc, s) => acc + s.investedAmount, 0);
  const totalCurrent = currentStocksWithAnalysis.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : '0.00';
  const avgScore = currentStocksWithAnalysis.length > 0
    ? (currentStocksWithAnalysis.reduce((acc, s) => acc + parseFloat(s.totalScore), 0) / currentStocksWithAnalysis.length).toFixed(1)
    : '0.0';

  // Handle Create Portfolio
  const handleCreatePortfolioSubmit = (e) => {
    e.preventDefault();
    if (!newPortName.trim()) return;
    createPortfolio(newPortName, newPortDesc);
    setNewPortName('');
    setNewPortDesc('');
    setShowCreateModal(false);
  };

  // Handle Edit Active Portfolio Submit
  const handleEditPortfolioSubmit = (e) => {
    e.preventDefault();
    if (!editPortName.trim()) return;
    updatePortfolio(activePortfolio.id, { name: editPortName, description: editPortDesc });
    setShowEditPortfolioModal(false);
  };

  // Stock Search Filtering
  const filteredSearchStocks = stockSearchQuery.trim()
    ? allStocks.filter(s =>
        s.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        s.ticker.toLowerCase().includes(stockSearchQuery.toLowerCase())
      ).slice(0, 6)
    : allStocks.slice(0, 6);

  const handleSelectStockForAdding = (s) => {
    setSelectedStockToAdd(s);
    setStockSearchQuery(s.ticker);
    setStockBuyPrice(s.currentPrice ? String(s.currentPrice) : '100');
    setStockTargetPrice(s.currentPrice ? String(Math.round(s.currentPrice * 1.25)) : '125');
  };

  // Handle Add Stock Submit
  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    const ticker = (selectedStockToAdd ? selectedStockToAdd.ticker : stockSearchQuery.trim()).toUpperCase();
    if (!ticker) return;

    const buyPrice = Number(stockBuyPrice) || (selectedStockToAdd?.currentPrice || 100);
    const targetPrice = Number(stockTargetPrice) || Math.round(buyPrice * 1.25);
    const quantity = Number(stockQuantity) > 0 ? Number(stockQuantity) : 10;

    addStockToPortfolio(activePortfolio.id, {
      ticker,
      name: selectedStockToAdd ? selectedStockToAdd.name : ticker,
      sector: selectedStockToAdd ? selectedStockToAdd.sector : 'NSE / BSE Listed',
      buyPrice,
      currentPrice: selectedStockToAdd?.currentPrice || buyPrice,
      targetPrice,
      quantity,
      conviction: stockConviction,
      notes: stockNotes
    });

    // Reset & close
    setShowAddStockModal(false);
    setSelectedStockToAdd(null);
    setStockSearchQuery('');
    setStockBuyPrice('');
    setStockTargetPrice('');
    setStockQuantity('10');
    setStockNotes('');
  };

  // Open Edit Modal for a stock
  const openEditStock = (stock) => {
    setEditingStock(stock);
    setEditBuyPrice(String(stock.buyPrice));
    setEditTargetPrice(String(stock.targetPrice || Math.round(stock.buyPrice * 1.25)));
    setEditQuantity(String(stock.quantity));
    setEditConviction(stock.conviction || 'High (50% Tier)');
    setEditNotes(stock.notes || '');
  };

  // Save Edited Stock
  const handleSaveStockEdit = (e) => {
    e.preventDefault();
    if (!editingStock) return;

    updateStockInPortfolio(activePortfolio.id, editingStock.ticker, {
      buyPrice: Number(editBuyPrice) || editingStock.buyPrice,
      targetPrice: Number(editTargetPrice) || editingStock.targetPrice,
      quantity: Number(editQuantity) > 0 ? Number(editQuantity) : 10,
      conviction: editConviction,
      notes: editNotes
    });

    setEditingStock(null);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header & Multiple Portfolio Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              Multi-Portfolio Manager
            </h1>
            <span className="badge badge-accent">
              {portfolios.length} Portfolios
            </span>
            {backendConnected && (
              <span className="badge badge-pass" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                <Server size={11} /> Cloud Backend Synced
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '8px 14px' }}
          >
            <FolderPlus size={15} color="var(--accent-primary)" />
            <span>New Portfolio</span>
          </button>

          <button
            onClick={() => setShowAddStockModal(true)}
            className="btn-primary"
            style={{ fontSize: '12.5px', padding: '8px 16px' }}
          >
            <Plus size={15} />
            <span>Add Stock to "{activePortfolio?.name}"</span>
          </button>
        </div>
      </div>

      {/* Multiple Portfolio Tabs Row (Wrapped neatly) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {portfolios.map((p) => {
          const isActive = p.id === activePortfolioId;
          const count = p.stocks ? p.stocks.length : 0;
          return (
            <button
              key={p.id}
              onClick={() => setActivePortfolioId(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--badge-radius)',
                background: isActive ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Folder size={15} color="currentColor" />
              <span>{p.name}</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: isActive ? '#000' : 'var(--text-dim)',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Portfolio Banner & Metadata */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-secondary)', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {activePortfolio?.name}
              </h2>
              <button
                onClick={() => {
                  setEditPortName(activePortfolio?.name || '');
                  setEditPortDesc(activePortfolio?.description || '');
                  setShowEditPortfolioModal(true);
                }}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Edit portfolio name & strategy"
              >
                <Edit3 size={11} /> <span>Edit</span>
              </button>
              <span className="badge" style={{ background: 'var(--bg-card)', color: 'var(--text-dim)', fontSize: '11px' }}>
                Created: {activePortfolio?.createdAt || '2026-10-11'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '680px' }}>
              {activePortfolio?.description || 'Custom equity allocation portfolio.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStocksWithAnalysis.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Clear all stocks from "${activePortfolio?.name}"?`)) {
                    clearPortfolio(activePortfolio?.id);
                  }
                }}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                title="Remove all stocks from this portfolio"
              >
                <RotateCcw size={13} />
                <span>Clear Stocks</span>
              </button>
            )}

            {portfolios.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${activePortfolio?.name}"?`)) {
                    deletePortfolio(activePortfolio?.id);
                  }
                }}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--danger)' }}
                title="Delete this portfolio"
              >
                <Trash2 size={13} />
                <span>Delete Portfolio</span>
              </button>
            )}
          </div>
        </div>

        {/* Portfolio KPI Summary Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL HOLDINGS</div>
            <div className="num" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {currentStocksWithAnalysis.length} Stocks
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Active in this portfolio</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL CAPITAL INVESTED</div>
            <div className="num" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatNum(totalInvested)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cost basis of holdings</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>CURRENT PORTFOLIO VALUE</div>
            <div className="num" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {formatNum(totalCurrent)}
            </div>
            <div style={{ fontSize: '11px', color: totalPnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700, marginTop: '2px' }}>
              {totalPnl >= 0 ? `+${formatNum(totalPnl)} (+${totalPnlPct}%)` : `${formatNum(totalPnl)} (${totalPnlPct}%)`}
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>AVG EVALUATION SCORE</div>
            <div className="num" style={{ fontSize: '20px', fontWeight: 800, color: parseFloat(avgScore) >= 16 ? 'var(--success)' : 'var(--warning)', marginTop: '2px' }}>
              {avgScore} / 20 Pts
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>10-Pt Gatekeeper + 10-Pt Trend</div>
          </div>
        </div>
      </div>

      {/* Stocks Data Table in Active Portfolio */}
      {currentStocksWithAnalysis.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)' }}>
          <Bookmark size={44} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
            No stocks in "{activePortfolio?.name}" yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', maxWidth: '420px', margin: '6px auto 18px auto' }}>
            Add your shortlisted stocks, set your buy cost and target prices, and track conviction allocations.
          </p>
          <button
            onClick={() => setShowAddStockModal(true)}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '9px 20px', margin: '0 auto' }}
          >
            <Plus size={15} /> Add First Stock to this Portfolio
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-secondary)' }}>Company</th>
                  <th>Sector</th>
                  <th>Current Price</th>
                  <th>Buy Cost</th>
                  <th>Shares &amp; Value</th>
                  <th>Target Price</th>
                  <th>Score (/20)</th>
                  <th>Conviction Tier</th>
                  <th>Research Thesis</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStocksWithAnalysis.map((item) => (
                  <tr key={item.ticker}>
                    <td style={{ position: 'sticky', left: 0, background: 'var(--bg-card)' }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
                        {item.name}
                      </div>
                      <div className="num" style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {item.ticker}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {item.sector}
                    </td>
                    <td>
                      <span className="num" style={{ fontWeight: 700, fontSize: '13.5px' }}>
                        {formatNum(item.currentPrice)}
                      </span>
                    </td>
                    <td>
                      <div className="num" style={{ fontWeight: 600, fontSize: '13px' }}>
                        {formatNum(item.buyPrice)}
                      </div>
                      <div className="num" style={{ fontSize: '10px', color: item.profitLoss >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {item.profitLoss >= 0 ? `+${item.profitLossPct}%` : `${item.profitLossPct}%`}
                      </div>
                    </td>
                    <td>
                      <div className="num" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {item.quantity} shares
                      </div>
                      <div className="num" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {formatNum(item.investedAmount)}
                      </div>
                    </td>
                    <td>
                      <span className="num" style={{ fontWeight: 700, color: 'var(--success)', fontSize: '13.5px' }}>
                        {formatNum(item.targetPrice)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-accent" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                        {item.totalScore} / 20 Pts
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${parseFloat(item.totalScore) >= 16 ? 'badge-pass' : parseFloat(item.totalScore) >= 14 ? 'badge-warn' : 'badge-accent'}`}>
                        {item.conviction || 'High (50% Tier)'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px' }}>
                      {item.notes || 'No thesis notes added'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {/* Edit Stock Button */}
                        <button
                          onClick={() => openEditStock(item)}
                          className="btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '11px' }}
                          title="Edit quantity, price, notes"
                        >
                          <Edit3 size={12} />
                        </button>

                        {/* Open Deep Analysis */}
                        <button
                          onClick={() => navigate(`/company/${item.ticker}`)}
                          className="btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '11px' }}
                          title="Open Deep Analysis"
                        >
                          Analyze <ArrowUpRight size={12} />
                        </button>

                        {/* Delete Stock */}
                        <button
                          onClick={() => removeStockFromPortfolio(activePortfolio.id, item.ticker)}
                          style={{ color: 'var(--danger)', padding: '5px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          title="Remove from this portfolio"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: CREATE NEW PORTFOLIO
      ========================================================= */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Create New Portfolio</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePortfolioSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  PORTFOLIO NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Core Compounders, Smallcap Alpha, Dividend Radar..."
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  STRATEGY &amp; ALLOCATION GOAL
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 50% Capital allocated only to compounders scoring >= 16 points with ROCE > 20%..."
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary" style={{ fontSize: '12.5px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '12.5px' }}>
                  Create Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: EDIT PORTFOLIO NAME & DESCRIPTION
      ========================================================= */}
      {showEditPortfolioModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Edit Portfolio Details</h3>
              </div>
              <button onClick={() => setShowEditPortfolioModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditPortfolioSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  PORTFOLIO NAME
                </label>
                <input
                  type="text"
                  value={editPortName}
                  onChange={(e) => setEditPortName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  STRATEGY &amp; ALLOCATION GOAL
                </label>
                <textarea
                  rows={3}
                  value={editPortDesc}
                  onChange={(e) => setEditPortDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowEditPortfolioModal(false)} className="btn-secondary" style={{ fontSize: '12.5px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '12.5px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD STOCK TO PORTFOLIO
      ========================================================= */}
      {showAddStockModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Add Stock to "{activePortfolio?.name}"
                </h3>
              </div>
              <button onClick={() => setShowAddStockModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit}>
              {/* Search or Pick Stock */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  SEARCH OR ENTER ANY NSE / BSE TICKER
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', padding: '7px 12px', gap: '8px' }}>
                  <Search size={14} color="var(--text-dim)" />
                  <input
                    type="text"
                    placeholder="Type ticker e.g. TCS, RELIANCE, KALYANKJIL, INFY..."
                    value={stockSearchQuery}
                    onChange={(e) => {
                      setStockSearchQuery(e.target.value);
                      setSelectedStockToAdd(null);
                    }}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '13px', width: '100%' }}
                  />
                </div>

                {/* Quick Selection Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {filteredSearchStocks.map(s => (
                    <button
                      key={s.ticker}
                      type="button"
                      onClick={() => handleSelectStockForAdding(s)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: selectedStockToAdd?.ticker === s.ticker ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: selectedStockToAdd?.ticker === s.ticker ? '#000' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {s.ticker} (₹{s.currentPrice})
                    </button>
                  ))}
                </div>
              </div>

              {/* Price, Target & Qty inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                    BUY / COST PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 510"
                    value={stockBuyPrice}
                    onChange={(e) => setStockBuyPrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                    TARGET PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 650"
                    value={stockTargetPrice}
                    onChange={(e) => setStockTargetPrice(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                    QUANTITY / SHARES
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Conviction Tier */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  CONVICTION POSITION TIER
                </label>
                <select
                  value={stockConviction}
                  onChange={(e) => setStockConviction(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                >
                  <option value="High (50% Tier)">High Conviction (50% Capital Weightage) - Score &ge; 16</option>
                  <option value="Medium (25% Tier)">Moderate Conviction (25% Capital Weightage) - Score 14-16</option>
                  <option value="Watchlist">Watchlist / Opportunistic Dip Buy - Score &lt; 14</option>
                </select>
              </div>

              {/* Research Notes */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  RESEARCH NOTES &amp; THESIS
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Market share expansion, disciplined debt reduction, franchise rollout..."
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddStockModal(false)} className="btn-secondary" style={{ fontSize: '12px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '12px' }}>
                  Add to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: EDIT EXISTING STOCK IN PORTFOLIO
      ========================================================= */}
      {editingStock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Edit {editingStock.ticker} Position
                </h3>
              </div>
              <button onClick={() => setEditingStock(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStockEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                    BUY PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editBuyPrice}
                    onChange={(e) => setEditBuyPrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                    TARGET PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editTargetPrice}
                    onChange={(e) => setEditTargetPrice(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                    QUANTITY / SHARES
                  </label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    required
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  CONVICTION POSITION TIER
                </label>
                <select
                  value={editConviction}
                  onChange={(e) => setEditConviction(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
                >
                  <option value="High (50% Tier)">High Conviction (50% Capital Weightage) - Score &ge; 16</option>
                  <option value="Medium (25% Tier)">Moderate Conviction (25% Capital Weightage) - Score 14-16</option>
                  <option value="Watchlist">Watchlist / Opportunistic Dip Buy - Score &lt; 14</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  RESEARCH NOTES &amp; THESIS
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingStock(null)} className="btn-secondary" style={{ fontSize: '12px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '12px' }}>
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
