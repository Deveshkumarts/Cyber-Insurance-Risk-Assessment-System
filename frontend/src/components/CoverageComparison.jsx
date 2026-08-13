import React from 'react';
import { Check, X } from 'lucide-react';

const CoverageComparison = ({ recommendedTier }) => {
  const tiers = [
    { name: 'Basic Coverage', price: '$', features: [true, false, false, false] },
    { name: 'Standard Coverage', price: '$$', features: [true, true, false, false] },
    { name: 'Premium Coverage', price: '$$$', features: [true, true, true, false] },
    { name: 'Enterprise Coverage', price: '$$$$', features: [true, true, true, true] },
  ];

  const featuresList = [
    'Data Breach Response',
    'Ransomware Payments',
    'Business Interruption Loss',
    'Regulatory Fines Coverage'
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6">Coverage Tiers</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-700 bg-cyber-dark text-gray-300">Feature</th>
              {tiers.map(tier => (
                <th key={tier.name} className={`p-4 border-b border-gray-700 text-center ${tier.name === recommendedTier ? 'bg-cyber-neon text-cyber-dark rounded-t-lg' : 'bg-cyber-dark text-gray-300'}`}>
                  {tier.name}
                  {tier.name === recommendedTier && <div className="text-xs font-bold mt-1">(Recommended)</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featuresList.map((feature, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                <td className="p-4 text-gray-300">{feature}</td>
                {tiers.map((tier, tIdx) => (
                  <td key={tIdx} className={`p-4 text-center ${tier.name === recommendedTier ? 'bg-cyber-neon/10' : ''}`}>
                    {tier.features[idx] ? <Check className="inline text-green-500 w-5 h-5" /> : <X className="inline text-red-500 w-5 h-5 opacity-50" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoverageComparison;
