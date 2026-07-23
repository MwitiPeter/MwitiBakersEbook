import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { setAuthSession } from '../api/authSession';
import SEO from '../components/SEO';
import { HiCheckCircle } from 'react-icons/hi';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const isPending = searchParams.get('pending') === 'true';

  const [status, setStatus] = useState(tokenFromUrl ? 'verifying' : 'idle');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState('');

  // Auto-verify when a token is present in the URL (from email link click)
  useEffect(() => {
    if (!tokenFromUrl) return;

    // Handle pre-account verification (pending=true flow)
    if (isPending) {
      const verifyPending = async () => {
        try {
          const { data } = await API.post('/auth/verify-pending', { token: tokenFromUrl });
          if (data.verified) {
            setStatus('success');
            setMessage(data.message || 'Email verified! Redirecting to complete your account setup...');
            // Redirect to signup page with token and email so user can complete registration
            setTimeout(() => {
              navigate(`/signup?token=${encodeURIComponent(tokenFromUrl)}&email=${encodeURIComponent(data.email)}`);
            }, 1500);
          }
        } catch (err) {
          setStatus('error');
          setError(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
        }
      };
      verifyPending();
      return;
    }

    // Handle post-account verification (legacy flow)
    const verifyWithToken = async () => {
      try {
        const { data } = await API.post('/auth/verify-email', { token: tokenFromUrl });

        if (data.verified && data.token) {
          setAuthSession({ token: data.token, user: data.user });
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verifyWithToken();
  }, [tokenFromUrl, isPending, navigate]);

  // If token is being verified, show a loading screen
  if (status === 'verifying') {
    return (
      <>
        <SEO
          title="Verifying Email"
          description="Verifying your email for Mwiti Bakers."
          url="https://mwitibakers.com/verify-email"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-brand-gold border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-navy mb-2">Verifying your email...</h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <>
        <SEO
          title="Email Verified"
          description="Your Mwiti Bakers email has been verified."
          url="https://mwitibakers.com/verify-email"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Error state from token verification
  if (status === 'error' && tokenFromUrl) {
    return (
      <>
        <SEO
          title="Verification Failed"
          description="Email verification failed for Mwiti Bakers."
          url="https://mwitibakers.com/verify-email"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleResendLink = async () => {
    if (!email) {
      setError('No email address provided. Please sign up again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/resend-link', { email });
      if (data.devMode && data.verificationLink) {
        setDevLink(data.verificationLink);
        setMessage('A verification link is available below:');
      } else {
        setMessage(data.message || 'A new verification link has been sent!');
        setDevLink('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification link');
      setDevLink('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Verify Email"
        description="Check your email to verify your Mwiti Bakers account."
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
            We sent a verification link to<br />
            <span className="font-semibold text-brand-navy">{email || 'your email'}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
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

          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-brand-navy mb-2">Verify your email address</h2>

          {devLink ? (
            <div className="mb-6">
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Click the link below to verify your email:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <a
                  href={devLink}
                  className="text-brand-navy font-semibold text-sm underline hover:text-brand-gold transition-colors break-all"
                >
                  {devLink}
                </a>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Click the link in the email we sent to <strong>{email || 'your email'}</strong> to activate your account.
                The link expires in <strong>24 hours</strong>.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-xs text-amber-700 text-left">
                💡 <strong>Tip:</strong> If you don't see the email in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
              </div>
            </>
          )}

          <button
            onClick={handleResendLink}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Resend Verification Link'}
          </button>

          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
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
