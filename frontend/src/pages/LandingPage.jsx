import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Activity, Calculator } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyber-neon opacity-10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyber-accent opacity-10 blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-blue-500">
            Assess Your Cyber Risk
          </span>
          <span className="block mt-2">Before It's Too Late.</span>
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-xl text-cyber-muted">
          The Cyber Risk Awareness Portal helps organizations evaluate their security posture, identify vulnerabilities, receive actionable recommendations, and instantly calculate cyber insurance premiums.
        </p>
        
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/assessment"
            className="px-8 py-4 bg-cyber-neon text-cyber-dark font-bold rounded-lg hover:bg-opacity-90 hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all duration-300"
          >
            Start Assessment
          </Link>
        </div>
      </div>

      {/* Features section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap justify-center gap-8">
          <div className="glass-card p-8 hover-neon flex flex-col items-center text-center flex-1 min-w-[280px] max-w-[380px]">
            <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-6 border border-blue-500/50">
              <ShieldCheck className="h-8 w-8 text-cyber-neon" />
            </div>
            <h3 className="text-xl font-bold mb-3">Risk Assessment</h3>
            <p className="text-cyber-muted">Evaluate your organization against industry-standard cybersecurity practices and receive actionable insights.</p>
          </div>
          
          <div className="glass-card p-8 hover-neon flex flex-col items-center text-center flex-1 min-w-[280px] max-w-[380px]">
            <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
              <Calculator className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Cyber Insurance</h3>
            <p className="text-cyber-muted">Calculate estimated cyber insurance premiums based on your asset value and risk profile.</p>
          </div>

          <div className="glass-card p-8 hover-neon flex flex-col items-center text-center flex-1 min-w-[280px] max-w-[380px]">
            <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-6 border border-purple-500/50">
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Incident Investigation</h3>
            <p className="text-cyber-muted">Report cyber incidents and collaborate with Security Officers to analyze threats and track resolution progress.</p>
          </div>

          <div className="glass-card p-8 hover-neon flex flex-col items-center text-center flex-1 min-w-[280px] max-w-[380px]">
            <div className="w-16 h-16 bg-pink-900/50 rounded-full flex items-center justify-center mb-6 border border-pink-500/50">
              <Lock className="h-8 w-8 text-cyber-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Evidence & Claims</h3>
            <p className="text-cyber-muted">Upload investigation evidence for integrity verification and submit formal cyber insurance claims.</p>
          </div>

          <div className="glass-card p-8 hover-neon flex flex-col items-center text-center flex-1 min-w-[280px] max-w-[380px]">
            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mb-6 border border-indigo-500/50">
              <Activity className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Predictive Analytics</h3>
            <p className="text-cyber-muted">AI-driven risk forecasting, loss estimation, and intelligent security recommendations based on your historical data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
