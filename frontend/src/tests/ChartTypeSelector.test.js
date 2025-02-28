import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChartTypeSelector from '../components/ChartTypeSelector';  // Adjust the import path as needed
import '@testing-library/jest-dom';

describe('ChartTypeSelector', () => {
  let setChartType;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    setChartType = jest.fn();  // Mock the setChartType function
  });

  test('should render the correct chart type options', () => {
    render(<ChartTypeSelector chartType="line" setChartType={setChartType} />);

    // Check that the chart type options are rendered
    expect(screen.getByLabelText(/pie chart/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bar chart/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/line chart/i)).toBeInTheDocument();
  });

  test('should have the correct radio button selected based on chartType prop', () => {
    render(<ChartTypeSelector chartType="bar" setChartType={setChartType} />);

    // Check that the 'bar' radio button is selected
    expect(screen.getByLabelText(/bar chart/i).checked).toBe(true);
    expect(screen.getByLabelText(/pie chart/i).checked).toBe(false);
    expect(screen.getByLabelText(/line chart/i).checked).toBe(false);
  });

  test('should call setChartType when a different chart type is selected', () => {
    render(<ChartTypeSelector chartType="line" setChartType={setChartType} />);

    // Simulate the user selecting the 'pie' chart radio button
    fireEvent.click(screen.getByLabelText(/pie chart/i));

    // Check that setChartType was called with the correct argument ('pie')
    expect(setChartType).toHaveBeenCalledWith('pie');

    // Simulate the user selecting the 'bar' chart radio button
    fireEvent.click(screen.getByLabelText(/bar chart/i));

    // Check that setChartType was called with the correct argument ('bar')
    expect(setChartType).toHaveBeenCalledWith('bar');
  });

  test('should not call setChartType if the selected chart type is already active', () => {
    render(<ChartTypeSelector chartType="line" setChartType={setChartType} />);

    // Simulate the user clicking on the already selected chart type
    fireEvent.click(screen.getByLabelText(/line chart/i));

    // Check that setChartType was NOT called
    expect(setChartType).not.toHaveBeenCalled();
  });
});
