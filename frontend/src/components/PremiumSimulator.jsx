import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const PremiumSimulator = ({ initialData, onUpdate }) => {
  const [simulation, setSimulation] = useState({
    organization_id: initialData.organization_id || 1,
    asset_value: initialData.asset_value,
    historical_incidents: initialData.historical_incidents,
    patch_management_status: initialData.patch_management_status,
    backup_availability: initialData.backup_availability,
    threat_probability: initialData.threat_probability || 'Medium'
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = async (field, value) => {
    const updated = { ...simulation, [field]: value };
    setSimulation(updated);
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/simulate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await response.json();
      if (response.ok) {
        onUpdate(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg neon-border mt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calculator className="text-cyber-neon" /> "What-If" Mitigation Simulator
      </h3>
      <p className="text-sm text-gray-400 mb-6">Toggle controls to see how implementing security measures affects your premium.</p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-cyber-dark rounded border border-gray-800">
          <div>
            <h4 className="font-medium">Maintain Offsite Backups</h4>
            <p className="text-xs text-gray-500">Required for insurrability.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={simulation.backup_availability}
              onChange={(e) => handleToggle('backup_availability', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-neon"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-cyber-dark rounded border border-gray-800">
          <div>
            <h4 className="font-medium">Patch Management</h4>
            <p className="text-xs text-gray-500">Automated regular patching lowers risk.</p>
          </div>
          <select 
            value={simulation.patch_management_status}
            onChange={(e) => handleToggle('patch_management_status', e.target.value)}
            className="bg-gray-800 text-white rounded p-1 text-sm outline-none"
          >
            <option value="None">None</option>
            <option value="Irregular">Irregular</option>
            <option value="Regular">Regular</option>
          </select>
        </div>

      </div>
      
      {loading && <p className="text-cyber-neon text-sm mt-4 animate-pulse">Recalculating premium...</p>}
    </div>
  );
};

export default PremiumSimulator;
