import React, { useState, useMemo } from 'react';
import { MULTI_ASSET_DATA } from '../data/stocksData';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Globe,
  Calculator,
  Compass,
  DollarSign,
  Percent,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Scale,
  PieChart,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function MultiAssetPage() {
  const [activeCalc, setActiveCalc] = useState('sip'); // 'sip', 'allocation', 'position', 'inflation', 'cagr'
  const [assetFilter, setAssetFilter] = useState('all'); // 'all', 'Commodity', 'Forex', 'Bonds', 'Crypto'

  // --- Calculator 1: SIP & Lumpsum Compound Calculator ---
  const [calcMode, setCalcMode] = useState('sip'); // 'sip' or 'lumpsum'
  const [sipAmount, setSipAmount] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(14);
  const [sipYears, setSipYears] = useState(15);
  const [stepUpPercent, setStepUpPercent] = useState(10);
  const [adjustInflation, setAdjustInflation] = useState(false);

  // SIP Compound Math with Step-Up
  const sipResult = useMemo(() => {
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = sipYears * 12;
    let totalInvested = 0;
    let maturityValue = 0;
    const yearlyBreakdown = [];

    if (calcMode === 'lumpsum') {
      totalInvested = sipAmount;
      maturityValue = sipAmount * Math.pow(1 + expectedReturn / 100, sipYears);
      for (let y = 1; y <= sipYears; y++) {
        yearlyBreakdown.push({
          year: y,
          invested: totalInvested,
          value: Math.round(sipAmount * Math.pow(1 + expectedReturn / 100, y))
        });
      }
    } else {
      // Monthly SIP with optional Annual Step-Up
      let currentMonthly = sipAmount;
      let runningBalance = 0;

      for (let y = 1; y <= sipYears; y++) {
        for (let m = 1; m <= 12; m++) {
          totalInvested += currentMonthly;
          runningBalance = (runningBalance + currentMonthly) * (1 + monthlyRate);
        }
        yearlyBreakdown.push({
          year: y,
          invested: Math.round(totalInvested),
          value: Math.round(runningBalance)
        });
        currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
      }
      maturityValue = runningBalance;
    }

    const estimatedWealthGain = maturityValue - totalInvested;
    // Inflation adjusted (assuming 6% avg inflation)
    const inflationFactor = Math.pow(1 + 0.06, sipYears);
    const realPurchasingPower = maturityValue / inflationFactor;

    return {
      totalInvested: Math.round(totalInvested),
      estimatedWealthGain: Math.round(estimatedWealthGain),
      maturityValue: Math.round(maturityValue),
      realPurchasingPower: Math.round(realPurchasingPower),
      yearlyBreakdown
    };
  }, [calcMode, sipAmount, expectedReturn, sipYears, stepUpPercent]);

  // --- Calculator 2: Multi-Asset Allocation & Rebalancing Matrix ---
  const [totalCorpus, setTotalCorpus] = useState(2500000); // 25 Lakhs
  const [allocLargeCap, setAllocLargeCap] = useState(40);
  const [allocMidSmall, setAllocMidSmall] = useState(25);
  const [allocGold, setAllocGold] = useState(15);
  const [allocDebt, setAllocDebt] = useState(15);
  const [allocGlobal, setAllocGlobal] = useState(5);

  const totalAllocPct = allocLargeCap + allocMidSmall + allocGold + allocDebt + allocGlobal;

  const allocationTargets = useMemo(() => {
    return [
      { name: 'Large-Cap Bluechips (Core)', pct: allocLargeCap, targetAmt: Math.round(totalCorpus * (allocLargeCap / 100)), role: 'Capital Preservation & Steady Compounding' },
      { name: 'Mid & Small-Cap (Alpha)', pct: allocMidSmall, targetAmt: Math.round(totalCorpus * (allocMidSmall / 100)), role: 'Aggressive High-CAGR Expansion' },
      { name: 'Gold & Bullion (Hedge)', pct: allocGold, targetAmt: Math.round(totalCorpus * (allocGold / 100)), role: 'Inflation Shield & Geopolitical Insurance' },
      { name: 'Debt / Liquid / Arbitrage', pct: allocDebt, targetAmt: Math.round(totalCorpus * (allocDebt / 100)), role: 'Emergency Cushion & Market Crash Dry-Powder' },
      { name: 'Global / US Equities', pct: allocGlobal, targetAmt: Math.round(totalCorpus * (allocGlobal / 100)), role: 'Currency Depreciation & Tech Hedge' }
    ];
  }, [totalCorpus, allocLargeCap, allocMidSmall, allocGold, allocDebt, allocGlobal]);

  // --- Calculator 3: Position Sizing & Risk Management Shield ---
  const [accountCapital, setAccountCapital] = useState(1000000); // 10 Lakhs
  const [riskPerTradePct, setRiskPerTradePct] = useState(1.5); // 1.5%
  const [entryPrice, setEntryPrice] = useState(3400);
  const [stopLossPrice, setStopLossPrice] = useState(3150);
  const [targetPrice, setTargetPrice] = useState(4150);

  const positionSizeResult = useMemo(() => {
    const maxLossRupees = Math.round(accountCapital * (riskPerTradePct / 100));
    const riskPerShare = Math.max(1, entryPrice - stopLossPrice);
    const rewardPerShare = Math.max(0, targetPrice - entryPrice);
    const sharesToBuy = Math.floor(maxLossRupees / riskPerShare);
    const totalTradeCommitment = sharesToBuy * entryPrice;
    const portfolioCapitalPct = Math.round((totalTradeCommitment / accountCapital) * 1000) / 10;
    const expectedProfit = sharesToBuy * rewardPerShare;
    const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : 0;

    return {
      maxLossRupees,
      riskPerShare,
      sharesToBuy,
      totalTradeCommitment,
      portfolioCapitalPct,
      expectedProfit,
      rrRatio
    };
  }, [accountCapital, riskPerTradePct, entryPrice, stopLossPrice, targetPrice]);

  // --- Calculator 4: Inflation & Purchasing Power Decay ---
  const [currentExpense, setCurrentExpense] = useState(1200000); // 12 Lakhs/year
  const [inflationRate, setInflationRate] = useState(6.5);
  const [inflationYears, setInflationYears] = useState(20);

  const inflationResult = useMemo(() => {
    const futureExpense = Math.round(currentExpense * Math.pow(1 + inflationRate / 100, inflationYears));
    const purchasingPowerFactor = (1 / Math.pow(1 + inflationRate / 100, inflationYears)) * 100;
    const corpusNeededAt4Pct = Math.round(futureExpense * 25); // 4% rule corpus

    return {
      futureExpense,
      purchasingPowerFactor: purchasingPowerFactor.toFixed(1),
      corpusNeededAt4Pct
    };
  }, [currentExpense, inflationRate, inflationYears]);

  // --- Calculator 5: CAGR / Annualized Growth ---
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [finalValue, setFinalValue] = useState(450000);
  const [cagrYears, setCagrYears] = useState(7);

  const cagrResult = useMemo(() => {
    if (initialInvestment <= 0 || finalValue <= 0 || cagrYears <= 0) return 0;
    const cagr = (Math.pow(finalValue / initialInvestment, 1 / cagrYears) - 1) * 100;
    return cagr.toFixed(2);
  }, [initialInvestment, finalValue, cagrYears]);

  // Filtered Assets
  const filteredAssets = MULTI_ASSET_DATA.filter(asset => {
    if (assetFilter === 'all') return true;
    return asset.category === assetFilter;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
              Macro Asset Radar &amp; Financial Calculators
            </h1>
            <span className="badge badge-accent">Multi-Instrument Hub</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Commodity benchmarks, sovereign yields, forex risk telemetry, and precision capital allocation calculators
          </p>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: MACRO ASSETS TELEMETRY GRID
      ========================================================= */}
      <div style={{ marginBottom: '28px' }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Macro Assets' },
            { id: 'Commodity', label: '🟡 Commodities (Gold, Silver, Crude)' },
            { id: 'Forex', label: '💱 Forex & Dollar Index (DXY)' },
            { id: 'Bonds', label: '🏛️ Sovereign Bonds & Yields' },
            { id: 'Crypto', label: '⚡ Digital Assets (BTC, ETH)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setAssetFilter(f.id)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--badge-radius)',
                border: assetFilter === f.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: assetFilter === f.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                color: assetFilter === f.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Asset Cards */}
        {/* Asset Cards with Direct Official Portal Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
          {filteredAssets.map((asset) => {
            const isUp = !asset.change.startsWith('-');
            const officialInfo = {
              gold: { url: 'https://www.mcxindia.com/', portal: 'MCX India Official' },
              silver: { url: 'https://www.mcxindia.com/', portal: 'MCX India Official' },
              usdinr: { url: 'https://www.rbi.org.in/', portal: 'RBI Reference Rate' },
              eurinr: { url: 'https://www.rbi.org.in/', portal: 'RBI Reference Rate' },
              crude: { url: 'https://oilprice.com/', portal: 'OilPrice Global' },
              dxy: { url: 'https://www.marketwatch.com/investing/index/dxy', portal: 'MarketWatch DXY' },
              us10y: { url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/', portal: 'US Treasury' },
              btc: { url: 'https://coinmarketcap.com/currencies/bitcoin/', portal: 'CoinMarketCap' },
              eth: { url: 'https://coinmarketcap.com/currencies/ethereum/', portal: 'CoinMarketCap' }
            }[asset.id] || { url: 'https://www.tradingview.com/', portal: 'Global Exchange' };

            return (
              <div
                key={asset.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '18px',
                  borderRadius: 'var(--card-radius)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-accent" style={{ fontSize: '10.5px' }}>{asset.category}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isUp ? 'var(--success)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {asset.change}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
                    {asset.symbol}
                  </h3>

                  <div className="num" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {asset.id === 'btc' || asset.id === 'eth' || asset.id === 'crude'
                      ? `$${asset.price.toLocaleString()}`
                      : asset.id === 'dxy'
                      ? `${asset.price}`
                      : asset.id === 'us10y'
                      ? `${asset.price}%`
                      : `₹${asset.price.toLocaleString()}`}
                    <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 500, marginLeft: '6px' }}>{asset.unit}</span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.45 }}>
                    {asset.description}
                  </p>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>10Y CAGR: </span>
                      <span className="num" style={{ color: 'var(--success)', fontWeight: 700 }}>{asset.cagr10Y}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{asset.sentiment.split('(')[0]}</span>
                    </div>
                  </div>

                  {/* Official External Link Button */}
                  <a
                    href={officialInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '7px 12px',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--badge-radius)'
                    }}
                    title={`Open full official data on ${officialInfo.portal}`}
                  >
                    <span>View on {officialInfo.portal}</span>
                    <ArrowRight size={13} style={{ transform: 'rotate(-45deg)' }} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          SECTION 2: FINANCIAL CALCULATING INSTRUMENTS SUITE
      ========================================================= */}
      <div className="card" style={{ padding: '22px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--card-radius)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              Institutional Financial Instruments &amp; Capital Calculators
            </h2>
          </div>
          <span className="badge badge-accent">Precision Math</span>
        </div>

        {/* Compact Option Box for Calculator Selection (Clean, no horizontal scrolling) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          padding: '12px 16px',
          borderRadius: 'var(--card-radius)',
          border: '1px solid var(--border-color)',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Select Calculator:
            </label>
            <select
              value={activeCalc}
              onChange={(e) => setActiveCalc(e.target.value)}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--badge-radius)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                minWidth: '280px'
              }}
            >
              <option value="sip">📈 SIP &amp; Lumpsum Wealth Compounder</option>
              <option value="allocation">⚖️ Strategic Asset Rebalancing Matrix</option>
              <option value="position">🛡️ Position Sizing &amp; Risk Management Shield</option>
              <option value="inflation">🔥 Inflation &amp; Purchasing Power Decay</option>
              <option value="cagr">📊 CAGR Annualized Return Engine</option>
            </select>
          </div>

          <span className="badge badge-accent" style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 'var(--badge-radius)' }}>
            {activeCalc === 'sip' ? 'Compounding Engine' :
             activeCalc === 'allocation' ? 'Portfolio Rebalancing' :
             activeCalc === 'position' ? 'Capital Risk Shield' :
             activeCalc === 'inflation' ? 'Purchasing Power Decay' : 'Annualized CAGR'}
          </span>
        </div>

        {/* ----------------------------------------------------
            TOOL 1: SIP & LUMPSUM COMPOUND WEALTH CALCULATOR
        ---------------------------------------------------- */}
        {activeCalc === 'sip' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Inputs Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCalcMode('sip')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    background: calcMode === 'sip' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: calcMode === 'sip' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Monthly SIP
                </button>
                <button
                  onClick={() => setCalcMode('lumpsum')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    background: calcMode === 'lumpsum' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: calcMode === 'lumpsum' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  One-Time Lumpsum
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    {calcMode === 'sip' ? 'Monthly Investment Amount:' : 'Lumpsum Deposit:'}
                  </span>
                  <span className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                    ₹{sipAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="500000"
                  step="2000"
                  value={sipAmount}
                  onChange={e => setSipAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Expected Return Rate (CAGR %):</span>
                  <span className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {expectedReturn}%
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="28"
                  step="0.5"
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Time Horizon (Years):</span>
                  <span className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {sipYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={sipYears}
                  onChange={e => setSipYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              {calcMode === 'sip' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Annual Step-Up (% Per Year):</span>
                    <span className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {stepUpPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={stepUpPercent}
                    onChange={e => setStepUpPercent(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Step-up compounds wealth dramatically as your income increases annually.
                  </div>
                </div>
              )}
            </div>

            {/* Results Column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  PROJECTED MATURITY WEALTH
                </div>
                <div className="num" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.5px' }}>
                  ₹{sipResult.maturityValue.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Total Wealth accumulated over {sipYears} years
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '20px 0' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--badge-radius)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Total Invested</div>
                  <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    ₹{sipResult.totalInvested.toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--badge-radius)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Estimated Gain</div>
                  <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
                    +₹{sipResult.estimatedWealthGain.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--badge-radius)', borderLeft: '3px solid var(--warning)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  INFLATION-ADJUSTED PURCHASING POWER (AT 6% CPI)
                </div>
                <div className="num" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  ₹{sipResult.realPurchasingPower.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Equivalent in today's money value after inflation erosion
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TOOL 2: STRATEGIC MULTI-ASSET REBALANCING MATRIX
        ---------------------------------------------------- */}
        {activeCalc === 'allocation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Control: Total Capital */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Total Strategic Portfolio Capital:
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Target allocation sum must equal 100%
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="num" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  ₹{totalCorpus.toLocaleString()}
                </span>
                <input
                  type="number"
                  value={totalCorpus}
                  onChange={e => setTotalCorpus(Number(e.target.value))}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--badge-radius)',
                    padding: '6px 10px',
                    fontSize: '13px',
                    width: '140px'
                  }}
                />
              </div>
            </div>

            {/* Target Breakdown Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Asset Class</th>
                    <th style={{ width: '140px' }}>Target Allocation %</th>
                    <th className="num">Target Corpus (₹)</th>
                    <th>Strategic Role &amp; Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {allocationTargets.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.pct}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (idx === 0) setAllocLargeCap(val);
                              if (idx === 1) setAllocMidSmall(val);
                              if (idx === 2) setAllocGold(val);
                              if (idx === 3) setAllocDebt(val);
                              if (idx === 4) setAllocGlobal(val);
                            }}
                            style={{
                              width: '60px',
                              padding: '4px 6px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--text-main)',
                              fontWeight: 700,
                              textAlign: 'center'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>%</span>
                        </div>
                      </td>
                      <td className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                        ₹{item.targetAmt.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {item.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalAllocPct !== 100 && (
              <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: 'var(--badge-radius)', color: 'var(--warning)', fontSize: '12px', fontWeight: 600 }}>
                ⚠️ Warning: Your total allocation sum is {totalAllocPct}%. Adjust sliders to exactly 100%.
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            TOOL 3: POSITION SIZING & RISK MANAGEMENT SHIELD
        ---------------------------------------------------- */}
        {activeCalc === 'position' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Trade Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Total Account Equity (₹):
                </label>
                <input
                  type="number"
                  value={accountCapital}
                  onChange={e => setAccountCapital(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Max Risk Per Trade (% of Capital):
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={riskPerTradePct}
                  onChange={e => setRiskPerTradePct(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontWeight: 700 }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Institutional rule: Never risk &gt;2.0% on a single position.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Entry (₹)</label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={e => setEntryPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>Stop Loss (₹)</label>
                  <input
                    type="number"
                    value={stopLossPrice}
                    onChange={e => setStopLossPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--success)', display: 'block', marginBottom: '4px' }}>Target (₹)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={e => setTargetPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--success)', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>

            {/* Risk Execution Readout */}
            <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  OPTIMAL POSITION SIZE
                </div>
                <div className="num" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                  {positionSizeResult.sharesToBuy} Shares
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Total Commitment: ₹{positionSizeResult.totalTradeCommitment.toLocaleString()} ({positionSizeResult.portfolioCapitalPct}% of portfolio)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '16px 0' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--badge-radius)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--danger)' }}>Max Rupee Loss at Stop</div>
                  <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--danger)', marginTop: '2px' }}>
                    -₹{positionSizeResult.maxLossRupees.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--badge-radius)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--success)' }}>Expected Profit at Target</div>
                  <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                    +₹{positionSizeResult.expectedProfit.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--badge-radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Risk-to-Reward Ratio:</span>
                <span className="num" style={{ fontSize: '16px', fontWeight: 800, color: Number(positionSizeResult.rrRatio) >= 2.0 ? 'var(--success)' : 'var(--warning)' }}>
                  1 : {positionSizeResult.rrRatio}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TOOL 4: INFLATION & PURCHASING POWER DECAY
        ---------------------------------------------------- */}
        {activeCalc === 'inflation' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Current Annual Lifestyle Expenses (₹):
                </label>
                <input
                  type="number"
                  value={currentExpense}
                  onChange={e => setCurrentExpense(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontWeight: 700 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Average Annual CPI Inflation Rate:</span>
                  <span className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{inflationRate}%</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={inflationRate}
                  onChange={e => setInflationRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Time Horizon (Years):</span>
                  <span className="num" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{inflationYears} Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={inflationYears}
                  onChange={e => setInflationYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  FUTURE ANNUAL EXPENSE TO MAINTAIN IDENTICAL LIFESTYLE
                </div>
                <div className="num" style={{ fontSize: '30px', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
                  ₹{inflationResult.futureExpense.toLocaleString()} / Year
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Due to {inflationRate}% annual compounding price increases
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--badge-radius)', margin: '16px 0' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  PURCHASING POWER RETENTION
                </div>
                <div className="num" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)', marginTop: '2px' }}>
                  {inflationResult.purchasingPowerFactor}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ₹100 today will only buy ₹{inflationResult.purchasingPowerFactor} worth of goods in {inflationYears} years.
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--badge-radius)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Retirement Corpus Needed (4% Safe Withdrawal Rule)</div>
                <div className="num" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  ₹{inflationResult.corpusNeededAt4Pct.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TOOL 5: CAGR ANNUALIZED RETURN ENGINE
        ---------------------------------------------------- */}
        {activeCalc === 'cagr' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Initial Starting Value (₹):
                </label>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={e => setInitialInvestment(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Final / Current Value (₹):
                </label>
                <input
                  type="number"
                  value={finalValue}
                  onChange={e => setFinalValue(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Total Duration (Years):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={cagrYears}
                  onChange={e => setCagrYears(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                COMPOUND ANNUAL GROWTH RATE (CAGR)
              </div>
              <div className="num" style={{ fontSize: '48px', fontWeight: 800, color: 'var(--success)', margin: '12px 0' }}>
                {cagrResult}%
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.5 }}>
                Your capital grew by <strong>{((finalValue / initialInvestment) * 100 - 100).toFixed(1)}% absolute</strong>, compounding at an annualized rate of <strong>{cagrResult}% per year</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
