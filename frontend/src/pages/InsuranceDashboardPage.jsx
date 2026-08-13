import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PremiumSimulator from '../components/PremiumSimulator';
import CoverageComparison from '../components/CoverageComparison';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InsuranceDashboardPage = () => {
  const { orgId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const fetchData = async () => {
    try {
      const response = await fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/insurance-dashboard/${orgId}`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulationUpdate = (simData) => {
    // Update the quote data locally based on simulation
    setData(prev => ({
      ...prev,
      quote: {
        ...prev.quote,
        ...simData
      }
    }));
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-cyber-neon">Loading Dashboard...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">Error loading data.</div>;

  const chartData = {
    labels: ['Your Company', 'Industry Average'],
    datasets: [
      {
        label: 'Risk Score (Lower is better)',
        data: [data.quote.risk_score, data.industryAverages.risk_score],
        backgroundColor: ['rgba(0, 255, 204, 0.6)', 'rgba(100, 116, 139, 0.6)'],
        borderColor: ['rgba(0, 255, 204, 1)', 'rgba(100, 116, 139, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Industry Benchmarking', color: '#fff' }
    },
    scales: {
      y: { ticks: { color: '#ccc' }, grid: { color: '#333' } },
      x: { ticks: { color: '#ccc' }, grid: { display: false } }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Insurance Dashboard</h1>
        <Link to={`/assessment`} className="text-cyber-neon hover:underline text-sm">
          Return to Assessments
        </Link>
      </div>

      {!data.quote.is_insurable && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg mb-8">
          <strong>Notice: Uninsurable</strong> Your organization lacks critical security controls (e.g., Offsite Backups or Patch Management). We cannot offer a premium quote until these are resolved. Use the What-If Simulator below to see how fixing these impacts your quote.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary & Simulator */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="glass-card p-6 neon-border">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Estimated Premium</h2>
            <div className={`text-4xl font-black ${data.quote.is_insurable ? 'text-cyber-neon' : 'text-gray-500'}`}>
              {data.quote.is_insurable ? `$${Number(data.quote.premium).toLocaleString()}` : 'N/A'}
              <span className="text-sm font-normal text-gray-400"> / yr</span>
            </div>
            
            <div className="mt-6 border-t border-gray-800 pt-4">
              <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Final Risk Score</h2>
              <div className="text-3xl font-bold">{data.quote.risk_score} <span className="text-sm text-gray-500">/ 100</span></div>
              <div className="text-cyber-muted mt-1">Category: {data.quote.risk_category}</div>
            </div>
          </div>

          <PremiumSimulator initialData={data.asset} onUpdate={handleSimulationUpdate} />
        </div>

        {/* Right Column: Charts & Coverage */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="glass-card p-6 neon-border">
            <Bar options={chartOptions} data={chartData} />
          </div>

          <div className="glass-card p-6 neon-border">
            <CoverageComparison recommendedTier={data.quote.recommended_tier} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default InsuranceDashboardPage;
