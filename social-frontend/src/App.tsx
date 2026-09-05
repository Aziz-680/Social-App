import { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calling YOUR Express backend!
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });
      
      // Save the token to local storage so we can use it for Friend Requests later
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Login Successful!');
      
     } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setMessage('❌ Login Failed: ' + (err.response?.data?.message || 'Server error'));}
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Social App Test</h1>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Test Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;