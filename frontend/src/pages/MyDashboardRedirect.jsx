import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizationContext } from '../context/OrganizationContext';
import { AlertCircle } from 'lucide-react';

const MyDashboardRedirect = () => {
  const { organization } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!organization) {
      navigate('/login');
      return;
    }

    const fetchLatestAssessment = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assessment/organization/${organization.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Assessments are ordered by created_at DESC, so the first one is the latest
            navigate(`/dashboard/${data[0].id}`);
          } else {
            // No assessments found, redirect to take one
            navigate('/assessment');
          }
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server');
      }
    };

    fetchLatestAssessment();
  }, [organization, navigate]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-red-500 mb-4">{error}</h2>
        <button onClick={() => navigate('/assessment')} className="text-cyber-neon hover:underline">
          Go to Assessment Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-32 h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyber-neon mx-auto mb-4"></div>
        <p className="text-cyber-muted font-medium">Loading your latest dashboard...</p>
      </div>
    </div>
  );
};

export default MyDashboardRedirect;
