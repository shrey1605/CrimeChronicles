/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header'; // Adjust the import path as needed
import '@testing-library/jest-dom';

describe('Header', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });
  test('should render the logo image with correct src and alt attributes', () => {
    render(<Header />);

    const logoImage = screen.getByAltText('Logo');
    
    // Check if the image is rendered correctly
    expect(logoImage).toBeInTheDocument();
    
    // Check if the src attribute is correct
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('logo.png'));
    
    // Check if the alt attribute is correct
    expect(logoImage).toHaveAttribute('alt', 'Logo');
  });

  test('should render the header text "Crime Chronicles"', () => {
    render(<Header />);

    // Check if the header title is rendered correctly
    const headerText = screen.getByText('Crime Chronicles');
    expect(headerText).toBeInTheDocument();
  });

  test('should have the correct CSS classes for header elements', () => {
    render(<Header />);

    // Check if the container has the correct class
    const headerContainer = screen.getByRole('banner'); // header is typically the banner role
    expect(headerContainer).toHaveClass('header-container');

    // Check if the inner div has the correct class
    const header = screen.getByRole('heading', { level: 1 });
    expect(header.parentElement).toHaveClass('header');
  });

});
