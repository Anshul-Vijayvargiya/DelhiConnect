import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintsAPI } from '../../services/api';
import { formatDateTime, timeAgo } from '../../utils/helpers';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-slate-200 h-[250px] w-full" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="h-6 w-28 bg-slate-200 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-1/2 bg-slate-200 rounded" />
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
        </div>
        <div className="h-8 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function AllGrievancesPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('city'); // 'nearby', 'city', 'yours'
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // GPS Location State
  const [gpsLocation, setGpsLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Comments state
  const [expandedComments, setExpandedComments] = useState({}); // { [complaintId]: boolean }
  const [commentInputs, setCommentInputs] = useState({}); // { [complaintId]: string }
  const [submittingComment, setSubmittingComment] = useState({}); // { [complaintId]: boolean }

  // Default coordinates (Connaught Place, Delhi) if GPS denied
  const DEFAULT_DELHI_COORDS = { lat: 28.6139, lng: 77.2090 };

  const fetchGrievances = async (tab = activeTab, location = gpsLocation) => {
    try {
      const params = { limit: 50 };

      if (tab === 'yours') {
        // Fetch user's own complaints (role-based defaults on server)
        params.public = 'false';
      } else {
        // Public grievances
        params.public = 'true';
        if (tab === 'nearby' && location) {
          params.lat = location.lat;
          params.lng = location.lng;
          params.radius = 2; // 2km radius
        }
      }

      const res = await complaintsAPI.list(params);
      setComplaints(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load grievances');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get current position for Nearby tab
  const getGPSCoords = (useDefault = false) => {
    if (useDefault) {
      setGpsLocation(DEFAULT_DELHI_COORDS);
      setGpsError(null);
      setLocating(false);
      fetchGrievances('nearby', DEFAULT_DELHI_COORDS);
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGpsLocation(coords);
        setLocating(false);
        fetchGrievances('nearby', coords);
      },
      (err) => {
        console.error(err);
        setGpsError('GPS access denied. You can still view city-wide complaints or use a default Delhi location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (activeTab === 'nearby') {
      if (gpsLocation) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchGrievances('nearby', gpsLocation);
      }
    } else {
       
      fetchGrievances(activeTab, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, gpsLocation]);

  // Vote Up handler (Optimistic UI)
  const handleVote = async (complaintId) => {
    if (!user) {
      toast.error('Please log in to upvote');
      return;
    }

    const userId = user._id || user.id;
    const originalComplaints = [...complaints];

    // Optimistic Update
    setComplaints(prev => prev.map(c => {
      if (c._id === complaintId) {
        const upvotes = c.upvotes || [];
        const hasVoted = upvotes.includes(userId);
        const nextUpvotes = hasVoted
          ? upvotes.filter(id => id !== userId)
          : [...upvotes, userId];
        return { ...c, upvotes: nextUpvotes };
      }
      return c;
    }));

    try {
      const res = await complaintsAPI.vote(complaintId);
      // Sync state with server response
      setComplaints(prev => prev.map(c => {
        if (c._id === complaintId) {
          return { ...c, upvotes: res.data.upvotes };
        }
        return c;
      }));
    } catch (err) {
      // Revert on error
      setComplaints(originalComplaints);
      toast.error(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  // Comment Thread Toggle
  const toggleComments = (complaintId) => {
    setExpandedComments(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  // Handle Comment Submission
  const handleCommentSubmit = async (e, complaintId) => {
    e.preventDefault();
    const commentText = commentInputs[complaintId] || '';
    if (!commentText.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [complaintId]: true }));
    try {
      const res = await complaintsAPI.comment(complaintId, commentText);
      // Update local complaint comments
      setComplaints(prev => prev.map(c => {
        if (c._id === complaintId) {
          return { ...c, comments: res.data };
        }
        return c;
      }));
      setCommentInputs(prev => ({ ...prev, [complaintId]: '' }));
      toast.success('Comment posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  // Handle Web Share or Copy Link
  const handleShare = async (c) => {
    const grievanceId = c.grievanceId || `GR-${String(c._id).slice(-5).toUpperCase()}`;
    const shareUrl = `${window.location.origin}/track/${grievanceId}`;
    const shareText = `Grievance ${grievanceId}: ${c.title} — Help resolve this neighborhood issue on DelhiConnect.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `DelhiConnect - Grievance ${grievanceId}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Grievance link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  // Status Badge Helper
  const getStatusBadge = (c) => {
    const isOverdue = c.slaDeadline && new Date() > new Date(c.slaDeadline) && !['Resolved', 'Closed', 'Rejected'].includes(c.status);
    if (isOverdue || c.slaBreached) {
      return (
        <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold shadow-sm">
          🚨 Overdue
        </span>
      );
    }
    if (['Submitted', 'Pending'].includes(c.status)) {
      return (
        <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold shadow-sm">
          🟢 New / Un-Assigned
        </span>
      );
    }
    if (['Assigned', 'In Progress', 'Reopened'].includes(c.status)) {
      return (
        <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold shadow-sm">
          🟡 In Progress
        </span>
      );
    }
    if (['Resolved', 'Closed'].includes(c.status)) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold shadow-sm">
          🔵 Closed / Complied
        </span>
      );
    }
    return (
      <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full font-bold shadow-sm">
        {c.status}
      </span>
    );
  };

  // Fallback category photo mapping with variety
  const getCategoryPhoto = (category, id) => {
    const cat = String(category || '').toLowerCase();

    if (cat.includes('garbage') || cat.includes('waste') || cat.includes('sanitation')) {
      return '/images/grievances/garbage-1.png';
    } else if (cat.includes('pothole') || cat.includes('road')) {
      return '/images/grievances/pothole-1.png';
    } else if (cat.includes('light') || cat.includes('electricity') || cat.includes('power')) {
      return '/images/grievances/electricity-1.png';
    } else if (cat.includes('water')) {
      return '/images/grievances/water-1.png';
    } else if (cat.includes('police') || cat.includes('safety') || cat.includes('dangerous')) {
      return '/images/grievances/safety-1.png';
    } else if (cat.includes('dog') || cat.includes('animal') || cat.includes('stray')) {
      const photos = ['/images/grievances/dogs-1.png', '/images/grievances/dogs-2.png'];
      return photos[id ? String(id).charCodeAt(String(id).length - 1) % photos.length : 0];
    } else if (cat.includes('park')) {
      return '/images/grievances/park-1.png';
    } else if (cat.includes('health') || cat.includes('hospital')) {
      return '/images/grievances/health-1.png';
    } else if (cat.includes('education') || cat.includes('school')) {
      return '/images/grievances/education-1.png';
    } else {
      const fallbacks = [
        '/images/grievances/pothole-1.png',
        '/images/grievances/garbage-1.png',
        '/images/grievances/water-1.png',
        '/images/grievances/electricity-1.png',
        '/images/grievances/park-1.png'
      ];
      return fallbacks[id ? String(id).charCodeAt(String(id).length - 1) % fallbacks.length : 0];
    }
  };

  const translateComplaintText = (text) => {
    if (!text) return '';
    let translated = text;
    const translations = {
      'Large pothole on main road causing accidents': 'मुख्य सड़क पर बड़ा गड्ढा दुर्घटनाओं का कारण',
      'No water supply for 3 days in our area': 'हमारे क्षेत्र में 3 दिनों से पानी की आपूर्ति नहीं',
      'Streetlight not working since last month': 'पिछले महीने से स्ट्रीटलाइट काम नहीं कर रही है',
      'Garbage not collected for a week': 'एक सप्ताह से कचरा नहीं उठाया गया',
      'Illegal construction blocking emergency exit': 'आपातकालीन निकास को अवरुद्ध करने वाला अवैध निर्माण',
      'Government hospital running out of medicines': 'सरकारी अस्पताल में दवाइयों की कमी',
      'Park damaged and not maintained': 'पार्क क्षतिग्रस्त और रखरखाव न होना',
      'School building in dangerous condition': 'स्कूल भवन खतरनाक स्थिति में',
      'Sewer overflow on residential street': 'आवासीय सड़क पर सीवर का पानी बहना',
      'Broken water pipeline wasting water': 'टूटी पानी की पाइपलाइन से पानी बर्बाद',
      'Road divider damaged causing accidents': 'सड़क विभाजक क्षतिग्रस्त दुर्घटनाओं का कारण',
      'Power cuts for 8 hours daily': 'रोजाना 8 घंटे बिजली कटौती',
      'Stray dogs attacking residents': 'आवारा कुत्ते निवासियों पर हमला कर रहे हैं',
      'Open manhole dangerous for pedestrians': 'पैदल यात्रियों के लिए खुला मैनहोल खतरनाक',
      'Tree fallen on road blocking traffic': 'सड़क पर पेड़ गिरने से यातायात बाधित'
    };

    for (const [key, value] of Object.entries(translations)) {
      if (translated.includes(key)) {
        if (i18n.language === 'hi') {
          translated = translated.replace(key, value);
          translated = translated.replace(/\bat Block\b/gi, 'ब्लॉक');
          translated = translated.replace(/\bnear street\b/gi, 'गली के पास');
        }
        break;
      }
    }

    if (i18n.language === 'hi') {
      translated = translated.replace(/\bThis is causing major inconvenience to residents of\b/gi, 'इससे यहाँ के निवासियों को भारी असुविधा हो रही है:');
      translated = translated.replace(/\bImmediate attention requested.\b/gi, 'तत्काल ध्यान देने का अनुरोध है।');
    }

    return translated;
  };

  const translateLocation = (address) => {
    if (!address) return '';
    let result = address;
    if (i18n.language === 'hi') {
      const districts = [
        'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
        'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi',
        'South East Delhi', 'South West Delhi', 'West Delhi'
      ];
      districts.forEach(d => {
        result = result.replace(d, t(d));
      });
      result = result.replace(/\bBlock\b/gi, 'ब्लॉक');
      result = result.replace(/\bWard\b/gi, 'वार्ड');
    }
    return result;
  };

  const userId = user?._id || user?.id;

  return (
    <Layout title="All Grievances Feed">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm border">
          {[
            { id: 'nearby', icon: '📍', label: 'Nearby (2km)' },
            { id: 'city', icon: '🏙️', label: 'City Feed' },
            { id: 'yours', icon: '👤', label: 'Yours' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setLoading(true); }}
              className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all duration-150 cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <div className="text-sm">{tab.icon} {t(tab.label)}</div>
            </button>
          ))}
        </div>

        {/* GPS Permission/Error box for Nearby Tab */}
        {activeTab === 'nearby' && (
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <div>
                <h4 className="font-bold text-blue-950">{t('GPS Location Coordinates')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locating 
                    ? t('Requesting location access...') 
                    : gpsLocation 
                      ? `Lat: ${gpsLocation.lat.toFixed(4)}, Lng: ${gpsLocation.lng.toFixed(4)}`
                      : t(gpsError) || t('GPS location helps find grievances in your neighborhood.')}
                </p>
              </div>
            </div>
            {!locating && !gpsLocation && (
              <div className="flex gap-2">
                <button onClick={() => getGPSCoords(false)} className="btn-primary text-xs whitespace-nowrap">
                  {t('Enable GPS')}
                </button>
                <button onClick={() => getGPSCoords(true)} className="btn-secondary text-xs whitespace-nowrap">
                  {t('Use Connaught Place')}
                </button>
              </div>
            )}
            {gpsLocation && (
              <button onClick={() => getGPSCoords(false)} className="btn-secondary text-xs">
                🔄 {t('Refresh Location')}
              </button>
            )}
          </div>
        )}

        {/* Loading Skeletal state */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : complaints.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-bold text-slate-700 text-lg">{t('No grievances found')}</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              {activeTab === 'nearby' 
                ? t('No civic issues registered within 2km of your coordinates.') 
                : activeTab === 'yours' 
                  ? t("You have not registered any civic complaints yet.") 
                  : t('No complaints registered across Delhi yet.')}
            </p>
            {activeTab === 'yours' && (
              <a href="/" className="mt-5 inline-block btn-primary">
                📝 File Civic Complaint
              </a>
            )}
          </div>
        ) : (
          /* Complaints Feed list */
          <div className="space-y-6">
            {complaints.map(c => {
              const grievanceId = c.grievanceId || `GR-${String(c._id).slice(-5).toUpperCase()}`;
              const upvoteCount = c.upvotes?.length || 0;
              const hasVoted = userId && c.upvotes?.includes(userId);
              const commentCount = c.comments?.length || 0;
              const isCommentsOpen = expandedComments[c._id];
              const photoUrl = c.photos && c.photos.length > 0 ? c.photos[0] : getCategoryPhoto(c.category, c._id);

              return (
                <div key={c._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in hover:shadow-md transition duration-200">
                  
                  {/* Photo at top */}
                  <div className="h-[250px] w-full overflow-hidden relative bg-slate-100">
                    <img 
                      src={photoUrl} 
                      alt={c.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(c)}
                    </div>
                    {/* Dark gradient overlay on photo bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Citizen details */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner"
                        style={{ backgroundColor: `hsl(${String(c.citizenName || 'C').length * 25 % 360}, 70%, 50%)` }}
                      >
                        {String(c.citizenName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{c.citizenName || t('Citizen')}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{grievanceId}</div>
                      </div>
                    </div>

                    {/* Complaint Title */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {c.assignedDepartment ? `${t(c.assignedDepartment)}: ` : ''}{translateComplaintText(c.title)}
                        </h3>
                        {c.isHotspot && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm flex-shrink-0">
                            🔥 {t('Hotspot')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{translateComplaintText(c.description)}</p>
                    </div>

                    {/* Linked Reporters Display if Hotspot */}
                    {c.isHotspot && c.linkedReporters?.length > 0 && (
                      <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1">
                            🔥 {t('Neighborhood Hotspot')}
                          </h4>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            {c.reporterCount} {t('Reports')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {c.linkedReporters.slice(0, 5).map((reporter, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full bg-white border border-orange-200 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center text-orange-600 font-bold text-[10px]" title={reporter.name}>
                              {reporter.photo ? (
                                <img src={reporter.photo} alt="Issue" className="w-full h-full object-cover" />
                              ) : (
                                String(reporter.name || 'C').charAt(0).toUpperCase()
                              )}
                            </div>
                          ))}
                          {c.linkedReporters.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-[10px] shadow-sm flex-shrink-0">
                              +{c.linkedReporters.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details Row: Location + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-base leading-none">📍</span>
                        <span className="truncate">{translateLocation(c.address || c.district || 'Delhi')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">📅</span>
                        <span>{formatDateTime(c.createdAt)} ({timeAgo(c.createdAt)})</span>
                      </div>
                    </div>

                    {/* Engagement Counts */}
                    <div className="flex gap-4 text-xs font-bold text-slate-500 border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1">
                        👍 {upvoteCount} {upvoteCount === 1 ? t('Vote Up') : t('Vote Up') + 's'}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {commentCount} {commentCount === 1 ? t('Comment') : t('Comment') + 's'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                      <button 
                        onClick={() => handleVote(c._id)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer
                          ${hasVoted 
                            ? 'bg-blue-900 border-blue-900 text-white shadow-sm hover:bg-blue-800' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <span>👍</span> {t('Vote Up')}
                      </button>
                      <button 
                        onClick={() => toggleComments(c._id)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer
                          ${isCommentsOpen 
                            ? 'bg-slate-100 border-slate-300 text-slate-800' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        <span>💬</span> {t('Comment')}
                      </button>
                      <button 
                        onClick={() => handleShare(c)}
                        className="py-2 px-3 text-xs font-bold rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>🔗</span> {t('Share')}
                      </button>
                    </div>

                    {/* Inline Comment Thread */}
                    {isCommentsOpen && (
                      <div className="border-t border-slate-100 pt-4 mt-3 space-y-4 animate-fade-in">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Discussion')}</h4>
                        
                        {/* List of Comments */}
                        {c.comments && c.comments.length > 0 ? (
                          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                            {c.comments.map((comment, index) => (
                              <div key={index} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs flex gap-2.5 items-start">
                                <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                  {String(comment.citizenName || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex justify-between items-center font-semibold text-slate-700">
                                    <span>{comment.citizenName || t('Citizen')}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">{timeAgo(comment.createdAt)}</span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{comment.commentText}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">{t('No comments yet. Be the first to share your input!') || 'No comments yet. Be the first to share your input!'}</p>
                        )}

                        {/* Add Comment Form */}
                        {user ? (
                          <form onSubmit={(e) => handleCommentSubmit(e, c._id)} className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder={t('Write a comment...')} 
                              value={commentInputs[c._id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [c._id]: e.target.value }))}
                              className="input flex-1 py-2 text-xs"
                              disabled={submittingComment[c._id]}
                              required
                            />
                            <button 
                              type="submit" 
                              disabled={submittingComment[c._id]}
                              className="btn-primary text-xs py-2 px-4 shadow-sm"
                            >
                              {t('Post')}
                            </button>
                          </form>
                        ) : (
                          <p className="text-xs text-slate-400">
                            Please <a href="/login" className="text-blue-700 font-bold hover:underline">login</a> to add a comment.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
