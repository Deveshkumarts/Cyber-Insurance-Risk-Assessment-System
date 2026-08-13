import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Shield, BookOpen } from 'lucide-react';

const KnowledgeBasePage = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from backend
    const fetchData = async () => {
      try {
        const response = await fetch('https://cyber-insurance-risk-assessment-system.onrender.com/api/knowledge-base');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching knowledge base:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-purple-500">
          Cyber Risk Knowledge Base
        </h1>
        <p className="text-xl text-cyber-muted max-w-3xl mx-auto">
          Understand the threats. Protect your assets. Explore common cyber risks and learn how to prevent them.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-4 border border-gray-700 rounded-lg bg-cyber-light bg-opacity-50 text-white placeholder-gray-400 focus:outline-none focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon transition-colors"
          placeholder="Search for threats, e.g., Phishing, Ransomware..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredData.map((item) => (
            <div key={item.id} className="glass-card p-6 hover-neon group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-neon opacity-5 rounded-bl-full transform group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-cyber-accent" />
                <h2 className="text-2xl font-bold">{item.category}</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-cyber-muted uppercase tracking-wider mb-1 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Description
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
                
                <div className="bg-red-900/20 border border-red-500/20 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-1">Impact</h3>
                  <p className="text-gray-300">{item.impact}</p>
                </div>
                
                <div className="bg-green-900/20 border border-green-500/20 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Prevention
                  </h3>
                  <p className="text-gray-300">{item.prevention}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="col-span-full text-center py-12 text-cyber-muted">
              No results found for "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;
