import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { iconifyIcon } from '../config';
import type { CalculatedValues } from '../types';

interface AlertsProps {
  calculated: CalculatedValues;
  totalExpenses: number;
}

export function Alerts({ calculated, totalExpenses }: AlertsProps) {
  const { t } = useTranslation();
  const { surplus, savingsRate } = calculated;
  
  const alerts: ReactElement[] = [];
  
  if (surplus <= 0) {
    alerts.push(
      <div key="critical" className="alert alert-error" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:alert', '1em')} ${t('alerts.critical.title')}</strong> ${t('alerts.critical.message')}`
      }} />
    );
  } else if (savingsRate < 10) {
    alerts.push(
      <div key="low" className="alert alert-warning" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:alert', '1em')} ${t('alerts.lowSavings.title')}</strong> ${t('alerts.lowSavings.message')}`
      }} />
    );
  } else if (savingsRate >= 30) {
    alerts.push(
      <div key="excellent" className="alert alert-success" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:party-popper', '1em')} ${t('alerts.excellent.title')}</strong> ${t('alerts.excellent.message')}`
      }} />
    );
  } else if (savingsRate >= 15) {
    alerts.push(
      <div key="good" className="alert alert-success" dangerouslySetInnerHTML={{
        __html: `<strong>${iconifyIcon('mdi:check-circle', '1em')} ${t('alerts.good.title')}</strong> ${t('alerts.good.message')}`
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
          <strong>{t('alerts.emergency.title')}</strong> {t('alerts.emergency.recommended', { 
            amount: recommendedEmergencyFund.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            current: currentBuffer.toLocaleString('en-US', { maximumFractionDigits: 0 })
          })}
        </div>
      );
    } else if (currentBuffer < idealEmergencyFund) {
      alerts.push(
        <div key="emergency-ideal" className="alert alert-info">
          <strong>{t('alerts.emergency.title')}</strong> {t('alerts.emergency.ideal', { 
            amount: idealEmergencyFund.toLocaleString('en-US', { maximumFractionDigits: 0 })
          })}
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
