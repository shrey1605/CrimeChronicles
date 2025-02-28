import React from 'react';
import '../styles/FilterOptions.css';

function FilterOptions({ onFilterChange }) {
  return (
    <div className="filter-options">
      <label>
        <input
          type="radio"
          name="filter"
          value="crimeType"
          onChange={onFilterChange}
        />
        <span>Crime Type</span>
      </label>
      <label>
        <input
          type="radio"
          name="filter"
          value="timeRange"
          onChange={onFilterChange}
        />
        <span>Time Range</span>
      </label>
    </div>
  );
}

export default FilterOptions;
