import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function ChartComponent({ chartData, chartType }) {
  const [chartOptions, setChartOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setChartOptions({
        chart: {
          type: chartType,
          animation: {
            duration: 800, // Animate data points
          },
        },
        title: {
          text: chartData.title,
        },
        xAxis: chartType !== 'pie' ? {
          categories: chartData.labels,
        } : undefined,
        yAxis: chartType !== 'pie' ? {
          title: {
            text: 'Crime Count',
          },
        } : undefined,
        series: [{
          name: chartType === 'pie' ? 'Crime Type' : 'Crime Count',
          data: chartType === 'pie'
            ? chartData.labels.map((label, index) => ({
                name: label,
                y: chartData.datasets[0].data[index],
              }))
            : chartData.datasets[0].data,
        }],
      });
      setLoading(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, [chartType, chartData]);

  return (
    <div style={{
      width: '80%',
      height: 'fit-content', // Set a fixed height for consistent layout
      marginInline: 'auto',
      borderRadius: '15px',
      overflow: 'hidden',
      border: 'solid 2px #272626', 
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center',
    }}>
      {loading ? (
        // Display a loader or a placeholder while loading
        <div data-testid="loading" style={{
          width: '100%',
          minHeight: '400px',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#aaa',
        }}>
          {/* Loading chart... */}
        </div>
      ) : (
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      )}
    </div>
  );
}

export default ChartComponent;
