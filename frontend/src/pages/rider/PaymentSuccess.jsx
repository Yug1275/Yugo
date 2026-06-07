import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const PaymentSuccess = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const payment = state?.payment;
  const method = state?.method || payment?.method || 'online';

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          {/* Success animation */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 20px',
              border: '3px solid #22c55e',
            }}
          >
            ✅
          </div>

          <h2 style={{ marginBottom: 8, color: 'var(--color-success)' }}>
            Payment Successful!
          </h2>
          <p style={{ marginBottom: 24 }}>
            Thank you for riding with YUGO. Your payment has been processed successfully.
          </p>

          {/* Payment details */}
          {payment && (
            <div
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '16px 20px',
                marginBottom: 24,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Amount Paid</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                  {payment.method}
                </span>
              </div>
              {payment.razorpayPaymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Transaction ID</span>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {payment.razorpayPaymentId}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Date</span>
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  {formatDateTime(payment.createdAt || new Date())}
                </span>
              </div>
            </div>
          )}

          {/* Cash payment */}
          {method === 'cash' && !payment && (
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 24,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#92400e' }}>
                💵 Cash payment recorded
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', marginTop: 4 }}>
                Please ensure you have paid the driver directly.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/rider/review/${rideId}`)}
            >
              ⭐ Rate Your Driver
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/rider/history')}
            >
              View Ride History
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/rider')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;