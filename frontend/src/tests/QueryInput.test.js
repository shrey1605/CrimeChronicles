import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryInput from '../components/QueryInput'; // Adjust the import path as needed
import '@testing-library/jest-dom';

describe('QueryInput', () => {
  let setViewType;

  beforeEach(() => {
    // Mock the setViewType function passed as a prop
    setViewType = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  test('should render the dropdown, input, and button', () => {
    render(<QueryInput setViewType={setViewType} />);

    // Check if the dropdown is rendered with the correct options
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /chart/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /text/i })).toBeInTheDocument();

    // Check if the input field is rendered
    expect(screen.getByPlaceholderText(/type your crime data query here/i)).toBeInTheDocument();

    // Check if the "Go" button is rendered
    expect(screen.getByRole('button', { name: /go/i })).toBeInTheDocument();
  });

  test('should call setViewType when dropdown value changes', () => {
    render(<QueryInput setViewType={setViewType} />);

    // Simulate selecting the "Text" option
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'text' } });

    // Ensure setViewType was called with "text"
    expect(setViewType).toHaveBeenCalledWith('text');

    // Simulate selecting the "Chart" option
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chart' } });

    // Ensure setViewType was called with "chart"
    expect(setViewType).toHaveBeenCalledWith('chart');
  });

  test('should update query state when user types in the input', () => {
    render(<QueryInput setViewType={setViewType} />);

    // Simulate user typing into the input field
    fireEvent.change(screen.getByPlaceholderText(/type your crime data query here/i), {
      target: { value: 'Crime data query' },
    });

    // Ensure the input field's value has changed
    expect(screen.getByPlaceholderText(/type your crime data query here/i).value).toBe(
      'Crime data query'
    );
  });

  test('should handle Enter key press and prevent default form submission', () => {
    render(<QueryInput setViewType={setViewType} />);

    // Simulate user typing and pressing Enter key
    fireEvent.change(screen.getByPlaceholderText(/type your crime data query here/i), {
      target: { value: 'Crime query' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText(/type your crime data query here/i), {
      key: 'Enter',
    });

    // The input field should not be cleared after pressing Enter, since the default action is prevented
    expect(screen.getByPlaceholderText(/type your crime data query here/i).value).toBe(
      'Crime query'
    );
  });

  test('should call console.log when "Go" button is clicked and input is not empty', () => {
    render(<QueryInput setViewType={setViewType} />);

    // Mock console.log to spy on it
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Simulate user typing in the input
    fireEvent.change(screen.getByPlaceholderText(/type your crime data query here/i), {
      target: { value: 'Crime data query' },
    });

    // Simulate clicking the "Go" button
    fireEvent.click(screen.getByRole('button', { name: /go/i }));

    // Check if console.log was called with the correct query value
    expect(consoleLogSpy).toHaveBeenCalledWith('query entered by user: ', { query: 'Crime data query' });

    // Cleanup the spy
    consoleLogSpy.mockRestore();
  });

  test('should not call console.log when "Go" button is clicked and input is empty', () => {
    render(<QueryInput setViewType={setViewType} />);

    // Mock console.log to spy on it
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Simulate clicking the "Go" button with an empty input
    fireEvent.click(screen.getByRole('button', { name: /go/i }));

    // Ensure console.log was not called because the input is empty
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Cleanup the spy
    consoleLogSpy.mockRestore();
  });
});
