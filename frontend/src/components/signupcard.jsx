import React, { useState } from 'react';
import { Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import './AuthCard.css'; // We'll share a CSS file for both

function getPasswordIssues(password) {
  const issues = []
  if (password.length < 8) issues.push('8+ characters')
  if (!/[A-Z]/.test(password)) issues.push('1 uppercase letter')
  if (!/[a-z]/.test(password)) issues.push('1 lowercase letter')
  if (!/\d/.test(password)) issues.push('1 number')
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('1 special character')
  return issues
}

const SignupCard = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const issues = getPasswordIssues(password)
    if (issues.length > 0) {
      setError(`Password must include: ${issues.join(', ')}`)
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account created! Please log in.');
        onSwitchToLogin(); // Automatically navigate to login
      } else {
        setError(data.detail || 'Signup failed');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="auth-card study-card">
      <div className="card-header auth-header">
        <span className="auth-chip">Sign Up</span>
        <h2 className="card-title">Create your study cockpit</h2>
        <span className="auth-subtitle">Build routines, hit streaks, and stay exam-ready every day.</span>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSignup} className="auth-form">
        <div className="input-group">
          <Mail className="input-icon" size={18} />
          <input
            type="text"
            placeholder="Username (e.g., student123)"
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
            autoComplete="new-password"
            required
          />
        </div>
        <div className="input-group">
          <Lock className="input-icon" size={18} />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="auth-submit">
          Sign Up <ArrowRight size={18} className="btn-icon-right" />
        </button>
      </form>

      <div className="auth-benefits">
        <span>Visual progress cards</span>
        <span>One place for planning</span>
      </div>

      <div className="auth-switch">
        <span>Already have an account?</span>
        <button onClick={onSwitchToLogin} className="switch-btn">
          Log In
        </button>
      </div>
    </div>
  );
};

export default SignupCard;