import React from 'react';
import '../styles/FilterOptions.css';


function ChartTypeSelector({ chartType, setChartType }) {
  return (
    <div className="chart-type-selector" >
      <strong><span>Chart Type:</span></strong>
      <label>
        <input
          type="radio"
          name="chartType"
          value="pie"
          checked={chartType === 'pie'}
          onChange={(e) => setChartType(e.target.value)}
        />
        <span>Pie Chart</span>
        
      </label>
      <label>
        <input
          type="radio"
          name="chartType"
          value="bar"
          checked={chartType === 'bar'}
          onChange={(e) => setChartType(e.target.value)}
        />
        <span>Bar Chart</span>
      </label>
      <label>
        <input
          type="radio"
          name="chartType"
          value="line"
          checked={chartType === 'line'}
          onChange={(e) => setChartType(e.target.value)}
        />
        <span>Line Chart</span>
      </label>
    </div>
    
  );
}

export default ChartTypeSelector;

