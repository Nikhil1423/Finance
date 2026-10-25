import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  ArrowDownRight,
  Radio,
  Zap,
  Globe,
  Gauge,
  Sparkles
} from 'lucide-react';

export default function TickerTape() {
  const navigate = useNavigate();
  // Smooth, comfortable slow duration for effortless reading
  const speedSec = 88;

  const tickerItems = [
    // --- Major Indian Domestic Benchmarks ---
    {
      type: 'INDEX',
      symbol: 'NIFTY 50',
      price: '24,865.40',
      pts: '+128.40',
      change: '+0.52%',
      isUp: true,
      tag: 'NSE'
    },
    {
      type: 'INDEX',
      symbol: 'SENSEX',
      price: '81,598.20',
      pts: '+355.10',
      change: '+0.44%',
      isUp: true,
      tag: 'BSE'
    },
    {
      type: 'INDEX',
      symbol: 'BANK NIFTY',
      price: '51,280.15',
      pts: '+345.80',
      change: '+0.68%',
      isUp: true,
      tag: 'BANKING'
    },
    {
      type: 'INDEX',
      symbol: 'NIFTY IT',
      price: '41,750.30',
      pts: '+475.20',
      change: '+1.15%',
      isUp: true,
      tag: 'TECH'
    },
    {
      type: 'INDEX',
      symbol: 'NIFTY AUTO',
      price: '26,140.20',
      pts: '+285.40',
      change: '+1.10%',
      isUp: true,
      tag: 'AUTO'
    },
    {
      type: 'INDEX',
      symbol: 'INDIA VIX',
      price: '13.42',
      pts: '-0.30',
      change: '-2.18%',
      isUp: false,
      tag: 'VOLATILITY'
    },

    // --- Market Breadth & Institutional Liquidity Flows ---
    {
      type: 'FLOW',
      symbol: 'FII NET FLOW',
      price: '+₹3,450 Cr',
      pts: 'Net Buying',
      change: 'Cash Segment',
      isUp: true,
      tag: 'INSTITUTIONAL'
    },
    {
      type: 'FLOW',
      symbol: 'DII NET FLOW',
      price: '+₹1,820 Cr',
      pts: 'Domestic Support',
      change: 'SIP Accumulation',
      isUp: true,
      tag: 'DOMESTIC'
    },
    {
      type: 'FLOW',
      symbol: 'MARKET BREADTH',
      price: 'A/D: 1,420 / 980',
      pts: 'Adv 59%',
      change: 'Bullish Tilt',
      isUp: true,
      tag: 'BREADTH'
    },

    // --- Global Market Benchmarks ---
    {
      type: 'GLOBAL',
      symbol: 'GIFT NIFTY',
      price: '24,910.00',
      pts: '+78.50',
      change: '+0.32%',
      isUp: true,
      tag: 'GLOBAL'
    },
    {
      type: 'GLOBAL',
      symbol: 'S&P 500',
      price: '5,815.20',
      pts: '+23.40',
      change: '+0.40%',
      isUp: true,
      tag: 'US MARKET'
    },
    {
      type: 'GLOBAL',
      symbol: 'NASDAQ',
      price: '18,340.50',
      pts: '+118.20',
      change: '+0.65%',
      isUp: true,
      tag: 'US TECH'
    },
    {
      type: 'GLOBAL',
      symbol: 'NIKKEI 225',
      price: '39,600.00',
      pts: '+216.00',
      change: '+0.55%',
      isUp: true,
      tag: 'ASIA'
    },

    // --- Top Gainers (NSE & BSE) ---
    {
      type: 'GAINER',
      symbol: 'TRENT',
      price: '₹7,850.00',
      pts: '+360.50',
      change: '+4.82%',
      isUp: true,
      isStock: true,
      badge: 'ATH',
      tag: 'RETAIL'
    },
    {
      type: 'GAINER',
      symbol: 'DIXON',
      price: '₹13,420.00',
      pts: '+510.00',
      change: '+3.95%',
      isUp: true,
      isStock: true,
      badge: '52W HIGH',
      tag: 'EMS / TECH'
    },
    {
      type: 'GAINER',
      symbol: 'BEL',
      price: '₹295.40',
      pts: '+9.15',
      change: '+3.20%',
      isUp: true,
      isStock: true,
      badge: 'DEFENSE',
      tag: 'ORDER WIN'
    },
    {
      type: 'GAINER',
      symbol: 'KALYANKJIL',
      price: '₹514.80',
      pts: '+13.80',
      change: '+2.75%',
      isUp: true,
      isStock: true,
      badge: 'GROWTH',
      tag: 'CONSUMER'
    },
    {
      type: 'GAINER',
      symbol: 'BHARTIARTL',
      price: '₹1,680.00',
      pts: '+40.60',
      change: '+2.48%',
      isUp: true,
      isStock: true,
      badge: 'TELECOM',
      tag: 'ARPU EXPANSION'
    },
    {
      type: 'GAINER',
      symbol: 'CDSL',
      price: '₹1,580.00',
      pts: '+34.20',
      change: '+2.21%',
      isUp: true,
      isStock: true,
      badge: 'MONOPOLY',
      tag: 'DEMAT SURGE'
    },
    {
      type: 'GAINER',
      symbol: 'ZOMATO',
      price: '₹275.50',
      pts: '+5.80',
      change: '+2.15%',
      isUp: true,
      isStock: true,
      badge: 'BLINKIT',
      tag: 'QUICK COMMERCE'
    },

    // --- Top Losers (NSE & BSE) ---
    {
      type: 'LOSER',
      symbol: 'INDUSINDBK',
      price: '₹1,340.00',
      pts: '-47.40',
      change: '-3.42%',
      isUp: false,
      isStock: true,
      badge: 'SLIPPAGE',
      tag: 'NPA PRESSURE'
    },
    {
      type: 'LOSER',
      symbol: 'BPCL',
      price: '₹342.10',
      pts: '-9.30',
      change: '-2.65%',
      isUp: false,
      isStock: true,
      badge: 'OMC',
      tag: 'MARGIN SQUEEZE'
    },
    {
      type: 'LOSER',
      symbol: 'TATASTEEL',
      price: '₹158.40',
      pts: '-3.40',
      change: '-2.10%',
      isUp: false,
      isStock: true,
      badge: 'METALS',
      tag: 'CHINA DUMPING'
    },
    {
      type: 'LOSER',
      symbol: 'HINDALCO',
      price: '₹685.20',
      pts: '-12.90',
      change: '-1.85%',
      isUp: false,
      isStock: true,
      badge: 'NOVELIS',
      tag: 'CYCLICAL'
    },
    {
      type: 'LOSER',
      symbol: 'JSWSTEEL',
      price: '₹982.00',
      pts: '-13.90',
      change: '-1.40%',
      isUp: false,
      isStock: true,
      badge: 'CAPEX',
      tag: 'COKING COAL'
    },

    // --- Commodities, Forex & Sovereign Yields ---
    {
      type: 'MACRO',
      symbol: 'MCX GOLD (10g)',
      price: '₹89,450',
      pts: '+1,250',
      change: '+1.42%',
      isUp: true,
      tag: '24K BULLION'
    },
    {
      type: 'MACRO',
      symbol: 'MCX SILVER (1kg)',
      price: '₹1,04,200',
      pts: '+2,880',
      change: '+2.85%',
      isUp: true,
      tag: 'SOLAR METAL'
    },
    {
      type: 'MACRO',
      symbol: 'BRENT CRUDE',
      price: '$78.45',
      pts: '+1.27',
      change: '+1.65%',
      isUp: true,
      tag: 'ENERGY'
    },
    {
      type: 'MACRO',
      symbol: 'USD / INR',
      price: '₹88.62',
      pts: '+0.10',
      change: '+0.12%',
      isUp: true,
      tag: 'FOREX'
    },
    {
      type: 'MACRO',
      symbol: 'US 10Y YIELD',
      price: '3.98%',
      pts: '-0.05',
      change: '-1.24%',
      isUp: false,
      tag: 'TREASURY'
    },
    {
      type: 'MACRO',
      symbol: 'DXY DOLLAR INDEX',
      price: '103.25',
      pts: '-0.29',
      change: '-0.28%',
      isUp: false,
      tag: 'DXY'
    },
    {
      type: 'MACRO',
      symbol: 'BITCOIN',
      price: '$94,250',
      pts: '+3,750',
      change: '+4.15%',
      isUp: true,
      tag: 'CRYPTO'
    }
  ];

  // Duplicate for seamless infinite loop marquee
  const loopedItems = [...tickerItems, ...tickerItems];

  const handleItemClick = (item) => {
    if (item.isStock) {
      navigate(`/company/${item.symbol}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      height: '36px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      fontFamily: 'var(--font-mono)',
      userSelect: 'none'
    }}>
      {/* Pinned Left Minimal Badge: MARKET WATCH */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        boxShadow: '4px 0 14px rgba(0,0,0,0.25)',
        flexShrink: 0
      }}>
        <span className="pulse-dot" />
        <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          MARKET WATCH
        </span>
      </div>

      {/* Continuously Moving Sideways Marquee Track */}
      <div style={{ overflow: 'hidden', flex: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
        <div
          className="ticker-marquee-track"
          style={{ animationDuration: `${speedSec}s` }}
        >
          {loopedItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 14px',
                cursor: item.isStock ? 'pointer' : 'default',
                fontSize: '11px',
                transition: 'opacity 0.15s ease'
              }}
              title={item.isStock ? `Click to inspect ${item.symbol} full analysis` : `${item.symbol} Telemetry`}
            >
              {/* Category Mini Pill */}
              {item.type === 'GAINER' && (
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  background: 'var(--success-bg)',
                  color: 'var(--success)'
                }}>
                  ▲ GAINER
                </span>
              )}
              {item.type === 'LOSER' && (
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)'
                }}>
                  ▼ LOSER
                </span>
              )}
              {item.type === 'INDEX' && (
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#3b82f6'
                }}>
                  {item.tag}
                </span>
              )}
              {item.type === 'FLOW' && (
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  background: 'rgba(168, 85, 247, 0.12)',
                  color: '#a855f7'
                }}>
                  FLOW
                </span>
              )}
              {item.type === 'GLOBAL' && (
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  background: 'rgba(234, 179, 8, 0.12)',
                  color: '#eab308'
                }}>
                  WORLD
                </span>
              )}

              {/* Special Badge (e.g. ATH, 52W HIGH) */}
              {item.badge && (
                <span style={{
                  fontSize: '8px',
                  fontWeight: 900,
                  padding: '1px 3px',
                  borderRadius: '2px',
                  background: 'var(--accent-glow)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)30'
                }}>
                  {item.badge}
                </span>
              )}

              {/* Symbol */}
              <span style={{
                color: item.isStock ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: item.isStock ? 800 : 700,
                letterSpacing: '-0.2px'
              }}>
                {item.symbol}:
              </span>

              {/* Price */}
              <span className="num" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {item.price}
              </span>

              {/* Absolute Points Change */}
              {item.pts && (
                <span className="num" style={{
                  color: item.isUp ? 'var(--success)' : 'var(--danger)',
                  fontSize: '10.5px',
                  fontWeight: 600
                }}>
                  {item.pts}
                </span>
              )}

              {/* Percentage Change */}
              <span style={{
                color: item.isUp ? 'var(--success)' : 'var(--danger)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1px',
                fontWeight: 700,
                fontSize: '10.5px'
              }}>
                {item.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {item.change}
              </span>

              {/* Separator dot */}
              <span style={{ color: 'var(--border-light)', marginLeft: '6px' }}>•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
