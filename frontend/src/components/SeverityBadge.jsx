/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
export default function SeverityBadge({ severity }) {
  const labels = {
    CRITICAL: 'Critical',
    HIGH:     'High',
    MEDIUM:   'Medium',
    LOW:      'Low',
  };
  const label = labels[severity] || severity;
  return (
    <span style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
      {label}
    </span>
  );
}
