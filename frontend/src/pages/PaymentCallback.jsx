import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { HiCheckCircle, HiXCircle, HiArrowRight } from 'react-icons/hi';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await API.get(`/payments/verify/${reference}`);
        if (data.success) {
          setStatus('success');
          setMessage('Payment successful! Your content has been unlocked.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed. Please contact support.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Please contact support.');
      }
    };

    // Small delay to ensure Paystack has processed
    const timer = setTimeout(verifyPayment, 1500);
    return () => clearTimeout(timer);
  }, [reference]);

  const getRedirectPath = () => {
    if (!reference) return '/dashboard';
    // We can't know the item type from here, so redirect to dashboard
    return '/dashboard';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <div>
            <div className="w-16 h-16 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <HiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to={getRedirectPath()} className="btn-primary inline-flex items-center space-x-2">
              <span>Go to Dashboard</span>
              <HiArrowRight />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <HiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Issue</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
              <p className="text-sm text-gray-400 mt-2">
                If you believe your payment was successful, your content should be unlocked automatically within a few minutes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
