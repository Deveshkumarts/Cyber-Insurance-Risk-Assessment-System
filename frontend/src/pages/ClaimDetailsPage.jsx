import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, Upload, File, CheckCircle, 
  XCircle, Clock, Activity, AlertTriangle, FileText, Check
} from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const ClaimDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization, user } = useContext(OrganizationContext);
  
  const [claim, setClaim] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [auditTrails, setAuditTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Screenshot');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const fetchClaimDetails = async () => {
    try {
      const response = await fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/claims/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setClaim(data.claim);
      setEvidence(data.evidence);
      setAuditTrails(data.audit_trails);
    } catch (error) {
      console.error('Error fetching claim details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('evidenceFile', file);
    formData.append('claim_id', id);
    formData.append('document_type', docType);
    formData.append('uploaded_by', organization?.name || 'Admin');

    try {
      const response = await fetch('https://cyber-insurance-risk-assessment-system.onrender.com/api/claims/evidence', {
        method: 'POST',
        body: formData, // fetch automatically sets multipart/form-data boundary
      });

      if (response.ok) {
        setFile(null);
        fetchClaimDetails();
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId, isVerified) => {
    try {
      const response = await fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/claims/evidence/${evidenceId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: id,
          is_verified: isVerified,
          performed_by: 'Adjuster'
        }),
      });
      if (response.ok) {
        fetchClaimDetails();
      }
    } catch (error) {
      console.error('Error verifying evidence:', error);
    }
  };

  const handleEvaluateClaim = async (newStatus) => {
    try {
      const response = await fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/claims/${id}/evaluate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          performed_by: 'Adjuster'
        }),
      });
      if (response.ok) {
        fetchClaimDetails();
      }
    } catch (error) {
      console.error('Error evaluating claim:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-accent"></div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-white">
        Claim not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate('/claims')}
        className="flex items-center text-cyber-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Claims
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Claim Details & Evidence List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Claim Summary Card */}
          <div className="glass-card p-8 border border-cyber-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
              <span className={`px-4 py-1 font-bold rounded-full text-sm mb-2 ${
                  claim.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                  claim.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                {claim.status}
              </span>
              <div className="flex items-center bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-700">
                <Activity className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-300 text-sm mr-2">Auth Score:</span>
                <span className={`font-bold ${claim.authenticity_score > 75 ? 'text-green-400' : claim.authenticity_score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {claim.authenticity_score}/100
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-2">Claim #{claim.id}</h1>
            <p className="text-cyber-muted mb-6">Initiated on {new Date(claim.created_at).toLocaleString()}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/40 p-6 rounded-lg">
              <div>
                <p className="text-sm text-gray-400 mb-1">Organization</p>
                <p className="text-lg font-semibold text-white">{claim.organization_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Incident</p>
                <p className="text-lg font-semibold text-white">{claim.incident_title}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400 mb-1">Incident Description</p>
                <p className="text-white bg-gray-900 p-4 rounded border border-gray-700 text-sm">
                  {claim.incident_desc}
                </p>
              </div>
            </div>

            {/* Adjuster Actions */}
            {user?.role === 'Security Officer' && (
              <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end gap-4">
                <button 
                  onClick={() => handleEvaluateClaim('Rejected')}
                  className="px-6 py-2 bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/40 font-bold rounded transition-colors"
                >
                  Reject Claim
                </button>
                <button 
                  onClick={() => handleEvaluateClaim('Approved')}
                  className="px-6 py-2 bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600/40 font-bold rounded transition-colors"
                >
                  Approve Claim
                </button>
                <button 
                  onClick={() => handleEvaluateClaim('Under Investigation')}
                  className="px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/40 font-bold rounded transition-colors"
                >
                  Re-Evaluate
                </button>
              </div>
            )}
          </div>

          {/* Upload Evidence Section */}
          {user?.role === 'Security Officer' && (
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-3 text-cyber-accent" />
                Upload Evidence
              </h2>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select 
                      className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-cyber-accent"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                    >
                      <option value="Screenshot">Screenshot</option>
                      <option value="Log">System Log</option>
                      <option value="Report">Security Report</option>
                      <option value="Document">Other Document</option>
                    </select>
                  </div>
                  <div className="flex-2 flex items-center">
                    <input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files[0])}
                      className="text-gray-300 w-full"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!file || uploading}
                    className="px-6 py-3 bg-cyber-accent text-white font-bold rounded hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Evidence List */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-cyber-accent" />
              Submitted Evidence
            </h2>
            {evidence.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No evidence uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {evidence.map(ev => (
                  <div key={ev.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-500 transition-colors">
                    <div className="flex items-start">
                      <File className="w-8 h-8 text-gray-400 mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-white font-semibold">{ev.file_name}</h4>
                          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">{ev.document_type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 font-mono">Hash: {ev.integrity_hash.substring(0, 16)}...</p>
                        <p className="text-xs text-gray-400">Uploaded {new Date(ev.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {user?.role === 'Security Officer' ? (
                      <div className="flex items-center bg-gray-900 rounded p-1 border border-gray-700 flex-shrink-0">
                         <button
                           onClick={() => handleVerifyEvidence(ev.id, true)}
                           className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${ev.is_verified ? 'bg-green-600/20 text-green-400' : 'text-gray-500 hover:text-green-400 hover:bg-gray-800'}`}
                         >
                           <CheckCircle className="w-4 h-4 mr-1.5" /> Verified
                         </button>
                         <div className="w-px h-6 bg-gray-700 mx-1"></div>
                         <button
                           onClick={() => handleVerifyEvidence(ev.id, false)}
                           className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${!ev.is_verified ? 'bg-red-600/20 text-red-400' : 'text-gray-500 hover:text-red-400 hover:bg-gray-800'}`}
                         >
                           <XCircle className="w-4 h-4 mr-1.5" /> Rejected
                         </button>
                      </div>
                    ) : (
                      <div className="flex items-center bg-gray-900 rounded p-2 border border-gray-700 flex-shrink-0">
                        {ev.is_verified ? (
                          <span className="flex items-center text-green-400 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-1.5" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-red-400 text-sm font-medium">
                            <XCircle className="w-4 h-4 mr-1.5" /> Pending/Rejected
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audit Trail */}
        <div className="space-y-8">
          <div className="glass-card p-6 h-full border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center border-b border-gray-800 pb-4">
              <Clock className="w-6 h-6 mr-3 text-cyber-accent" />
              Audit Trail
            </h2>
            
            <div className="relative border-l border-gray-700 ml-3 space-y-6">
              {auditTrails.map((trail, index) => (
                <div key={trail.id} className="pl-6 relative">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                    trail.action.includes('Approved') || trail.action.includes('Verified') ? 'bg-green-500' :
                    trail.action.includes('Rejected') ? 'bg-red-500' : 'bg-cyber-accent'
                  }`}></div>
                  <div className="mb-1">
                    <span className="text-white font-medium text-sm">{trail.action}</span>
                    <span className="text-gray-500 text-xs ml-2">{new Date(trail.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded border border-gray-800 mt-2">
                    {trail.details}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">By: {trail.performed_by}</p>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsPage;
