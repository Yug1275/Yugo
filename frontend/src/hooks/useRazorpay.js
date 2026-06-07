import { useState, useCallback } from 'react';
import { createOrderApi, verifyPaymentApi } from '../api/paymentApi';

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initiatePayment = useCallback(async ({
    rideId,
    userDetails,
    onSuccess,
    onFailure,
  }) => {
    setLoading(true);
    setError('');

    try {
      // Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
      }

      // Create Razorpay order via backend
      const res = await createOrderApi(rideId);
      const { orderId, amount, currency, keyId, ride } = res.data.data;

      // Configure Razorpay checkout options
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'YUGO',
        description: `Ride payment — ${ride.pickup} → ${ride.destination}`,
        image: '/favicon.svg',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rideId,
            });
            if (onSuccess) onSuccess(verifyRes.data.data);
          } catch (err) {
            const msg = err.response?.data?.error || 'Payment verification failed';
            setError(msg);
            if (onFailure) onFailure(msg);
          }
        },
        prefill: {
          name: userDetails?.name || '',
          email: userDetails?.email || '',
          contact: userDetails?.phone || '',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled by user');
            if (onFailure) onFailure('Payment cancelled');
          },
        },
      };

      // Open Razorpay checkout modal
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed';
        setError(msg);
        if (onFailure) onFailure(msg);
      });
      rzp.open();

    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to initiate payment';
      setError(msg);
      if (onFailure) onFailure(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { initiatePayment, loading, error, setError };
};

export default useRazorpay;