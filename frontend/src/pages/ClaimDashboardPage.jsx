import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Activity, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const ClaimDashboardPage = () => {
  const { organization } = useContext(OrganizationContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch('https://cyber-insurance-risk-assessment-system.onrender.com/api/claims');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center">
            <ShieldCheck className="w-10 h-10 mr-4 text-cyber-accent" />
            Evidence Verification & Claims
          </h1>
          <p className="text-cyber-muted">Verify evidence, validate claims, and manage the audit trail.</p>
        </div>
        <button
          onClick={() => navigate('/claims/new')}
          className="px-6 py-3 bg-cyber-accent text-white font-bold rounded-lg hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(255,42,109,0.6)] transition-all duration-300"
        >
          Submit New Claim
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-accent"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-cyber-muted mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Claims Found</h3>
          <p className="text-cyber-muted">There are currently no active claims in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="glass-card p-6 flex flex-col h-full hover:border-cyber-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white truncate pr-4">
                  Claim #{claim.id}
                </h3>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  claim.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                  claim.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                  claim.status === 'Under Investigation' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {claim.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-300 mb-2">
                <span className="font-semibold text-gray-400">Organization:</span> {claim.organization_name}
              </div>
              <div className="text-sm text-gray-300 mb-4 line-clamp-2">
                <span className="font-semibold text-gray-400">Incident:</span> {claim.incident_title}
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center text-sm mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> 
                    Authenticity Score
                  </span>
                  <span className={`font-bold ${claim.authenticity_score > 75 ? 'text-green-400' : claim.authenticity_score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {claim.authenticity_score}/100
                  </span>
                </div>
                
                <button
                  onClick={() => navigate(`/claims/${claim.id}`)}
                  className="w-full py-2 bg-transparent border border-gray-600 text-white rounded hover:border-cyber-accent hover:text-cyber-accent transition-colors flex items-center justify-center"
                >
                  Review Claim <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimDashboardPage;
