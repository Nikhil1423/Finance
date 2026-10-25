import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { usePortfolio } from '../context/PortfolioContext';
import { INITIAL_STOCKS } from '../data/stocksData';
import {
  Search,
  Layers,
  BarChart3,
  Sliders,
  Bookmark,
  Coins,
  Newspaper,
  Palette,
  CheckCircle2,
  BookOpen,
  Menu,
  X,
  Sparkles,
  Share2
} from 'lucide-react';

export default function Navbar({ allStocks = INITIAL_STOCKS }) {
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  const { portfolios, activePortfolio } = usePortfolio();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Extract currently active company ticker if on /company/:ticker
  const isCompanyRoute = location.pathname.startsWith('/company');
  const activeCompanyTicker = isCompanyRoute
    ? location.pathname.split('/')[2] || 'KALYANKJIL'
    : 'KALYANKJIL';

  const totalSavedCount = portfolios.reduce((acc, p) => acc + (p.stocks?.length || 0), 0);

  const handleSearchChange = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    const localMatches = allStocks.filter(s =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.ticker.toLowerCase().includes(q.toLowerCase()) ||
      s.sector.toLowerCase().includes(q.toLowerCase())
    );

    setSearchResults(localMatches);

    try {
      setIsSearching(true);
      const res = await fetch(`/api/screener/api/company/search/?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(item => ({
          ticker: item.url.replace('/company/', '').replace('/consolidated/', '').replace(/\//g, ''),
          name: item.name,
          sector: 'NSE / BSE Listed',
          isLiveResult: true
        }));
        const combined = [...localMatches];
        mapped.forEach(m => {
          if (!combined.some(c => c.ticker.toUpperCase() === m.ticker.toUpperCase())) {
            combined.push(m);
          }
        });
        setSearchResults(combined.slice(0, 8));
      }
    } catch {
      setSearchResults(localMatches);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (stock) => {
    setSearchQuery('');
    setSearchResults([]);
    setMobileMenuOpen(false);
    navigate(`/company/${stock.ticker.toUpperCase()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const ticker = searchQuery.trim().toUpperCase();
    setSearchQuery('');
    setSearchResults([]);
    setMobileMenuOpen(false);
    navigate(`/company/${ticker}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0];

  const navLinks = [
    { to: '/screener', label: 'Stocks', icon: Layers },
    { to: `/company/${activeCompanyTicker}`, label: 'Analysis', icon: BarChart3 },
    { to: '/marking-scheme', label: 'Marking Scheme', icon: Sliders },
    { to: '/portfolio', label: `Portfolios (${totalSavedCount})`, icon: Bookmark },
    { to: '/multi-asset', label: 'Macro & Assets', icon: Coins },
    { to: '/news', label: 'News', icon: Newspaper }
  ];

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        height: '56px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'nowrap',
        boxSizing: 'border-box'
      }}>
        {/* Brand & System Logo */}
        <NavLink
          to="/screener"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--badge-radius)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px var(--accent-glow)',
            flexShrink: 0
          }}>
            <BarChart3 size={18} color="#040812" strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Alpha<span style={{ color: 'var(--accent-primary)' }}>Terminal</span>
            </span>
            <span className="badge badge-accent hide-on-laptop-mini" style={{ fontSize: '9px', padding: '1px 5px' }}>
              2.0
            </span>
          </div>
        </NavLink>

        {/* Global Stock Search Bar (Laptop & Desktop) */}
        <div style={{ position: 'relative', flexShrink: 1, maxWidth: '240px', minWidth: '150px' }} className="desktop-search-container">
          <form onSubmit={handleSearchSubmit} style={{ margin: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--badge-radius)',
              padding: '5px 10px',
              gap: '6px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Search size={14} color="var(--text-dim)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search BSE/NSE..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
              {isSearching && <span style={{ fontSize: '10px', color: 'var(--accent-primary)', flexShrink: 0 }}>...</span>}
            </div>
          </form>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '115%',
              left: 0,
              width: '320px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--card-radius)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 350
            }}>
              {searchResults.map((stock, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(stock)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>
                      {stock.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                      <span className="num" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{stock.ticker}</span> • {stock.sector}
                    </div>
                  </div>
                  {stock.currentPrice && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 700, fontSize: '12px' }}>
                        ₹{Number(stock.currentPrice).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop / Laptop Navigation Links */}
        <nav className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--badge-radius)',
                  textDecoration: 'none',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={14} color="currentColor" style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions: WhatsApp Share, AI Copilot, Theme Picker & Mobile Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* WhatsApp Quick Share Button */}
          <button
            onClick={() => {
              const shareUrl = window.location.origin.includes('trycloudflare.com')
                ? window.location.origin
                : 'https://dispatched-mate-doom-composite.trycloudflare.com';
              const text = encodeURIComponent(`📈 Check out AlphaTerminal - Stock Screener & AI ChatGPT Analyst:\n\n${shareUrl}`);
              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              height: '32px',
              padding: '0 10px',
              borderRadius: 'var(--badge-radius)',
              border: 'none',
              background: '#25D366',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Share AlphaTerminal on WhatsApp"
          >
            <Share2 size={13} />
            <span className="theme-name-label">Share</span>
          </button>

          {/* Theme Selector Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThemeModal(!showThemeModal)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                height: '32px',
                padding: '0 8px',
                borderRadius: 'var(--badge-radius)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title={`Active Theme: ${currentThemeObj.name}`}
            >
              <Palette size={14} color="var(--accent-primary)" />
              <span className="theme-name-label">{currentThemeObj.name}</span>
            </button>

            {/* Theme Dropdown Modal */}
            {showThemeModal && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '260px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--card-radius)',
                padding: '10px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.55)',
                zIndex: 350
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sparkles size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Visual Themes ({themes.length} Designs)
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setCurrentTheme(t.id);
                        setShowThemeModal(false);
                      }}
                      style={{
                        padding: '7px 9px',
                        borderRadius: 'var(--badge-radius)',
                        border: currentTheme === t.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: currentTheme === t.id ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{t.tagline}</div>
                      </div>
                      {currentTheme === t.id && <CheckCircle2 size={14} color="var(--accent-primary)" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button (Collapses cleanly on small laptops & tablets) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--badge-radius)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Collapsible Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          padding: '12px 16px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Quick Search on Mobile */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--badge-radius)',
              padding: '8px 12px',
              gap: '8px'
            }}>
              <Search size={15} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search any BSE/NSE stock..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '13px', width: '100%' }}
              />
            </div>
          </form>

          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
            Navigation
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--badge-radius)',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-main)',
                  background: isActive ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  fontSize: '13.5px',
                  fontWeight: 600
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color="currentColor" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
