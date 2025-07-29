import React from 'react';
import { ExternalLink, Clock, Users } from 'lucide-react';

interface GoblinPick {
  id: string;
  player: string;
  team: string;
  opponent: string;
  position: string;
  propType: string;
  line: string;
  lineValue: number;
  gameTime: string;
  scrapedAt: string;
  source: string;
  isGoblin: boolean;
  goblinReason: string;
}

interface PropTableProps {
  picks: GoblinPick[];
  propType: string;
}

export default function PropTable({ picks, propType }: PropTableProps) {
  const formatGameTime = (gameTime: string) => {
    try {
      const date = new Date(gameTime);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return 'TBD';
    }
  };

  const getTeamColor = (team: string) => {
    const colors: { [key: string]: string } = {
      'ATL': 'bg-red-600',
      'LAD': 'bg-blue-600',
      'NYY': 'bg-blue-800',
      'HOU': 'bg-orange-600',
      'CLE': 'bg-red-700',
      'TEX': 'bg-blue-700',
      'SD': 'bg-yellow-600',
      'PHI': 'bg-red-500'
    };
    return colors[team] || 'bg-gray-600';
  };

  if (picks.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No {propType} Goblin Picks Found</h3>
        <p className="text-gray-500">No low lines available for this prop type at the moment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Player
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Matchup
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Line
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Game Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Goblin Reason
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {picks.map((pick) => (
            <tr key={pick.id} className="hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-white">{pick.player}</div>
                    <div className="text-sm text-gray-400">{pick.position}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getTeamColor(pick.team)}`}>
                    {pick.team}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getTeamColor(pick.opponent)}`}>
                    {pick.opponent}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200 border border-green-700">
                    {pick.line}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  {formatGameTime(pick.gameTime)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200 border border-yellow-700">
                    🎯 Lowest Line
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 flex items-center justify-between px-6 py-3 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <ExternalLink className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-400">
            Data from {picks[0]?.source} • {picks.length} goblin picks found
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Last scraped: {picks[0] ? new Date(picks[0].scrapedAt).toLocaleString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
}
