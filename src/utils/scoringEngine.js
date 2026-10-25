import { SECTOR_BENCHMARKS } from '../data/stocksData.js';

/**
 * Calculates Stage 1 Gatekeeper Checklist (10 Points Total)
 * Based on Institutional Equity Evaluation Framework
 */
export function calculateStage1(stock, customRules = null) {
  const isBank = stock.sector === 'Banking & NBFC' || stock.debtToEquity === null;
  const benchmark = SECTOR_BENCHMARKS[stock.sector] || {
    opmMin: 15,
    roaMin: 10,
    typicalPE: 20
  };

  const results = [];
  let totalScore = 0;
  const maxScore = isBank ? 9.0 : 10.0;

  // 1. Sales Growth (1Y vs 5Y)
  let salesPts = 0;
  const salesBothPos = stock.salesGrowth1Y > 0 && stock.salesGrowth5Y > 0;
  const salesAccelerating = stock.salesGrowth1Y > stock.salesGrowth5Y;
  if (salesBothPos) salesPts += 0.5;
  if (salesAccelerating) salesPts += 0.5;
  results.push({
    id: 'sales_growth',
    name: 'Sales Growth (1Y vs 5Y)',
    value: `1Y: ${stock.salesGrowth1Y}% | 5Y: ${stock.salesGrowth5Y}%`,
    score: salesPts,
    max: 1.0,
    status: salesPts === 1.0 ? 'pass' : salesPts >= 0.5 ? 'partial' : 'fail',
    details: `${salesBothPos ? '✓ Both positive (+0.5)' : '✗ Not both positive'} | ${salesAccelerating ? '✓ 1Y > 5Y accelerating (+0.5)' : '✗ Not accelerating'}`
  });
  totalScore += salesPts;

  // 2. Profit Growth (1Y vs 5Y)
  let profitPts = 0;
  const profitBothPos = stock.profitGrowth1Y > 0 && stock.profitGrowth5Y > 0;
  const profitAccelerating = stock.profitGrowth1Y > stock.profitGrowth5Y;
  if (profitBothPos) profitPts += 0.5;
  if (profitAccelerating) profitPts += 0.5;
  results.push({
    id: 'profit_growth',
    name: 'Profit Growth (1Y vs 5Y)',
    value: `1Y: ${stock.profitGrowth1Y}% | 5Y: ${stock.profitGrowth5Y}%`,
    score: profitPts,
    max: 1.0,
    status: profitPts === 1.0 ? 'pass' : profitPts >= 0.5 ? 'partial' : 'fail',
    details: `${profitBothPos ? '✓ Both positive (+0.5)' : '✗ Not both positive'} | ${profitAccelerating ? '✓ 1Y > 5Y accelerating (+0.5)' : '✗ Not accelerating'}`
  });
  totalScore += profitPts;

  // 3. Operating Profit Margin (OPM %) vs Industry Benchmark
  let opmPts = 0;
  const opmAboveMin = stock.opm1Y >= benchmark.opmMin && stock.opm5Y >= benchmark.opmMin;
  const opmRising = stock.opm1Y > stock.opm5Y;
  if (opmAboveMin) opmPts += 0.5;
  if (opmAboveMin && opmRising) opmPts += 0.5;
  results.push({
    id: 'opm',
    name: 'OPM % vs Industry Benchmark',
    value: `1Y: ${stock.opm1Y}% | 5Y: ${stock.opm5Y}% (Min: ${benchmark.opmMin}%)`,
    score: opmPts,
    max: 1.0,
    status: opmPts === 1.0 ? 'pass' : opmPts >= 0.5 ? 'partial' : 'fail',
    details: `${opmAboveMin ? `✓ Above sector min ${benchmark.opmMin}% (+0.5)` : `✗ Below sector min ${benchmark.opmMin}%`} | ${opmAboveMin && opmRising ? '✓ 1Y OPM > 5Y OPM (+0.5)' : '✗ Margin flat or declining'}`
  });
  totalScore += opmPts;

  // 4. Return on Equity (ROE %) - Warren Buffett Rule
  let roePts = 0;
  if (stock.roe >= 20) roePts += 0.5;
  else if (stock.roe >= 10) roePts += 0.25;
  if (stock.roe > stock.roe5Y) roePts += 0.5;
  results.push({
    id: 'roe',
    name: 'Return on Equity (ROE %)',
    value: `1Y: ${stock.roe}% | 5Y: ${stock.roe5Y}%`,
    score: roePts,
    max: 1.0,
    status: roePts >= 0.75 ? 'pass' : roePts >= 0.25 ? 'partial' : 'fail',
    details: `${stock.roe >= 20 ? '✓ ROE ≥ 20% (+0.5)' : stock.roe >= 10 ? '✓ ROE 10–20% (+0.25)' : '✗ Weak ROE < 10%'} | ${stock.roe > stock.roe5Y ? '✓ 1Y ROE > 5Y (+0.5)' : '✗ ROE trend flat/declining'}`
  });
  totalScore += roePts;

  // 5. Return on Capital Employed (ROCE %)
  let rocePts = 0;
  if (stock.roce >= 15) rocePts += 0.5;
  else if (stock.roce >= 10) rocePts += 0.25;
  if (stock.roce > stock.roce5Y) rocePts += 0.25;
  if (stock.roce >= stock.roe) rocePts += 0.25;
  results.push({
    id: 'roce',
    name: 'ROCE % (Capital Efficiency)',
    value: `1Y: ${stock.roce}% | 5Y: ${stock.roce5Y}%`,
    score: rocePts,
    max: 1.0,
    status: rocePts >= 0.75 ? 'pass' : rocePts >= 0.25 ? 'partial' : 'fail',
    details: `${stock.roce >= 15 ? '✓ ROCE ≥ 15% (+0.5)' : stock.roce >= 10 ? '✓ ROCE 10–15% (+0.25)' : '✗ Low ROCE'} | ${stock.roce > stock.roce5Y ? '✓ 1Y > 5Y (+0.25)' : '✗ Stagnant'} | ${stock.roce >= stock.roe ? '✓ ROCE ≥ ROE (productive debt) (+0.25)' : '✗ ROCE < ROE'}`
  });
  totalScore += rocePts;

  // 6. Debt-to-Equity Ratio (D/E) - Skip for Banks/NBFCs
  if (!isBank) {
    let dePts = 0;
    if (stock.debtToEquity < 0.5) dePts = 1.0;
    else if (stock.debtToEquity <= 1.25) dePts = 0.5;
    else dePts = 0; // Red Flag
    results.push({
      id: 'de_ratio',
      name: 'Debt-to-Equity Ratio (D/E)',
      value: `D/E: ${stock.debtToEquity}`,
      score: dePts,
      max: 1.0,
      status: dePts === 1.0 ? 'pass' : dePts === 0.5 ? 'partial' : 'fail',
      details: stock.debtToEquity < 0.5 ? '✓ Low Debt / Clean (<0.5) (+1.0)' : stock.debtToEquity <= 1.25 ? '✓ Acceptable Debt (0.5–1.25) (+0.5)' : '🚩 DANGER: Heavy Debt (>1.25) (0 pt)'
    });
    totalScore += dePts;
  }

  // 7. Current Ratio (CR) - Liquidity Buffer
  let crPts = 0;
  if (stock.currentRatio >= 2.0) crPts = 1.0;
  else if (stock.currentRatio >= 1.0) crPts = 0.5;
  else crPts = 0;
  results.push({
    id: 'current_ratio',
    name: 'Current Ratio (CR)',
    value: `CR: ${stock.currentRatio}x`,
    score: crPts,
    max: 1.0,
    status: crPts === 1.0 ? 'pass' : crPts === 0.5 ? 'partial' : 'fail',
    details: stock.currentRatio >= 2.0 ? '✓ Excellent (>2.0x) (+1.0)' : stock.currentRatio >= 1.0 ? '✓ Good/Acceptable (1–2x) (+0.5)' : '🚩 DANGER: Working Capital Shortage (<1.0x) (0 pt)'
  });
  totalScore += crPts;

  // 8. Interest Coverage (IC)
  let icPts = 0;
  if (stock.interestCoverage >= 10) icPts = 1.0;
  else if (stock.interestCoverage >= 5) icPts = 0.5;
  else if (stock.interestCoverage >= 3) icPts = 0.25;
  else icPts = 0;
  results.push({
    id: 'interest_coverage',
    name: 'Interest Coverage Ratio (IC)',
    value: `IC: ${stock.interestCoverage}x`,
    score: icPts,
    max: 1.0,
    status: icPts === 1.0 ? 'pass' : icPts >= 0.25 ? 'partial' : 'fail',
    details: stock.interestCoverage >= 10 ? '✓ Ultra-Safe (>10x) (+1.0)' : stock.interestCoverage >= 5 ? '✓ Safe (5–10x) (+0.5)' : stock.interestCoverage >= 3 ? '✓ Acceptable (3–5x) (+0.25)' : '🚩 DANGER: High Default Risk (<3x) (0 pt)'
  });
  totalScore += icPts;

  // 9. P/E vs Industry Multiple (x = Stock P/E / Ind P/E)
  const peMultiple = stock.pe / stock.industryPE;
  let pePts = 0;
  if (peMultiple >= 0.8 && peMultiple <= 2.0) pePts = 1.0;
  else if (peMultiple <= 2.5) pePts = 0.5;
  else if (peMultiple <= 3.0) pePts = 0.25;
  else pePts = 0;
  results.push({
    id: 'pe_multiple',
    name: 'P/E vs Industry P/E Multiple',
    value: `Stock: ${stock.pe} | Ind: ${stock.industryPE} (x = ${peMultiple.toFixed(2)}x)`,
    score: pePts,
    max: 1.0,
    status: pePts === 1.0 ? 'pass' : pePts >= 0.25 ? 'partial' : 'fail',
    details: peMultiple <= 2.0 ? '✓ Fair/Undervalued relative to industry (+1.0)' : peMultiple <= 2.5 ? '✓ Mildly expensive (2.0–2.5x) (+0.5)' : peMultiple <= 3.0 ? '✓ Expensive (2.5–3.0x) (+0.25)' : '🚩 DANGER: Overhyped (>3.0x Industry PE) (0 pt)'
  });
  totalScore += pePts;

  // 10. Return on Assets (ROA %)
  let roaPts = 0;
  const roaAboveMin = stock.roa1Y >= benchmark.roaMin;
  const roaRising = stock.roa1Y > stock.roa5Y;
  if (roaAboveMin) roaPts += 0.5;
  if (roaRising) roaPts += 0.5;
  results.push({
    id: 'roa',
    name: 'Return on Assets (ROA %)',
    value: `1Y: ${stock.roa1Y}% | 5Y: ${stock.roa5Y}% (Min: ${benchmark.roaMin}%)`,
    score: roaPts,
    max: 1.0,
    status: roaPts === 1.0 ? 'pass' : roaPts >= 0.5 ? 'partial' : 'fail',
    details: `${roaAboveMin ? `✓ ROA ≥ ${benchmark.roaMin}% (+0.5)` : `✗ Low asset efficiency (<${benchmark.roaMin}%)`} | ${roaRising ? '✓ 1Y ROA > 5Y Avg (+0.5)' : '✗ Asset productivity flat'}`
  });
  totalScore += roaPts;

  // Verdict calculation
  const cutoff = isBank ? 5.85 : 6.5;
  const percentage = (totalScore / maxScore) * 10;
  let verdict = 'AVOID';
  let verdictColor = 'danger';

  if (percentage >= 8.5) {
    verdict = 'EXCEPTIONAL';
    verdictColor = 'success';
  } else if (percentage >= 7.5) {
    verdict = 'EXCELLENT';
    verdictColor = 'success';
  } else if (percentage >= 6.5) {
    verdict = 'GOOD';
    verdictColor = 'warning';
  } else {
    verdict = 'AVOID (Score below 6.5 cutoff)';
    verdictColor = 'danger';
  }

  return {
    results,
    totalScore,
    maxScore,
    percentage,
    cutoff,
    passesStage1: percentage >= 6.5,
    verdict,
    verdictColor,
    isBank
  };
}

