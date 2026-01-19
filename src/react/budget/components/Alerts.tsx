import type { ReactElement } from 'react';
import { iconifyIcon } from '../config';
import type { CalculatedValues } from '../types';

interface AlertsProps {
  calculated: CalculatedValues;
  totalExpenses: number;
}

export function Alerts({ calculated, totalExpenses }: AlertsProps) {
  const { surplus, savingsRate } = calculated;
  
  const alerts: ReactElement[] = [];
  
  if (surplus <= 0) {
    alerts.push(
      <div key="critical" className="alert alert-error" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:alert', '1em')} Critical:</strong> You're spending more than you earn! Reduce expenses immediately.`
      }} />
    );
  } else if (savingsRate < 10) {
    alerts.push(
      <div key="low" className="alert alert-warning" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:alert', '1em')} Low Savings Rate:</strong> Try to save at least 15% of your income. Consider reviewing discretionary expenses.`
      }} />
    );
  } else if (savingsRate >= 30) {
    alerts.push(
      <div key="excellent" className="alert alert-success" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:party-popper', '1em')} Excellent!</strong> You're saving over 30% - great job! This puts you on track for financial independence.`
      }} />
    );
  } else if (savingsRate >= 15) {
    alerts.push(
      <div key="good" className="alert alert-success" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:check-circle', '1em')} Good!</strong> You're on track with a healthy savings rate. Keep it up!`
      }} />
    );
  }
  
  // Emergency fund check
  const recommendedEmergencyFund = totalExpenses * 3;
  const idealEmergencyFund = totalExpenses * 6;
  const currentBuffer = calculated.buffer;
  
  if (surplus > 0) {
    if (currentBuffer < recommendedEmergencyFund) {
      alerts.push(
        <div key="emergency" className="alert alert-warning">
          <strong>Emergency Fund:</strong> Build up to €{recommendedEmergencyFund.toLocaleString('en-US', { maximumFractionDigits: 0 })} (3 months expenses) before aggressive investing. Current buffer: €{currentBuffer.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      );
    } else if (currentBuffer < idealEmergencyFund) {
      alerts.push(
        <div key="emergency-ideal" className="alert alert-info">
          <strong>Emergency Fund:</strong> Good start! Consider building to €{idealEmergencyFund.toLocaleString('en-US', { maximumFractionDigits: 0 })} (6 months) for better security.
        </div>
      );
    }
  }
  
  return (
    <div className="flex flex-col gap-2">
      {alerts}
    </div>
  );
}
