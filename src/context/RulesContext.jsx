import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEFAULT_RULES = {
  stage1Cutoff: 6.5,
  bankCutoff: 5.85,
  weights: {
    salesGrowth: 1.0,
    profitGrowth: 1.0,
    opm: 1.0,
    roe: 1.0,
    roce: 1.0,
    debtToEquity: 1.0,
    currentRatio: 1.0,
    interestCoverage: 1.0,
    peMultiple: 1.0,
    roa: 1.0
  },
  stage2Weights: {
    quarterlyResults: 2.0,
    plStatement: 3.0,
    balanceSheet: 1.0,
    cashFlow: 1.0,
    ratios: 2.0,
    shareholding: 1.0
  },
  strictRules: {
    publicHoldingMax: 50,
    debtorDaysMax: 120,
    marginOfSafetyMin: 20
  },
  customChecklist: [
    { id: 'c1', title: 'Promoter Pledging must be 0%', active: true, points: 0.5 },
    { id: 'c2', title: 'Zero negative cash flow in past 3 years', active: true, points: 0.5 },
    { id: 'c3', title: 'FII + DII holding expanding over last 2 quarters', active: true, points: 0.5 }
  ]
};

const RulesContext = createContext();

export function RulesProvider({ children }) {
  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem('analysis_scoring_rules');
      return saved ? JSON.parse(saved) : DEFAULT_RULES;
    } catch {
      return DEFAULT_RULES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('analysis_scoring_rules', JSON.stringify(rules));
    } catch (e) {
      console.error('Failed to save rules to localStorage', e);
    }
  }, [rules]);

  const updateStage1Cutoff = (cutoff) => {
    setRules(prev => ({ ...prev, stage1Cutoff: parseFloat(cutoff) }));
  };

  const updateWeight = (key, value) => {
    setRules(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: parseFloat(value)
      }
    }));
  };

  const addCustomChecklistItem = (title, points = 0.5) => {
    setRules(prev => ({
      ...prev,
      customChecklist: [
        ...prev.customChecklist,
        {
          id: 'custom_' + Date.now(),
          title,
          active: true,
          points: parseFloat(points)
        }
      ]
    }));
  };

  const toggleCustomChecklistItem = (id) => {
    setRules(prev => ({
      ...prev,
      customChecklist: prev.customChecklist.map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    }));
  };

  const removeCustomChecklistItem = (id) => {
    setRules(prev => ({
      ...prev,
      customChecklist: prev.customChecklist.filter(item => item.id !== id)
    }));
  };

  const resetToDefault = () => {
    setRules(DEFAULT_RULES);
  };

  return (
    <RulesContext.Provider
      value={{
        rules,
        updateStage1Cutoff,
        updateWeight,
        addCustomChecklistItem,
        toggleCustomChecklistItem,
        removeCustomChecklistItem,
        resetToDefault
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  return useContext(RulesContext);
}
