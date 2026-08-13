import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Search, Shield, AlertTriangle, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(OrganizationContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Log submission state
  const [newLog, setNewLog] = useState({ log_source: 'Security Logs', log_data: '' });
  
  // Investigation state
  const [investigationData, setInvestigationData] = useState({
    threat_identified: '',
    impact_assessment: '',
    investigation_report: '',
    status: 'Open',
    attack_pattern: '',
    severity_score: '',
    incident_status: 'Under Investigation'
  });

  // Updates state
  const [newUpdate, setNewUpdate] = useState('');

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const fetchIncidentDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/incidents/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
      
      if (result.investigation) {
        setInvestigationData({
          threat_identified: result.investigation.threat_identified || '',
          impact_assessment: result.investigation.impact_assessment || '',
          investigation_report: result.investigation.investigation_report || '',
          status: result.investigation.status || 'Open',
          attack_pattern: result.incident.attack_pattern || '',
          severity_score: result.incident.severity_score || '',
          incident_status: result.incident.status || 'Under Investigation'
        });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/incidents/${id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (response.ok) {
        setNewLog({ log_source: 'Security Logs', log_data: '' });
        fetchIncidentDetails();
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const handleSaveInvestigation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/incidents/${id}/investigation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investigationData),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchIncidentDetails();
      }
    } catch (error) {
      console.error('Error saving investigation:', error);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    try {
      const response = await fetch(`http://localhost:5000/api/incidents/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          message: newUpdate
        }),
      });
      if (response.ok) {
        setNewUpdate('');
        fetchIncidentDetails();
      }
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-accent"></div>
    </div>
  );

  if (!data) return <div className="text-center p-12 text-white">Incident not found.</div>;

  const { incident, logs, updates } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate('/incidents')}
        className="flex items-center text-cyber-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Incident Details & Logs (Visible to everyone) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Incident Report Card */}
          <div className="glass-card p-6 border-l-4 border-cyber-neon">
            <h2 className="text-xl font-bold text-white flex items-center mb-4">
              <FileText className="w-5 h-5 mr-2 text-cyber-neon" /> Incident Report
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Title</label>
                <div className="text-white font-medium">{incident.title}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Description</label>
                <div className="text-gray-300 text-sm">{incident.description}</div>
              </div>
              <div className="flex justify-between">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Reported At</label>
                  <div className="text-gray-300 text-sm">{new Date(incident.reported_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="text-cyber-neon text-sm font-bold">{incident.status}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Updates */}
          <div className="glass-card p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-white flex items-center mb-4">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-500" /> Activity & Updates
            </h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {updates && updates.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No updates yet.</p>
              ) : (
                updates?.map((u) => (
                  <div key={u.id} className={`bg-gray-900/50 p-4 rounded-xl border ${u.role === 'Security Officer' ? 'border-purple-500/30' : 'border-gray-700'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold ${u.role === 'Security Officer' ? 'text-purple-400' : 'text-blue-400'}`}>
                        {u.role} ({u.email})
                      </span>
                      <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{u.message}</p>
                    {u.status_change && (
                      <div className="mt-2 text-xs font-bold text-cyber-accent">Changed status to: {u.status_change}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddUpdate} className="space-y-3 pt-4 border-t border-gray-700">
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white h-20 focus:border-purple-500"
                placeholder="Type your update or question here..."
                required
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
              />
              <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold transition-colors">
                Post Update
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Investigation Workflow (Only for Security Officers) */}
        {user?.role === 'Security Officer' && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Log Analysis Card */}
            <div className="glass-card p-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-white flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-blue-500" /> Evidence & Logs (Officer Only)
              </h2>
              
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No logs attached yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                      <div className="text-xs text-blue-400 font-bold mb-1">{log.log_source}</div>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-black p-2 rounded">{log.log_data}</pre>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddLog} className="space-y-3 pt-4 border-t border-gray-700">
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500"
                  value={newLog.log_source}
                  onChange={(e) => setNewLog({...newLog, log_source: e.target.value})}
                >
                  <option value="Security Logs">Security Logs</option>
                  <option value="Network Activity Data">Network Activity Data</option>
                  <option value="System Event">System Event Logs</option>
                </select>
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white font-mono h-24 focus:border-blue-500"
                  placeholder="Paste log data here..."
                  required
                  value={newLog.log_data}
                  onChange={(e) => setNewLog({...newLog, log_data: e.target.value})}
                />
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold transition-colors">
                  Add Evidence Log
                </button>
              </form>
            </div>

            <form onSubmit={handleSaveInvestigation} className="space-y-6">
              {/* Threat Identification */}
              <div className="glass-card p-6 border-l-4 border-yellow-500">
                <h2 className="text-xl font-bold text-white flex items-center mb-4">
                  <Search className="w-5 h-5 mr-2 text-yellow-500" /> Threat Identification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Attack Pattern Classification</label>
                    <select
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500"
                      value={investigationData.attack_pattern}
                      onChange={(e) => setInvestigationData({...investigationData, attack_pattern: e.target.value})}
                    >
                      <option value="">Select Pattern...</option>
                      <option value="Phishing/Social Engineering">Phishing/Social Engineering</option>
                      <option value="Ransomware">Ransomware</option>
                      <option value="DDoS">DDoS</option>
                      <option value="Insider Threat">Insider Threat</option>
                      <option value="Malware/Botnet">Malware/Botnet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Threat Analysis Notes</label>
                  <textarea
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white h-24 focus:border-yellow-500"
                    placeholder="Details of the identified threat vector..."
                    value={investigationData.threat_identified}
                    onChange={(e) => setInvestigationData({...investigationData, threat_identified: e.target.value})}
                  />
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="glass-card p-6 border-l-4 border-orange-500">
                <h2 className="text-xl font-bold text-white flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> Impact Assessment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Incident Severity Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-orange-500"
                      value={investigationData.severity_score}
                      onChange={(e) => setInvestigationData({...investigationData, severity_score: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Impact Analysis</label>
                  <textarea
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white h-24 focus:border-orange-500"
                    placeholder="Assess the impact on systems, data, and business operations..."
                    value={investigationData.impact_assessment}
                    onChange={(e) => setInvestigationData({...investigationData, impact_assessment: e.target.value})}
                  />
                </div>
              </div>

              {/* Investigation Report */}
              <div className="glass-card p-6 border-l-4 border-green-500">
                <h2 className="text-xl font-bold text-white flex items-center mb-4">
                  <Shield className="w-5 h-5 mr-2 text-green-500" /> Investigation Report
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Final Investigation Report</label>
                  <textarea
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white h-48 focus:border-green-500"
                    placeholder="Comprehensive summary of the incident, response actions, and remediation..."
                    value={investigationData.investigation_report}
                    onChange={(e) => setInvestigationData({...investigationData, investigation_report: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Incident Status</label>
                    <select
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500"
                      value={investigationData.incident_status}
                      onChange={(e) => setInvestigationData({...investigationData, incident_status: e.target.value})}
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Investigation Workflow Status</label>
                    <select
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500"
                      value={investigationData.status}
                      onChange={(e) => setInvestigationData({...investigationData, status: e.target.value})}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-700 items-center">
                  {saveSuccess && <span className="text-green-500 mr-4 font-bold">Saved successfully!</span>}
                  <button 
                    type="button" 
                    onClick={handleSaveInvestigation}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg flex items-center transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> Save Investigation Progress
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Read-Only Report for Employees when Resolved */}
        {user?.role === 'Employee' && incident.status === 'Resolved' && (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-bold text-white flex items-center mb-4">
                <Shield className="w-5 h-5 mr-2 text-green-500" /> Final Investigation Report
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Report Findings</label>
                  <div className="text-gray-300 bg-gray-900/50 p-4 rounded-lg mt-1 border border-gray-700 whitespace-pre-wrap">
                    {investigationData.investigation_report || 'No detailed report provided.'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Attack Pattern</label>
                    <div className="text-white font-medium mt-1">{investigationData.attack_pattern || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Severity Score</label>
                    <div className="text-white font-medium mt-1">{investigationData.severity_score || 'N/A'}/100</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Impact Analysis</label>
                  <div className="text-gray-300 mt-1">{investigationData.impact_assessment || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentDetailsPage;
