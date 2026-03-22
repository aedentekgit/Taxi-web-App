import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail]     = useState('admin@mytaxi.com');
  const [password, setPass]   = useState('123456');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError('Please enter a valid email address');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="text-center mb-28">
          <div className="login-logo">M</div>
          <h1 className="text-24 font-bold mb-4">MyTaxi Admin</h1>
          <p className="text-sub text-13">Sign in to your dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-16">
            <label className="d-block text-13 font-semibold mb-6">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input-lg" />
          </div>
          <div className="mb-16">
            <label className="d-block text-13 font-semibold mb-6">Password</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} required className="form-input-lg" />
          </div>
          {error && <div className="error-alert">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary login-btn">
            {loading ? <><div className="spinner spinner-sm" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-12 text-muted mt-16">Default: admin@mytaxi.com / 123456</p>
      </div>
    </div>
  );
}