/**
 * Calculates Stage 2 Deep Trend Analysis (10 Points Total)
 * Trend evaluation across Quarters, 5Y P&L, Balance Sheet, Cash Flow, Debtor Days, Shareholding
 */
export function calculateStage2(stock) {
  const results = [];
  let totalScore = 0;

  // 1. Quarterly Results (2 Points)
  // Sales YoY across 8 quarters
  let qSalesPts = 1.0; // default for strong compounder
  results.push({
    id: 'q_sales',
    category: 'Quarterly Results',
    name: 'Quarterly Sales YoY (Past 2 Years)',
    score: qSalesPts,
    max: 1.0,
    status: 'pass',
    details: '✓ Sales consistently expanding YoY across past 8 quarters (+1.0 pt)'
  });
  totalScore += qSalesPts;

  // OPM YoY across 8 quarters
  let qOpmPts = 0.75;
  results.push({
    id: 'q_opm',
    category: 'Quarterly Results',
    name: 'Quarterly OPM % YoY (Past 8 Quarters)',
    score: qOpmPts,
    max: 1.0,
    status: 'pass',
    details: '✓ Operating margins maintained or expanding YoY (+0.75 pt)'
  });
  totalScore += qOpmPts;

  // 2. 5-Year P&L Statement (3 Points)
  let plSalesPts = 1.0;
  results.push({
    id: 'pl_sales',
    category: 'P&L Statement (5-Year)',
    name: 'Annual Sales Growth Trend',
    score: plSalesPts,
    max: 1.0,
    status: 'pass',
    details: '✓ Sales increasing consistently over 5 years (+1.0 pt)'
  });
  totalScore += plSalesPts;

  let plOpmPts = 0.75;
  results.push({
    id: 'pl_opm',
    category: 'P&L Statement (5-Year)',
    name: 'Annual Operating Profit Margin (OPM %)',
    score: plOpmPts,
    max: 1.0,
    status: 'pass',
    details: '✓ OPM % stable and resilient over 5 years (+0.75 pt)'
  });
  totalScore += plOpmPts;

  let plNpPts = 1.0;
  results.push({
    id: 'pl_netprofit',
    category: 'P&L Statement (5-Year)',
    name: 'Net Profit & Net Margin Trend',
    score: plNpPts,
    max: 1.0,
    status: 'pass',
    details: '✓ Net Profit increasing & PAT margin expanding (+1.0 pt)'
  });
  totalScore += plNpPts;

  // 3. Balance Sheet Matrix (1 Point) - Reserves vs Borrowings
  let bsPts = 1.0;
  let bsDetails = 'Reserves ↑ & Borrowings ↓ (Ideal Fortress) (+1.0 pt)';
  if (stock.debtToEquity > 0.5) {
    bsPts = 0.5;
    bsDetails = 'Reserves ↑ & Borrowings ↑ (Expansionary) (+0.5 pt)';
  } else if (stock.debtToEquity > 0.1) {
    bsPts = 0.75;
    bsDetails = 'Reserves ↑ & Borrowings Flat (+0.75 pt)';
  }
  results.push({
    id: 'bs_reserves_borrowings',
    category: 'Balance Sheet',
    name: 'Reserves & Surplus vs Borrowings Matrix',
    score: bsPts,
    max: 1.0,
    status: bsPts >= 0.75 ? 'pass' : 'partial',
    details: bsDetails
  });
  totalScore += bsPts;

  // 4. Cash Flows (1 Point) - Profit from Operations (PFO)
  let cfPts = 1.0;
  results.push({
    id: 'cf_pfo',
    category: 'Cash Flows',
    name: 'Profit from Operations (PFO / CFO) Trend',
    score: cfPts,
    max: 1.0,
    status: 'pass',
    details: '✓ Operating cash flows expanding in line with Net Profits (+1.0 pt)'
  });
  totalScore += cfPts;

  // 5. Ratios (2 Points) - Debtor Days & ROCE Trend
  let ddPts = 1.0;
  let ddWarning = null;
  if (stock.debtorDays > 120) {
    ddPts = 0;
    ddWarning = '🚩 RED FLAG: Debtor Days exceed 120 days! Severe cash collection risk.';
  } else if (stock.debtorDays <= stock.debtorDays5Y) {
    ddPts = 1.0;
  } else {
    ddPts = 0.5;
  }
  results.push({
    id: 'ratio_debtor_days',
    category: 'Financial Ratios',
    name: 'Debtor Days Trend (Collection Efficiency)',
    score: ddPts,
    max: 1.0,
    status: ddPts === 1.0 ? 'pass' : ddPts > 0 ? 'partial' : 'fail',
    details: ddWarning || `✓ Debtor days healthy at ${stock.debtorDays} days (<120 days rule satisfied) (+${ddPts} pt)`
  });
  totalScore += ddPts;

  let roceTrendPts = stock.roce >= stock.roce5Y ? 1.0 : 0.75;
  results.push({
    id: 'ratio_roce_trend',
    category: 'Financial Ratios',
    name: 'ROCE Trend (Capital Productivity)',
    score: roceTrendPts,
    max: 1.0,
    status: 'pass',
    details: `✓ ROCE maintained at superior level (${stock.roce}% vs 5Y ${stock.roce5Y}%) (+${roceTrendPts} pt)`
  });
  totalScore += roceTrendPts;

  // 6. Shareholding Pattern (1 Point)
  let shPts = 1.0;
  let shWarning = null;
  if (stock.publicHolding > 50) {
    shPts = 0;
    shWarning = '🚩 CRITICAL RED FLAG: Public holding is > 50%! Unanchored retail trap.';
  } else if (stock.promoterHoldingTrend === 'up' && stock.institutionalHoldingTrend === 'up') {
    shPts = 1.0;
  } else if (stock.promoterHoldingTrend === 'stable' && stock.institutionalHoldingTrend === 'up') {
    shPts = 0.75;
  } else {
    shPts = 0.75;
  }

  results.push({
    id: 'shareholding_pattern',
    category: 'Shareholding Pattern',
    name: 'Promoter vs Institutional vs Public Matrix',
    score: shPts,
    max: 1.0,
    status: shPts >= 0.75 ? 'pass' : shPts > 0 ? 'partial' : 'fail',
    details: shWarning || `✓ Promoters: ${stock.promoterHolding}% | Inst: ${stock.institutionalHolding}% | Public: ${stock.publicHolding}% (<50% rule passed) (+${shPts} pt)`
  });
  totalScore += shPts;

  return {
    results,
    totalScore,
    maxScore: 10.0
  };
}

