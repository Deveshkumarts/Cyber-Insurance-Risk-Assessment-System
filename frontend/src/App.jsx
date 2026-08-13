import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';
import AssetAssessmentPage from './pages/AssetAssessmentPage';
import InsuranceDashboardPage from './pages/InsuranceDashboardPage';
import IncidentDashboardPage from './pages/IncidentDashboardPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import ClaimDashboardPage from './pages/ClaimDashboardPage';
import ClaimSubmissionPage from './pages/ClaimSubmissionPage';
import ClaimDetailsPage from './pages/ClaimDetailsPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import MyDashboardRedirect from './pages/MyDashboardRedirect';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { OrganizationProvider } from './context/OrganizationContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <OrganizationProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
              <Route path="/my-dashboard" element={<ProtectedRoute><MyDashboardRedirect /></ProtectedRoute>} />
              <Route path="/dashboard/:id" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/asset-assessment/:orgId" element={<ProtectedRoute><AssetAssessmentPage /></ProtectedRoute>} />
              <Route path="/asset-assessment" element={<ProtectedRoute><AssetAssessmentPage /></ProtectedRoute>} />
              <Route path="/insurance-dashboard/:orgId" element={<ProtectedRoute><InsuranceDashboardPage /></ProtectedRoute>} />
              <Route path="/incidents" element={<ProtectedRoute><IncidentDashboardPage /></ProtectedRoute>} />
              <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetailsPage /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><ClaimDashboardPage /></ProtectedRoute>} />
              <Route path="/claims/new" element={<ProtectedRoute><ClaimSubmissionPage /></ProtectedRoute>} />
              <Route path="/claims/:id" element={<ProtectedRoute><ClaimDetailsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </OrganizationProvider>
  );
}

export default App;
