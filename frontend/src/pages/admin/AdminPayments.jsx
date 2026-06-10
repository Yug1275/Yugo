import { useEffect, useState } from 'react';
import { getAllPaymentsAdminApi, exportPaymentsApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const STATUS_OPTIONS = ['all', 'pending', 'completed', 'failed'];

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [exporting, setExporting] = useState(false);

  const fetchPayments = async (p = 1, status = 'all') => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (status !== 'all') params.status = status;
      const res = await getAllPaymentsAdminApi(params);
      setPayments(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(page, statusFilter); }, [page, statusFilter]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await exportPaymentsApi(params);
      const data = res.data.data;
      if (!data || data.length === 0) {
        alert('No payments found matching filters to export.');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? '' : row[header];
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(',')
        )
      ];

      const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `yugo_payments_${statusFilter}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export payments CSV: ' + (err.response?.data?.error || err.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="page-title">Payment History</h2>
          <p className="page-subtitle">View and monitor transaction details and invoice status</p>
        </div>
        <Button variant="secondary" onClick={handleExportCSV} loading={exporting} size="sm">
          📥 Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter by Status:</span>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: 'auto', minWidth: 150, textTransform: 'capitalize' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <Loader text="Loading payment records..." />
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <p className="empty-state-text">No payments found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Payment ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Rider</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Ride Details</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Method</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Razorpay ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }}>
                  {/* Payment ID */}
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {payment._id.toString().slice(-6).toUpperCase()}
                  </td>
                  
                  {/* Rider */}
                  <td style={{ padding: '14px 18px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>{payment.riderId?.name || 'Deleted Rider'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{payment.riderId?.email || ''}</p>
                  </td>

                  {/* Ride details */}
                  <td style={{ padding: '14px 18px', maxWidth: 220 }}>
                    {payment.rideId ? (
                      <>
                        <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>
                          🏁 {payment.rideId.destination?.address}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Status: <span style={{ textTransform: 'capitalize' }}>{payment.rideId.status}</span>
                        </p>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>N/A (Deleted Ride)</span>
                    )}
                  </td>

                  {/* Method */}
                  <td style={{ padding: '14px 18px', textTransform: 'uppercase', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {payment.method === 'cash' ? '💵 Cash' : '💳 Online'}
                  </td>

                  {/* Razorpay ID */}
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                    {payment.razorpayPaymentId || '-'}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 18px', color: 'var(--color-text-muted)' }}>
                    {formatDateTime(payment.createdAt)}
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {formatCurrency(payment.amount)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: payment.status === 'completed' ? '#dcfce7' : payment.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: payment.status === 'completed' ? '#166534' : payment.status === 'pending' ? '#92400e' : '#991b1b',
                        textTransform: 'capitalize',
                      }}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Page {page} of {pagination.pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
