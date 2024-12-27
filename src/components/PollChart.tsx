'use client';

import { useMemo } from 'react'
import type { Poll } from '../types'

interface PollChartProps {
  poll: Poll
}

const PollChart = ({ poll }: PollChartProps) => {
  const totalVotes = useMemo(() => 
    poll.options.reduce((sum, option) => sum + option.votes, 0),
    [poll.options]
  )

  const sortedOptions = useMemo(() => 
    [...poll.options].sort((a, b) => b.votes - a.votes),
    [poll.options]
  )

  const maxVotes = Math.max(...sortedOptions.map(o => o.votes));
  const tiedForFirst = sortedOptions.filter(o => o.votes === maxVotes);
  const isMultipleWinners = tiedForFirst.length > 1;

  return (
    <div className="space-y-4">
      {sortedOptions.map((option, index) => {
        const percentage = totalVotes > 0 
          ? Math.round((option.votes / totalVotes) * 100) 
          : 0

        const isWinner = option.votes === maxVotes;

        return (
          <div key={option.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{option.text}</span>
              <span className="text-gray-500">
                {option.votes} vote{option.votes !== 1 ? 's' : ''} ({percentage}%)
              </span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-3 rounded-full bg-gray-50">
                <div
                  style={{ width: `${percentage}%` }}
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                    isWinner
                      ? isMultipleWinners
                        ? 'from-indigo-600 to-indigo-250' // Égalité
                        : 'from-indigo-600 to-indigo-400' // Gagnant unique
                      : 'from-indigo-600 to-indigo-100' // Autres
                  }`}
                />
              </div>
            </div>
          </div>
        )
      })}

      <div className="text-sm text-gray-500 pt-2 border-t">
        Total des votes : {totalVotes}
      </div>
    </div>
  )
}

export default PollChart
