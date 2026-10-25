import React, { useState } from 'react';
import { MARKET_NEWS } from '../data/stocksData';
import {
  Newspaper,
  ExternalLink,
  Clock,
  Tag,
  TrendingUp,
  AlertCircle,
  Globe,
  Landmark,
  ShieldAlert,
  Flame,
  Search,
  CheckCircle,
  Radio,
  ArrowUpRight
} from 'lucide-react';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'market', 'geopolitics', 'policy'
  const [selectedEconomy, setSelectedEconomy] = useState('all'); // 'all', 'India', 'USA', 'China', 'Europe', 'Global'
  const [searchQuery, setSearchQuery] = useState('');

  // Leading External Financial News Tellers & Intelligence Terminals
  const newsTellers = [
    {
      name: 'Reuters World & Macro',
      coverage: 'Global Geopolitics, Crude Logistics & Trade Wars',
      url: 'https://www.reuters.com/markets/',
      tag: 'Global Wire',
      badgeColor: '#3b82f6'
    },
    {
      name: 'Bloomberg Markets',
      coverage: 'Sovereign Debt, Currency Reserves & Central Banks',
      url: 'https://www.bloomberg.com/markets',
      tag: 'Terminal Feed',
      badgeColor: '#8b5cf6'
    },
    {
      name: 'Financial Times Global',
      coverage: 'US Fed, ECB, PBOC Monetary Policies & Macro',
      url: 'https://www.ft.com/global-economy',
      tag: 'Institutional',
      badgeColor: '#ec4899'
    },
    {
      name: 'Moneycontrol Livewire',
      coverage: 'NSE/BSE Corporate Results, FII/DII Orders',
      url: 'https://www.moneycontrol.com/news/business/markets/',
      tag: 'Domestic Equities',
      badgeColor: '#10b981'
    },
    {
      name: 'Economic Times Macro',
      coverage: 'Union Ministry Policies, RBI MPC, PLI Capex',
      url: 'https://economictimes.indiatimes.com/news/economy',
      tag: 'India Policy',
      badgeColor: '#f59e0b'
    },
    {
      name: 'LiveMint Enterprise',
      coverage: 'Audited Financials, SEBI Directives & Governance',
      url: 'https://www.livemint.com/market',
      tag: 'Deep Corporate',
      badgeColor: '#06b6d4'
    }
  ];

  // Major Economies Policy & Interest Rate Dashboard
  const majorEconomiesPolicy = [
    {
      country: 'India (RBI)',
      status: 'Repo Rate: 6.50%',
      stance: 'Neutral / Growth Anchored',
      gdp: '7.2% YoY GDP',
      keyPolicy: 'PLI Capex Incentives & Infrastructure Outlay',
      impact: 'FII stability in domestic manufacturing & banking',
      color: '#10b981'
    },
    {
      country: 'United States (Fed)',
      status: 'Fed Funds: 4.75% - 5.00%',
      stance: 'Easing / Rate Cut Cycle',
      gdp: '2.8% Ann. Growth',
      keyPolicy: 'Inflation Reduction Act & CHIPS Act export controls',
      impact: 'Lower 10Y US Yields benefit Emerging Market inflows',
      color: '#3b82f6'
    },
    {
      country: 'China (PBOC)',
      status: '7-Day Reverse Repo: 1.50%',
      stance: 'Aggressive Liquidity Injections',
      gdp: '4.8% Target Pressure',
      keyPolicy: '2T Yuan Housing & Consumption Stimulus package',
      impact: 'Surge in Global Industrial Metals (Copper, Steel)',
      color: '#ef4444'
    },
    {
      country: 'Eurozone (ECB)',
      status: 'Deposit Facility: 3.25%',
      stance: 'Disinflationary Easing',
      gdp: '0.8% Subdued Stagnation',
      keyPolicy: 'Green Energy Transition & Energy Security Subsidies',
      impact: 'EUR/USD parity pressures & European export drag',
      color: '#8b5cf6'
    },
    {
      country: 'Japan (BoJ)',
      status: 'Policy Rate: 0.25%',
      stance: 'Hawkish Normalization',
      gdp: '1.2% Real Growth',
      keyPolicy: 'Exiting Negative Rate Era & Yen Defense',
      impact: 'Yen Carry-Trade unwinds cause transient volatility',
      color: '#f59e0b'
    }
  ];

  // Filtering news items
  const filteredNews = MARKET_NEWS.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedEconomy !== 'all' && item.economy !== selectedEconomy) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchTag = item.tag.toLowerCase().includes(q);
      const matchSource = item.source.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchTag && !matchSource) return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
              Global Marketwire &amp; Policy Radar
            </h1>
            <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} className="spin-icon" color="var(--accent-primary)" /> Live Dispatch
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Stock market corporate catalysts, geopolitical trade logistics, and government policies of major world economies
          </p>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: MAJOR ECONOMIES GOVERNMENT POLICY RADAR
      ========================================================= */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
              Major Economies Central Bank &amp; Government Policy Matrix
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Updated for current global monetary cycle
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {majorEconomiesPolicy.map((eco, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--badge-radius)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `3px solid ${eco.color}`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {eco.country}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: eco.color }}>
                    {eco.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Stance: <strong>{eco.stance}</strong> • {eco.gdp}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-main)', marginTop: '6px', lineHeight: 1.4, fontWeight: 500 }}>
                  {eco.keyPolicy}
                </div>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '10.5px', color: 'var(--text-dim)' }}>
                Impact: {eco.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          SECTION 2: EXTERNAL NEWS TELLER CONNECTORS
      ========================================================= */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
              Connected Institutional News Tellers &amp; Fast Terminals
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Direct access to authenticated international news services
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {newsTellers.map((teller, idx) => (
            <a
              key={idx}
              href={teller.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--badge-radius)',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {teller.name}
                </span>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 6px 0', lineHeight: 1.35 }}>
                {teller.coverage}
              </p>
              <span className="badge" style={{ alignSelf: 'flex-start', fontSize: '9.5px', background: 'var(--bg-card)', color: teller.badgeColor, border: `1px solid ${teller.badgeColor}40` }}>
                {teller.tag}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* =========================================================
          SECTION 2.5: GEOPOLITICAL INTELLIGENCE & EXPERT ANALYSTS
      ========================================================= */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--card-radius)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Specialized Geopolitical &amp; Macro Intelligence Feeds
            </h3>
          </div>
          <span className="badge badge-accent" style={{ fontSize: '10.5px' }}>
            Curated Analysts
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {/* Prashant Dhawan */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Prashant Dhawan (World Affairs &amp; Skills)
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '2px' }}>
                    Global Geopolitics, Supply Chains &amp; Foreign Policy
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '10px' }}>
                  YouTube Channel
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, margin: '8px 0 12px 0' }}>
                Exhaustive daily briefings on international diplomacy, Strait of Hormuz oil shipping routes, China Rare Earth restrictions, and macro strategic impacts on Indian markets.
              </p>
            </div>
            <a
              href="https://www.youtube.com/@adda247-skills"
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
            >
              <span>Watch Prashant Dhawan Analysis</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Ankit Agarwal / Study IQ IAS */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--badge-radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Ankit Agarwal Sir (Study IQ IAS)
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, marginTop: '2px' }}>
                    Economic Policy, RBI Directives &amp; Indian Macro
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '10px' }}>
                  Study IQ Briefing
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, margin: '8px 0 12px 0' }}>
                Detailed breakdowns of Union fiscal policies, banking liquidity, semiconductor manufacturing outlays, trade agreements, and bilateral geopolitical developments.
              </p>
            </div>
            <a
              href="https://www.youtube.com/watch?v=NvihDW2V_4Y"
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
            >
              <span>Watch Ankit Agarwal Briefing</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 3: INTERACTIVE FILTER & SEARCH BAR
      ========================================================= */}
      <div className="card" style={{ marginBottom: '18px', padding: '12px 16px', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: '🌐 All News Wire' },
              { id: 'market', label: '📈 Stock Markets & Results' },
              { id: 'geopolitics', label: '⚔️ Geopolitics & Crude' },
              { id: 'policy', label: '🏛️ Government Policies' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--badge-radius)',
                  border: selectedCategory === cat.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: selectedCategory === cat.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                  color: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Economy Selector & Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600 }}>Economy:</span>
              <select
                value={selectedEconomy}
                onChange={(e) => setSelectedEconomy(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--badge-radius)',
                  padding: '5px 8px',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="all">All Economies</option>
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="China">China</option>
                <option value="Europe">Europe</option>
                <option value="Global">Global</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--badge-radius)', padding: '4px 10px', gap: '6px', minWidth: '200px' }}>
              <Search size={13} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search headlines, RBI, crude..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  width: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 4: NEWS FEED STREAM
      ========================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredNews.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No news items match your current filter parameters. Try clearing the search.
          </div>
        ) : (
          filteredNews.map((news) => (
            <div key={news.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-accent" style={{ fontSize: '11px' }}>{news.tag}</span>
                  <span className="badge" style={{ fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    {news.economy}
                  </span>
                  {news.impactAsset && (
                    <span className="badge" style={{ fontSize: '11px', background: 'rgba(234, 179, 8, 0.12)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
                      Impact: {news.impactAsset}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {news.time}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${news.sentiment.includes('Bullish') || news.sentiment === 'Positive' ? 'badge-pass' : news.sentiment.includes('Risk-Off') ? 'badge-fail' : 'badge-warn'}`}>
                    {news.sentiment}
                  </span>
                  <a
                    href={news.sourceUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11.5px', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                  >
                    <span>{news.source}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.4 }}>
                {news.title}
              </h3>

              {/* Summary */}
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                {news.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
