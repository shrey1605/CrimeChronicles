import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../components/Signup'; // Adjust the import path as needed
import '@testing-library/jest-dom';
jest.useFakeTimers(); // Mock timers for the test

// Clear localStorage before each test to prevent conflicts
beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, 'error').mockImplementation(jest.fn());
});

describe('Signup Component', () => {
  let setIsLoggedIn, setUsername, setPassword, username, password;

  beforeEach(() => {
    setIsLoggedIn = jest.fn();
    setUsername = jest.fn();
    setPassword = jest.fn();
    username = '';
    password = '';
  });

  test('should render Signup form with fields and button', () => {
    render(<Signup 
      setIsLoggedIn={setIsLoggedIn} 
      setUsername={setUsername} 
      setPassword={setPassword} 
      username={username} 
      password={password} 
    />);

    // Check if the form elements are present
    expect(screen.getByTestId(/username/i)).toBeInTheDocument();
    expect(screen.getByTestId(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
  });


  test('should show an error message if username already exists', () => {
    // Set up localStorage with an existing username
    localStorage.setItem('cc_existingUser', 'existingUser');
    render(<Signup 
      setIsLoggedIn={setIsLoggedIn} 
      setUsername={setUsername} 
      setPassword={setPassword} 
      username="existingUser" 
      password="password123" 
    />);

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    // Expect an error message about the username already existing
    expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
  });

  test('should create a new user and save to localStorage when username is new', async () => {
    render(<Signup 
      setIsLoggedIn={setIsLoggedIn} 
      setUsername={setUsername} 
      setPassword={setPassword} 
      username="newUser" 
      password="password123" 
    />);

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    // Check that the success message is displayed
    expect(screen.getByText(/user created successfully/i)).toBeInTheDocument();

    // Wait for the async operation (setIsLoggedIn to be called after 1.5s)
    act(() => {
        jest.advanceTimersByTime(1500); // Advance by the timeout duration (100ms)
    });
    await waitFor(() => {
      expect(setIsLoggedIn).toHaveBeenCalledWith(true);
    });

    // Ensure the username and password are saved in localStorage
    expect(localStorage.getItem('cc_newUser')).toBe('newUser');
    expect(localStorage.getItem('cc_newUser_pw')).toBe('password123');
  });

  test('should not call setIsLoggedIn if signup is unsuccessful', () => {
    render(<Signup 
      setIsLoggedIn={setIsLoggedIn} 
      setUsername={setUsername} 
      setPassword={setPassword} 
      username="existingUser" 
      password="password123" 
    />);

    // Set up localStorage with an existing username
    localStorage.setItem('cc_existingUser', 'existingUser');

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    // Ensure setIsLoggedIn was not called
    expect(setIsLoggedIn).not.toHaveBeenCalled();
  });
});
