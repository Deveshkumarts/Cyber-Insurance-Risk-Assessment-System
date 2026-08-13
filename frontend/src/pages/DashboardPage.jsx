import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ShieldAlert, ShieldCheck, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insuranceQuote, setInsuranceQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [assRes, recRes] = await Promise.all([
          fetch(`http://localhost:5000/api/assessment/${id}`),
          fetch(`http://localhost:5000/api/recommendations/${id}`)
        ]);

        if (assRes.ok && recRes.ok) {
          const assessmentData = await assRes.json();
          setData(assessmentData);
          const recData = await recRes.json();
          setRecommendations(recData.recommendations);
          
          if (assessmentData.org_id) {
            try {
              const quoteRes = await fetch(`http://localhost:5000/api/insurance-quotes/organization/${assessmentData.org_id}`);
              if (quoteRes.ok) {
                const quotes = await quoteRes.json();
                if (quotes && quotes.length > 0) {
                  setInsuranceQuote(quotes[0]);
                }
              }
            } catch (qErr) {
              console.error("Failed to fetch quotes", qErr);
            }
          }
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyber-neon"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Assessment Not Found</h2>
        <Link to="/assessment" className="text-cyber-neon hover:underline">Take a new assessment</Link>
      </div>
    );
  }

  const getRiskColor = (category) => {
    switch(category) {
      case 'Low Risk': return 'text-green-500';
      case 'Medium Risk': return 'text-yellow-500';
      case 'High Risk': return 'text-orange-500';
      case 'Critical Risk': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskColorHex = (category) => {
    switch(category) {
      case 'Low Risk': return '#22c55e'; // green-500
      case 'Medium Risk': return '#eab308'; // yellow-500
      case 'High Risk': return '#f97316'; // orange-500
      case 'Critical Risk': return '#ef4444'; // red-500
      default: return '#6b7280';
    }
  };

  const chartData = {
    labels: ['Secured Score', 'Risk Gap'],
    datasets: [
      {
        data: [data.score, 100 - data.score],
        backgroundColor: [
          getRiskColorHex(data.risk_category),
          '#1f2937' // gray-800
        ],
        borderColor: ['#000', '#000'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/assessment" className="inline-flex items-center text-cyber-muted hover:text-cyber-neon mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessment
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Organization & Score */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-6 border-t-4" style={{borderTopColor: getRiskColorHex(data.risk_category)}}>
            <h2 className="text-xl font-bold text-gray-300 mb-1">Organization</h2>
            <p className="text-3xl font-bold text-white mb-4">{data.organization_name}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                <span className="text-cyber-muted block">Industry</span>
                <span className="font-semibold">{data.industry}</span>
              </div>
              <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                <span className="text-cyber-muted block">Employees</span>
                <span className="font-semibold">{data.employees}</span>
              </div>
            </div>
          </div>
          
          {insuranceQuote && (
            <div className="glass-card p-6 border-t-4 border-cyber-accent mt-6">
              <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-cyber-accent" />
                Latest Insurance Quote
              </h2>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm text-cyber-muted mb-1">Estimated Premium</p>
                  <p className="text-3xl font-bold text-white">${Number(insuranceQuote.premium).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    insuranceQuote.is_insurable ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {insuranceQuote.is_insurable ? insuranceQuote.recommended_tier : 'Uninsurable'}
                  </span>
                </div>
              </div>
              <Link 
                to={`/insurance-dashboard/${data.org_id}`}
                className="w-full block text-center py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-colors text-sm"
              >
                View Full Insurance Details
              </Link>
            </div>
          )}

          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
            <h2 className="text-lg font-bold text-gray-300 mb-6 w-full text-left">Risk Overview</h2>
            
            <div className="w-48 h-48 relative mb-6">
              <Doughnut data={chartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold">{data.score}</span>
                <span className="text-xs text-cyber-muted uppercase tracking-widest">/ 100</span>
              </div>
            </div>
            
            <div className={`text-2xl font-bold flex items-center gap-2 ${getRiskColor(data.risk_category)}`}>
              {data.risk_category === 'Critical Risk' || data.risk_category === 'High Risk' ? (
                <ShieldAlert className="h-6 w-6" />
              ) : data.risk_category === 'Low Risk' ? (
                <ShieldCheck className="h-6 w-6" />
              ) : (
                <Shield className="h-6 w-6" />
              )}
              {data.risk_category}
            </div>

            {/* Progress bar */}
            <div className="w-full mt-8">
              <div className="flex justify-between text-xs text-cyber-muted mb-1">
                <span>Critical</span>
                <span>High</span>
                <span>Medium</span>
                <span>Low</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-red-500" style={{ width: '40%' }}></div>
                <div className="h-full bg-orange-500" style={{ width: '20%' }}></div>
                <div className="h-full bg-yellow-500" style={{ width: '20%' }}></div>
                <div className="h-full bg-green-500" style={{ width: '20%' }}></div>
              </div>
              <div className="w-full relative h-4">
                <div 
                  className="absolute top-0 h-4 w-1 bg-white"
                  style={{ left: `${data.score}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-white transform rotate-180"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8 h-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Action Plan & Recommendations
            </h2>
            <p className="text-cyber-muted mb-8">Based on your assessment, implement the following controls to improve your security posture.</p>
            
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-4 bg-cyber-dark p-5 rounded-xl border border-gray-800 hover:border-cyber-accent/50 transition-colors">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30">
                        <span className="text-red-400 font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-200 text-lg leading-relaxed">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-green-900/10 rounded-xl border border-green-500/20">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-400 mb-2">Excellent Security Posture!</h3>
                <p className="text-cyber-muted text-center max-w-md">Your organization has implemented all key security controls. Keep monitoring for new threats.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