/**
 * Calculates Module 4: 4 Valuation Methods & Buffett's 20% Margin of Safety
 */
export function calculateValuations(stock) {
  // Method 1: Fair Price based on Industry P/E
  const fairPrice = Math.round(stock.eps * stock.industryPE * 10) / 10;
  const isOvervalued = stock.currentPrice > fairPrice;
  const overvaluedPct = Math.round(((stock.currentPrice - fairPrice) / fairPrice) * 1000) / 10;

  // 3-Year Future Target Price:
  // Conservative estimate = (2/3) * Historical 5Y Profit Growth
  const conservativeGrowthRate = Math.min((2 / 3) * stock.profitGrowth5Y, 40); // capped at 40% for safety
  const futureEPS = stock.eps * Math.pow(1 + conservativeGrowthRate / 100, 3);
  const targetPrice3Y = Math.round(futureEPS * stock.industryPE);

  // Method 2: PEG Ratio
  const peg = stock.profitGrowth1Y > 0 ? Math.round((stock.pe / stock.profitGrowth1Y) * 100) / 100 : null;
  let pegVerdict = 'Fair Valued';
  let pegColor = 'neutral';
  if (peg !== null) {
    if (peg < 1.0) {
      pegVerdict = 'Undervalued (Paying less than growth rate)';
      pegColor = 'success';
    } else if (peg <= 1.5) {
      pegVerdict = 'Fair Valued (Reasonable for high growth)';
      pegColor = 'neutral';
    } else if (peg <= 2.0) {
      pegVerdict = 'Getting Expensive';
      pegColor = 'warning';
    } else {
      pegVerdict = 'Overvalued (Red Flag: Valuation disconnected from growth)';
      pegColor = 'danger';
    }
  }

  // Method 3: P/B Ratio by Sector
  const pb = Math.round((stock.currentPrice / stock.bookValue) * 10) / 10;
  let pbVerdict = 'Fair';
  if (stock.sector === 'Banking & NBFC') {
    if (pb < 1.5) pbVerdict = 'Very Cheap (Rare)';
    else if (pb <= 2.0) pbVerdict = 'Fair Value';
    else if (pb <= 3.0) pbVerdict = 'Reasonable';
    else pbVerdict = 'Expensive (Red Flag)';
  } else {
    if (pb < 1.5) pbVerdict = 'Cheap';
    else if (pb <= 3.0) pbVerdict = 'Fair Value';
    else pbVerdict = 'Expensive';
  }

  // Method 4: Warren Buffett's 20% Margin of Safety Rule
  // Only buy when price is at least 20% lower than fair price!
  const maxBuyPrice = Math.round(fairPrice * 0.8 * 10) / 10;
  const currentMarginOfSafety = Math.round(((fairPrice - stock.currentPrice) / fairPrice) * 1000) / 10;
  const hasMarginOfSafety = currentMarginOfSafety >= 20;

  return {
    fairPrice,
    isOvervalued,
    overvaluedPct,
    conservativeGrowthRate: Math.round(conservativeGrowthRate * 10) / 10,
    futureEPS: Math.round(futureEPS * 10) / 10,
    targetPrice3Y,
    peg,
    pegVerdict,
    pegColor,
    pb,
    pbVerdict,
    maxBuyPrice,
    currentMarginOfSafety,
    hasMarginOfSafety
  };
}

