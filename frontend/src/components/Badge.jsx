export function Badge({ text, variant = 'gray' }) {
  return <span className={`badge b-${variant}`}>{text}</span>;
}

const STATUS_MAP = {
  completed: 'green', delivered: 'green', resolved: 'green', approved: 'green', active: 'green',
  started: 'orange', in_transit: 'blue', in_progress: 'yellow', acknowledged: 'yellow',
  pending: 'yellow', confirmed: 'yellow',
  cancelled: 'red', rejected: 'red', blocked: 'red', open: 'red',
  draft: 'gray', offline: 'gray',
};

export function StatusBadge({ status }) {
  const variant = STATUS_MAP[status?.toLowerCase()] || 'gray';
  const label = status?.replace(/_/g, ' ') || '—';
  return <Badge text={label} variant={variant} />;
}

export function PriorityBadge({ priority }) {
  const map = { low: 'gray', medium: 'blue', high: 'yellow', urgent: 'red' };
  return <Badge text={priority} variant={map[priority?.toLowerCase()] || 'gray'} />;
}

export function getStatusBtnClass(status) {
  const variant = STATUS_MAP[status?.toLowerCase()] || 'gray';
  switch (variant) {
    case 'green': return 'btn-success';
    case 'red': return 'btn-danger';
    case 'yellow': return 'btn-warning';
    case 'orange': return 'btn-primary';
    case 'blue': return 'btn-primary';
    case 'gray': return 'btn-secondary';
    default: return 'btn-primary';
  }
}
