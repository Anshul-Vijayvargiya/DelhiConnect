import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';
import { complaintsAPI } from '../services/api';
import { EMERGENCY_CONTACTS, PUBLIC_SERVICES, NEARBY_FACILITY_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('complaint'); // 'complaint', 'services', 'helpline', 'nearme', 'officer'
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [searchingNearMe, setSearchingNearMe] = useState(false);
  const [selectedNearMeType, setSelectedNearMeType] = useState('');
  
  // Officer App inputs
  const [officerForm, setOfficerForm] = useState({
    officerName: 'Amit Sharma',
    officerId: 'DL-OFF-739',
    taskType: 'Field Inspection',
    locationName: 'Connaught Place Block E',
    notes: '',
    status: 'In Progress'
  });
  const [officerLog, setOfficerLog] = useState([]);

  const navigate = useNavigate();

  // Get current GPS on mount or check
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await complaintsAPI.create(formData);
      setSubmitted(res.data);
      toast.success('Complaint submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Find Nearby mock helper based on actual GPS
  const handleFindNearMe = (typeId, query) => {
    setSelectedNearMeType(typeId);
    setSearchingNearMe(true);
    setTimeout(() => {
      // Mocked nearby facilities based on real-ish Delhi coordinates
      const lat = gpsLocation?.lat || 28.6139;
      const lng = gpsLocation?.lng || 77.2090;

      const mockFacilities = {
        hospital: [
          { name: 'Dr. Ram Manohar Lohia Hospital', dist: '1.2 km', address: 'Baba Kharak Singh Marg, Connaught Place' },
          { name: 'Lok Nayak Hospital (LNJP)', dist: '2.4 km', address: 'Jawaharlal Nehru Marg, Delhi Gate' },
          { name: 'Sir Ganga Ram Hospital', dist: '3.1 km', address: 'Rajinder Nagar, New Delhi' },
        ],
        police: [
          { name: 'Connaught Place Police Station', dist: '0.8 km', address: 'Parliament Street, CP' },
          { name: 'Tilak Marg Police Station', dist: '2.1 km', address: 'Tilak Marg, Mandi House' },
          { name: 'Parliament Street Police Station', dist: '1.5 km', address: 'Sansad Marg' },
        ],
        railway: [
          { name: 'New Delhi Railway Station (NDLS)', dist: '1.5 km', address: 'Bhavbhuti Marg, Ajmeri Gate' },
          { name: 'Old Delhi Railway Station', dist: '4.8 km', address: 'Chandni Chowk, Delhi' },
          { name: 'Hazrat Nizamuddin Railway Station', dist: '6.2 km', address: 'Nizamuddin East' },
        ],
        metro: [
          { name: 'Rajiv Chowk Metro Station', dist: '0.4 km', address: 'Yellow/Blue Line Interchange, CP' },
          { name: 'Barakhamba Road Metro Station', dist: '1.0 km', address: 'Blue Line, Connaught Place' },
          { name: 'Janpath Metro Station', dist: '1.2 km', address: 'Violet Line, Janpath' },
        ],
        park: [
          { name: 'Central Park', dist: '0.3 km', address: 'Rajiv Chowk, Connaught Place' },
          { name: 'Lodi Gardens', dist: '4.5 km', address: 'Lodhi Road, New Delhi' },
          { name: 'Mughal Gardens', dist: '3.2 km', address: 'Rashtrapati Bhawan' },
        ],
        school: [
          { name: 'Modern School Barakhamba', dist: '1.1 km', address: 'Barakhamba Road' },
          { name: 'Convent of Jesus & Mary', dist: '1.8 km', address: 'Bangla Sahib Road' },
        ],
        atm: [
          { name: 'SBI ATM CP Branch', dist: '0.2 km', address: 'Radial Road 3, CP' },
          { name: 'HDFC Bank ATM', dist: '0.3 km', address: 'E-Block, Connaught Place' },
        ],
        pharmacy: [
          { name: 'Apollo Pharmacy CP', dist: '0.4 km', address: 'N-Block, Connaught Place' },
          { name: 'Fortis Healthworld Pharmacy', dist: '0.9 km', address: 'Outer Circle, CP' },
        ]
      };

      setNearbyResults(mockFacilities[typeId] || []);
      setSearchingNearMe(false);
    }, 800);
  };

  // Submit Officer App update / GPS attendance / Inspection
  const handleOfficerSubmit = (e) => {
    e.preventDefault();
    const logItem = {
      ...officerForm,
      timestamp: new Date().toLocaleTimeString(),
      coords: gpsLocation ? `${gpsLocation.lat.toFixed(5)}, ${gpsLocation.lng.toFixed(5)}` : '28.6139, 77.2090'
    };
    setOfficerLog(prev => [logItem, ...prev]);
    toast.success(`${officerForm.taskType} logged with GPS coordinates!`);
    setOfficerForm(f => ({ ...f, notes: '' }));
  };

  if (submitted) {
    const grievanceId = submitted.grievanceId || `GR-${String(submitted._id).slice(-5).toUpperCase()}`;
    const shareText = `I just registered a grievance: "${submitted.title}" via DelhiConnect CM Portal. Track ID: ${grievanceId}`;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/track/' + grievanceId)}&quote=${encodeURIComponent(shareText)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.origin + '/track/' + grievanceId)}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A3A6B] to-[#0f2548] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="text-5xl mb-4">✅</div>
          
          {submitted.isMerged ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Good News!</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  <span className="text-blue-600 font-bold">{submitted.reporterCount - 1} other citizens</span> have already reported this issue near you. 
                  Your report has been added to strengthen this case!
                </p>
              </div>
            </>
          ) : (
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Complaint Submitted!</h2>
          )}

          <p className="text-slate-500 mb-4">Your Tracking ID is:</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="text-3xl font-mono font-bold text-slate-900">{grievanceId}</div>
            <div className="text-sm text-slate-500 mt-1">Save this for tracking</div>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            {submitted.citizenPhone
              ? `WhatsApp updates will be sent to ${submitted.citizenPhone}`
              : 'You can track your complaint status using the ID above.'}
          </p>

          {/* Social Sharing */}
          <div className="border-t border-b border-slate-100 py-4 mb-6">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Share your concern</p>
            <div className="flex gap-3 justify-center">
              <a href={fbShareUrl} target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 bg-[#1877F2] text-white hover:bg-[#166fe5]">
                <span>📘</span> Share on Facebook
              </a>
              <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-slate-900">
                <span>🐦</span> Share on X / Twitter
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate(`/track/${grievanceId}`)}
              className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
              Track Status
            </button>
            <button onClick={() => setSubmitted(null)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition">
              New Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-[#1A3A6B] to-[#254F8C] text-white py-8 px-8 shadow-md">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏛️</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">DelhiConnect</h1>
              <p className="text-blue-200 text-xs md:text-sm mt-0.5 font-semibold">Chief Minister's Grievance & Public Services Portal</p>
              <p className="text-[10px] text-slate-300 mt-0.5">National Capital Territory of Delhi</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/login" className="btn-secondary bg-transparent text-white border-white/30 hover:bg-white/10 text-xs">
              Officer Login
            </a>
            <a href="/track/search" className="btn-primary bg-yellow-600 hover:bg-yellow-700 text-xs">
              🔍 Track Grievance
            </a>
          </div>
        </div>
      </header>

      {/* Main Container / Navigation Tabs */}
      <main className="w-full px-8 mt-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left navigation menu — fixed width sidebar */}
        <div className="flex-shrink-0 w-full md:w-[260px] xl:w-[280px] space-y-2">
          {[
            { id: 'complaint', label: '📝 File Civic Complaint', desc: 'Garbage, potholes, safety, noise' },
            { id: 'services', label: '🏛️ Public Services', desc: 'Property Tax, Birth Certificate' },
            { id: 'helpline', label: '🚨 24x7 Emergency Help', desc: 'Police, Ambulance, Fire' },
            { id: 'nearme', label: '📍 What\'s Near Me', desc: 'Find nearby public facilities' },
            { id: 'officer', label: '💼 Officer Field App', desc: 'Inspection & GPS Attendance' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-start
                ${activeTab === tab.id
                  ? 'bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <span className="text-sm font-bold">{tab.label}</span>
              <span className={`text-[10px] mt-0.5 ${activeTab === tab.id ? 'text-blue-200' : 'text-slate-400'}`}>{tab.desc}</span>
            </button>
          ))}

          {/* Quick Metrics / Performance callout */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100/60 border border-amber-200/70 rounded-xl p-4 mt-6 text-slate-800">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">🎯 Governance metrics</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Solved</span>
                <span className="font-bold text-slate-800">94.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Complaints Handled</span>
                <span className="font-bold text-slate-800">1.2 Lakhs+</span>
              </div>
              <p className="text-[10px] text-amber-800/80 leading-relaxed mt-1">
                Powered by DelhiConnect for transparent and responsive urban governance.
              </p>
            </div>
          </div>
        </div>

        {/* Right content viewport — fills all remaining space */}
        <div className="flex-1 min-w-0">
          
          {/* Tab Content: Complaint Submission */}
          {activeTab === 'complaint' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-blue-900 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Civic Complaint Registration</h2>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  🤖 Gemini AI Enabled
                </span>
              </div>
              {/* Two-column on wide screens: form (left) + info panel (right) */}
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form — capped at reasonable width so fields don't stretch edge-to-edge */}
                <div className="flex-1 min-w-0 max-w-2xl">
                  <ComplaintForm onSubmit={handleSubmit} loading={submitting} />
                </div>
                {/* Right info panel */}
                <aside className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">⚡ Smart Routing</h3>
                    <p className="text-blue-700 text-xs leading-relaxed">Your complaint is automatically routed to the correct department using AI analysis of your description.</p>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Avg. Resolution Time</span><span className="font-semibold text-slate-700">3–5 days</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">SLA (High Priority)</span><span className="font-semibold text-red-600">24 hours</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tracked via</span><span className="font-semibold text-slate-700">Grievance ID</span></div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
                    <h3 className="font-bold text-amber-900 mb-2">💡 Tips for Faster Resolution</h3>
                    <ul className="space-y-1.5 text-amber-800 leading-relaxed">
                      <li>✓ Add a clear photo of the issue</li>
                      <li>✓ Include the exact street / landmark</li>
                      <li>✓ Mention severity (blocking road, health risk, etc.)</li>
                      <li>✓ Provide your phone for WhatsApp updates</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs">
                    <h3 className="font-bold text-emerald-900 mb-2">📊 This Month</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-slate-500">Complaints Filed</span><span className="font-semibold text-slate-700">4,218</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Resolved</span><span className="font-semibold text-emerald-700">3,997 (94.8%)</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Pending</span><span className="font-semibold text-amber-600">221</span></div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* Tab Content: Public Services Access */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-blue-900 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Public Services Portal</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Access direct linkages for Municipal Corporation civic utility services, tax payments, and official certifications.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {PUBLIC_SERVICES.map(svc => (
                  <a key={svc.id} href={svc.url} target="_blank" rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition group flex items-start gap-3">
                    <span className="text-3xl p-2 bg-white rounded-lg border border-slate-100 shadow-sm">{svc.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-900">{svc.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{svc.desc}</p>
                      <span className="text-[11px] text-blue-700 font-semibold mt-2 inline-block">Apply Online →</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: 24x7 Helpline */}
          {activeTab === 'helpline' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">24×7 Emergency Helpline Support</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Immediate government hotlines for emergency support. Click to call directly from your device.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {EMERGENCY_CONTACTS.map(contact => (
                  <a key={contact.label} href={`tel:${contact.number}`}
                    style={{ borderColor: contact.color + '20' }}
                    className="p-4 rounded-xl border bg-white hover:shadow-md transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{contact.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{contact.label}</h4>
                        <p className="text-xs text-slate-400">{contact.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-blue-900" style={{ color: contact.color }}>
                        📞 {contact.number}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: What's Near Me */}
          {activeTab === 'nearme' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-blue-950 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">What's Near Me (Facility Locator)</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Find nearby hospitals, police stations, railways, and other public facilities instantly based on your live GPS location.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2 mb-6">
                {NEARBY_FACILITY_TYPES.map(type => (
                  <button key={type.id} onClick={() => handleFindNearMe(type.id, type.query)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5
                      ${selectedNearMeType === type.id ? 'bg-blue-900 border-blue-900 text-white shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-xs font-bold">{type.label}</span>
                  </button>
                ))}
              </div>

              {searchingNearMe ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Locating facilities nearby...</span>
                </div>
              ) : nearbyResults.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nearby Facilities Found</h3>
                  {nearbyResults.map((res, i) => (
                    <div key={i} className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{res.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{res.address}</p>
                      </div>
                      <span className="text-xs bg-blue-900 text-white px-2 py-1 rounded font-semibold whitespace-nowrap">
                        📍 {res.dist}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Select a category above to find public facilities near your location
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Officer App */}
          {activeTab === 'officer' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Officer App Portal</h2>
                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                  Field Utility
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Mobile-first features for field officers including investigation reporting, attendance logs, and toilet inspection metrics.
              </p>

              {/* Two-column on wide screens: form (left) + recent logs (right) */}
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Form — capped so fields don't stretch too wide */}
                <div className="flex-1 min-w-0 max-w-2xl">
                  <form onSubmit={handleOfficerSubmit} className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Officer Details</label>
                        <input className="input bg-white" value={officerForm.officerName} disabled />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">GPS Attendance/Task ID</label>
                        <input className="input bg-white" value={officerForm.officerId} disabled />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Task Type / Inspection *</label>
                        <select className="input" value={officerForm.taskType}
                          onChange={e => setOfficerForm(f => ({ ...f, taskType: e.target.value }))}>
                          <option value="Field Inspection">🔎 Field Inspection</option>
                          <option value="GPS Attendance Log">📍 GPS Attendance Check-In</option>
                          <option value="Investigation Report">📝 Investigation Report</option>
                          <option value="Toilet Inspection">🚽 Public Toilet Inspection</option>
                          <option value="Project Monitoring">🏗️ Project Monitoring</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Location Address</label>
                        <input className="input" value={officerForm.locationName}
                          onChange={e => setOfficerForm(f => ({ ...f, locationName: e.target.value }))} required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Observation / Inspection Notes *</label>
                      <textarea className="input" rows={3} placeholder="Write comments or report details..."
                        value={officerForm.notes} onChange={e => setOfficerForm(f => ({ ...f, notes: e.target.value }))} required />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-[10px] text-slate-500 font-mono">
                        GPS: {gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : 'Detecting...'}
                      </div>
                      <button type="submit" className="btn-success text-xs font-bold">
                        🚀 Log Field Activity
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right column: Recent logs (always visible, scrollable) */}
                <div className="xl:w-80 flex-shrink-0">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Field Logs</h3>
                  {officerLog.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                      No activity logged yet. Submit the form to start tracking.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto">
                      {officerLog.map((log, index) => (
                        <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{log.taskType}</span>
                            <span className="text-slate-400">{log.timestamp}</span>
                          </div>
                          <p className="text-slate-600 mt-1"><strong className="text-slate-700">Location:</strong> {log.locationName}</p>
                          <p className="text-slate-500 font-mono text-[10px]">{log.coords}</p>
                          {log.notes && <p className="text-slate-600"><strong className="text-slate-700">Notes:</strong> {log.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