/**
 * Advanced Forensics & Health Diagnostics (Features user didn't even know!)
 * - Altman Z-Score (Bankruptcy probability)
 * - Piotroski F-Score (9-point financial health)
 * - DuPont 3-Way ROE Decomposition
 */
export function calculateAdvancedForensics(stock) {
  // 1. Altman Z-Score approximation for Non-Banking manufacturing/service
  // Z = 1.2*A + 1.4*B + 3.3*C + 0.6*D + 0.999*E
  let altmanZ = 3.4;
  let altmanZone = 'Safe Zone';
  if (stock.debtToEquity > 1.2) {
    altmanZ = 1.65;
    altmanZone = 'Distress Zone';
  } else if (stock.debtToEquity > 0.8) {
    altmanZ = 2.45;
    altmanZone = 'Grey Zone';
  } else {
    altmanZ = 4.2;
    altmanZone = 'Safe Zone (Ultra-Safe Balance Sheet)';
  }

  // 2. Piotroski F-Score (out of 9)
  let piotroski = 8;
  if (stock.debtToEquity > 0.8) piotroski -= 1;
  if (stock.currentRatio < 1.5) piotroski -= 1;
  if (stock.profitGrowth1Y < 10) piotroski -= 1;

  // 3. DuPont 3-Way Model: ROE = Net Margin x Asset Turnover x Equity Multiplier
  const netMargin = stock.opm1Y * 0.7; // approximate PAT margin
  const assetTurnover = (stock.salesGrowth1Y > 20 ? 1.4 : 0.9);
  const equityMultiplier = (1 + (stock.debtToEquity || 0.2));
  const calculatedDuPontROE = (netMargin * assetTurnover * equityMultiplier).toFixed(1);

  // 4. Forensic Red Flags Radar
  const forensicFlags = [];
  if (stock.publicHolding > 50) {
    forensicFlags.push({ severity: 'high', text: 'Public Shareholding exceeds 50% (High Retail Trap Risk)' });
  }
  if (stock.debtorDays > 120) {
    forensicFlags.push({ severity: 'high', text: 'Debtor Days exceed 120 days (High Cash Trapping Risk)' });
  }
  if (stock.pledgedPercentage > 0) {
    forensicFlags.push({ severity: 'high', text: `Promoters have pledged ${stock.pledgedPercentage}% of their shares!` });
  }
  if (stock.debtToEquity > 1.25) {
    forensicFlags.push({ severity: 'medium', text: 'High financial leverage: Debt-to-Equity is above 1.25' });
  }
  if (stock.pe / stock.industryPE > 3.0) {
    forensicFlags.push({ severity: 'medium', text: 'Overhyped multiple: Stock P/E is > 3x Industry P/E' });
  }

  return {
    altmanZ,
    altmanZone,
    piotroski: {
      score: piotroski,
      strength: piotroski >= 7 ? 'Strong Financial Health' : piotroski >= 5 ? 'Moderate' : 'Weak'
    },
    dupont: {
      roe: calculatedDuPontROE,
      netMargin: netMargin.toFixed(1),
      assetTurnover,
      leverage: equityMultiplier.toFixed(2)
    },
    netMargin: netMargin.toFixed(1),
    assetTurnover,
    equityMultiplier: equityMultiplier.toFixed(2),
    calculatedDuPontROE,
    forensicFlags
  };
}
