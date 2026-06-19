import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isSLABreached = (complaint) => {
  if (complaint.status === 'Resolved' || complaint.status === 'Rejected') return false;
  if (!complaint.slaDeadline) return false;
  return new Date() > new Date(complaint.slaDeadline);
};

export const getSLARemaining = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  if (diff <= 0) return 'Breached';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
