
import React, { useState } from 'react';
import '../styles/Signup.css';


const Login = ({setIsLoggedIn}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    try {
      const response = await fetch('http://localhost:5100/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send data to backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const result = await response.json();
      setSuccessMessage(result.message || 'Login successful!');
      setError('');
      setIsLoggedIn(true); // Update logged-in state in parent component
      console.log('Response from backend:', result);
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
      console.error('Login error:', err);
    }
  };
  
  
  
  
  
  
  // const [loginMessage, setLoginMessage] = useState('');

  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   // const result = login(username, password);

  //   if(localStorage.getItem(`cc_${username}_pw`) === password){
  //       setIsLoggedIn(true);
  //   }
  //   else{
  //       setLoginMessage("Username or Password is incorrect!");
  //   }

  return (
    <div className='login-div'>
      <div>
        <small>Already a User?</small>
        <h2>Log In</h2>
      </div>
      <form onSubmit={handleLogin}>
      <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
      </div>
      <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default Login;
