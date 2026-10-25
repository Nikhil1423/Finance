import React, { useState } from 'react';
import { TrendingUp, BarChart2, PieChart, Shield, Target } from 'lucide-react';

export default function FinancialCharts({ stock }) {
  const [hoveredQuarter, setHoveredQuarter] = useState(null);
  const [hoveredYear, setHoveredYear] = useState(null);

  const quarters = stock?.quarters || [];
  const balanceSheet = stock?.balanceSheet || [];

  // 1. Calculations for Quarterly Sales & Profit Chart
  const maxSales = Math.max(...quarters.map(q => q.sales || 0), 100);
  const chartHeight = 180;

  // 2. Calculations for Reserves vs Debt Chart
  const maxReservesDebt = Math.max(
    ...balanceSheet.map(b => Math.max(b.reserves || 0, b.borrowings || 0)),
    100
  );

  // 3. Shareholding Pattern
  const shareholding = stock?.shareholding || {
    promoter: 60.5,
    fii: 14.2,
    dii: 11.8,
    public: 13.5
  };

  // 4. Valuation Range Points
  const currentPrice = stock?.currentPrice || 100;
  const low52 = stock?.low52 || Math.round(currentPrice * 0.75);
  const high52 = stock?.high52 || Math.round(currentPrice * 1.35);
  const fairPrice = Math.round((stock?.eps || 10) * (stock?.industryPE || 25));
  const maxSafeBuy = Math.round(fairPrice * 0.8);
  const target3Y = Math.round(currentPrice * 1.55);

  const minRange = Math.min(low52, currentPrice, maxSafeBuy) * 0.9;
  const maxRange = Math.max(high52, target3Y, fairPrice) * 1.08;
  const rangeSpan = maxRange - minRange || 1;

  const getPositionPercent = (val) => {
    return Math.max(2, Math.min(98, ((val - minRange) / rangeSpan) * 100));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Chart Row: Valuation Price Gauge */}
      <div className="card" style={{ padding: '18px', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={17} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              Valuation Corridor &amp; Price Range Telemetry
            </h3>
          </div>
          <span className="badge badge-accent" style={{ fontSize: '11px' }}>
            Current: ₹{Number(currentPrice).toLocaleString()}
          </span>
        </div>

        {/* Visual Price Track */}
        <div style={{ padding: '24px 10px 10px 10px' }}>
          <div style={{
            position: 'relative',
            height: '10px',
            background: 'var(--bg-card)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            {/* Safe Buy Zone Highlight */}
            <div style={{
              position: 'absolute',
              left: `${getPositionPercent(minRange)}%`,
              width: `${Math.max(5, getPositionPercent(maxSafeBuy) - getPositionPercent(minRange))}%`,
              top: 0,
              bottom: 0,
              background: 'var(--success-bg)',
              borderRight: '2px dashed var(--success)',
              borderRadius: '6px 0 0 6px'
            }} />

            {/* Current Price Marker */}
            <div style={{
              position: 'absolute',
              left: `${getPositionPercent(currentPrice)}%`,
              top: '-16px',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}>
              <span className="num" style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                background: 'var(--bg-card)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--accent-primary)',
                whiteSpace: 'nowrap'
              }}>
                CMP: ₹{currentPrice}
              </span>
              <div style={{ width: '2px', height: '14px', background: 'var(--accent-primary)', marginTop: '2px' }} />
            </div>

            {/* Fair Price Marker */}
            <div style={{
              position: 'absolute',
              left: `${getPositionPercent(fairPrice)}%`,
              top: '12px',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ width: '2px', height: '10px', background: 'var(--text-dim)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Fair: ₹{fairPrice}
              </span>
            </div>

            {/* Target 3Y Marker */}
            <div style={{
              position: 'absolute',
              left: `${getPositionPercent(target3Y)}%`,
              top: '12px',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ width: '2px', height: '10px', background: 'var(--success)' }} />
              <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                3Y Target: ₹{target3Y}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '36px' }}>
            <span>52W Low: <strong>₹{low52}</strong></span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Buffett 20% Safety Buy Floor: <strong>₹{maxSafeBuy}</strong></span>
            <span>52W High: <strong>₹{high52}</strong></span>
          </div>
        </div>
      </div>

      {/* Second Row: 2 Grid Charts (Quarterly Trends & Reserves vs Debt) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Quarterly Sales & Net Profit Bar Chart */}
        <div className="card" style={{ padding: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                Quarterly Sales &amp; Net Profit (₹ Cr)
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--accent-primary)', borderRadius: '2px' }} /> Sales
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '2px' }} /> Net Profit
              </span>
            </div>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
            {quarters.map((q, idx) => {
              const salesHeight = Math.max(6, ((q.sales || 0) / maxSales) * chartHeight);
              const profitHeight = Math.max(4, ((q.netProfit || 0) / maxSales) * chartHeight * 3.5); // scaled for visual clarity

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredQuarter(q)}
                  onMouseLeave={() => setHoveredQuarter(null)}
                  style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                    {/* Sales Bar */}
                    <div
                      style={{
                        width: '45%',
                        height: `${salesHeight}px`,
                        background: 'linear-gradient(180deg, var(--accent-primary), rgba(56, 189, 248, 0.4))',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    {/* Net Profit Bar */}
                    <div
                      style={{
                        width: '45%',
                        height: `${profitHeight}px`,
                        background: 'linear-gradient(180deg, var(--success), rgba(34, 197, 94, 0.4))',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Quarter Label */}
                  <span style={{
                    position: 'absolute',
                    bottom: '-22px',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}>
                    {q.quarter}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quarter Hover Tooltip */}
          <div style={{ minHeight: '26px', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            {hoveredQuarter ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{hoveredQuarter.quarter}</strong>: Sales ₹{Number(hoveredQuarter.sales).toLocaleString()} Cr</span>
                <span>Net Profit: <strong style={{ color: 'var(--success)' }}>₹{Number(hoveredQuarter.netProfit).toLocaleString()} Cr</strong> (OPM: {hoveredQuarter.opm}%)</span>
              </div>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Hover over any quarter bar to inspect exact audited numbers.</span>
            )}
          </div>
        </div>

        {/* Chart 2: Fortress Balance Sheet (Reserves vs Debt) */}
        <div className="card" style={{ padding: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="var(--success)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                Reserves vs Borrowings Matrix (₹ Cr)
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '2px' }} /> Reserves
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '2px' }} /> Debt
              </span>
            </div>
          </div>

          {/* SVG Grouped Bar Chart for Balance Sheet */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
            {balanceSheet.map((b, idx) => {
              const resHeight = Math.max(6, ((b.reserves || 0) / maxReservesDebt) * chartHeight);
              const debtHeight = Math.max(6, ((b.borrowings || 0) / maxReservesDebt) * chartHeight);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredYear(b)}
                  onMouseLeave={() => setHoveredYear(null)}
                  style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                    {/* Reserves Bar */}
                    <div
                      style={{
                        width: '45%',
                        height: `${resHeight}px`,
                        background: 'linear-gradient(180deg, var(--success), rgba(34, 197, 94, 0.4))',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    {/* Borrowings (Debt) Bar */}
                    <div
                      style={{
                        width: '45%',
                        height: `${debtHeight}px`,
                        background: 'linear-gradient(180deg, var(--danger), rgba(239, 68, 68, 0.4))',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Year Label */}
                  <span style={{
                    position: 'absolute',
                    bottom: '-22px',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}>
                    {b.year}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Year Hover Tooltip */}
          <div style={{ minHeight: '26px', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            {hoveredYear ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{hoveredYear.year}</strong>: Reserves <strong style={{ color: 'var(--success)' }}>₹{Number(hoveredYear.reserves).toLocaleString()} Cr</strong></span>
                <span>Debt: <strong style={{ color: 'var(--danger)' }}>₹{Number(hoveredYear.borrowings || 0).toLocaleString()} Cr</strong></span>
              </div>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Fortress condition: Reserves expanding while debt remains low or declining.</span>
            )}
          </div>
        </div>
      </div>

      {/* Third Row: OPM % Trend Line & Shareholding Donut Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* OPM % Trend Chart */}
        <div className="card" style={{ padding: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <TrendingUp size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Operating Margin (OPM %) Stability Trend
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '10px' }}>
            {quarters.map((q, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: '1' }}>
                <div style={{
                  height: '70px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    width: '18px',
                    height: `${Math.max(10, ((q.opm || 10) / 40) * 65)}px`,
                    background: (q.opm || 0) >= 15 ? 'var(--accent-primary)' : 'var(--warning)',
                    borderRadius: '3px 3px 0 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }} />
                </div>
                <div className="num" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {q.opm}%
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {q.quarter}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shareholding Pattern Breakdown */}
        <div className="card" style={{ padding: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <PieChart size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Shareholding Pattern Distribution
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Promoter Holding:</span>
                <span className="num" style={{ fontWeight: 700, color: 'var(--success)' }}>{shareholding.promoter}%</span>
              </div>
              <div style={{ height: '7px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${shareholding.promoter}%`, height: '100%', background: 'var(--success)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Foreign Institutional (FII):</span>
                <span className="num" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{shareholding.fii}%</span>
              </div>
              <div style={{ height: '7px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${shareholding.fii}%`, height: '100%', background: 'var(--accent-primary)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Domestic Institutional (DII):</span>
                <span className="num" style={{ fontWeight: 700, color: 'var(--warning)' }}>{shareholding.dii}%</span>
              </div>
              <div style={{ height: '7px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${shareholding.dii}%`, height: '100%', background: 'var(--warning)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Public &amp; Others:</span>
                <span className="num" style={{ fontWeight: 700, color: shareholding.public < 50 ? 'var(--text-muted)' : 'var(--danger)' }}>
                  {shareholding.public}%
                </span>
              </div>
              <div style={{ height: '7px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${shareholding.public}%`, height: '100%', background: 'var(--text-dim)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
