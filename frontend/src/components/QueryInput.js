import React, { useState } from 'react';
import '../styles/QueryInput.css';
import Visualization from './Visualization';
import ChartTypeSelector from './ChartTypeSelector';


function QueryInput({ setViewType, chartType, setChartType, viewType }) {

  const [query, setQuery] = useState('');
  const [isChart, setIsChart] = useState(true); // Default view is chart
  const [responseMessage, setResponseMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [queryResult, setQueryResult] = useState(null); // State to hold query result
  const [loading, setLoading] = useState(false);

  const handleDropdownChange = (e) => {
    const viewType = e.target.value;
    setViewType(viewType); // Notify parent of the change
    setIsChart(viewType === 'chart'); // Update local state for chart or text
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (query.trim() === '') {
      setErrorMessage('Query cannot be empty.');
      return;
    }
    setErrorMessage('');
    setResponseMessage('');

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5100/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: query,
          user_email:"finaldemo@gmail.com",
          is_chart: isChart,
          chart_type: isChart ? chartType : undefined, // Include chart type if chart is selected
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process query');
      }

      const result = await response.json();
      console.log('Response from backend:', result);
      setResponseMessage(result.message || 'Query processed successfully.');
      setQueryResult(result.data);
      setLoading(false); // Store the query result here
    } catch (error) {
      console.error('Error processing query:', error);
      setErrorMessage(error.message || 'An error occurred while processing your query.');
    }
  };

  return (
    <div className="query-input">
      <div style={{
        marginBlock:'2rem',
      display:"flex",
      flexDirection:"column",
      width:"100vw"
      }}>
        <Visualization chartType={chartType} viewType={viewType} queryResult={queryResult}/>

        <div style={{
              display: "flex",
              width:'80%',
              justifyContent: "space-between",
              alignItems: "center",
              marginInline:'auto'
              }}>
              {viewType === 'chart' && <ChartTypeSelector chartType={chartType} setChartType={setChartType} />}
        </div>

      </div>
      <div>
        <select onChange={handleDropdownChange}>
          <option value="chart">Chart</option>
          <option value="text">Text</option>
        </select>

        <input
          type="text"
          placeholder="Type your crime data query here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown} // Trigger submit on Enter
        />
        
        <button onClick={handleSubmit}>Go</button> {/* Submit button */}
      </div>
      <div style={{
        justifyContent:"center"
      }}>
        {responseMessage && <p>{responseMessage}</p>}
        {errorMessage && <p>{errorMessage}</p>}
        {loading && <p>Loading...</p>}
      </div>
    </div>
  );
  


}

export default QueryInput;