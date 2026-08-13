import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, UserPlus, Building, Users, Briefcase } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    organization_name: '',
    industry: '',
    employees: '',
    email: '',
    password: '',
    role: 'Employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(OrganizationContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://cyber-insurance-risk-assessment-system.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.organization, data.user);
        navigate('/assessment'); // Send directly to assessment
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="glass-card w-full max-w-2xl p-8 neon-border">
        <div className="text-center mb-8">
          <ShieldAlert className="w-16 h-16 text-cyber-neon mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Create Organization Account</h2>
          <p className="text-cyber-muted">Sign up to access your cyber risk assessments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" /> Organization Name
              </label>
              <input
                required
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
                placeholder="Acme Corp"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Industry Type
              </label>
              <select
                required
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
              >
                <option value="" disabled>Select Industry</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Technology">Technology</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Number of Employees
              </label>
              <input
                required
                type="number"
                name="employees"
                min="1"
                value={formData.employees}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
                placeholder="e.g., 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
                placeholder="admin@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Role</label>
              <select
                required
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg focus:outline-none focus:border-cyber-neon text-white"
              >
                <option value="Employee">Employee (Can report incidents)</option>
                <option value="Security Officer">Security Officer (Can investigate incidents)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-cyber-neon text-cyber-dark font-bold rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyber-dark"></div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Register Organization
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-neon hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
