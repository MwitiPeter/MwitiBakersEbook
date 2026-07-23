import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { setAuthSession } from '../api/authSession';
import PasswordInput from '../components/PasswordInput';
import SEO from '../components/SEO';
import { HiCheckCircle, HiMail, HiExclamation } from 'react-icons/hi';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token') || '';
  const queryEmail = searchParams.get('email') || '';

  // Step 1: Email verification
  const [email, setEmail] = useState(queryEmail);
  const [pendingToken, setPendingToken] = useState(queryToken);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(!!queryToken);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [devVerificationLink, setDevVerificationLink] = useState('');

  // If user arrived from an email link, validate token before showing account form.
  useEffect(() => {
    if (!queryToken) {
      setVerifyingToken(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await API.post('/auth/verify-pending', { token: queryToken });
        if (data.verified) {
          setEmailVerified(true);
          setVerificationSent(true);
          setPendingToken(queryToken);
          setEmail(data.email || queryEmail);
          setError('');

          // Clean URL params without reloading and keep email context.
          const normalizedEmail = encodeURIComponent(data.email || queryEmail || '');
          window.history.replaceState({}, '', normalizedEmail ? `/signup?email=${normalizedEmail}` : '/signup');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'This verification link is invalid or expired. Please request a new one.');
        setEmailVerified(false);
        setVerificationSent(false);
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [queryToken, queryEmail]);

  // Step 2: Account details
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    notificationsEnabled: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Step 1: Send verification email ---
  const handleInitiateVerification = async (e) => {
    e.preventDefault();
    setError('');
    setWarnings([]);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setSendingVerification(true);
    try {
      const { data } = await API.post('/auth/initiate-verification', { email });

      if (data.devMode && data.verificationLink) {
        // Email unavailable — show the verification link on screen for manual clicking
        setDevVerificationLink(data.verificationLink);
        if (data.suggestion) {
          setWarnings([`Did you mean ${data.suggestion}?`]);
        }
        setVerificationSent(true);
        return;
      }

      if (data.suggestion) {
        setWarnings([`Did you mean ${data.suggestion}?`]);
      }

      setVerificationSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification. Please try again.';
      setError(msg);
      // Also show warnings/suggestions from the API
      if (err.response?.data?.suggestion) {
        setWarnings([`Did you mean ${err.response.data.suggestion}?`]);
      }
    } finally {
      setSendingVerification(false);
    }
  };

  // --- Step 2: Complete signup ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/complete-signup', {
        token: pendingToken,
        name: formData.name,
        password: formData.password,
        notificationsEnabled: formData.notificationsEnabled,
      });

      setAuthSession({ token: data.token, user: data.user });
      if (data.nextStep === 'dashboard' || !data.nextStep) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Steps ---
  if (verifyingToken) {
    return (
      <>
        <SEO
          title="Verifying Email"
          description="Verifying your Mwiti Bakers email link."
          url="https://mwitibakers.com/signup"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-brand-gold border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-navy mb-2">Verifying your email link...</h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </div>
        </div>
      </>
    );
  }

  // Show verification sent state (waiting for user to click link)
  if (verificationSent && !emailVerified) {
    return (
      <>
        <SEO
          title="Verify Email"
          description="Check your email to verify your Mwiti Bakers account."
          url="https://mwitibakers.com/signup"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <img
                src="/New.jpg"
                alt="Mwiti Bakers - Premium Baking Content Logo"
                className="h-16 sm:h-20 w-auto mx-auto mb-4 object-contain"
                loading="eager"
                decoding="async"
              />
              <h1 className="text-3xl font-bold text-brand-navy mt-2">Check Your Email</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              {devVerificationLink ? (
                <>
                  <div className="text-6xl mb-4">🔗</div>
                  <h2 className="text-xl font-bold text-brand-navy mb-2">Verify your email</h2>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                    Our email service is not configured yet. Click the link below to verify your email:
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <a
                      href={devVerificationLink}
                      className="text-brand-navy font-semibold text-sm underline hover:text-brand-gold transition-colors break-all"
                    >
                      {devVerificationLink}
                    </a>
                  </div>

                  <p className="text-xs text-gray-400 mb-6">
                    Once you click the link and verify, you'll be redirected to complete your account setup.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📧</div>
                  <h2 className="text-xl font-bold text-brand-navy mb-2">Verify your email</h2>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    We sent a verification link to <strong>{email}</strong>.
                    Click the link in the email to verify your address. Once verified, you'll be
                    redirected here to complete your account setup.
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-xs text-amber-700 text-left">
                    💡 <strong>Tip:</strong> If you don't see the email in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
                  </div>
                </>
              )}

              {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 text-xs text-yellow-700 text-left">
                  {warnings.map((w, i) => <p key={i}>{w}</p>)}
                </div>
              )}

              <button
                onClick={handleInitiateVerification}
                disabled={sendingVerification}
                className="text-brand-gold font-medium hover:text-yellow-700 transition-colors text-sm disabled:opacity-50"
              >
                {sendingVerification ? 'Sending...' : 'Resend verification link'}
              </button>

              <div className="mt-4">
                <Link to="/login" className="text-gray-500 hover:text-brand-navy text-sm transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Email verified step — show account creation form
  if (emailVerified) {
    return (
      <>
        <SEO
          title="Create Account"
          description="Complete your Mwiti Bakers account setup."
          url="https://mwitibakers.com/signup"
          noindex
        />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img
                src="/New.jpg"
                alt="Mwiti Bakers - Premium Baking Content Logo"
                className="h-16 sm:h-20 w-auto mx-auto mb-4 object-contain"
                loading="eager"
                decoding="async"
              />
              <h1 className="text-3xl font-bold text-brand-navy mt-2">Create Your Account</h1>
              <p className="text-gray-600 mt-1">Set up your profile to get started</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm text-green-700 flex items-center space-x-2">
                <HiCheckCircle className="text-lg flex-shrink-0" />
                <span>Email <strong>{email}</strong> verified! Now set up your account.</span>
              </div>

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

                <PasswordInput
                  id="signup-password"
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  showStrength={true}
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
                    I'd like to receive email notifications about new recipe books, training videos, and exclusive baking tips.
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
            </div>
          </div>
        </div>
      </>
    );
  }

  // Initial state — email input form
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
              loading="eager"
              decoding="async"
            />
            <h1 className="text-3xl font-bold text-brand-navy mt-2">Join Mwiti Bakers</h1>
            <p className="text-gray-600 mt-1">Start by verifying your email address</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-start space-x-2">
                <HiExclamation className="text-lg flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 text-xs text-yellow-700">
                {warnings.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            )}

            <form onSubmit={handleInitiateVerification} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  We'll send a verification link to this email. Disposable email addresses are not allowed.
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingVerification}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sendingVerification ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Sending verification...</span>
                  </span>
                ) : (
                  'Send Verification Link'
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
