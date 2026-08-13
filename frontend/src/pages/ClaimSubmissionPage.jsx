import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const ClaimSubmissionPage = () => {
  const { organization } = useContext(OrganizationContext);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (organization) {
      fetchIncidents(organization.id);
    } else {
      setLoading(false);
    }
  }, [organization]);

  const fetchIncidents = async (orgId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/incidents?organization_id=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!organization || !selectedIncident) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organization.id,
          incident_id: selectedIncident
        }),
      });
      
      if (response.ok) {
        const newClaim = await response.json();
        navigate(`/claims/${newClaim.id}`); // Navigate to details to upload evidence
      } else {
        throw new Error('Failed to submit claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!organization) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Organization Required</h3>
        <p className="text-cyber-muted">Please select an organization from the navbar first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate('/claims')}
        className="flex items-center text-cyber-muted hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
      </button>

      <div className="glass-card p-10 border border-cyber-accent/30 shadow-[0_0_20px_rgba(255,42,109,0.15)]">
        <div className="flex items-center mb-8 pb-6 border-b border-gray-800">
          <ShieldCheck className="w-12 h-12 text-cyber-accent mr-6" />
          <div>
            <h1 className="text-3xl font-extrabold text-white">Submit New Claim</h1>
            <p className="text-cyber-muted">Initiate a claim process for a reported incident.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-accent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Incident
              </label>
              {incidents.length === 0 ? (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-red-900/50 text-red-400 text-sm">
                  No incidents found for this organization. Please report an incident first.
                </div>
              ) : (
                <select
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-cyber-accent appearance-none"
                  value={selectedIncident}
                  onChange={(e) => setSelectedIncident(e.target.value)}
                >
                  <option value="" disabled>-- Choose an Incident --</option>
                  {incidents.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      {inc.title} ({new Date(inc.reported_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-blue-900/10 border border-blue-900/50 rounded-lg p-4 mb-8 text-sm text-blue-200 flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
              <p>
                After submitting, you will be redirected to the claim details page where you can upload required evidence (screenshots, logs, reports) for verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={!selectedIncident || submitting}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                !selectedIncident || submitting 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-cyber-accent text-white hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(255,42,109,0.6)]'
              }`}
            >
              {submitting ? 'Initiating Claim...' : 'Initiate Claim Process'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClaimSubmissionPage;
