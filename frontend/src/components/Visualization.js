import React from 'react';
// import { Pie } from 'react-chartjs-2';
import ChartComponent from './ChartComponent'


// Import the CSS file
import '../styles/Visualization.css';

function Visualization({ chartType, viewType, queryResult }) { // just for sample output!
  const chartData = queryResult && queryResult?.title?.text ? {
    title: queryResult.title.text, // Use title from the response
    labels: queryResult.series[0].data.map(item => item.name), // Get the locations (labels)
    datasets: [
      {
        data: queryResult.series[0].data.map(item => item.y), // Get the corresponding crime count (data)
        // Optionally, you can add more customization like background colors here
      },
    ],
  } : null;

  if (viewType === 'text') {
    return (
      <div className="text-container">
        <h3>Response</h3>
        {
          queryResult?.title ? (<textarea
            placeholder="AI-generated response will appear here..."
            readOnly
            value= {"Sample Text Output: Theft is the most reported crime in 2022."}
          />) :
          (<textarea
            placeholder="AI-generated response will appear here..."
            readOnly
            value= {queryResult}
          />)
        }
        
      </div>
    );
  }

  // return (
  //   <div className="visualization-container">
  //     <h3 className="visualization-title">Visualization</h3>
  //     <div className="chart-container">
  //       <Pie data={chartData} options={{ maintainAspectRatio: false }} />
  //     </div>
  //   </div>
  // );
  
  return (
    <div>
      {/* Send chartData and chartType to the ChartComponent */}
      {chartData && (
        <ChartComponent chartData={chartData} chartType={chartType} />
      )}
    </div>
  );

}

export default Visualization;
