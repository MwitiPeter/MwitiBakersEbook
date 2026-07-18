import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PasswordInput from '../components/PasswordInput';
import SEO from '../components/SEO';
import { HiCheckCircle } from 'react-icons/hi';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || '';

  const [resetToken, setResetToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If we have a legacy code flow (email + code from dev mode), guide user
  useEffect(() => {
    if (codeFromUrl && emailFromUrl) {
      setError('The password reset flow has been updated. Please go back to "Forgot Password" and request a new reset link.');
    }
  }, [codeFromUrl, emailFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!resetToken) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/reset-password', {
        token: resetToken,
        password: newPassword,
      });
      setMessage(data.message || 'Password reset successfully!');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <>
        <SEO
          title="Password Reset"
          description="Your Mwiti Bakers password has been reset."
          url="https://mwitibakers.com/reset-password"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Password Reset!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">Redirecting you to login...</p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Set New Password"
        description="Set a new password for your Mwiti Bakers account."
        url="https://mwitibakers.com/reset-password"
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
            <h1 className="text-3xl font-bold text-brand-navy mt-2">Set New Password</h1>
            <p className="text-gray-600 mt-1">
              {tokenFromUrl
                ? 'Choose a new password for your account.'
                : 'Enter the reset token and your new password.'}
            </p>
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
              💡 This link expires in <strong>1 hour</strong>. Make sure to set your new password soon.
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!tokenFromUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="input-field"
                    placeholder="Paste the token from your reset link"
                    required
                  />
                </div>
              )}

              {tokenFromUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 flex items-start space-x-2">
                  <HiCheckCircle className="text-lg flex-shrink-0 mt-0.5" />
                  <span>Reset link verified! Now enter your new password.</span>
                </div>
              )}

              <PasswordInput
                id="reset-password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />

              <PasswordInput
                id="reset-confirm-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
              />

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
                    <span>Resetting password...</span>
                  </span>
                ) : (
                  'Set New Password'
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
              <Link to="/login" className="text-gray-500 hover:text-brand-navy text-sm transition-colors block">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
