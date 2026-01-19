import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chart } from 'chart.js/auto';
import { expenseCategories } from '../config';
import type { CalculatedValues } from '../types';
import { getTranslatedCategoryName } from '../utils/getTranslatedCategory';

interface ExpensesChartProps {
  expenses: Record<string, number>;
  calculated: CalculatedValues;
}

export function ExpensesChart({ expenses, calculated }: ExpensesChartProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare data
    const categoriesData = expenseCategories
      .map(cat => ({
        id: cat.id,
        name: getTranslatedCategoryName(cat.id, t),
        value: expenses[cat.id] || 0,
        group: cat.group
      }))
      .filter(cat => cat.value > 0)
      .sort((a, b) => b.value - a.value);
    
    const labels = categoriesData.map(cat => cat.name.replace(/<[^>]*>/g, ''));
    const values = categoriesData.map(cat => cat.value);
    const colors = categoriesData.map(cat => 
      cat.group === 'essential' 
        ? 'rgba(34, 197, 94, 0.8)' 
        : 'rgba(251, 191, 36, 0.8)'
    );
    const borderColors = categoriesData.map(cat =>
      cat.group === 'essential'
        ? 'rgb(34, 197, 94)'
        : 'rgb(251, 191, 36)'
    );
    
    let config: any;
    
    if (chartType === 'pie') {
      config = {
        type: 'pie' as const,
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 11
                },
                generateLabels: function(chart: any) {
                  const data = chart.data;
                  if (data.labels && data.labels.length && data.datasets.length) {
                    return data.labels.map((label: any, i: any) => {
                      const value = (data.datasets[0].data[i] as number) || 0;
                      const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return {
                        text: `${label}: €${value.toLocaleString('en-US')} (${percentage}%)`,
                        fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                        strokeStyle: (data.datasets[0].borderColor as string[])[i],
                        lineWidth: 2,
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              callbacks: {
                label: function(context: any) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: €${value.toLocaleString('en-US')} (${percentage}%)`;
                }
              }
            }
          }
        }
      };
    } else {
      config = {
        type: 'bar' as const,
        data: {
          labels,
          datasets: [{
            label: 'Monthly Expense',
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              callbacks: {
                label: function(context: any) {
                  const value = context.parsed.x;
                  const total = calculated.totalExpenses;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `€${value.toLocaleString('en-US')} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return '€' + value.toLocaleString('en-US');
                },
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.08)'
              }
            },
            y: {
              ticks: {
                font: {
                  size: 11
                }
              },
              grid: {
                display: false
              }
            }
          }
        }
      };
    }
    
    chartRef.current = new Chart(ctx, config);
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartType, expenses, calculated, t]);
  
  return (
    <div>
      {/* Chart Type Toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          type="button"
          className={`btn btn-sm ${chartType === 'pie' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setChartType('pie')}
        >
          Pie Chart
        </button>
        <button
          type="button"
          className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setChartType('bar')}
        >
          Bar Chart
        </button>
      </div>
      
      <div className="bg-base-100 rounded-lg p-4">
        <canvas ref={canvasRef} height="400"></canvas>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-xs">{t('categories.totalExpenses')}</div>
          <div className="stat-value text-lg text-error">€{calculated.totalExpenses.toLocaleString('en-US')}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-xs">{t('categories.essentials')}</div>
          <div className="stat-value text-lg text-success">€{calculated.essentialTotal.toLocaleString('en-US')}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-xs">{t('categories.discretionary')}</div>
          <div className="stat-value text-lg text-warning">€{calculated.discretionaryTotal.toLocaleString('en-US')}</div>
        </div>
      </div>
    </div>
  );
}
