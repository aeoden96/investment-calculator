import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import type { ChartData } from '../types';
import { iconifyIcon } from '../config';

interface ProgressChartProps {
  chartData: ChartData;
  bufferLimit: number;
}

export function ProgressChart({ chartData, bufferLimit }: ProgressChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const config = {
      type: 'line' as const,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index' as const,
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold' as const
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context: any) {
                return context.dataset.label + ': €' + context.parsed.y.toLocaleString('en-US');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '€' + value.toLocaleString('en-US');
              },
              font: {
                size: 11
              },
              padding: 8
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.08)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              padding: 10
            }
          }
        }
      }
    };
    
    chartRef.current = new Chart(ctx, config);
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);
  
  return (
    <div>
      <div className="bg-base-100 rounded-lg p-4">
        <canvas ref={canvasRef} height="400"></canvas>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-xs">Starting Amount</div>
          <div className="stat-value text-lg">€{chartData.startingAmount.toLocaleString('en-US')}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-xs">After 12 Months</div>
          <div className="stat-value text-lg text-success">€{chartData.endingAmount.toLocaleString('en-US')}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-xs">Total Growth</div>
          <div className="stat-value text-lg text-success">€{chartData.growth.toLocaleString('en-US')}</div>
        </div>
      </div>
      
      {/* Buffer limit status */}
      <div className="mt-4">
        {chartData.bufferLimitReachedMonth >= 0 ? (
          <div className="alert alert-success" dangerouslySetInnerHTML={{
            __html: `<strong>${iconifyIcon('mdi:check-circle', '1em')} Buffer limit reached in ${chartData.labels[chartData.bufferLimitReachedMonth]}!</strong> Investment split switched to 100% investment from ${chartData.labels[chartData.bufferLimitReachedMonth]} onwards. Final buffer: €${chartData.finalBuffer.toLocaleString('en-US')}`
          }} />
        ) : bufferLimit > 0 ? (
          <div className="alert alert-info">
            Buffer limit not reached in 12 months. Current buffer: €{chartData.finalBuffer.toLocaleString('en-US')} / €{bufferLimit.toLocaleString('en-US')}
          </div>
        ) : null}
      </div>
    </div>
  );
}
