import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import SEO from '../components/SEO';
import { HiCheckCircle } from 'react-icons/hi';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
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
      document.getElementById('code-0')?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO
        title="Verify Email"
        description="Enter the verification code sent to your email to activate your Mwiti Bakers account."
        url="https://mwitibakers.com/verify-email"
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
          <h1 className="text-3xl font-bold text-brand-navy mt-2">Check Your Email</h1>
          <p className="text-gray-600 mt-2">
            We sent a verification code to<br />
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

          <p className="text-sm text-gray-500 mb-4 text-center">
            Enter the 6-digit verification code from your email
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-xs text-amber-700">
            💡 <strong>Tip:</strong> If you don't see the code in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
          </div>

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
