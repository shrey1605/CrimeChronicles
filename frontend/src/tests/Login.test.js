import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login'; // Adjust the import path as needed
import '@testing-library/jest-dom';

describe('Login', () => {
  let setIsLoggedIn;
  let setUsername;
  let setPassword;

  beforeEach(() => {
    // Mock the functions passed as props
    setIsLoggedIn = jest.fn();
    setUsername = jest.fn();
    setPassword = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    
    // Mock localStorage to simulate login credentials
    localStorage.setItem('cc_testUser_pw', 'testPassword');
  });

  test('should render the Login form with correct elements', () => {
    render(
      <Login 
        setIsLoggedIn={setIsLoggedIn} 
        setUsername={setUsername} 
        setPassword={setPassword} 
        username='' 
        password='' 
      />
    );

    // Check if form elements are present
    expect(screen.getByTestId(/username/i)).toBeInTheDocument();
    expect(screen.getByTestId(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test('should call setUsername and setPassword on input change', () => {
    render(
      <Login 
        setIsLoggedIn={setIsLoggedIn} 
        setUsername={setUsername} 
        setPassword={setPassword} 
        username='' 
        password='' 
      />
    );

    // Simulate user typing into the username input
    fireEvent.change(screen.getByTestId(/username/i), { target: { value: 'testUser' } });
    fireEvent.change(screen.getByTestId(/password/i), { target: { value: 'testPassword' } });

    // Ensure setUsername and setPassword were called
    expect(setUsername).toHaveBeenCalledWith('testUser');
    expect(setPassword).toHaveBeenCalledWith('testPassword');
  });

  test('should display error message when username or password is incorrect', () => {
    render(
      <Login 
        setIsLoggedIn={setIsLoggedIn} 
        setUsername={setUsername} 
        setPassword={setPassword} 
        username='testUser' 
        password='wrongPassword' 
      />
    );

    // Simulate form submission with incorrect credentials
    fireEvent.click(screen.getByText(/login/i));

    // Check if error message is displayed
    expect(screen.getByText(/username or password is incorrect/i)).toBeInTheDocument();
  });

  test('should call setIsLoggedIn with true when correct credentials are entered', () => {
    render(
      <Login 
        setIsLoggedIn={setIsLoggedIn} 
        setUsername={setUsername} 
        setPassword={setPassword} 
        username='testUser' 
        password='testPassword' 
      />
    );

    // Simulate form submission with correct credentials
    fireEvent.click(screen.getByText(/login/i));

    // Check if setIsLoggedIn was called with true
    expect(setIsLoggedIn).toHaveBeenCalledWith(true);
  });

  test('should not call setIsLoggedIn if the credentials are incorrect', () => {
    render(
      <Login 
        setIsLoggedIn={setIsLoggedIn} 
        setUsername={setUsername} 
        setPassword={setPassword} 
        username='testUser' 
        password='wrongPassword' 
      />
    );

    // Simulate form submission with incorrect credentials
    fireEvent.click(screen.getByText(/login/i));

    // Ensure setIsLoggedIn was not called
    expect(setIsLoggedIn).not.toHaveBeenCalled();
  });

  afterEach(() => {
    // Clean up the localStorage after each test
    localStorage.clear();
  });
});
