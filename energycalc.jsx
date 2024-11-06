import React, { useState } from 'react';

const ElectricityCalculator = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [usage, setUsage] = useState(months.reduce((acc, month) => ({
    ...acc,
    [month]: ''
  }), {}));

  const [rates, setRates] = useState({
    peakRate: '',
    offPeakRate: ''
  });

  const handleUsageChange = (month, value) => {
    setUsage(prev => ({
      ...prev,
      [month]: value
    }));
  };

  const handleRateChange = (rate, value) => {
    setRates(prev => ({
      ...prev,
      [rate]: value
    }));
  };

  const calculateTotal = () => {
    return Object.values(usage)
      .reduce((sum, value) => sum + (Number(value) || 0), 0);
  };

  const calculateCost = () => {
    const totalUsage = calculateTotal();
    const averageRate = ((Number(rates.peakRate) || 0) + (Number(rates.offPeakRate) || 0)) / 2 / 100;
    return (totalUsage * averageRate).toFixed(2);
  };

  return (
    <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Electricity Usage Calculator</h1>

      <div className="space-y-4">
        {months.map(month => (
          <div key={month} className="flex justify-between items-center">
            <label className="text-gray-700">{month}</label>
            <input
              type="number"
              value={usage[month]}
              onChange={e => handleUsageChange(month, e.target.value)}
              placeholder={`Usage in ${month}`}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Peak Rate (cents per kWh)</label>
        <input
          type="number"
          value={rates.peakRate}
          onChange={e => handleRateChange('peakRate', e.target.value)}
          placeholder="Enter peak rate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <label className="block text-sm font-medium text-gray-700 mt-4">Off-Peak Rate (cents per kWh)</label>
        <input
          type="number"
          value={rates.offPeakRate}
          onChange={e => handleRateChange('offPeakRate', e.target.value)}
          placeholder="Enter off-peak rate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            alert(`Total Usage: ${calculateTotal()} kWh\nEstimated Cost: $${calculateCost()}`);
          }}
          className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-600 focus:outline-none"
        >
          Calculate
        </button>
      </div>
    </div>
  );
};

export default ElectricityCalculator;
