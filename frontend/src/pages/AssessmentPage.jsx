import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Building, Users, Briefcase } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { organization } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [pastAssessments, setPastAssessments] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  
  const [formData, setFormData] = useState({
    answers: {
      mfa: false,
      antivirus: false,
      firewall: false,
      security_updates: false,
      training: false,
      backups: false,
      encryption: false,
      incident_response: false
    }
  });


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://cyber-insurance-risk-assessment-system.onrender.com/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: organization.id,
          answers: formData.answers
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        navigate(`/dashboard/${data.assessmentId}`);
      } else {
        alert('Failed to submit assessment.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organization) {
      navigate('/login');
    } else {
      fetch(`https://cyber-insurance-risk-assessment-system.onrender.com/api/assessment/organization/${organization.id}`)
        .then(res => res.json())
        .then(data => {
            setPastAssessments(data);
            setLoadingPast(false);
        })
        .catch(err => {
            console.error('Error fetching past assessments', err);
            setLoadingPast(false);
        });
    }
  }, [organization, navigate]);

  if (!organization) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Security Self-Assessment</h1>
        <p className="text-cyber-muted">Complete this form to receive your personalized risk score and recommendations.</p>
      </div>

      {!loadingPast && pastAssessments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Past Assessments</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastAssessments.map(assessment => (
              <div key={assessment.id} className="glass-card p-6 border border-gray-800 hover:border-cyber-accent transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white">Score: {assessment.score}/100</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    assessment.risk_category === 'Critical Risk' ? 'bg-red-500/20 text-red-500' :
                    assessment.risk_category === 'High Risk' ? 'bg-orange-500/20 text-orange-500' :
                    assessment.risk_category === 'Medium Risk' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {assessment.risk_category}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(assessment.created_at).toLocaleDateString()} at {new Date(assessment.created_at).toLocaleTimeString()}
                </p>
                <button
                  onClick={() => navigate(`/dashboard/${assessment.id}`)}
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
        <form onSubmit={handleSubmit} className="space-y-8">
          

          {/* Questionnaire */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">Security Checklist</h2>
            <p className="text-sm text-cyber-muted mb-4">Toggle the switch if the security control is fully implemented in your organization.</p>
            
            <div className="space-y-4">
              {[
                { name: 'mfa', label: 'Multi-Factor Authentication Enabled?', desc: 'MFA is enforced for all user accounts and remote access.' },
                { name: 'antivirus', label: 'Antivirus Installed?', desc: 'Active antivirus/anti-malware solutions are deployed on all endpoints.' },
                { name: 'firewall', label: 'Firewall Enabled?', desc: 'Network firewalls are configured to block unauthorized traffic.' },
                { name: 'security_updates', label: 'Regular Security Updates?', desc: 'OS and application patches are applied systematically.' },
                { name: 'training', label: 'Employee Security Training?', desc: 'Staff undergo regular phishing and security awareness training.' },
                { name: 'backups', label: 'Secure Data Backups?', desc: 'Critical data is backed up regularly and stored securely off-site.' },
                { name: 'encryption', label: 'Data Encryption Implemented?', desc: 'Sensitive data is encrypted both at rest and in transit.' },
                { name: 'incident_response', label: 'Incident Response Plan Available?', desc: 'A formal plan exists to detect, respond to, and recover from cyber incidents.' },
              ].map((q) => (
                <div key={q.name} className="flex items-start justify-between p-4 bg-cyber-dark rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                  <div className="pr-4">
                    <h3 className="font-medium text-white">{q.label}</h3>
                    <p className="text-sm text-gray-400 mt-1">{q.desc}</p>
                  </div>
                  <div className="flex items-center h-full pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={q.name}
                        checked={formData.answers[q.name]}
                        onChange={handleCheckboxChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-neon"></div>
                    </label>
                  </div>
                </div>
              ))}
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
                  <Send className="h-5 w-5" /> Submit Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentPage;
