import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useRazorpay from '../../hooks/useRazorpay';
import { getRideByIdApi } from '../../api/rideApi';
import { getPaymentByRideApi, recordCashPaymentApi } from '../../api/paymentApi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const Payment = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { initiatePayment, loading: razorpayLoading, error: razorpayError, setError } = useRazorpay();

  const [ride, setRide] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cashLoading, setCashLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('online');
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rideRes, paymentRes] = await Promise.all([
          getRideByIdApi(rideId),
          getPaymentByRideApi(rideId),
        ]);
        setRide(rideRes.data.data);
        setExistingPayment(paymentRes.data.data);
      } catch {
        setPageError('Failed to load ride details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rideId]);

  const handleOnlinePayment = () => {
    setError('');
    initiatePayment({
      rideId,
      userDetails: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      },
      onSuccess: (data) => {
        navigate(`/rider/payment-success/${rideId}`, {
          state: { payment: data.payment },
        });
      },
      onFailure: (msg) => {
        setPageError(msg);
      },
    });
  };

  const handleCashPayment = async () => {
    setCashLoading(true);
    setPageError('');
    try {
      await recordCashPaymentApi(rideId);
      navigate(`/rider/payment-success/${rideId}`, {
        state: { method: 'cash' },
      });
    } catch (err) {
      setPageError(err.response?.data?.error || 'Failed to record cash payment');
    } finally {
      setCashLoading(false);
    }
  };

  if (loading) return <Loader text="Loading payment details..." />;

  if (pageError && !ride) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
        <h3>{pageError}</h3>
        <Button variant="primary" onClick={() => navigate('/rider')} style={{ marginTop: 16 }}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Already paid
  if (existingPayment?.status === 'completed') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>Already Paid</h3>
          <p style={{ marginBottom: 20 }}>
            This ride has already been paid via{' '}
            <strong style={{ textTransform: 'capitalize' }}>{existingPayment.method}</strong>.
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 20 }}>
            {formatCurrency(existingPayment.amount)}
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/rider')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const fare = ride?.finalFare || ride?.fare || 0;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Complete Payment</h2>
        <p className="page-subtitle">Pay for your completed ride</p>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Ride summary */}
        <div className="card">
          <h4 style={{ marginBottom: 14 }}>Ride Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: '1rem' }}>🟢</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PICKUP</p>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{ride?.pickup?.address}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: '1rem' }}>🔴</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>DESTINATION</p>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{ride?.destination?.address}</p>
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {formatDateTime(ride?.createdAt)}
              </p>
              {ride?.distanceKm && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  📏 {ride.distanceKm} km
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>AMOUNT DUE</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {formatCurrency(fare)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="card">
          <h4 style={{ marginBottom: 14 }}>Select Payment Method</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { value: 'online', icon: '💳', label: 'Online Payment', desc: 'Card / UPI / Wallet' },
              { value: 'cash', icon: '💵', label: 'Cash', desc: 'Pay driver directly' },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setSelectedMethod(method.value)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 10,
                  border: `2px solid ${selectedMethod === method.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedMethod === method.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{method.icon}</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: selectedMethod === method.value ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                  {method.label}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {method.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Error */}
          {(pageError || razorpayError) && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 14,
                fontSize: '0.875rem',
                color: '#991b1b',
              }}
            >
              {pageError || razorpayError}
            </div>
          )}

          {/* Pay button */}
          {selectedMethod === 'online' ? (
            <div>
              <Button
                variant="primary"
                fullWidth
                loading={razorpayLoading}
                onClick={handleOnlinePayment}
              >
                💳 Pay {formatCurrency(fare)} Online
              </Button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 10 }}>
                🔒 Secured by Razorpay · 256-bit SSL encryption
              </p>
            </div>
          ) : (
            <div>
              <Button
                variant="primary"
                fullWidth
                loading={cashLoading}
                onClick={handleCashPayment}
              >
                💵 Confirm Cash Payment
              </Button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 10 }}>
                Please pay the driver {formatCurrency(fare)} in cash
              </p>
            </div>
          )}
        </div>

        {/* Back button */}
        <Button variant="ghost" fullWidth onClick={() => navigate('/rider')}>
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Payment;