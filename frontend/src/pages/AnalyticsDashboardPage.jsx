import React, { useState, useEffect, useContext } from 'react';
import { 
  Line, 
  Doughnut 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  BrainCircuit, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboardPage = () => {
  const { organization } = useContext(OrganizationContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      fetchAnalytics(organization.id);
    }
  }, [organization]);

  const fetchAnalytics = async (orgId) => {
    try {
      const response = await fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/analytics/${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-accent"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-white">
        No analytics data found.
      </div>
    );
  }

  // Threat Trends Line Chart Data
  const trendLabels = Object.keys(analytics.threatTrends);
  const trendDataValues = Object.values(analytics.threatTrends);
  
  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Incidents Reported',
        data: trendDataValues,
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#e5e7eb' } },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#9ca3af', stepSize: 1 }, grid: { color: '#374151' } },
    }
  };

  // Attack Forecasting Doughnut Data
  const attackLabels = Object.keys(analytics.attackFrequencies);
  const attackValues = Object.values(analytics.attackFrequencies);
  
  const hasAttackData = attackLabels.length > 0;

  const attackData = {
    labels: hasAttackData ? attackLabels : ['No Data'],
    datasets: [
      {
        label: 'Attack Types',
        data: hasAttackData ? attackValues : [1],
        backgroundColor: hasAttackData ? [
          '#ff003c', '#ff5722', '#ff9800', '#ffeb3b', '#4caf50'
        ] : ['#374151'],
        borderWidth: 0,
      },
    ],
  };

  const attackOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#e5e7eb' } },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyber-accent/20 rounded-lg flex items-center justify-center border border-cyber-accent">
          <BrainCircuit className="w-6 h-6 text-cyber-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Predictive Analytics</h1>
          <p className="text-cyber-muted">AI-driven risk forecasting and loss estimation for {organization?.organization_name}</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Future Risk Score */}
        <div className="glass-card p-6 flex items-center">
          <div className="mr-6 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
              <circle 
                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={40 * 2 * Math.PI} 
                strokeDashoffset={40 * 2 * Math.PI - (analytics.futureRiskScore / 100) * (40 * 2 * Math.PI)}
                className={
                  analytics.futureRiskScore > 75 ? 'text-green-500' :
                  analytics.futureRiskScore > 40 ? 'text-yellow-500' : 'text-red-500'
                } 
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
              {analytics.futureRiskScore}
            </span>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Future Security Score</h3>
            <p className="text-sm text-gray-500">Predicted posture based on recent threat exposure.</p>
          </div>
        </div>

        {/* Predicted Loss Estimate */}
        <div className="glass-card p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-red-400 bg-red-900/30 p-1.5 rounded-lg border border-red-500/50" />
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Predicted Max Loss</h3>
          </div>
          <p className="text-4xl font-black text-white mt-2">
            ${analytics.predictedLossEstimate.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Estimated financial exposure if a breach occurs today.</p>
        </div>

        {/* Primary Threat Vector */}
        <div className="glass-card p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-yellow-400 bg-yellow-900/30 p-1.5 rounded-lg border border-yellow-500/50" />
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Top Forecasted Threat</h3>
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {analytics.mostLikelyAttack}
          </p>
          <p className="text-sm text-gray-500 mt-2">Highest probability of re-occurrence based on history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Threat Trend Analysis */}
        <div className="glass-card p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyber-neon" />
            <h2 className="text-xl font-bold text-white">Threat Trend Analysis</h2>
          </div>
          <div className="h-64">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>

        {/* Attack Forecasting */}
        <div className="glass-card p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-cyber-accent" />
            <h2 className="text-xl font-bold text-white">Attack Vector Forecast</h2>
          </div>
          <div className="h-64 flex justify-center">
            <Doughnut data={attackData} options={attackOptions} />
          </div>
        </div>
      </div>

      {/* AI Recommendation Engine */}
      <div className="glass-card p-6 border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="px-3 py-1 bg-cyber-accent/20 border border-cyber-accent/50 rounded-full flex items-center text-cyber-accent text-xs font-bold">
            <BrainCircuit className="w-3 h-3 mr-1" /> AI Engine Active
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-6">Actionable Security Recommendations</h2>
        
        <div className="space-y-4">
          {analytics.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="mt-1 flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-cyber-neon" />
              </div>
              <p className="text-gray-300">{rec}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboardPage;
