/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
export default function StatusBadge({ status }) {
  const labels = {
    OPEN:        'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED:    'Resolved',
    CANCELLED:   'Cancelled',
    AVAILABLE:   'Available',
    DISPATCHED:  'Dispatched',
    MAINTENANCE: 'Maintenance',
    OFF_DUTY:    'Off Duty',
    PENDING:     'Pending',
    COMPLETED:   'Completed',
    FAILED:      'Failed',
  };
  const label = labels[status] || status;
  return (
    <span style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold">
      <span style={{ background: '#94a3b8' }} className="w-1.5 h-1.5 rounded-full" />
      {label}
    </span>
  );
}
