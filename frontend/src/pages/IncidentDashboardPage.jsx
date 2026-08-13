import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, Search, Activity, ShieldAlert, ArrowRight } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const IncidentDashboardPage = () => {
  const { organization, user } = useContext(OrganizationContext);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', description: '', organization_id: '', user_id: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (organization && user) {
      setNewIncident(prev => ({ ...prev, organization_id: organization.id, user_id: user.id }));
      fetchIncidents(organization.id, user.id, user.role);
    } else {
      setLoading(false);
    }
  }, [organization, user]);

  const fetchIncidents = async (orgId, userId, role) => {
    try {
      const response = await fetch(`http://localhost:5000/api/incidents?organization_id=${orgId}&user_id=${userId}&role=${role}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident),
      });
      if (response.ok) {
        setShowModal(false);
        setNewIncident({ title: '', description: '', organization_id: organization.id, user_id: user.id });
        fetchIncidents(organization.id, user.id, user.role);
      }
    } catch (error) {
      console.error('Error reporting incident:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center">
            <ShieldAlert className="w-10 h-10 mr-4 text-cyber-accent" />
            Incident Investigation
          </h1>
          <p className="text-cyber-muted">Track, analyze, and manage cyber incidents in real-time.</p>
        </div>
        {user?.role === 'Employee' && (
          <button
            onClick={() => {
              if (!organization) {
                alert('Please select an organization from the navbar first.');
                return;
              }
              setShowModal(true);
            }}
            className="px-6 py-3 bg-cyber-accent text-white font-bold rounded-lg hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(255,42,109,0.6)] transition-all duration-300"
          >
            Report New Incident
          </button>
        )}
      </div>

      {!organization ? (
        <div className="glass-card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Organization Required</h3>
          <p className="text-cyber-muted">Please select an organization from the navbar to view and manage incidents.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-accent"></div>
        </div>
      ) : incidents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-cyber-muted mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Incidents Reported</h3>
          <p className="text-cyber-muted">There are currently no active incidents for your organization.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => (
            <div key={incident.id} className="glass-card p-6 flex flex-col h-full hover:border-cyber-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white truncate pr-4" title={incident.title}>
                  {incident.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  incident.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                  incident.status === 'Under Investigation' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {incident.status}
                </span>
              </div>
              <p className="text-sm text-cyber-muted mb-6 flex-grow line-clamp-3">
                {incident.description}
              </p>
              <div className="mt-auto">
                <div className="flex justify-between items-center text-sm mb-4">
                  {user?.role === 'Security Officer' && (
                    <span className="text-gray-400 flex items-center">
                      <Activity className="w-4 h-4 mr-1" /> 
                      Severity: {incident.severity_score ? `${incident.severity_score}/100` : 'TBD'}
                    </span>
                  )}
                  {user?.role === 'Employee' && (
                    <span className="text-gray-400">
                      Reported by you
                    </span>
                  )}
                  <span className="text-gray-400">
                    {new Date(incident.reported_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="w-full py-2 bg-transparent border border-gray-600 text-white rounded hover:border-cyber-accent hover:text-cyber-accent transition-colors flex items-center justify-center"
                >
                  View Investigation <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-8 border border-cyber-accent/30">
            <h2 className="text-2xl font-bold text-white mb-6">Report Security Incident</h2>
            <form onSubmit={handleReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Incident Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-accent"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  placeholder="e.g. Suspicious login activity"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-accent"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  placeholder="Describe what happened..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyber-accent text-white font-bold rounded hover:bg-opacity-90"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDashboardPage;
