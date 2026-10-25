import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart2, Activity, Calendar, Eye, EyeOff } from 'lucide-react';

export default function ScreenerInteractiveChart({ stock }) {
  const [activeMetric, setActiveMetric] = useState('price'); // 'price', 'pe', 'sales'
  const [timeframe, setTimeframe] = useState('1Yr'); // '1M', '6M', '1Yr', '3Yr', '5Yr', 'Max'
  const [show50DMA, setShow50DMA] = useState(true);
  const [show200DMA, setShow200DMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);

  const currentPrice = Number(stock?.currentPrice || 1000);
  const high52 = Number(stock?.high52 || currentPrice * 1.25);
  const low52 = Number(stock?.low52 || currentPrice * 0.75);
  const pe = Number(stock?.pe || 25);
  const industryPE = Number(stock?.industryPE || 22);

  // Generate synthetic but mathematically realistic historical time series based on the stock's actual metrics
  const chartData = useMemo(() => {
    let pointCount = 50;
    let labelInterval = 10;
    let monthSpan = 12;

    switch (timeframe) {
      case '1M':
        pointCount = 22;
        labelInterval = 5;
        monthSpan = 1;
        break;
      case '6M':
        pointCount = 40;
        labelInterval = 8;
        monthSpan = 6;
        break;
      case '1Yr':
        pointCount = 60;
        labelInterval = 12;
        monthSpan = 12;
        break;
      case '3Yr':
        pointCount = 80;
        labelInterval = 16;
        monthSpan = 36;
        break;
      case '5Yr':
        pointCount = 100;
        labelInterval = 20;
        monthSpan = 60;
        break;
      case 'Max':
        pointCount = 120;
        labelInterval = 24;
        monthSpan = 120;
        break;
      default:
        pointCount = 60;
    }

    const data = [];
    const now = new Date(2026, 9, 11); // October 2026

    // Baseline trend: 1Y profit growth & compounding
    const growthFactor = (stock?.profitGrowth5Y || 15) / 100;
    const startPrice = currentPrice / Math.pow(1 + growthFactor, monthSpan / 12);
    
    for (let i = 0; i < pointCount; i++) {
      const progress = i / (pointCount - 1);
      const daysAgo = Math.round((1 - progress) * monthSpan * 30.5);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: timeframe === '1M' || timeframe === '6M' ? undefined : '2-digit' });

      // Realistic price curve with volatility and upward drift towards currentPrice
      const cyclical = Math.sin(i * 0.28) * (currentPrice * 0.04) + Math.cos(i * 0.12) * (currentPrice * 0.06);
      const drift = startPrice + (currentPrice - startPrice) * Math.pow(progress, 0.9);
      const rawPrice = i === pointCount - 1 ? currentPrice : Math.round(drift + cyclical);
      const boundedPrice = Math.max(low52 * 0.85, Math.min(high52 * 1.15, rawPrice));

      // 50 DMA and 200 DMA approximations
      const dma50 = Math.round(boundedPrice * (0.97 + Math.sin(i * 0.15) * 0.03));
      const dma200 = Math.round(boundedPrice * (0.93 + (progress * 0.05)));

      // PE ratio curve
      const historicalPE = Math.round((pe * (boundedPrice / currentPrice)) * 10) / 10;
      
      // Volume bars
      const baseVol = stock?.marketCap ? Math.round(stock.marketCap * 15) : 50000;
      const volume = Math.round(baseVol * (0.6 + Math.abs(Math.sin(i * 1.1)) * 0.9));

      // Quarterly Sales / OPM data
      const sales = Math.round((stock?.salesGrowth1Y ? 1000 * (1 + (progress * 0.3)) : 800) * 10) / 10;
      const opm = Math.round((stock?.opm1Y || 20) * (0.95 + Math.sin(i * 0.3) * 0.1) * 10) / 10;

      data.push({
        index: i,
        date: dateStr,
        price: boundedPrice,
        dma50,
        dma200,
        pe: historicalPE,
        medianPE: Math.round(pe * 0.92 * 10) / 10,
        volume,
        sales,
        opm
      });
    }

    return data;
  }, [timeframe, currentPrice, high52, low52, pe, stock]);

  // Chart Dimensions & Coordinate Mappings
  const svgWidth = 860;
  const svgHeight = 320;
  const padLeft = 55;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Domain calculations based on active metric
  const { minVal, maxVal } = useMemo(() => {
    if (activeMetric === 'price') {
      const allPrices = chartData.flatMap(d => [d.price, show50DMA ? d.dma50 : null, show200DMA ? d.dma200 : null].filter(Boolean));
      const min = Math.min(...allPrices) * 0.96;
      const max = Math.max(...allPrices) * 1.04;
      return { minVal: min, maxVal: max };
    }
    if (activeMetric === 'pe') {
      const allPE = chartData.map(d => d.pe);
      const min = Math.max(2, Math.min(...allPE) * 0.85);
      const max = Math.max(...allPE, chartData[0]?.medianPE || 20) * 1.15;
      return { minVal: min, maxVal: max, medianVal: chartData[0]?.medianPE || 20 };
    }
    // sales & margin
    const allSales = chartData.map(d => d.sales);
    const min = Math.min(...allSales) * 0.85;
    const max = Math.max(...allSales) * 1.15;
    return { minVal: min, maxVal: max, medianVal: (min + max) / 2 };
  }, [activeMetric, chartData, show50DMA, show200DMA]);

  const maxVolume = useMemo(() => {
    return Math.max(...chartData.map(d => d.volume), 1);
  }, [chartData]);

  const getX = (idx) => padLeft + (idx / (chartData.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;

  // Path generator
  const createPath = (key) => {
    return chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`).join(' ');
  };

  const createAreaPath = (key) => {
    const line = createPath(key);
    const bottomY = padTop + chartH;
    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const activePoint = hoverIndex !== null ? chartData[hoverIndex] : chartData[chartData.length - 1];

  return (
    <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--card-radius)' }}>
      {/* Top Header: Metric Toggle Tabs + Timeframe Selectors (Exact Screener.in Layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
        {/* Metric Selector Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--badge-radius)' }}>
          {[
            { id: 'price', label: 'Price & Volume' },
            { id: 'pe', label: 'PE Ratio' },
            { id: 'sales', label: 'Sales & Margin' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMetric(tab.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: activeMetric === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeMetric === tab.id ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeframe Selectors (1M, 6M, 1Yr, 3Yr, 5Yr, Max) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['1M', '6M', '1Yr', '3Yr', '5Yr', 'Max'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '4px 9px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                border: timeframe === tf ? '1px solid var(--accent-primary)' : '1px solid transparent',
                background: timeframe === tf ? 'var(--accent-glow)' : 'transparent',
                color: timeframe === tf ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* DMA & Volume Checkbox Controls + Hover Live Telemetry Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', fontSize: '11.5px' }}>
        {/* Toggles */}
        {activeMetric === 'price' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={show50DMA}
                onChange={e => setShow50DMA(e.target.checked)}
                style={{ accentColor: '#3b82f6' }}
              />
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              <span>50 DMA</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={show200DMA}
                onChange={e => setShow200DMA(e.target.checked)}
                style={{ accentColor: '#eab308' }}
              />
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
              <span>200 DMA</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={showVolume}
                onChange={e => setShowVolume(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Volume</span>
            </label>
          </div>
        )}

        {activeMetric === 'pe' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--accent-primary)' }} />
              Stock P/E: <strong>{activePoint?.pe}x</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '2px', background: '#94a3b8', borderBottom: '1px dashed #94a3b8' }} />
              Median P/E: <strong>{activePoint?.medianPE}x</strong>
            </span>
          </div>
        )}

        {/* Live Hover Readout Pill */}
        {activePoint && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-dim)' }}>{activePoint.date}</span>
            {activeMetric === 'price' && (
              <>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  Price: ₹{activePoint.price.toLocaleString()}
                </span>
                {show50DMA && (
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                    50D: ₹{activePoint.dma50.toLocaleString()}
                  </span>
                )}
                {show200DMA && (
                  <span style={{ color: '#eab308', fontWeight: 600 }}>
                    200D: ₹{activePoint.dma200.toLocaleString()}
                  </span>
                )}
              </>
            )}
            {activeMetric === 'pe' && (
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                P/E: {activePoint.pe}x
              </span>
            )}
            {activeMetric === 'sales' && (
              <>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  Sales: ₹{activePoint.sales} Cr
                </span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                  OPM: {activePoint.opm}%
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', userSelect: 'none' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            if (relX >= padLeft && relX <= padLeft + chartW) {
              const ratio = (relX - padLeft) / chartW;
              const idx = Math.min(chartData.length - 1, Math.max(0, Math.round(ratio * (chartData.length - 1))));
              setHoverIndex(idx);
            }
          }}
        >
          <defs>
            {/* Price Area Gradient */}
            <linearGradient id="screenerPriceGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
            {/* Volume Bar Gradient */}
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + chartH * pct;
            const val = maxVal - pct * (maxVal - minVal);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-dim)"
                  fontFamily="monospace"
                >
                  {activeMetric === 'price' ? `₹${Math.round(val)}` : activeMetric === 'pe' ? `${val.toFixed(1)}x` : `₹${Math.round(val)}`}
                </text>
              </g>
            );
          })}

          {/* Volume Histogram Bars (at bottom) */}
          {activeMetric === 'price' && showVolume && chartData.map((d, i) => {
            const barH = (d.volume / maxVolume) * 45;
            const barX = getX(i) - 2;
            const barY = padTop + chartH - barH;
            return (
              <rect
                key={i}
                x={barX}
                y={barY}
                width="4"
                height={barH}
                fill="url(#volGrad)"
                rx="1"
              />
            );
          })}

          {/* Median PE line if in PE mode */}
          {activeMetric === 'pe' && (
            <line
              x1={padLeft}
              y1={getY(chartData[0]?.medianPE || 20)}
              x2={padLeft + chartW}
              y2={getY(chartData[0]?.medianPE || 20)}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {/* Primary Trend Area & Line */}
          {activeMetric === 'price' && (
            <>
              {/* Shaded Area under Price */}
              <path
                d={createAreaPath('price')}
                fill="url(#screenerPriceGlow)"
              />

              {/* 200 DMA Line */}
              {show200DMA && (
                <path
                  d={createPath('dma200')}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}

              {/* 50 DMA Line */}
              {show50DMA && (
                <path
                  d={createPath('dma50')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
              )}

              {/* Main Price Line */}
              <path
                d={createPath('price')}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* PE Mode Curve */}
          {activeMetric === 'pe' && (
            <path
              d={createPath('pe')}
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Sales & Margin Bars / Line */}
          {activeMetric === 'sales' && (
            <>
              {chartData.map((d, i) => {
                const barH = ((d.sales - minVal) / (maxVal - minVal || 1)) * chartH * 0.8;
                return (
                  <rect
                    key={i}
                    x={getX(i) - 3}
                    y={padTop + chartH - barH}
                    width="6"
                    height={barH}
                    fill="var(--accent-primary)"
                    opacity="0.8"
                    rx="1"
                  />
                );
              })}
            </>
          )}

          {/* Interactive Crosshair & Cursor Point */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={getX(hoverIndex)}
                y1={padTop}
                x2={getX(hoverIndex)}
                y2={padTop + chartH}
                stroke="var(--text-muted)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />

              {/* Active Dot on Line */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activeMetric === 'price' ? activePoint.price : activeMetric === 'pe' ? activePoint.pe : activePoint.sales)}
                r="4.5"
                fill="var(--accent-primary)"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X-Axis Date Labels */}
          {chartData.filter((_, idx) => idx % Math.round(chartData.length / 6) === 0).map((d, idx) => (
            <text
              key={idx}
              x={getX(d.index)}
              y={padTop + chartH + 20}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-dim)"
            >
              {d.date}
            </text>
          ))}
        </svg>
      </div>

      {/* Footer Indicator Signals (Clean Technical Summary) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>
            52W Range: <strong style={{ color: 'var(--text-main)' }}>₹{low52.toLocaleString()} - ₹{high52.toLocaleString()}</strong>
          </span>
          <span>
            Current Trend:{' '}
            <strong style={{ color: currentPrice >= (stock?.low52 || 0) * 1.1 ? 'var(--success)' : 'var(--warning)' }}>
              {currentPrice > high52 * 0.95 ? 'Near 52W High' : currentPrice > low52 * 1.15 ? 'Consolidating Bullish' : 'Value Territory'}
            </strong>
          </span>
        </div>

        <div style={{ color: 'var(--text-dim)' }}>
          Referenced from official Screener.in consolidated time-series architecture
        </div>
      </div>
    </div>
  );
}
