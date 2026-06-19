import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import StatusTimeline from '../components/StatusTimeline';
import { StatusBadge, PriorityBadge, SLABadge, AIBadge } from '../components/Badges';
import { formatDateTime, getSLARemaining } from '../utils/helpers';
import toast from 'react-hot-toast';

const Stepper = ({ currentStatus }) => {
  const steps = [
    { label: 'Submitted', desc: 'Complaint registered' },
    { label: 'Assigned', desc: 'Officer assigned' },
    { label: 'In Progress', desc: 'Work underway' },
    { label: 'Resolved', desc: 'Officer resolved' },
    { label: 'Closed', desc: 'Citizen satisfied' }
  ];

  let activeIdx = steps.findIndex(s => s.label === currentStatus);
  if (currentStatus === 'Pending' || currentStatus === 'Submitted') activeIdx = 0;
  if (currentStatus === 'Reopened') activeIdx = 2; // Treat reopened as In Progress phase
  if (currentStatus === 'Rejected') activeIdx = -1;

  return (
    <div className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2">
      {steps.map((step, idx) => {
        const isCompleted = activeIdx >= idx && currentStatus !== 'Rejected';
        const isActive = activeIdx === idx;
        const isReopened = currentStatus === 'Reopened' && idx === 2;

        return (
          <div key={idx} className="flex-1 flex md:flex-col items-center gap-3 w-full relative">
            {/* Horizontal Line on Desktop */}
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute left-[60%] top-4 w-4/5 h-[3px] bg-slate-100 -z-10">
                <div 
                  className={`h-full transition-all duration-300 ${activeIdx > idx ? 'bg-blue-900' : 'bg-slate-100'}`} 
                />
              </div>
            )}
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300
              ${isReopened 
                ? 'bg-amber-100 text-amber-700 border-amber-500 animate-pulse' 
                : isActive 
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/10' 
                  : isCompleted 
                    ? 'bg-blue-100 text-blue-900 border-blue-900' 
                    : 'bg-white text-slate-400 border-slate-200'}`}>
              {isReopened ? '⚠' : isCompleted && activeIdx > idx ? '✔' : idx + 1}
            </div>

            <div className="flex flex-col md:items-center">
              <span className={`text-xs font-bold leading-tight ${isActive || isReopened ? 'text-slate-800' : 'text-slate-500'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{step.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function TrackComplaintPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaint = () => {
    complaintsAPI.get(id)
      .then(r => setComplaint(r.data))
      .catch(e => setError(e.response?.data?.message || 'Complaint not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleFeedback = (satisfied) => {
    setSubmittingFeedback(true);
    complaintsAPI.feedback(id, { satisfied })
      .then(r => {
        setComplaint(r.data);
        if (satisfied) {
          toast.success('Thank you! Complaint has been closed.');
        } else {
          toast.error('Complaint reopened and escalated to a higher priority.');
        }
      })
      .catch(() => toast.error('Failed to submit feedback'))
      .finally(() => setSubmittingFeedback(false));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin text-4xl">⏳</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3A6B] to-[#0f2548] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-slate-800">Not Found</h2>
        <p className="text-slate-500 mt-2">{error}</p>
        <Link to="/" className="mt-4 inline-block btn-primary">Submit New Complaint</Link>
      </div>
    </div>
  );

  const grievanceId = complaint.grievanceId || `GR-${String(complaint._id).slice(-5).toUpperCase()}`;
  const slaRemaining = getSLARemaining(complaint.slaDeadline);
  const isOverdue = complaint.slaDeadline && new Date() > new Date(complaint.slaDeadline) && !['Resolved', 'Closed', 'Rejected'].includes(complaint.status);

  const shareText = `My grievance: "${complaint.title}" is currently "${complaint.status}" on DelhiConnect CM Portal. Track code: ${grievanceId}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1A3A6B] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-blue-300 text-sm hover:text-white">← Back to Portal</Link>
            <h1 className="text-xl font-bold mt-2">Complaint {grievanceId}</h1>
            <p className="text-blue-300 text-sm">CM Grievance Portal — Status Tracker</p>
          </div>
          <Link to="/" className="btn-secondary bg-transparent text-white border-white/30 text-xs">Submit New</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Overdue Badge Alert */}
        {isOverdue && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">Overdue</span>
              <p className="text-xs text-red-700 font-semibold mt-1">This complaint has breached its SLA resolution deadline.</p>
            </div>
          </div>
        )}

        {/* Stepper Card */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 mb-2">📍 Progress Timeline</h3>
          <Stepper currentStatus={complaint.status} />
        </div>

        {/* Status Card */}
        <div className="card p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">{complaint.title}</h2>
              <p className="text-slate-500 text-sm mt-1">{complaint.district} {complaint.ward && `— ${complaint.ward}`}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-3">{complaint.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 border-t border-slate-100 pt-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs font-semibold">Filed on</span>
              <p className="font-medium text-slate-700">{formatDateTime(complaint.createdAt)}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs font-semibold">Assigned Officer / Department</span>
              <p className="font-medium text-slate-700">{complaint.assignedDepartment || 'Not yet assigned'}</p>
            </div>
            {complaint.slaDeadline && (
              <div>
                <span className="text-slate-400 text-xs font-semibold">SLA Deadline</span>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                  {formatDateTime(complaint.slaDeadline)}
                  {!isOverdue && slaRemaining !== 'Breached' && (
                    <span className="text-xs text-green-600 ml-1">({slaRemaining} left)</span>
                  )}
                </p>
              </div>
            )}
            {complaint.coordinates?.lat && (
              <div>
                <span className="text-slate-400 text-xs font-semibold">GPS Coordinates</span>
                <p className="font-medium text-slate-700 font-mono text-xs">
                  {complaint.coordinates.lat.toFixed(5)}, {complaint.coordinates.lng.toFixed(5)}
                </p>
              </div>
            )}
            {complaint.resolvedAt && (
              <div>
                <span className="text-slate-400 text-xs font-semibold">Resolved on</span>
                <p className="font-medium text-green-700">{formatDateTime(complaint.resolvedAt)}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 border-t border-slate-100 pt-3">
            <SLABadge breached={complaint.slaBreached || isOverdue} deadline={complaint.slaDeadline} />
            <AIBadge score={complaint.aiConfidenceScore} category={complaint.aiCategory} />
          </div>
        </div>

        {/* Citizen Satisfaction Feedback Prompt */}
        {complaint.status === 'Resolved' && (
          <div className="card p-5 border-blue-200 bg-blue-50/50 shadow-sm animate-pulse-slow">
            <h3 className="font-bold text-slate-800 text-base mb-1.5 flex items-center gap-1.5">
              <span>💬 Are you satisfied with the resolution?</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Officer has marked complaint <strong>{grievanceId}</strong> as Resolved. Please confirm to close this case.
            </p>
            <div className="flex gap-3">
              <button 
                type="button" 
                disabled={submittingFeedback}
                onClick={() => handleFeedback(true)}
                className="btn-success text-xs font-bold px-4 py-2 hover:scale-102 transition cursor-pointer"
              >
                Yes, Close Complaint
              </button>
              <button 
                type="button" 
                disabled={submittingFeedback}
                onClick={() => handleFeedback(false)}
                className="btn-danger text-xs font-bold px-4 py-2 hover:scale-102 transition cursor-pointer"
              >
                No, Reopen & Escalate
              </button>
            </div>
          </div>
        )}

        {/* Resolution details & proof */}
        {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (complaint.resolutionNotes || complaint.resolutionProof) && (
          <div className="card p-5 border-green-200 bg-green-50/50">
            <h3 className="font-semibold text-green-800 mb-2">✅ Resolution Photo & Notes</h3>
            {complaint.resolutionNotes && (
              <p className="text-green-700 text-sm mb-3">"{complaint.resolutionNotes}"</p>
            )}
            {complaint.resolutionProof && (
              <img src={complaint.resolutionProof} alt="Proof of Resolution" className="max-w-md w-full rounded-lg border border-green-200/60 shadow-sm" />
            )}
          </div>
        )}

        {/* Share Section */}
        <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Accountability & Social Sharing</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Publish status updates or post directly to social media</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <a href={fbShareUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 sm:flex-initial btn-secondary text-xs flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1877F2] text-white hover:bg-[#166fe5] border-none">
              📘 Facebook
            </a>
            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 sm:flex-initial btn-secondary text-xs flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-slate-900 border-none">
              🐦 Share on X
            </a>
          </div>
        </div>

        {/* Photos (Attached by citizen initially) */}
        {complaint.photos?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3">📷 Attached Citizen Photos</h3>
            <div className="flex gap-3 flex-wrap">
              {complaint.photos.map((url, i) => (
                <img key={i} src={url} alt="Initial complaint proof" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          </div>
        )}

        {/* Timeline (Transparency Audit) */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 mb-4">📅 Status Timeline (Transparency Audit)</h3>
          <StatusTimeline history={complaint.statusHistory || []} currentStatus={complaint.status} />
        </div>

        <div className="text-center text-sm text-slate-400 pb-4">
          <p>Need help? Call CM Helpline: <a href="tel:1076" className="text-blue-700 font-medium font-mono">1076</a></p>
        </div>
      </div>
    </div>
  );
}
