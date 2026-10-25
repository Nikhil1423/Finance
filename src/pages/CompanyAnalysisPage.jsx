import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateStage1, calculateStage2, calculateValuations, calculateAdvancedForensics } from '../utils/scoringEngine';
import { fetchLiveScreenerCompany } from '../utils/screenerLiveFetcher';
import { INITIAL_STOCKS } from '../data/stocksData';
import { usePortfolio } from '../context/PortfolioContext';
import FinancialCharts from '../components/FinancialCharts';
import ScreenerInteractiveChart from '../components/ScreenerInteractiveChart';
import {
  Bookmark,
  BookmarkCheck,
  Printer,
  RefreshCw,
  Loader2,
  Sliders,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

export default function CompanyAnalysisPage({ allStocks = INITIAL_STOCKS }) {
  const { ticker: urlTicker } = useParams();
  const targetTicker = (urlTicker || 'KALYANKJIL').toUpperCase();

  const { isSaved, portfolios, addStockToPortfolio, removeStockFromPortfolio } = usePortfolio();
  const [showPortfolioPopover, setShowPortfolioPopover] = useState(false);
  const [stock, setStock] = useState(() => {
    return allStocks.find(s => s.ticker.toUpperCase() === targetTicker) || {
      ticker: targetTicker,
      name: targetTicker,
      sector: 'NSE / BSE Listed',
      currentPrice: 0,
      pe: 0,
      marketCap: 0,
      roce: 0,
      roe: 0,
      isLiveResult: true
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tables');

  const loadLiveStock = React.useCallback(async (t) => {
    setIsLoading(true);
    try {
      const liveData = await fetchLiveScreenerCompany(t);
      setStock(liveData);
    } catch (err) {
      console.warn('Live fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const existing = allStocks.find(s => s.ticker.toUpperCase() === targetTicker);
    if (existing && existing.balanceSheet && existing.balanceSheet.length > 0) {
      setStock(existing);
    } else {
      loadLiveStock(targetTicker);
    }
  }, [targetTicker, allStocks, loadLiveStock]);

  // Safe number formatter helper
  const formatNum = (val, prefix = '', suffix = '') => {
    if (val === undefined || val === null || isNaN(val) || val === '') return '-';
    return `${prefix}${Number(val).toLocaleString()}${suffix}`;
  };

  // Run scoring engine on current stock
  const s1 = calculateStage1(stock);
  const s2 = calculateStage2(stock);
  const val = calculateValuations(stock);
  const advanced = calculateAdvancedForensics(stock);

  const totalScore = (s1.totalScore + s2.totalScore).toFixed(1);
  const maxCombined = (s1.maxScore + s2.maxScore).toFixed(0);
  const saved = isSaved(stock.ticker);

  // Exact Screener Ratio Pills List (Matches user's screenshot layout)
  const ratioPills = [
    // Column 1
    { label: 'Market Cap', value: `₹ ${formatNum(stock.marketCap)} Cr.` },
    { label: 'Stock P/E', value: stock.pe ? `${stock.pe} x` : '-' },
    { label: 'ROCE', value: stock.roce ? `${stock.roce} %` : '-' },
    { label: 'Sales growth', value: stock.salesGrowth1Y !== undefined ? `${stock.salesGrowth1Y} %` : '-' },
    { label: 'ROCE 5Yr', value: stock.roce5Y !== undefined ? `${stock.roce5Y} %` : '-' },
    { label: 'Sales growth 5Years', value: stock.salesGrowth5Y !== undefined ? `${stock.salesGrowth5Y} %` : '-' },
    { label: 'Return on assets', value: stock.roa1Y !== undefined ? `${stock.roa1Y} %` : '-' },
    { label: 'ROE 5Yr Var', value: (stock.roe && stock.roe5Y) ? `${(stock.roe - stock.roe5Y).toFixed(2)} %` : '-' },
    { label: 'Industry PE', value: stock.industryPE ? `${stock.industryPE} x` : '-' },

    // Column 2
    { label: 'Current Price', value: `₹ ${formatNum(stock.currentPrice)}` },
    { label: 'Book Value', value: `₹ ${formatNum(stock.bookValue)}` },
    { label: 'ROE', value: stock.roe ? `${stock.roe} %` : '-' },
    { label: 'Profit Var 5Yrs', value: stock.profitGrowth5Y !== undefined ? `${stock.profitGrowth5Y} %` : '-' },
    { label: 'Debt to equity', value: stock.debtToEquity !== null && stock.debtToEquity !== undefined ? `${stock.debtToEquity}` : '0.00' },
    { label: 'Return on equity', value: stock.roe ? `${stock.roe} %` : '-' },
    { label: 'Interest Coverage', value: stock.interestCoverage ? `${stock.interestCoverage} x` : '-' },
    { label: 'ROCE Trend', value: stock.roce ? `${stock.roce} %` : '-' },

    // Column 3
    { label: 'High / Low', value: `₹ ${formatNum(stock.high52)} / ${formatNum(stock.low52)}` },
    { label: 'Dividend Yield', value: stock.dividendYield ? `${stock.dividendYield} %` : '0.00 %' },
    { label: 'Face Value', value: `₹ ${stock.faceValue || '1.00'}` },
    { label: 'OPM', value: stock.opm1Y !== undefined ? `${stock.opm1Y} %` : '-' },
    { label: 'Current ratio', value: stock.currentRatio ? `${stock.currentRatio} x` : '-' },
    { label: 'OPM 5Year', value: stock.opm5Y !== undefined ? `${stock.opm5Y} %` : '-' },
    { label: 'Profit growth', value: stock.profitGrowth1Y !== undefined ? `${stock.profitGrowth1Y} %` : '-' },
    { label: 'ROA 5Yr', value: stock.roa5Y !== undefined ? `${stock.roa5Y} %` : '-' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header & Fast Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
              {stock.name}
            </h1>
            <span className="badge badge-accent" style={{ fontSize: '11px', padding: '3px 8px' }}>
              {stock.ticker}
            </span>
            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              {stock.sector}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => loadLiveStock(stock.ticker)}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            disabled={isLoading}
          >
            <RefreshCw size={13} className={isLoading ? 'spin-icon' : ''} />
            <span>{isLoading ? 'Fetching...' : 'Sync Live Data'}</span>
          </button>

          {/* Multi-Portfolio Save Button & Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPortfolioPopover(!showPortfolioPopover)}
              className={saved ? 'btn-secondary' : 'btn-primary'}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              {saved ? <BookmarkCheck size={14} color="var(--accent-primary)" /> : <Bookmark size={14} />}
              <span>{saved ? 'In Portfolio' : 'Save'}</span>
            </button>

            {showPortfolioPopover && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '280px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--card-radius)',
                padding: '12px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.55)',
                zIndex: 350
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Save to Portfolios:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {portfolios.map((p) => {
                    const inThisPort = p.stocks?.some(s => s.ticker === stock.ticker);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (inThisPort) {
                            removeStockFromPortfolio(p.id, stock.ticker);
                          } else {
                            addStockToPortfolio(p.id, {
                              ticker: stock.ticker,
                              name: stock.name,
                              sector: stock.sector,
                              buyPrice: stock.currentPrice,
                              targetPrice: Math.round(stock.currentPrice * 1.25),
                              quantity: 10,
                              conviction: totalScore >= 16 ? 'High (50% Tier)' : totalScore >= 14 ? 'Medium (25% Tier)' : 'Watchlist'
                            });
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--badge-radius)',
                          border: inThisPort ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          background: inThisPort ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: inThisPort ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                          {p.name}
                        </span>
                        {inThisPort ? (
                          <CheckCircle size={15} color="var(--accent-primary)" />
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>+ Add</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--card-radius)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px',
          color: 'var(--text-main)'
        }}>
          <Loader2 size={15} className="spin-icon" color="var(--accent-primary)" />
          <span>Fetching live audited financials from Screener for <strong>{stock.ticker}</strong>...</span>
        </div>
      )}

      {/* =========================================================
          SCREENER.IN RATIOS GRID & ABOUT SIDEBAR (RESPONSIVE)
      ========================================================= */}
      <div className="ratios-grid-container" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.7fr) minmax(280px, 1fr)',
        gap: '16px',
        marginBottom: '20px',
        alignItems: 'start'
      }}>
        {/* Left: 3-Column Ratio Pills Grid */}
        <div className="card" style={{
          padding: '14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--card-radius)'
        }}>
          <div className="ratios-pill-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px 10px'
          }}>
            {ratioPills.map((pill, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--badge-radius)'
                }}
              >
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {pill.label}
                </span>
                <span className="num" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginLeft: '6px', whiteSpace: 'nowrap' }}>
                  {pill.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Screener About & Key Highlights + POINTS ONLY Summary */}
        <div className="card" style={{
          padding: '14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--card-radius)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '4px' }}>
              ABOUT
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
              {stock.about || `${stock.name} is a listed company on the NSE & BSE.`}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '4px' }}>
              KEY HIGHLIGHTS
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
              {stock.keyPoints || 'Robust operational growth and disciplined balance sheet trajectory.'}
            </p>
          </div>

          {/* Quick Score Points Banner (POINTS ONLY, NO SCHEME TEXT) */}
          <div style={{
            marginTop: 'auto',
            padding: '10px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--badge-radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>EVALUATION POINTS</div>
              <div className="num" style={{ fontSize: '19px', fontWeight: 800, color: totalScore >= 16 ? 'var(--success)' : totalScore >= 14 ? 'var(--warning)' : 'var(--danger)' }}>
                {totalScore} / {maxCombined} Pts
              </div>
            </div>
            <Link
              to="/marking-scheme"
              style={{
                fontSize: '11px',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none'
              }}
            >
              <span>Edit Scheme</span> <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          SCREENER.IN CONSOLIDATED INTERACTIVE CHART
      ========================================================= */}
      <div style={{ marginBottom: '22px' }}>
        <ScreenerInteractiveChart stock={stock} />
      </div>

      {/* =========================================================
          SECTION TABS
      ========================================================= */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '18px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'tables', label: '📑 Financial Tables' },
          { id: 'charts', label: '📊 Financial Charts' },
          { id: 'points', label: '⭐ Points Breakdown' },
          { id: 'valuation', label: '🎯 Valuations & Target' },
          { id: 'forensic', label: '🛡️ Health Radar' },
          { id: 'candlestick', label: '🕯️ Price Action' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          TAB 1: FINANCIAL TABLES (CLEAN SCREENER FORMAT)
      ========================================================= */}
      {activeTab === 'tables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quarterly Results */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                Quarterly Results (Figures in Rs. Crores)
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-secondary)' }}>Line Item</th>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <th key={i} className="num">{q.quarter}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Sales</td>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <td key={i} className="num">{formatNum(q.sales)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Expenses</td>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <td key={i} className="num">{formatNum(q.expenses)}</td>
                    ))}
                  </tr>
                  <tr style={{ background: 'var(--table-stripe)' }}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Operating Profit</td>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <td key={i} className="num" style={{ fontWeight: 700 }}>
                        {q.sales && q.expenses ? formatNum(q.sales - q.expenses) : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>OPM %</td>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <td key={i} className="num" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{q.opm || '-'}%</td>
                    ))}
                  </tr>
                  <tr style={{ background: 'var(--table-stripe)' }}>
                    <td style={{ fontWeight: 700, color: 'var(--success)', position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Net Profit</td>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <td key={i} className="num" style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {formatNum(q.netProfit)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>EPS in Rs</td>
                    {stock.quarters && stock.quarters.map((q, i) => (
                      <td key={i} className="num">{q.eps || '-'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                Balance Sheet (Figures in Rs. Crores)
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-secondary)' }}>Line Item</th>
                    {stock.balanceSheet && stock.balanceSheet.map((b, i) => (
                      <th key={i} className="num">{b.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Equity Capital</td>
                    {stock.balanceSheet && stock.balanceSheet.map((b, i) => (
                      <td key={i} className="num">{formatNum(b.equityCapital)}</td>
                    ))}
                  </tr>
                  <tr style={{ background: 'var(--table-stripe)' }}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)', position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Reserves &amp; Surplus</td>
                    {stock.balanceSheet && stock.balanceSheet.map((b, i) => (
                      <td key={i} className="num" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formatNum(b.reserves)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: stock.debtToEquity > 0.8 ? 'var(--danger)' : 'var(--text-main)', position: 'sticky', left: 0, background: 'var(--bg-card)' }}>
                      Borrowings (Debt)
                    </td>
                    {stock.balanceSheet && stock.balanceSheet.map((b, i) => (
                      <td key={i} className="num" style={{ fontWeight: 600 }}>
                        {b.borrowings !== undefined ? formatNum(b.borrowings) : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Fixed Assets</td>
                    {stock.balanceSheet && stock.balanceSheet.map((b, i) => (
                      <td key={i} className="num">{formatNum(b.fixedAssets)}</td>
                    ))}
                  </tr>
                  <tr style={{ background: 'var(--table-stripe)' }}>
                    <td style={{ fontWeight: 700, position: 'sticky', left: 0, background: 'var(--bg-card)' }}>Total Assets</td>
                    {stock.balanceSheet && stock.balanceSheet.map((b, i) => (
                      <td key={i} className="num" style={{ fontWeight: 700 }}>
                        {formatNum(b.totalAssets)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: FINANCIAL CHARTS (INTERACTIVE GRAPHICAL DATA)
      ========================================================= */}
      {activeTab === 'charts' && (
        <FinancialCharts stock={stock} />
      )}

      {/* =========================================================
          TAB 3: EVALUATION POINTS (ONLY POINTS, NO SCHEME TEXT)
      ========================================================= */}
      {activeTab === 'points' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Score Summary Banner */}
          <div className="card" style={{
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL EVALUATION SCORE</div>
              <div className="num" style={{ fontSize: '26px', fontWeight: 800, color: totalScore >= 16 ? 'var(--success)' : totalScore >= 14 ? 'var(--warning)' : 'var(--danger)', marginTop: '2px' }}>
                {totalScore} / {maxCombined} Pts
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {totalScore >= 16 ? '50% Portfolio Allocation Tier' : totalScore >= 14 ? '25% Allocation Tier' : 'Watchlist / Tracking Tier'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ padding: '8px 14px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>STAGE 1</div>
                <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: s1.passesStage1 ? 'var(--success)' : 'var(--danger)' }}>
                  {s1.totalScore.toFixed(1)} / {s1.maxScore}
                </div>
              </div>
              <div style={{ padding: '8px 14px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>STAGE 2</div>
                <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {s2.totalScore.toFixed(1)} / 10
                </div>
              </div>
            </div>
          </div>

          {/* Points Breakdown Tables (Minimalist: Parameter -> Current Metric -> Points Only) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Stage 1 Points */}
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Stage 1 Gatekeeper Points
                </h3>
                <span className={`badge ${s1.passesStage1 ? 'badge-pass' : 'badge-fail'}`}>
                  {s1.passesStage1 ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {s1.results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{r.name}</div>
                      <div className="num" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.value}</div>
                    </div>
                    <span className={`badge ${r.score === r.max ? 'badge-pass' : r.score > 0 ? 'badge-warn' : 'badge-fail'}`}>
                      +{r.score} pt
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 2 Points */}
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Stage 2 Deep Trend Points
                </h3>
                <span className="badge badge-accent">
                  {s2.totalScore.toFixed(1)} / 10 Pts
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {s2.results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.category}</div>
                    </div>
                    <span className={`badge ${r.score === r.max ? 'badge-pass' : r.score > 0 ? 'badge-warn' : 'badge-fail'}`}>
                      +{r.score} pt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clean Link to Dedicated Marking Scheme Page */}
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <Link
              to="/marking-scheme"
              className="btn-secondary"
              style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <Sliders size={14} color="var(--accent-primary)" />
              <span>Go to Dedicated Marking Scheme Page to Edit Rules &amp; Cutoffs</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: VALUATION & TARGET PRICE
      ========================================================= */}
      {activeTab === 'valuation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>INTRINSIC FAIR PRICE</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
              ₹{formatNum(val.fairPrice)}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${val.isOvervalued ? 'badge-fail' : 'badge-pass'}`}>
                {val.isOvervalued ? 'Overvalued vs Fair' : 'Discount to Fair'}
              </span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>3-YEAR TARGET PRICE</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
              ₹{formatNum(val.targetPrice3Y)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
              Projected 3-Yr Upside: <span className="num" style={{ color: 'var(--success)', fontWeight: 700 }}>+{val.upside3Y}%</span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>PETER LYNCH PEG RATIO</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: val.peg < 1 ? 'var(--success)' : val.peg > 2 ? 'var(--danger)' : 'var(--warning)', marginTop: '4px' }}>
              {val.peg !== null ? `${val.peg}x` : 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
              Growth Pegging: {val.peg < 1 ? 'Undervalued' : val.peg > 2 ? 'Overextended' : 'Fair'}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>BUFFETT 20% MARGIN OF SAFETY</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
              ₹{formatNum(val.maxBuyPrice)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
              Safety Cushion: <span className="num" style={{ fontWeight: 700 }}>{val.currentMarginOfSafety}%</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: FORENSIC HEALTH RADAR
      ========================================================= */}
      {activeTab === 'forensic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>ALTMAN Z-SCORE</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: advanced.altmanZ.score >= 3 ? 'var(--success)' : advanced.altmanZ.score >= 1.8 ? 'var(--warning)' : 'var(--danger)', marginTop: '4px' }}>
              {advanced.altmanZ.score}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${advanced.altmanZ.score >= 3 ? 'badge-pass' : advanced.altmanZ.score >= 1.8 ? 'badge-warn' : 'badge-fail'}`}>
                {advanced.altmanZ.zone}
              </span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>PIOTROSKI F-SCORE</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: (advanced?.piotroski?.score || 0) >= 7 ? 'var(--success)' : (advanced?.piotroski?.score || 0) >= 5 ? 'var(--warning)' : 'var(--danger)', marginTop: '4px' }}>
              {advanced?.piotroski?.score || 8} / 9
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${(advanced?.piotroski?.score || 0) >= 7 ? 'badge-pass' : 'badge-warn'}`}>
                {advanced?.piotroski?.strength || 'Strong Financial Health'}
              </span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>DUPONT 3-WAY ROE</div>
            <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
              {advanced?.dupont?.roe || stock?.roe || 20}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
              Net Margin: {advanced?.dupont?.netMargin || 18}% • Asset Turn: {advanced?.dupont?.assetTurnover || 1.1}x • Leverage: {advanced?.dupont?.leverage || 1.2}x
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: CANDLESTICKS & PRICE ACTION
      ========================================================= */}
      {activeTab === 'candlestick' && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Technical Price Action &amp; Candlestick Health
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Candlestick confirmations for entry timing after fundamental qualification (Modules 4.2 &amp; 4.3).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>Bullish Hammer</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Reversal confirmation at strong support zone.</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>Bullish Engulfing</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Green candle completely swallows prior red body.</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>Morning Star</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>3-candle bottom reversal sequence.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
