import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import './AuthCard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const LoginCard = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.access_token) {
          setError('Login succeeded but token is missing from server response.');
          return;
        }

        // SUCCESS: Store the token and update app state
        sessionStorage.setItem('study_token', data.access_token);
        onLoginSuccess(data.access_token);
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="auth-card study-card">
      <div className="card-header auth-header">
        <span className="auth-chip">Sign In</span>
        <h2 className="card-title">Welcome back to StudyDash</h2>
        <span className="auth-subtitle">Pick up where you left off and keep your momentum going.</span>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <Mail className="input-icon" size={18} />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <Lock className="input-icon" size={18} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-submit">
          Log In <ArrowRight size={18} className="btn-icon-right" />
        </button>
      </form>

      <p className="auth-note">Your session is private to this browser tab.</p>

      <div className="auth-benefits">
        <span>Track focus sessions</span>
        <span>Plan smarter days</span>
      </div>

      <div className="auth-switch">
        <span>New to StudyDash?</span>
        <button onClick={onSwitchToSignup} className="switch-btn">
          Create Account
        </button>
      </div>
    </div>
  );
};

export default LoginCard;