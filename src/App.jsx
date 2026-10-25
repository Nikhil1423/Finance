import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { RulesProvider } from './context/RulesContext';
import { INITIAL_STOCKS } from './data/stocksData';

import TickerTape from './components/TickerTape';
import Navbar from './components/Navbar';
import ScreenerPage from './pages/ScreenerPage';
import CompanyAnalysisPage from './pages/CompanyAnalysisPage';
import MarkingSchemePage from './pages/MarkingSchemePage';
import PortfolioPage from './pages/PortfolioPage';
import MultiAssetPage from './pages/MultiAssetPage';
import NewsPage from './pages/NewsPage';

export default function App() {
  const [allStocks] = useState(INITIAL_STOCKS);

  return (
    <HashRouter>
      <ThemeProvider>
        <PortfolioProvider>
          <RulesProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              {/* Live Streaming Ticker Tape */}
              <TickerTape />

              {/* Multipage Responsive Navigation */}
              <Navbar allStocks={allStocks} />

              {/* Multipage Routing Body */}
              <main style={{ flex: '1', paddingBottom: '40px' }}>
                <Routes>
                  {/* Home redirects to Screener Radar */}
                  <Route path="/" element={<Navigate to="/screener" replace />} />
                  <Route path="/screener" element={<ScreenerPage allStocks={allStocks} />} />

                  {/* Dynamic Company Deep Analysis - Any BSE/NSE Ticker */}
                  <Route path="/company/:ticker" element={<CompanyAnalysisPage allStocks={allStocks} />} />
                  <Route path="/company" element={<Navigate to="/company/KALYANKJIL" replace />} />

                  {/* Dedicated Marking Scheme & Rules Customizer Page */}
                  <Route path="/marking-scheme" element={<MarkingSchemePage />} />

                  {/* Saved Portfolio & Allocation Planner */}
                  <Route path="/portfolio" element={<PortfolioPage allStocks={allStocks} />} />

                  {/* Multi-Asset Macro Radar (Gold, Silver, Forex, Crypto) */}
                  <Route path="/multi-asset" element={<MultiAssetPage />} />

                  {/* Market News & Catalysts */}
                  <Route path="/news" element={<NewsPage />} />

                  {/* Fallback to Screener */}
                  <Route path="*" element={<Navigate to="/screener" replace />} />
                </Routes>
              </main>

              {/* Responsive Footer */}
              <footer style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                padding: '16px 20px',
                fontSize: '12px',
                color: 'var(--text-dim)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                  AlphaTerminal • Institutional Fundamental &amp; Technical Evaluation Engine
                </div>
              </footer>
            </div>
          </RulesProvider>
        </PortfolioProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
