import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PasswordInput from '../components/PasswordInput';
import SEO from '../components/SEO';
import { HiCheckCircle } from 'react-icons/hi';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const prefillCode = searchParams.get('code') || '';

  const [code, setCode] = useState(prefillCode ? prefillCode.split('') : ['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`rcode-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`rcode-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      document.getElementById('rcode-5')?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
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
        email,
        code: fullCode,
        password: newPassword,
      });
      setMessage(data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setMessage(data.message || 'A new code has been sent to your email!');
      setCode(['', '', '', '', '', '']);
      document.getElementById('rcode-0')?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password"
        description="Reset your Mwiti Bakers account password."
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
            <h1 className="text-3xl font-bold text-brand-navy mt-2">Reset Password</h1>
            <p className="text-gray-600 mt-1">
              Enter the code sent to<br />
              <span className="font-semibold text-brand-navy">{email || 'your email'}</span>
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

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-xs text-amber-700">
              💡 <strong>Tip:</strong> If you don't see the code in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-3 text-center">Enter the 6-digit code from your email</p>
                <div className="flex justify-center gap-2 sm:gap-3 mb-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`rcode-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                      style={{
                        borderColor: digit ? '#c89b5a' : '#e5e7eb',
                      }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

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
                disabled={loading || code.join('').length !== 6}
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
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="text-center mt-6 space-y-3">
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-brand-gold font-medium hover:text-yellow-700 transition-colors text-sm disabled:opacity-50"
              >
                {resending ? 'Sending...' : "Didn't receive the code? Resend"}
              </button>

              <div>
                <Link to="/login" className="text-gray-500 hover:text-brand-navy text-sm transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
