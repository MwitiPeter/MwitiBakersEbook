import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { WHATSAPP_URL } from '../constants/brand';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  const getRedirectPath = () => {
    if (itemType && itemId) {
      switch (itemType) {
        case 'image':
          return `/gallery?itemId=${itemId}`;
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
      case 'image': return 'View Image';
      case 'recipeBook': return 'View Recipe Book';
      case 'trainingVideo': return 'Watch Video';
      default: return 'Go to Dashboard';
    }
  };

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

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <img
          src="/logo.jpg"
          alt="Mwiti Bakers"
          className="w-14 h-14 rounded-full mx-auto mb-6 shadow-gold object-cover"
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
            <HiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-2">{message}</p>
            {itemType && (
              <p className="text-sm text-gray-500 mb-6 capitalize">
                Your {itemType === 'trainingVideo' ? 'video' : itemType} is now unlocked.
              </p>
            )}
            <Link
              to={getRedirectPath()}
              className="btn-primary inline-flex items-center justify-center space-x-2 w-full"
            >
              <span>{getItemLabel()}</span>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <HiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Issue</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                to={getRedirectPath()}
                className="btn-primary text-center"
              >
                {getItemLabel()}
              </Link>
              {(!itemType || !itemId) && (
                <Link to="/dashboard" className="btn-outline text-center">
                  Go to Dashboard
                </Link>
              )}
              <p className="text-sm text-gray-400 mt-2">
                If you believe your payment was successful, your content should be unlocked automatically within a few minutes.{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  Contact us on WhatsApp
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
