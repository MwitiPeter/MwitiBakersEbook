import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const redirectTimer = useRef(null);
  const reference = searchParams.get('reference');
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');
  const [status, setStatus] = useState('verifying');

  const getRedirectPath = () => {
    if (itemType && itemId) {
      switch (itemType) {
        case 'recipeBook':
          return `/recipe-books?itemId=${itemId}`;
        case 'trainingVideo':
          return `/training-videos?itemId=${itemId}`;
        default:
          return '/dashboard';
      }
    }
    return '/dashboard';
  };

  const getItemLabel = () => {
    switch (itemType) {
      case 'recipeBook': return 'View Recipe Book';
      case 'trainingVideo': return 'Watch Video';
      default: return 'Go to Dashboard';
    }
  };

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await API.get(`/payments/verify/${reference}`);
        if (data.success) {
          setStatus('success');
          // Refresh user data to update purchased items immediately
          await loadUser();
          // Auto-redirect after a brief moment to show success state
          redirectTimer.current = setTimeout(() => {
            navigate(getRedirectPath(), { replace: true });
          }, 1000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };

    // Small delay to ensure Paystack has processed
    const timer = setTimeout(verifyPayment, 1500);
    return () => {
      clearTimeout(timer);
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [reference]);

  return (
    <>
      <SEO title="Payment Confirmation" noindex />
      <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <img
          src="/New.jpg"
          alt="Mwiti Bakers - Premium Baking Content Logo"
          className="h-14 sm:h-16 w-auto mx-auto mb-6 object-contain"
          loading="lazy"
          decoding="async"
        />
        {status === 'verifying' && (
          <div>
            <div className="w-16 h-16 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <HiCheckCircle className="text-6xl text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-green-700 mb-2">Payment Verified!</h2>
            <p className="text-gray-500 text-sm">Your content is now unlocked. Taking you there...</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
              <div className="bg-green-500 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <HiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Issue</h2>
            <p className="text-gray-600 mb-6">We couldn't verify your payment. If funds were deducted, your content will be unlocked shortly.</p>
            <div className="flex flex-col gap-3">
              <Link
                to={getRedirectPath()}
                className="btn-primary text-center"
                onClick={async () => {
                  // Try to refresh user data anyway
                  try { await loadUser(); } catch {}
                }}
              >
                {getItemLabel()}
              </Link>
              {(!itemType || !itemId) && (
                <Link to="/dashboard" className="btn-outline text-center">
                  Go to Dashboard
                </Link>
              )}
              <p className="text-sm text-gray-400 mt-2">
                If you believe your payment was successful, your content should be unlocked automatically within a few minutes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
