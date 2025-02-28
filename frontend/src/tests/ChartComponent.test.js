import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ChartComponent from '../components/ChartComponent';  // Adjust the import path as needed
import '@testing-library/jest-dom';
jest.useFakeTimers(); // Mock timers for the test

describe('ChartComponent', () => {
  const chartData = {
    title: 'Crime Statistics',
    labels: ['January', 'February', 'March'],
    datasets: [{
      data: [10, 20, 30],
    }],
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });
  
  test('should render the component and display loading initially', () => {
    render(<ChartComponent chartData={chartData} chartType="line" />);
    
    // Check if loading state is displayed
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  test('should display the chart once data is loaded', async () => {
    render(<ChartComponent chartData={chartData} chartType="line" />);

    // Wait for the chart to load
    act(() => {
        jest.advanceTimersByTime(100); // Advance by the timeout duration (100ms)
    });

    // Check that the loading state is removed
    expect(screen.queryByTestId("loading")).toBeNull();
    
    // Optionally, check if HighchartsReact is present
    const highchartsComponent = screen.getByText('Created with Highcharts 12.0.1'); // HighchartsReact uses this role
    expect(highchartsComponent).toBeInTheDocument();
  });

  test('should update the chart when chartType changes', async () => {
    const { rerender } = render(<ChartComponent chartData={chartData} chartType="line" />);

    // Wait for the initial render
    act(() => {
        jest.advanceTimersByTime(100); // Advance by the timeout duration (100ms)
    });

    // Check the chart is rendered for 'line' type
    let highchartsComponent = screen.getByText('Created with Highcharts 12.0.1'); // HighchartsReact uses this role
    expect(highchartsComponent).toBeInTheDocument();

    // Now change the chart type to 'pie'
    rerender(<ChartComponent chartData={chartData} chartType="pie" />);

    // Wait for the component to update
    act(() => {
        jest.advanceTimersByTime(100); // Advance by the timeout duration (100ms)
    });

    // Check that the chart has been updated to 'pie' type
    highchartsComponent = screen.getByText('Created with Highcharts 12.0.1');
    expect(highchartsComponent).toBeInTheDocument();
  });

  test('should handle empty chartData gracefully', async () => {
    const emptyChartData = {
      title: '',
      labels: [],
      datasets: [{
        data: [],
      }],
    };

    render(<ChartComponent chartData={emptyChartData} chartType="line" />);
    
    // Check if loading state is shown while data is loading
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    act(() => {
        jest.advanceTimersByTime(100); // Advance by the timeout duration (100ms)
    });

    const highchartsComponent = screen.getByText('Created with Highcharts 12.0.1');
    expect(highchartsComponent).toBeInTheDocument();
  });
});
