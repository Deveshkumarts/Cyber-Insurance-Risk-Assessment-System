import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculator, ShieldAlert, FileText, Database, AlertCircle } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const AssetAssessmentPage = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { organization } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [pastQuotes, setPastQuotes] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  
  const [formData, setFormData] = useState({
    organization_id: '',
    asset_value: '',
    historical_incidents: 0,
    patch_management_status: '',
    backup_availability: false,
    threat_probability: '',
    security_controls: []
  });

  useEffect(() => {
    if (organization) {
      let mappedThreat = '';
      if (organization.risk_category) {
        if (organization.risk_category.includes('Low')) mappedThreat = 'Low';
        if (organization.risk_category.includes('Medium')) mappedThreat = 'Medium';
        if (organization.risk_category.includes('High')) mappedThreat = 'High';
        if (organization.risk_category.includes('Critical')) mappedThreat = 'Critical';
      }
      
      setFormData(prev => ({ 
        ...prev, 
        organization_id: organization.id,
        threat_probability: mappedThreat || prev.threat_probability
      }));

      fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/insurance-quotes/organization/${organization.id}`)
        .then(res => res.json())
        .then(data => {
            setPastQuotes(data);
            setLoadingPast(false);
        })
        .catch(err => {
            console.error('Error fetching past quotes', err);
            setLoadingPast(false);
        });
    } else {
        setLoadingPast(false);
    }
  }, [organization]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (e) => {
    // Handling multiple security controls
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      security_controls: options
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://cyber-insurance-risk-assessment-system.onrender.com/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (response.ok) {
        navigate(`/insurance-dashboard/${formData.organization_id}`);
      } else {
        alert('Failed to calculate premium.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Insurance Asset Valuation & Risk</h1>
        <p className="text-cyber-muted">Complete the assessment to receive an estimated cyber insurance quote.</p>
      </div>

      {!loadingPast && pastQuotes.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Past Insurance Quotes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastQuotes.map(quote => (
              <div key={quote.id} className="glass-card p-6 border border-gray-800 hover:border-cyber-accent transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white">${Number(quote.premium).toLocaleString()}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    quote.is_insurable ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {quote.is_insurable ? quote.recommended_tier : 'Uninsurable'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(quote.created_at).toLocaleDateString()} at {new Date(quote.created_at).toLocaleTimeString()}
                </p>
                <button
                  onClick={() => navigate(`/insurance-dashboard/${quote.organization_id}`)}
                  className="text-sm font-bold text-cyber-neon hover:underline"
                >
                  View Dashboard &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-8 neon-border">
        {!organization ? (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Organization Required</h2>
            <p className="text-cyber-muted mb-6">Please login by selecting an organization from the navigation bar, or complete a Risk Assessment first.</p>
            <button onClick={() => navigate('/assessment')} className="px-6 py-3 bg-cyber-neon text-cyber-dark font-bold rounded-lg hover:bg-opacity-90">
              Go to Risk Assessment
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Asset Details */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">1. Asset Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" /> Total Asset Value ($)
                </label>
                <input
                  required
                  type="number"
                  name="asset_value"
                  min="0"
                  value={formData.asset_value}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon"
                  placeholder="e.g. 5000000"
                />
              </div>
            </div>
          </div>

          {/* Threat Assessment */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">2. Threat Probability</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Perceived Cyber Attack Likelihood
                </label>
                <select
                  required
                  name="threat_probability"
                  value={formData.threat_probability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
                >
                  <option value="" disabled>Select Likelihood</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vulnerability Assessment */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">3. Vulnerabilities & Controls</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Historical Cyber Incidents (Past 3 years)</label>
                <input
                  required
                  type="number"
                  name="historical_incidents"
                  min="0"
                  value={formData.historical_incidents}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon"
                  placeholder="e.g. 0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Patch Management Status</label>
                <select
                  required
                  name="patch_management_status"
                  value={formData.patch_management_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
                >
                  <option value="" disabled>Select Status</option>
                  <option value="Regular">Regular (Automated/Monthly)</option>
                  <option value="Irregular">Irregular</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center h-full pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="backup_availability"
                    checked={formData.backup_availability}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-neon"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">Offsite Backup Availability (CRITICAL)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-cyber-neon text-cyber-dark font-bold rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyber-dark"></div>
              ) : (
                <>
                  <Calculator className="h-5 w-5" /> Calculate Premium
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default AssetAssessmentPage;
