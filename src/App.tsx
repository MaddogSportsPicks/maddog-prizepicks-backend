import React, { useState, useEffect } from 'react';
import { Activity, Clock, TrendingDown, Target, Users, BarChart3 } from 'lucide-react';
import PropTable from './components/PropTable';
import StatusBar from './components/StatusBar';
import StatsCard from './components/StatsCard';

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

interface ApiResponse {
  summary: {
    totalPicks: number;
    totalBases: number;
    fantasyScore: number;
    strikeouts: number;
    lastUpdate: string;
  };
  picks: {
    'Total Bases': GoblinPick[];
    'Fantasy Score': GoblinPick[];
    'Strikeouts': GoblinPick[];
  };
}

interface ScrapeStatus {
  status: 'idle' | 'running' | 'completed' | 'error';
  message: string;
  lastScrape: string | null;
  nextScrape: string;
}

function App() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Total Bases');
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Backend URL - will be updated after Railway deployment
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      const [dataResponse, statusResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/props/all-goblins`),
        fetch(`${BACKEND_URL}/api/scrape-status`)
      ]);
      
      const goblinData = await dataResponse.json();
      const statusData = await statusResponse.json();
      
      setBackendAvailable(true);
      setData(goblinData);
      setScrapeStatus(statusData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setBackendAvailable(false);
    }
  };

  const triggerManualScrape = async () => {
    try {
      setScrapeStatus(prev => prev ? { ...prev, status: 'running', message: 'Manual scrape initiated...' } : null);
      
      const response = await fetch(`${BACKEND_URL}/api/manual-scrape`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh data after scrape
        setTimeout(fetchData, 2000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error triggering manual scrape:', error);
      setScrapeStatus(prev => prev ? { ...prev, status: 'error', message: 'Manual scrape failed - server may not be running' } : null);
    }
  };

  const showDemoData = () => {
    // Show demo/mock data when backend is not available
    setScrapeStatus({ status: 'completed', message: 'Showing demo data - backend not available', lastScrape: new Date().toISOString(), nextScrape: new Date(Date.now() + 3600000).toISOString() });
    // You could set mock data here if needed
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const propTypes = ['Total Bases', 'Fantasy Score', 'Strikeouts'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading goblin picks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingDown className="h-8 w-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold">MLB Goblin Picks</h1>
                <p className="text-gray-400">Lowest available lines from PrizePicks</p>
              </div>
            </div>
            <button
              onClick={triggerManualScrape}
              disabled={scrapeStatus?.status === 'running' || !backendAvailable}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              title={!backendAvailable ? 'Backend server not available - this is a frontend-only demo' : ''}
            >
              <Activity className={`h-4 w-4 ${scrapeStatus?.status === 'running' ? 'animate-spin' : ''}`} />
              <span>
                {scrapeStatus?.status === 'running' 
                  ? 'Scraping...' 
                  : !backendAvailable 
                    ? 'Backend Unavailable' 
                    : 'Manual Scrape'
                }
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      {scrapeStatus && (
        <StatusBar 
          status={!backendAvailable ? 'error' : scrapeStatus.status}
          message={scrapeStatus.message}
          lastScrape={scrapeStatus.lastScrape}
          nextScrape={scrapeStatus.nextScrape}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Goblin Picks"
              value={data.summary.totalPicks}
              icon={Target}
              color="green"
            />
            <StatsCard
              title="Total Bases"
              value={data.summary.totalBases}
              icon={BarChart3}
              color="blue"
            />
            <StatsCard
              title="Fantasy Score"
              value={data.summary.fantasyScore}
              icon={Users}
              color="purple"
            />
            <StatsCard
              title="Strikeouts"
              value={data.summary.strikeouts}
              icon={Activity}
              color="orange"
            />
          </div>
        )}

        {/* Prop Type Tabs */}
        <div className="bg-gray-800 rounded-lg">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {propTypes.map((propType) => (
                <button
                  key={propType}
                  onClick={() => setActiveTab(propType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === propType
                      ? 'border-green-500 text-green-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {propType}
                  {data && (
                    <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">
                      {data.picks[propType as keyof typeof data.picks]?.length || 0}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Prop Table */}
          <div className="p-6">
            {data ? (
              <PropTable 
                picks={data.picks[activeTab as keyof typeof data.picks] || []}
                propType={activeTab}
              />
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  {!backendAvailable ? 'Backend server not available' : 'No goblin picks available'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {!backendAvailable 
                    ? 'This is a frontend-only demo. The scraping functionality requires a backend server.' 
                    : 'Try running a manual scrape'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Automated scraping at 12:00 PM and 5:00 PM EST daily</p>
          <p className="mt-1">
            Data sourced from PrizePicks • Last updated: {data?.summary.lastUpdate ? new Date(data.summary.lastUpdate).toLocaleString() : 'Never'}
            {!backendAvailable && (
              <span className="block mt-1 text-yellow-500">⚠️ Frontend-only demo - backend server required for live data</span>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
