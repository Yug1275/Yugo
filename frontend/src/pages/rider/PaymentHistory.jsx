import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPaymentsApi } from '../../api/paymentApi';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { CreditCard, Smartphone, Wallet, Banknote, MapPin, RefreshCcw } from '../../components/common/Icons';

const STATUS_STYLES = {
  completed: { background: '#dcfce7', color: '#166534' },
  pending:   { background: '#fef3c7', color: '#92400e' },
  failed:    { background: '#fee2e2', color: '#991b1b' },
  refunded:  { background: '#f3e8ff', color: '#6b21a8' },
};

const METHOD_ICONS = {
  card:   <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />,
  upi:    <Smartphone size={18} style={{ color: 'var(--color-primary)' }} />,
  wallet: <Wallet size={18} style={{ color: 'var(--color-primary)' }} />,
  cash:   <Banknote size={18} style={{ color: 'var(--color-primary)' }} />,
};

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('all');

  const fetchPayments = async (p = 1, status = 'all') => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (status !== 'all') params.status = status;
      const res = await getMyPaymentsApi(params);
      setPayments(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, filter);
  }, [page, filter]);

  const totalSpent = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Payment History</h2>
        <p className="page-subtitle">All your transactions</p>
      </div>

      {/* Summary */}
      {payments.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div className="card" style={{ background: '#dcfce7', border: 'none' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Total Spent</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="card" style={{ background: '#dbeafe', border: 'none' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Transactions</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e40af' }}>
              {pagination.total || payments.length}
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'completed', 'pending', 'failed', 'refunded'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1.5px solid ${filter === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <Loader text="Loading payments..." />
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            <CreditCard size={36} strokeWidth={1.5} />
          </div>
          <p className="empty-state-text">No payment records found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="card"
              style={{ padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => payment.rideId?._id && navigate(`/rider/payment/${payment.rideId._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                {/* Left */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {METHOD_ICONS[payment.method] || <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />}
                    </span>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        ...STATUS_STYLES[payment.status],
                      }}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {payment.method}
                    </span>
                  </div>

                  {payment.rideId && (
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>{payment.rideId.destination?.address || 'Unknown destination'}</span>
                    </p>
                  )}

                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                    {formatDateTime(payment.createdAt)}
                  </p>

                  {payment.razorpayPaymentId && (
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                      {payment.razorpayPaymentId}
                    </p>
                  )}
                </div>

                {/* Right: amount */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: payment.status === 'refunded' ? '#6b21a8' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    {payment.status === 'refunded' && <RefreshCcw size={14} />}
                    <span>{formatCurrency(payment.amount)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;