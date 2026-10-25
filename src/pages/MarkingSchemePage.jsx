import React, { useState, useMemo } from 'react';
import { useRules } from '../context/RulesContext';
import {
  Award,
  Layers,
  Scale,
  TrendingUp,
  Target,
  Calculator,
  RotateCcw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  BookOpen,
  Sliders
} from 'lucide-react';

export default function MarkingSchemePage() {
  const {
    rules,
    updateStage1Cutoff,
    addCustomChecklistItem,
    toggleCustomChecklistItem,
    removeCustomChecklistItem,
    resetToDefault
  } = useRules();

  // View presentation mode: 'blueprint' (Visual Pillars & Cards), 'pipeline' (Step-by-Step Roadmap), 'slides' (Deck Presentation), 'simulator' (Live Sandbox)
  const [activeTab, setActiveTab] = useState('blueprint');
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Custom rule creation state
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRulePoints, setNewRulePoints] = useState('0.5');
  const [savedNotice, setSavedNotice] = useState(false);

  // Live Simulator state for interactive sandbox
  const [simSales1Y, setSimSales1Y] = useState(24);
  const [simSales5Y, setSimSales5Y] = useState(14);
  const [simProfit1Y, setSimProfit1Y] = useState(28);
  const [simProfit5Y, setSimProfit5Y] = useState(16);
  const [simOPM, setSimOPM] = useState(22);
  const [simROE, setSimROE] = useState(24);
  const [simROCE, setSimROCE] = useState(27);
  const [simDE, setSimDE] = useState(0.2);
  const [simCR, setSimCR] = useState(2.3);
  const [simIC, setSimIC] = useState(14);
  const [simStockPE, setSimStockPE] = useState(28);
  const [simIndPE, setSimIndPE] = useState(24);
  const [simROA, setSimROA] = useState(16);

  // Live score calculation for the sandbox
  const simScore = useMemo(() => {
    let pts = 0;
    const breakdown = [];

    // 1. Sales
    let sPts = 0;
    if (simSales1Y > 0 && simSales5Y > 0) sPts += 0.5;
    if (simSales1Y > simSales5Y) sPts += 0.5;
    pts += sPts;
    breakdown.push({ name: 'Sales Growth (1Y vs 5Y)', score: sPts, max: 1.0 });

    // 2. Profit
    let pPts = 0;
    if (simProfit1Y > 0 && simProfit5Y > 0) pPts += 0.5;
    if (simProfit1Y > simProfit5Y) pPts += 0.5;
    pts += pPts;
    breakdown.push({ name: 'Profit Growth (1Y vs 5Y)', score: pPts, max: 1.0 });

    // 3. OPM
    let opmPts = 0;
    if (simOPM >= 15) opmPts += 0.5;
    if (simOPM >= 18) opmPts += 0.5;
    pts += opmPts;
    breakdown.push({ name: 'Operating Margin (OPM %)', score: opmPts, max: 1.0 });

    // 4. ROE
    let roePts = 0;
    if (simROE >= 20) roePts += 0.5;
    else if (simROE >= 10) roePts += 0.25;
    if (simROE > 18) roePts += 0.5;
    pts += roePts;
    breakdown.push({ name: 'Return on Equity (ROE %)', score: roePts, max: 1.0 });

    // 5. ROCE
    let rocePts = 0;
    if (simROCE >= 15) rocePts += 0.5;
    else if (simROCE >= 10) rocePts += 0.25;
    if (simROCE > 20) rocePts += 0.25;
    if (simROCE >= simROE) rocePts += 0.25;
    pts += rocePts;
    breakdown.push({ name: 'ROCE % (Capital Efficiency)', score: rocePts, max: 1.0 });

    // 6. D/E
    let dePts = 0;
    if (simDE < 0.5) dePts = 1.0;
    else if (simDE <= 1.25) dePts = 0.5;
    else dePts = 0;
    pts += dePts;
    breakdown.push({ name: 'Debt-to-Equity (D/E)', score: dePts, max: 1.0 });

    // 7. CR
    let crPts = 0;
    if (simCR >= 2.0) crPts = 1.0;
    else if (simCR >= 1.0) crPts = 0.5;
    else crPts = 0;
    pts += crPts;
    breakdown.push({ name: 'Current Ratio (CR)', score: crPts, max: 1.0 });

    // 8. IC
    let icPts = 0;
    if (simIC >= 10) icPts = 1.0;
    else if (simIC >= 5) icPts = 0.5;
    else if (simIC >= 3) icPts = 0.25;
    else icPts = 0;
    pts += icPts;
    breakdown.push({ name: 'Interest Coverage (IC)', score: icPts, max: 1.0 });

    // 9. PE
    const x = simStockPE / (simIndPE || 1);
    let pePts = 0;
    if (x >= 0.8 && x <= 2.0) pePts = 1.0;
    else if (x <= 2.5) pePts = 0.5;
    else if (x <= 3.0) pePts = 0.25;
    else pePts = 0;
    pts += pePts;
    breakdown.push({ name: 'Stock P/E vs Industry Multiple', score: pePts, max: 1.0 });

    // 10. ROA
    let roaPts = 0;
    if (simROA >= 10) roaPts += 0.5;
    if (simROA >= 14) roaPts += 0.5;
    pts += roaPts;
    breakdown.push({ name: 'Return on Assets (ROA %)', score: roaPts, max: 1.0 });

    return { total: Math.round(pts * 10) / 10, breakdown };
  }, [simSales1Y, simSales5Y, simProfit1Y, simProfit5Y, simOPM, simROE, simROCE, simDE, simCR, simIC, simStockPE, simIndPE, simROA]);

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;
    addCustomChecklistItem(newRuleTitle.trim(), newRulePoints);
    setNewRuleTitle('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Structured Stage 1 Criteria Data grouped into 3 intuitive Thematic Pillars
  const stage1Pillars = [
    {
      pillarTitle: 'Pillar 1: Growth Engine & Margins',
      pillarSubtitle: '3.0 Points | Measures sales momentum and pricing power',
      items: [
        {
          id: 'sales_growth',
          num: 1,
          title: 'Sales Growth (1Y vs 5Y)',
          points: '1.0 Pt',
          formula: 'Both 1Y & 5Y positive (+0.5 pt) + 1Y > 5Y accelerating (+0.5 pt)',
          benchmark: 'Target: >10% | Good: 5-10% | Red Flag: <0%',
          description: 'Checks whether customer demand is actively accelerating today compared to the 5-year baseline. Slowing sales signals market saturation.',
          benchmarkVisual: [
            { label: '<0% Decline', type: 'danger' },
            { label: '5-10% Good', type: 'warning' },
            { label: '>10% Compounding', type: 'success' }
          ]
        },
        {
          id: 'profit_growth',
          num: 2,
          title: 'Profit Growth (1Y vs 5Y)',
          points: '1.0 Pt',
          formula: 'Both 1Y & 5Y positive (+0.5 pt) + 1Y > 5Y accelerating (+0.5 pt)',
          benchmark: 'Target: >15% | Good: 10-15% | Red Flag: <0%',
          description: 'Earnings must compound faster than top-line revenue, proving operational leverage and growing net margins.',
          benchmarkVisual: [
            { label: '<0% Negative', type: 'danger' },
            { label: '10-15% Moderate', type: 'warning' },
            { label: '>15% High Alpha', type: 'success' }
          ]
        },
        {
          id: 'opm',
          num: 3,
          title: 'Operating Profit Margin (OPM %)',
          points: '1.0 Pt',
          formula: '1Y & 5Y ≥ Sector Min (+0.5 pt) + 1Y > 5Y expanding (+0.5 pt)',
          benchmark: 'IT: 22-28% | Pharma: 25-35% | FMCG: 18-25% | Auto: 8-12%',
          description: 'Operating margin measures the company’s moat. A firm that can maintain or expand OPM against inflation has genuine pricing power.',
          benchmarkVisual: [
            { label: 'Below Sector', type: 'danger' },
            { label: 'At Par', type: 'warning' },
            { label: 'Expanding Moat', type: 'success' }
          ]
        }
      ]
    },
    {
      pillarTitle: 'Pillar 2: Capital Productivity',
      pillarSubtitle: '3.0 Points | How efficiently management converts assets and equity into cash',
      items: [
        {
          id: 'roe',
          num: 4,
          title: 'Return on Equity (ROE %) — Buffett Rule',
          points: '1.0 Pt',
          formula: 'ROE ≥ 20% (+0.5 pt, 10-20%: +0.25 pt) + 1Y ROE > 5Y ROE (+0.5 pt)',
          benchmark: 'Exceptional: >25% | Solid: 20-25% | Weak: <10%',
          description: 'Warren Buffett’s favorite indicator. Measures the dollar return generated on each dollar of net shareholder equity.',
          benchmarkVisual: [
            { label: '<10% Dilutive', type: 'danger' },
            { label: '10-20% Acceptable', type: 'warning' },
            { label: '≥20% Buffett Tier', type: 'success' }
          ]
        },
        {
          id: 'roce',
          num: 5,
          title: 'ROCE % (Capital Efficiency & Productive Debt)',
          points: '1.0 Pt',
          formula: 'ROCE ≥ 15% (+0.5 pt) + 1Y > 5Y (+0.25 pt) + ROCE ≥ ROE (+0.25 pt)',
          benchmark: 'ROCE ≥ ROE proves borrowed debt is invested profitably',
          description: 'Crucial sanity check: if ROCE is lower than ROE, it means financial leverage is artificially flattering returns. ROCE ≥ ROE confirms debt generates more than interest cost.',
          benchmarkVisual: [
            { label: '<10% Low Efficiency', type: 'danger' },
            { label: '10-15% Moderate', type: 'warning' },
            { label: '≥15% High Efficiency', type: 'success' }
          ]
        },
        {
          id: 'roa',
          num: 6,
          title: 'Return on Assets (ROA %)',
          points: '1.0 Pt',
          formula: 'ROA ≥ Sector Min (+0.5 pt) + 1Y ROA > 5Y ROA (+0.5 pt)',
          benchmark: 'IT: >20% | FMCG: >15% | Mfg: >8% | Banks: >0.8%',
          description: 'Assesses pure asset utilization speed without skew from capital structure or financing mix.',
          benchmarkVisual: [
            { label: 'Sub-par', type: 'danger' },
            { label: 'Sector Par', type: 'warning' },
            { label: 'Superior Asset Turns', type: 'success' }
          ]
        }
      ]
    },
    {
      pillarTitle: 'Pillar 3: Solvency Fortress & Valuation Gate',
      pillarSubtitle: '4.0 Points | Eliminates balance sheet blowups and irrational valuations',
      items: [
        {
          id: 'de',
          num: 7,
          title: 'Debt-to-Equity (D/E) Ratio',
          points: '1.0 Pt',
          formula: 'D/E < 0.5 (+1.0 pt) | 0.5 - 1.25 (+0.5 pt) | > 1.25 (0 pt / Red Flag)',
          benchmark: 'Fortress: <0.5 | Safe: 0.5-1.0 | Danger: >1.25 (*Banks Exempt)',
          description: 'Zero or low debt protects the investor against bankruptcy during cyclical downturns. (*For Banks and NBFCs, D/E is excluded as deposits are their operational raw material).',
          benchmarkVisual: [
            { label: '>1.25 High Debt 🚩', type: 'danger' },
            { label: '0.5 - 1.25 Safe', type: 'warning' },
            { label: '<0.5 Fortress Clean', type: 'success' }
          ]
        },
        {
          id: 'cr',
          num: 8,
          title: 'Current Ratio (Liquidity Buffer)',
          points: '1.0 Pt',
          formula: 'CR ≥ 2.0x (+1.0 pt) | 1.0 - 2.0x (+0.5 pt) | < 1.0x (0 pt)',
          benchmark: 'Ultra Safe: ≥2.0x | Working Buffer: 1.0-2.0x | Cash Crunch: <1.0x',
          description: 'Measures short-term liquidity. A ratio below 1.0x indicates an imminent cash shortfall to pay off near-term obligations.',
          benchmarkVisual: [
            { label: '<1.0x Cash Crunch 🚩', type: 'danger' },
            { label: '1.0 - 2.0x Good', type: 'warning' },
            { label: '≥2.0x Fortress Buffer', type: 'success' }
          ]
        },
        {
          id: 'ic',
          num: 9,
          title: 'Interest Coverage (IC) Ratio',
          points: '1.0 Pt',
          formula: 'IC ≥ 10x (+1.0 pt) | 5 - 10x (+0.5 pt) | 3 - 5x (+0.25 pt) | < 3x (0 pt)',
          benchmark: 'Bulletproof: ≥10x | Moderate: 5-10x | Default Risk: <3x',
          description: 'Calculates how many times operating EBIT covers interest expense. Companies below 3x suffer devastating profit drops when borrowing costs rise.',
          benchmarkVisual: [
            { label: '<3x Default Risk 🚩', type: 'danger' },
            { label: '3-10x Adequate', type: 'warning' },
            { label: '≥10x Bulletproof', type: 'success' }
          ]
        },
        {
          id: 'pe',
          num: 10,
          title: 'Stock P/E vs Industry Multiple (x)',
          points: '1.0 Pt',
          formula: 'x ∈ [0.8, 2.0] (+1.0 pt) | 2.0 - 2.5 (+0.5 pt) | 2.5 - 3.0 (+0.25 pt) | >3.0 (0 pt)',
          benchmark: 'x = Stock P/E / Industry P/E | Fair: 0.8-2.0x | Overvalued: >3.0x',
          description: 'Prevents buying great businesses at bubble valuations. A multiple higher than 3.0x industry means market euphoria has priced in unrealistic perfection.',
          benchmarkVisual: [
            { label: '>3.0x Bubble 🚩', type: 'danger' },
            { label: '2.0-3.0x Elevated', type: 'warning' },
            { label: '0.8-2.0x Fair Multiple', type: 'success' }
          ]
        }
      ]
    }
  ];

  // Stage 2 Deep Trend 4 Core Diagnostic Pillars
  const stage2Pillars = [
    {
      title: '1. Quarterly Momentum (8 Quarters)',
      score: '2.0 Points',
      color: 'var(--accent-primary)',
      badge: 'Short-term Trajectory',
      rules: [
        { label: 'Sales YoY Expanding across 8 Quarters', pts: '+1.0 Pt', note: 'Consistent quarterly compounding. Fluctuating receives +0.75 pt.' },
        { label: 'OPM YoY Stable or Expanding', pts: '+1.0 Pt', note: 'Protects against raw material price shocks. Constant receives +0.75 pt.' }
      ]
    },
    {
      title: '2. 5-Year P&L Compounding',
      score: '3.0 Points',
      color: 'var(--success)',
      badge: 'Medium-term Durability',
      rules: [
        { label: '5-Year Sales Compounding Consistently', pts: '+1.0 Pt', note: 'Proven organic market share expansion.' },
        { label: '5-Year OPM % Resilient & Maintained', pts: '+1.0 Pt', note: 'No margin decay over full economic cycle.' },
        { label: '5-Year Net Profit & PAT Margin Expansion', pts: '+1.0 Pt', note: 'Bottom line grows at equal or faster clip than revenue.' }
      ]
    },
    {
      title: '3. Balance Sheet Fortress & Cash Conversion',
      score: '2.0 Points',
      color: 'var(--warning)',
      badge: 'Solvency & Cash Flow',
      rules: [
        { label: 'Reserves Expanding & Borrowings Decreasing', pts: '+1.0 Pt', note: 'Deleveraging fortress. Reserves ↑ & Debt Flat: +0.75 pt; Reserves ↑ & Debt ↑: +0.5 pt.' },
        { label: 'CFO Positive & Growing in Lockstep with PAT', pts: '+1.0 Pt', note: 'Accounting profits must convert into bank cash flow. CFO < PAT indicates aggressive accrual.' }
      ]
    },
    {
      title: '4. Working Capital & Clean Ownership',
      score: '3.0 Points',
      color: 'var(--accent-primary)',
      badge: 'Forensics & Governance',
      rules: [
        { label: 'Debtor Days strictly ≤ 120 Days & Declining', pts: '+1.0 Pt', note: '🚩 Critical Red Flag if >120 days. Cash trapped in receivables.' },
        { label: 'ROCE Maintained or Expanding', pts: '+1.0 Pt', note: 'No deterioration in return on capital deployment.' },
        { label: 'Promoters + FII/DII Accumulation & Public ≤ 50%', pts: '+1.0 Pt', note: '🚩 Critical Red Flag if Public Float > 50% (retail dump ground).' }
      ]
    }
  ];

  // Slide Deck content for Slide Mode
  const slideDeck = [
    {
      title: 'Stage 1 vs Stage 2 Investment Architecture',
      subtitle: 'The 20-Point Multi-Stage Gatekeeper Framework',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '22px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>STAGE 1: GATEKEEPER</span>
                <span className="badge badge-warn" style={{ fontSize: '12px' }}>10 Points Total</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                A strict fundamental filter. A company must score at least <strong>6.5 / 10 Points</strong> (or <strong>5.85 / 9.0</strong> for Banks/NBFCs) to qualify. Stocks scoring below this are <strong>immediately rejected</strong>.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                🛡️ Eliminates high-debt traps, eroding margins, and overhyped PE bubbles in seconds.
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '22px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>STAGE 2: DEEP TREND</span>
                <span className="badge badge-pass" style={{ fontSize: '12px' }}>10 Points Total</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                Audits multi-year quarterly and annual filings: 8 quarters of sales and OPM consistency, 5-year balance sheet reserves, cash flow conversion (CFO), debtor days (&le;120), and institutional ownership.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                🔍 Confirms reported accounting profits represent real compounding cash flows.
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '14px' }}>
              PORTFOLIO CONVICTION ALLOCATION MATRIX (COMBINED SCORE / 20)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 'var(--card-radius)', borderLeft: '4px solid var(--success)' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--success)' }}>≥ 16.0 / 20 Points</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>High Conviction (50% Tier)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Core compounders, fortress balance sheet, zero red flags.</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 'var(--card-radius)', borderLeft: '4px solid var(--warning)' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--warning)' }}>14.0 - 15.9 / 20 Points</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>Medium Conviction (25% Tier)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Strong growth with slight multiple or cyclical friction.</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 'var(--card-radius)', borderLeft: '4px solid var(--danger)' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--danger)' }}>&lt; 14.0 Points</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>Tactical Watchlist / Rejection</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Do not initiate. Wait for margin expansion or price drop.</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Stage 1 Gatekeeper Checklist (10 Points)',
      subtitle: 'The 10 Binary Pillars of Fundamental Health',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
          {stage1Pillars.flatMap(p => p.items).map(item => (
            <div key={item.id} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)' }}>#{item.num}. {item.title}</span>
                <span className="badge badge-accent" style={{ fontSize: '11px' }}>{item.points}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '6px' }}>
                {item.formula}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Stage 2 Deep Trend Forensics (10 Points)',
      subtitle: 'Audit 8 Quarters of Momentum and 5-Year Balance Sheet Compounding',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {stage2Pillars.map((p, idx) => (
            <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', borderTop: `3px solid ${p.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>{p.title}</span>
                <span className="badge badge-accent" style={{ fontSize: '11.5px' }}>{p.score}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {p.rules.map((r, rIdx) => (
                  <div key={rIdx} style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{r.label}</span>
                      <span className="num" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)' }}>{r.pts}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{r.note}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Valuation Blueprint & Buffett’s 20% Margin of Safety',
      subtitle: 'Never overpay for growth: Four quantitative anchors',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>ANCHOR 1: INDUSTRY P/E FAIR VALUE</div>
            <div className="num" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 6px 0' }}>
              Fair Price = EPS &times; Industry P/E
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Anchors intrinsic worth to what the industry multiple trades at. If a stock trades significantly above this without exceptional ROCE, it is expensive.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>ANCHOR 2: 3-YEAR TARGET PRICE</div>
            <div className="num" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--accent-primary)', margin: '10px 0 6px 0' }}>
              Target 3Y = EPS &times; (1 + g)&sup3; &times; Target PE
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Projected growth <em>g</em> is conservatively capped at <strong>&frac23; &times; 5-Year Historical Profit Growth</strong> to prevent over-optimistic forecasts.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>ANCHOR 3: PEG RATIO (GARP)</div>
            <div className="num" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 6px 0' }}>
              PEG = Stock P/E / Profit Growth %
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              &lt;1.0: Undervalued growth bargain | 1.0 - 1.5: Fair price | &gt;2.0: Speculative Red Flag.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--success)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>ANCHOR 4: BUFFETT’S 20% MARGIN OF SAFETY</div>
            <div className="num" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--success)', margin: '10px 0 6px 0' }}>
              Safe Buy Price = Fair Price &times; 0.80
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Never enter at fair value. Always demand an entry discount of at least 20% to absorb macro shocks and sector corrections.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              Marking Scheme &amp; Institutional Evaluation Framework
            </h1>
            <span className="badge badge-accent" style={{ borderRadius: 'var(--badge-radius)' }}>
              20 Points Total
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Clear, quantitative evaluation criteria: 10-Point Stage 1 Gatekeeper + 10-Point Stage 2 Deep Trend Forensics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={resetToDefault}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 14px', borderRadius: 'var(--badge-radius)' }}
            title="Reset to default institutional rules"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div style={{ padding: '12px 16px', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--badge-radius)', color: 'var(--success)', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> Rule updated and saved automatically!
        </div>
      )}

      {/* Main Representation View Selector (Pillars vs Flowchart vs Slides vs Sandbox) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '6px',
        borderRadius: 'var(--card-radius)',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('blueprint')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: 'var(--badge-radius)',
              border: activeTab === 'blueprint' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === 'blueprint' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'blueprint' ? 'var(--accent-primary)' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>Structured Pillars &amp; Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: 'var(--badge-radius)',
              border: activeTab === 'pipeline' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === 'pipeline' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'pipeline' ? 'var(--accent-primary)' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowRight size={14} />
            <span>Step-by-Step Investor Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: 'var(--badge-radius)',
              border: activeTab === 'slides' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === 'slides' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'slides' ? 'var(--accent-primary)' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={14} />
            <span>Presentation Slide Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: 'var(--badge-radius)',
              border: activeTab === 'simulator' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === 'simulator' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'simulator' ? 'var(--accent-primary)' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={14} />
            <span>Interactive Simulator &amp; Rules Studio</span>
          </button>
        </div>

        {/* Search rule filter */}
        {activeTab === 'blueprint' && (
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', padding: '5px 10px', gap: '6px', minWidth: '220px' }}>
            <Search size={13} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search criteria e.g. ROCE, D/E..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '12px', width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* =========================================================
          VIEW 1: STRUCTURED THEMATIC PILLARS & VISUAL SCORECARD
      ========================================================= */}
      {activeTab === 'blueprint' && (
        <div>
          {/* Quick Overview Hero Strip */}
          <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ borderLeft: '3px solid var(--warning)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>STAGE 1 GATEKEEPER</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>10.0 Points Total</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Cutoff: <strong>6.5 Pts</strong> (Banks: <strong>5.85 / 9</strong>). Strict pass/fail filter.
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>STAGE 2 DEEP TREND</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>10.0 Points Total</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Audits 8 quarters of momentum, 5Y balance sheet, CFO conversion, &amp; clean public float.
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>COMBINED CONVICTION</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>20.0 Points Score</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  High Conviction (&ge;16 pts, 50% Tier) | Medium (14-15.9 pts, 25% Tier) | Watchlist (&lt;14).
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>BUFFETT MARGIN OF SAFETY</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>20% Minimum Discount</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Safe Buy Price = <code>Fair Price &times; 0.80</code> before capital deployment.
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 1 PILLARS SECTION */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="var(--warning)" />
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Stage 1 Gatekeeper Criteria (10 Points)
                </h2>
              </div>
              <span className="badge badge-warn" style={{ fontSize: '11.5px', borderRadius: 'var(--badge-radius)' }}>
                Cutoff: 6.5 / 10.0 Pts (Elimination Filter)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {stage1Pillars.map((pillar, pIdx) => {
                const filteredItems = pillar.items.filter(i =>
                  !searchTerm.trim() ||
                  i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={pIdx} className="card" style={{ padding: '20px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)' }}>
                    <div style={{ marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {pillar.pillarTitle}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {pillar.pillarSubtitle}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--card-radius)',
                            padding: '16px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: 'var(--bg-card)',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: 'var(--accent-primary)',
                                  border: '1px solid var(--border-color)'
                                }}>
                                  {item.num}
                                </span>
                                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {item.title}
                                </span>
                              </div>
                              <span className="badge badge-accent" style={{ fontSize: '11px', borderRadius: 'var(--badge-radius)' }}>
                                {item.points}
                              </span>
                            </div>

                            {/* Point Formula Box */}
                            <div style={{
                              background: 'var(--bg-card)',
                              padding: '8px 10px',
                              borderRadius: 'var(--badge-radius)',
                              border: '1px solid var(--border-color)',
                              fontSize: '11.5px',
                              color: 'var(--accent-primary)',
                              fontWeight: 600,
                              marginBottom: '8px'
                            }}>
                              {item.formula}
                            </div>

                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, margin: '0 0 10px 0' }}>
                              {item.description}
                            </p>
                          </div>

                          {/* Visual Benchmark Range Bar */}
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                              BENCHMARK SPECTRUM
                            </div>
                            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                              {item.benchmarkVisual.map((bv, bIdx) => (
                                <div
                                  key={bIdx}
                                  style={{
                                    flex: 1,
                                    padding: '4px 6px',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: bv.type === 'danger' ? 'var(--danger-bg)' : bv.type === 'warning' ? 'var(--warning-bg)' : 'var(--success-bg)',
                                    color: bv.type === 'danger' ? 'var(--danger)' : bv.type === 'warning' ? 'var(--warning)' : 'var(--success)',
                                    border: `1px solid ${bv.type === 'danger' ? 'rgba(239,68,68,0.3)' : bv.type === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`
                                  }}
                                >
                                  {bv.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE 2 DEEP TREND DIAGNOSTIC CARDS */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--success)" />
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Stage 2 Deep Trend Forensics (10 Points)
                </h2>
              </div>
              <span className="badge badge-pass" style={{ fontSize: '11.5px', borderRadius: 'var(--badge-radius)' }}>
                Multi-Year Filings &amp; Audited Forensics
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {stage2Pillars.map((p, idx) => (
                <div key={idx} className="card" style={{ padding: '18px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)', borderTop: `4px solid ${p.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {p.title}
                    </h3>
                    <span className="badge badge-accent" style={{ fontSize: '11px', borderRadius: 'var(--badge-radius)' }}>
                      {p.score}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    {p.badge}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {p.rules.map((r, rIdx) => (
                      <div key={rIdx} style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{r.label}</span>
                          <span className="num" style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--accent-primary)' }}>{r.pts}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>
                          {r.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VALUATIONS & MARGIN OF SAFETY CARDS */}
          <div className="card" style={{ padding: '22px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Target size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                Valuation Formulas &amp; Buffett’s 20% Margin of Safety
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Never enter at fair value: compute intrinsic value and demand an entry discount before deployment.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>1. INDUSTRY P/E FAIR VALUE</div>
                <div className="num" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  Fair Price = EPS &times; Industry P/E
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Anchors intrinsic stock price to what peer businesses trade at.
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>2. 3-YEAR TARGET PRICE</div>
                <div className="num" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--accent-primary)', margin: '8px 0 4px 0' }}>
                  Target 3Y = EPS &times; (1 + g)&sup3; &times; Target PE
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Conservative growth <em>g</em> is capped at <strong>&frac23; &times; 5-Year Profit Growth</strong>.
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>3. PEG RATIO</div>
                <div className="num" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  PEG = Stock P/E / Profit Growth %
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  &lt;1.0: Bargain | 1.0-1.5: Fair | &gt;2.0: Overvalued Red Flag.
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)', borderTop: '3px solid var(--success)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>4. BUFFETT’S 20% MARGIN OF SAFETY</div>
                <div className="num" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--success)', margin: '8px 0 4px 0' }}>
                  Safe Buy Price = Fair Price &times; 0.80
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Mandatory 20% discount buffer absorbs recessions and black swan events.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: STEP-BY-STEP INVESTOR DECISION FLOWCHART / ROADMAP
      ========================================================= */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Step 1 Node */}
          <div className="card" style={{ padding: '22px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)', borderLeft: '5px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--warning)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>1</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Step 1: The Gatekeeper Test (Stage 1 Checklist)</h3>
              </div>
              <span className="badge badge-warn" style={{ borderRadius: 'var(--badge-radius)' }}>Cutoff: 6.5 / 10 Pts</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Run the stock through the 10 binary quantitative filters (Sales, Profit, OPM, ROE, ROCE, D/E, Current Ratio, Interest Coverage, PE, ROA).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--danger)' }}>🛑 If Score &lt; 6.5 / 10 Pts:</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <strong>IMMEDIATE REJECTION.</strong> Do not spend another second analyzing annual reports. The business lacks core economic moat or balance sheet safety.
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>🟢 If Score ≥ 6.5 / 10 Pts:</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <strong>PASSES TO STAGE 2.</strong> The company qualifies for deep historical trend forensics and balance sheet stress testing.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={24} color="var(--accent-primary)" style={{ transform: 'rotate(90deg)' }} />
          </div>

          {/* Step 2 Node */}
          <div className="card" style={{ padding: '22px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)', borderLeft: '5px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>2</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Step 2: Deep Trend Forensic Audit (Stage 2 Checklist)</h3>
              </div>
              <span className="badge badge-accent" style={{ borderRadius: 'var(--badge-radius)' }}>10.0 Points Trajectory</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Audit multi-year trajectories: 8 Quarters of Sales/OPM resilience (2 pts), 5-Year compounding consistency (3 pts), Reserves expanding while Borrowings decrease (1 pt), CFO strictly positive (1 pt), Debtor Days &le; 120 Days (1 pt), ROCE maintained (1 pt), and Public Float &le; 50% (1 pt).
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              🚩 <strong>Automatic Disqualifiers:</strong> Debtor Days &gt; 120 days or Public Shareholding &gt; 50% trigger critical warning flags regardless of other scores.
            </div>
          </div>

          <div style={{ display: 'center', justifyContent: 'center' }}>
            <ArrowRight size={24} color="var(--accent-primary)" style={{ transform: 'rotate(90deg)', margin: '0 auto' }} />
          </div>

          {/* Step 3 Node */}
          <div className="card" style={{ padding: '22px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)', borderLeft: '5px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>3</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Step 3: Conviction Scoring &amp; Portfolio Allocation (20 Pts)</h3>
              </div>
              <span className="badge badge-pass" style={{ borderRadius: 'var(--badge-radius)' }}>Allocation Sizing</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)', borderLeft: '3px solid var(--success)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>Score ≥ 16.0 / 20</div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>50% Capital Weightage Tier</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Elite fortress compounders eligible for core capital deployment.</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)', borderLeft: '3px solid var(--warning)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--warning)' }}>Score 14.0 - 15.9 / 20</div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>25% Capital Weightage Tier</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Solid growth compounders with minor valuation or cyclical friction.</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)', borderLeft: '3px solid var(--danger)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)' }}>Score &lt; 14.0 / 20</div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>Tactical Watchlist</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Wait on sidelines until quarterly earnings turn around.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={24} color="var(--accent-primary)" style={{ transform: 'rotate(90deg)' }} />
          </div>

          {/* Step 4 Node */}
          <div className="card" style={{ padding: '22px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)', borderLeft: '5px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>4</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Step 4: Buffett 20% Margin of Safety Pricing Rule</h3>
              </div>
              <span className="badge badge-accent" style={{ borderRadius: 'var(--badge-radius)' }}>Disciplined Buying</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
              Even an exceptional stock with 18/20 score is an awful investment if purchased at an inflated price. Demand <code>Current Price &le; Fair Price &times; 0.80</code>.
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-main)' }}>
              💎 <strong>Execution Rule:</strong> Add to "Dip Watchlist" portfolio with target trigger alert set to Safe Buy Price. Initiate position only when price pulls back into the safety zone.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 3: EXECUTIVE SLIDE DECK (SLIDE 1 TO 4)
      ========================================================= */}
      {activeTab === 'slides' && (
        <div className="card" style={{ padding: '24px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)' }}>
          {/* Slide Deck Top Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {slideDeck.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: 'var(--badge-radius)',
                    border: activeSlide === idx ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    background: activeSlide === idx ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: activeSlide === idx ? '#000' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Slide {idx + 1}: {s.title.split(':')[0]}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', opacity: activeSlide === 0 ? 0.4 : 1, borderRadius: 'var(--badge-radius)' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)' }}>
                {activeSlide + 1} / {slideDeck.length}
              </span>
              <button
                onClick={() => setActiveSlide(Math.min(slideDeck.length - 1, activeSlide + 1))}
                disabled={activeSlide === slideDeck.length - 1}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', opacity: activeSlide === slideDeck.length - 1 ? 0.4 : 1, borderRadius: 'var(--badge-radius)' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Active Slide Content */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                Slide {activeSlide + 1}: {slideDeck[activeSlide].title}
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', marginBottom: '20px' }}>
              {slideDeck[activeSlide].subtitle}
            </p>

            {slideDeck[activeSlide].content}
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 4: INTERACTIVE SIMULATOR & CUSTOM RULES STUDIO
      ========================================================= */}
      {activeTab === 'simulator' && (
        <div className="card" style={{ padding: '24px', borderRadius: 'var(--card-radius)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                Interactive Scoring Simulator &amp; Custom Rules Studio
              </h2>
            </div>
            <span className="badge badge-accent" style={{ borderRadius: 'var(--badge-radius)' }}>
              Real-Time Engine Feedback
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Adjust the sliders below to see in real-time how points are calculated for Stage 1. This is the exact mathematical logic running in the live terminal.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Interactive Ratio Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                ADJUST COMPANY FINANCIAL METRICS
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Sales Growth (1Y: {simSales1Y}% | 5Y: {simSales5Y}%)</span>
                  <span className="num" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{simSales1Y > simSales5Y ? '+1.0 pt' : '+0.5 pt'}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="40"
                  value={simSales1Y}
                  onChange={e => setSimSales1Y(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Profit Growth (1Y: {simProfit1Y}% | 5Y: {simProfit5Y}%)</span>
                  <span className="num" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{simProfit1Y > simProfit5Y ? '+1.0 pt' : '+0.5 pt'}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="50"
                  value={simProfit1Y}
                  onChange={e => setSimProfit1Y(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Operating Margin (OPM): {simOPM}%</span>
                  <span className="num" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{simOPM >= 18 ? '+1.0 pt' : simOPM >= 15 ? '+0.5 pt' : '0 pt'}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={simOPM}
                  onChange={e => setSimOPM(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Debt-to-Equity (D/E): {simDE}</span>
                  <span className="num" style={{ fontWeight: 700, color: simDE < 0.5 ? 'var(--success)' : simDE <= 1.25 ? 'var(--warning)' : 'var(--danger)' }}>
                    {simDE < 0.5 ? '+1.0 pt' : simDE <= 1.25 ? '+0.5 pt' : '0 pt (Red Flag)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.05"
                  value={simDE}
                  onChange={e => setSimDE(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Current Ratio: {simCR}x</span>
                  <span className="num" style={{ fontWeight: 700, color: simCR >= 2.0 ? 'var(--success)' : simCR >= 1.0 ? 'var(--warning)' : 'var(--danger)' }}>
                    {simCR >= 2.0 ? '+1.0 pt' : simCR >= 1.0 ? '+0.5 pt' : '0 pt'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={simCR}
                  onChange={e => setSimCR(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Stock P/E: {simStockPE}x (Ind: {simIndPE}x &rarr; {(simStockPE / simIndPE).toFixed(2)}x)</span>
                  <span className="num" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {simStockPE / simIndPE <= 2.0 ? '+1.0 pt' : simStockPE / simIndPE <= 2.5 ? '+0.5 pt' : '+0.25 pt'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={simStockPE}
                  onChange={e => setSimStockPE(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>

            {/* Simulated Live Score Result */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  LIVE SIMULATED STAGE 1 SCORE
                </div>
                <div className="num" style={{ fontSize: '42px', fontWeight: 800, color: simScore.total >= 6.5 ? 'var(--success)' : 'var(--danger)', marginTop: '4px' }}>
                  {simScore.total} / 10.0 Pts
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: simScore.total >= 6.5 ? 'var(--success)' : 'var(--danger)', marginTop: '2px' }}>
                  {simScore.total >= 8.5 ? '✓ EXCEPTIONAL (Green Light)' : simScore.total >= 6.5 ? '✓ PASSES GATEKEEPER' : '✗ ELIMINATED (Below 6.5 Cutoff)'}
                </div>
              </div>

              {/* Breakdown list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                {simScore.breakdown.slice(0, 6).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '5px 8px', background: 'var(--bg-card)', borderRadius: 'var(--badge-radius)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                    <span className="num" style={{ fontWeight: 700, color: item.score === item.max ? 'var(--success)' : item.score > 0 ? 'var(--warning)' : 'var(--danger)' }}>
                      {item.score} / {item.max}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cutoff customizer */}
              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Custom Stage 1 Cutoff:</span>
                  <span className="num" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>{rules.stage1Cutoff} Pts</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="8.5"
                  step="0.25"
                  value={rules.stage1Cutoff}
                  onChange={e => updateStage1Cutoff(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Add Custom User Rules */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              Add Custom Evaluation Rules to the Terminal
            </h3>
            <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. Promoter pledging must be strictly 0%..."
                value={newRuleTitle}
                onChange={e => setNewRuleTitle(e.target.value)}
                style={{ flex: 1, minWidth: '240px', padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '13px' }}
              />
              <select
                value={newRulePoints}
                onChange={e => setNewRulePoints(e.target.value)}
                style={{ padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', color: 'var(--text-main)', fontSize: '13px' }}
              >
                <option value="0.25">+0.25 pt</option>
                <option value="0.50">+0.50 pt</option>
                <option value="1.00">+1.00 pt</option>
              </select>
              <button type="submit" className="btn-primary" style={{ fontSize: '12.5px', padding: '9px 18px', borderRadius: 'var(--badge-radius)' }}>
                <PlusCircle size={15} /> Add Rule
              </button>
            </form>

            {/* List of active custom rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              {rules.customChecklist && rules.customChecklist.map((item) => (
                <div key={item.id} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={() => toggleCustomChecklistItem(item.id)}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ fontSize: '13px', color: item.active ? 'var(--text-main)' : 'var(--text-dim)', textDecoration: item.active ? 'none' : 'line-through' }}>
                      {item.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-accent" style={{ borderRadius: 'var(--badge-radius)' }}>+{item.points} pt</span>
                    <button onClick={() => removeCustomChecklistItem(item.id)} style={{ color: 'var(--danger)', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
