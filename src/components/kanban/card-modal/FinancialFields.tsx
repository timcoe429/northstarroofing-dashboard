'use client';

import React from 'react';
import { EditableField } from './EditableField';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface FinancialFieldsProps {
  quoteAmount: number | null;
  projectedCost: number | null;
  projectedProfit: number | null;
  projectedCommission: number | null;
  projectedOffice: number | null;
  onQuoteAmountChange: (value: number | null) => void;
  onProjectedCostChange: (value: number | null) => void;
  onProjectedProfitChange: (value: number | null) => void;
  onProjectedCommissionChange: (value: number | null) => void;
  onProjectedOfficeChange: (value: number | null) => void;
  onQuoteAmountSave: () => Promise<void>;
  onProjectedCostSave: () => Promise<void>;
  onProjectedProfitSave: () => Promise<void>;
  onProjectedCommissionSave: () => Promise<void>;
  onProjectedOfficeSave: () => Promise<void>;
  saveStates: {
    quote_amount?: SaveState;
    projected_cost?: SaveState;
    projected_profit?: SaveState;
    projected_commission?: SaveState;
    projected_office?: SaveState;
  };
}

export const FinancialFields: React.FC<FinancialFieldsProps> = ({
  quoteAmount,
  projectedCost,
  projectedProfit,
  projectedCommission,
  projectedOffice,
  onQuoteAmountChange,
  onProjectedCostChange,
  onProjectedProfitChange,
  onProjectedCommissionChange,
  onProjectedOfficeChange,
  onQuoteAmountSave,
  onProjectedCostSave,
  onProjectedProfitSave,
  onProjectedCommissionSave,
  onProjectedOfficeSave,
  saveStates,
}) => {
  // Calculate profit if quote and cost are available
  const calculatedProfit = quoteAmount && projectedCost 
    ? quoteAmount - projectedCost 
    : null;

  return (
    <div>
      <h3 style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#172b4d',
        marginBottom: 12,
        marginTop: 0,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        Financial Summary
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <EditableField
          label="Quote Amount"
          value={quoteAmount}
          type="currency"
          onChange={(value) => onQuoteAmountChange(typeof value === 'number' ? value : null)}
          onSave={onQuoteAmountSave}
          placeholder="$0.00"
          saveState={saveStates.quote_amount}
        />
        
        <EditableField
          label="Projected Cost"
          value={projectedCost}
          type="currency"
          onChange={(value) => onProjectedCostChange(typeof value === 'number' ? value : null)}
          onSave={onProjectedCostSave}
          placeholder="$0.00"
          saveState={saveStates.projected_cost}
        />
        
        {/* Show calculated profit if available */}
        {calculatedProfit !== null && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 4,
            background: '#f4f5f7',
            fontSize: 13,
            color: '#5e6c84',
          }}>
            <strong>Calculated Profit:</strong> ${calculatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        
        <EditableField
          label="Projected Profit"
          value={projectedProfit}
          type="currency"
          onChange={(value) => onProjectedProfitChange(typeof value === 'number' ? value : null)}
          onSave={onProjectedProfitSave}
          placeholder="$0.00"
          saveState={saveStates.projected_profit}
        />
        
        <EditableField
          label="Projected Commission"
          value={projectedCommission}
          type="currency"
          onChange={(value) => onProjectedCommissionChange(typeof value === 'number' ? value : null)}
          onSave={onProjectedCommissionSave}
          placeholder="$0.00"
          saveState={saveStates.projected_commission}
        />
        
        <EditableField
          label="Projected Office"
          value={projectedOffice}
          type="currency"
          onChange={(value) => onProjectedOfficeChange(typeof value === 'number' ? value : null)}
          onSave={onProjectedOfficeSave}
          placeholder="$0.00"
          saveState={saveStates.projected_office}
        />
      </div>
    </div>
  );
};
