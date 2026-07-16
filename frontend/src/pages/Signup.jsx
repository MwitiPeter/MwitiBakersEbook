import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import SEO from '../components/SEO';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    notificationsEnabled: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await signup(formData.name, formData.email, formData.password, formData.notificationsEnabled);
      if (data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Signup failed. Please try again.';
      // If user already exists but unverified, redirect to verification
      if (err.response?.data?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Create Account"
        description="Create your free Mwiti Bakers account and unlock access to premium baking recipe books and expert training videos."
        url="https://mwitibakers.com/signup"
        noindex
      />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/New.jpg"
            alt="Mwiti Bakers - Premium Baking Content Logo"
            className="h-16 sm:h-20 w-auto mx-auto mb-4 object-contain"
            loading="lazy"
            decoding="async"
          />
          <h1 className="text-3xl font-bold text-brand-navy mt-2">Join Mwiti Bakers</h1>
          <p className="text-gray-600 mt-1">Create your account and start baking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <PasswordInput
              id="signup-password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />

            <PasswordInput
              id="signup-confirm-password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repeat your password"
              required
            />

            <div className="flex items-start space-x-3">
              <input
                id="notifications"
                type="checkbox"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold cursor-pointer"
              />
              <label htmlFor="notifications" className="text-sm text-gray-600 cursor-pointer select-none">
                I'd like to receive <span className="font-medium text-brand-navy">email notifications</span> about new recipe books, training videos, and exclusive baking tips.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-gold font-semibold hover:text-yellow-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
