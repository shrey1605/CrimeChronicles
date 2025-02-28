import React, { useState } from 'react';
import '../styles/Signup.css';


const Signup = ({setIsLoggedIn}) => {
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    try {

      const response = await fetch('http://localhost:5100/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone, name, password }), // Send data to backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      const result = await response.json();
      setSuccessMessage(result.message || 'Signup successful!');
      setIsLoggedIn(true)
      setError('');
      console.log('Response from backend:', result);
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
      console.error('Signup error:', err);
    }
  };

  // const [signupMessage, setSignupMessage] = useState('');

  // const handleSignup = (e) => {
  //   e.preventDefault();
  //   // const result = signup(username, password);
    
  //   if(username.length===0 || password.length===0){
  //       setSignupMessage("Missing Username or Password!");
  //   }

  //   if(localStorage.getItem(`cc_${username}`)){
  //       setSignupMessage("Username already exists!");
  //   }
  //   else{
  //       localStorage.setItem(`cc_${username}`, username);
  //       localStorage.setItem(`cc_${username}_pw`, password);
  //       setSignupMessage("User created successfully.!");
  //       setTimeout(() => {
  //           setIsLoggedIn(true);
  //       }, 1500);    
  //   }
  // };

  return (
    <div className='signup-div'>
      <div>
        <small>New User?</small>
        <h2>Sign Up</h2>
      </div>
      <form onSubmit={handleSignup}>
      <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      
        <div>
          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
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
        <button type="submit">Signup</button>
      </form>
      {error && <p>{error}</p>}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default Signup;