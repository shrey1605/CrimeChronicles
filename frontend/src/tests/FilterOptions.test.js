import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterOptions from '../components/FilterOptions'; // Adjust the import path as needed
import '@testing-library/jest-dom';

describe('FilterOptions', () => {
  let onFilterChange;

  beforeEach(() => {
    // Mock the onFilterChange function
    onFilterChange = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  test('should render the FilterOptions component with correct radio buttons', () => {
    render(<FilterOptions onFilterChange={onFilterChange} />);

    // Check if the radio buttons are rendered with correct labels
    expect(screen.getByLabelText(/crime type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time range/i)).toBeInTheDocument();
  });

  test('should call onFilterChange with the correct value when Crime Type is selected', () => {
    render(<FilterOptions onFilterChange={onFilterChange} />);

    // Simulate user clicking the "Crime Type" radio button
    fireEvent.click(screen.getByLabelText(/crime type/i));

    // Ensure onFilterChange was called with the correct value
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'crimeType',
      }),
    }));
  });

  test('should call onFilterChange with the correct value when Time Range is selected', () => {
    render(<FilterOptions onFilterChange={onFilterChange} />);

    // Simulate user clicking the "Time Range" radio button
    fireEvent.click(screen.getByLabelText(/time range/i));

    // Ensure onFilterChange was called with the correct value
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'timeRange',
      }),
    }));
  });

  test('should not call onFilterChange if the same radio button is clicked again', () => {
    render(<FilterOptions onFilterChange={onFilterChange} />);

    // Click on the "Crime Type" radio button
    fireEvent.click(screen.getByLabelText(/crime type/i));

    // Simulate clicking it again (should not trigger the onFilterChange)
    fireEvent.click(screen.getByLabelText(/crime type/i));

    // Ensure that onFilterChange is called only once
    expect(onFilterChange).toHaveBeenCalledTimes(1);
  });
});
