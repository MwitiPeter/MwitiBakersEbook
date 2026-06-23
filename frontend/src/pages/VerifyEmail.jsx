import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { HiMail, HiCheckCircle, HiEye, HiEyeOff } from 'react-icons/hi';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  // Check if we have a dev code stored from signup (Resend not configured)
  const [devCode, setDevCode] = useState('');
  const [showDevCode, setShowDevCode] = useState(false);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Read dev code from sessionStorage (set by AuthContext on signup)
    const stored = sessionStorage.getItem('devCode');
    if (stored) {
      setDevCode(stored);
      // Auto-fill the code inputs for convenience
      const digits = stored.split('');
      if (digits.length === 6) {
        setCode(digits);
      }
    }
  }, []);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      document.getElementById('code-5')?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/verify-email', {
        email,
        code: fullCode,
      });

      if (data.verified && data.token) {
        // Clear dev code from storage
        sessionStorage.removeItem('devCode');
        // Auto-login after verification
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      const { data } = await API.post('/auth/resend-code', { email });
      setMessage(data.message || 'A new verification code has been sent!');
      setCode(['', '', '', '', '', '']);

      // If dev mode, update the code
      if (data.devCode) {
        sessionStorage.setItem('devCode', data.devCode);
        setDevCode(data.devCode);
        const digits = data.devCode.split('');
        if (digits.length === 6) {
          setCode(digits);
        }
      }

      document.getElementById('code-0')?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiMail className="text-3xl text-brand-navy" />
          </div>
          <h1 className="text-3xl font-bold text-brand-navy mt-2">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            {devCode ? 'Enter the code below to verify your account' : 'We sent a verification code to'}
            {!devCode && <><br /><span className="font-semibold text-brand-navy">{email || 'your email'}</span></>}
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

          {/* Dev mode: Show the code directly */}
          {devCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                  ⚡ Email service not configured
                </p>
                <button
                  onClick={() => setShowDevCode(!showDevCode)}
                  className="text-amber-600 hover:text-amber-800 transition-colors"
                  title={showDevCode ? 'Hide code' : 'Show code'}
                >
                  {showDevCode ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
              <p className="text-xs text-amber-600 mb-3">
                Resend API key not set. Your verification code is shown below:
              </p>
              <div className={`text-center transition-all ${showDevCode ? '' : 'blur-sm select-none'}`}>
                <span className="text-2xl font-bold tracking-[0.3em] text-brand-navy font-mono">
                  {devCode}
                </span>
              </div>
              {!showDevCode && (
                <p className="text-xs text-amber-500 mt-1 text-center">Click the eye icon to reveal</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
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

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center mt-6 space-y-3">
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="text-brand-gold font-medium hover:text-yellow-700 transition-colors text-sm disabled:opacity-50"
            >
              {resending ? 'Sending...' : devCode ? 'Generate new code' : "Didn't receive the code? Resend"}
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
  );
}
