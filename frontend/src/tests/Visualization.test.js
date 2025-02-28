import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import Visualization from '../components/Visualization'; // Adjust the import path as needed
import ChartComponent from '../components/ChartComponent'; // Import ChartComponent to check its usage
import '@testing-library/jest-dom';
jest.useFakeTimers(); // Mock timers for the test

// jest.mock('../components/ChartComponent'); // Mocking ChartComponent for unit testing purposes

describe('Visualization Component', () => {
  const chartData = {
    title: 'Crime Distribution by Type',
    labels: ['Theft', 'Assault', 'Burglary', 'Vandalism', 'Robbery'],
    datasets: [
      {
        data: [120, 45, 67, 34, 78],
      },
    ],
  };
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  test('should render ChartComponent when viewType is "chart"', () => {
    render(
      <Visualization chartType="pie" viewType="chart" />
    );
    act(() => {
        jest.advanceTimersByTime(100); // Advance by the timeout duration (100ms)
    });
    // Ensure that the ChartComponent is rendered
    expect(screen.getByText('Created with Highcharts 12.0.1')).toBeInTheDocument();

  });

  test('should render text output when viewType is "text"', () => {
    render(
      <Visualization chartType="pie" viewType="text" />
    );

    // Check if the textarea is rendered
    const textarea = screen.getByPlaceholderText(/AI-generated response will appear here/i);
    expect(textarea).toBeInTheDocument();

    // Check if the default text is present
    expect(textarea.value).toBe('Sample Text Output: Theft is the most reported crime in 2022.');
  });
});