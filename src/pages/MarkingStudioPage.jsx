import React, { useState } from 'react';
import { useRules, DEFAULT_RULES } from '../context/RulesContext';
import {
  Sliders,
  RotateCcw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function MarkingStudioPage() {
  const {
    rules,
    updateStage1Cutoff,
    updateWeight,
    addCustomChecklistItem,
    toggleCustomChecklistItem,
    removeCustomChecklistItem,
    resetToDefault
  } = useRules();

  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRulePoints, setNewRulePoints] = useState('0.5');

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;
    addCustomChecklistItem(newRuleTitle.trim(), newRulePoints);
    setNewRuleTitle('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              Marking Scheme Studio
            </h1>
            <span className="badge badge-accent">Rules Customizer</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Customize point weightings, cutoff benchmarks, and add future evaluation criteria to your engine
          </p>
        </div>

        <button onClick={resetToDefault} className="btn-secondary" style={{ fontSize: '12px' }}>
          <RotateCcw size={14} />
          <span>Reset to Default Benchmarks</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
        {/* Core Cutoff Controls */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sliders size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              Gatekeeper Cutoff Thresholds
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Non-Banking Stage 1 Cutoff (/10 Points):
                </span>
                <span className="num" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {rules.stage1Cutoff} pts
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="8.5"
                step="0.25"
                value={rules.stage1Cutoff}
                onChange={(e) => updateStage1Cutoff(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Recommended Baseline: <strong>6.5 Points</strong> (Stocks below this score are strictly rejected).
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Banking &amp; NBFC Stage 1 Cutoff (/9 Points):
                </span>
                <span className="num" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {rules.bankCutoff} pts
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Automatically reduces max score by 1 point because Debt-to-Equity is meaningless for lenders.
              </div>
            </div>
          </div>
        </div>

        {/* Custom Checklist Addition */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              Add Future Marking Schemes &amp; Rules
            </h3>
          </div>

          <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. Promoter pledging must be 0%..."
              value={newRuleTitle}
              onChange={(e) => setNewRuleTitle(e.target.value)}
              style={{
                flex: '1',
                minWidth: '220px',
                padding: '8px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--badge-radius)',
                color: 'var(--text-main)',
                fontSize: '13px'
              }}
            />
            <select
              value={newRulePoints}
              onChange={(e) => setNewRulePoints(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--badge-radius)',
                color: 'var(--text-main)',
                fontSize: '13px'
              }}
            >
              <option value="0.25">+0.25 pt</option>
              <option value="0.50">+0.50 pt</option>
              <option value="1.00">+1.00 pt</option>
            </select>
            <button type="submit" className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
              <PlusCircle size={15} /> Add Rule
            </button>
          </form>

          {/* Active Custom Rules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rules.customChecklist.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--badge-radius)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
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
                  <span className="badge badge-accent">+{item.points} pt</span>
                  <button onClick={() => removeCustomChecklistItem(item.id)} style={{ color: 'var(--danger)', padding: '4px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
