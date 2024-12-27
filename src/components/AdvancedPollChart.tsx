'use client';

import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Poll } from '@/types/poll';

interface AdvancedPollChartProps {
  poll: Poll;
}

export function AdvancedPollChart({ poll }: AdvancedPollChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Calculer les statistiques
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const chartData = poll.options.map(option => ({
    name: option.text,
    value: option.votes,
    percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
  }));

  // Configuration commune pour les graphiques
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#6366F1', // indigo-500
    '#EC4899'  // pink-500
  ];

  // Options pour le graphique en camembert
  const pieOptions = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percentage = (params.value / totalVotes * 100).toFixed(1);
        return `${params.name}<br/>${params.value} vote${params.value !== 1 ? 's' : ''} (${percentage}%)`;
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    color: colors,
    series: [
      {
        name: 'Votes',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: chartData
      }
    ]
  };

  // Options pour le graphique en barres
  const barOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0];
        const percentage = (data.value / totalVotes * 100).toFixed(1);
        return `${data.name}<br/>${data.value} vote${data.value !== 1 ? 's' : ''} (${percentage}%)`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    color: colors,
    series: [
      {
        name: 'Votes',
        type: 'bar',
        data: chartData.map(item => item.value),
        itemStyle: {
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Boutons de sélection du type de graphique */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setChartType('pie')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === 'pie'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Camembert
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === 'bar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Barres
        </button>
      </div>

      {/* Graphique */}
      <div className="h-[400px] w-full bg-white rounded-lg p-4">
        <ReactECharts
          option={chartType === 'pie' ? pieOptions : barOptions}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>

      {/* Statistiques détaillées */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Statistiques détaillées</h3>
        <div className="space-y-2">
          {chartData.map((option, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{option.name}</span>
              </div>
              <div className="text-gray-600">
                {option.value} vote{option.value !== 1 ? 's' : ''} ({option.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 