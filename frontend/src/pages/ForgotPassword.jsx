import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import SEO from '../components/SEO';
import { HiCheckCircle, HiMail } from 'react-icons/hi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });

      if (data.devMode && data.code) {
        // Email unavailable — redirect straight to reset with the code pre-filled
        navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${data.code}`);
      } else {
        setMessage(data.message || 'A reset code has been sent to your email.');
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Forgot Password"
        description="Reset your Mwiti Bakers account password."
        url="https://mwitibakers.com/forgot-password"
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
            <h1 className="text-3xl font-bold text-brand-navy mt-2">Forgot Password</h1>
            <p className="text-gray-600 mt-1">Enter your email to receive a reset code</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2">
                <HiCheckCircle className="text-lg flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-xs text-amber-700">
              <strong>Note:</strong> Your email must be verified before you can reset your password. If you haven't verified yet, please{' '}
              <Link to="/signup" className="underline font-medium">create an account</Link> first.
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
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
                    <span>Sending code...</span>
                  </span>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-brand-gold font-semibold hover:text-yellow-700">
                  Sign In
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-gold font-semibold hover:text-yellow-700">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
