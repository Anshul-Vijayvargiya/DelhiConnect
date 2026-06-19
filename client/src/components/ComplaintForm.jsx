import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { DELHI_DISTRICTS, COMPLAINT_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ComplaintForm({ onSubmit, loading: submitting }) {
  const [form, setForm] = useState({
    description: '',
    category: '',
    address: '',
    district: '',
    ward: '',
    citizenName: '',
    citizenPhone: ''
  });
  
  const [photos, setPhotos] = useState([]); // Array of File objects, max 3
  const [photoError, setPhotoError] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [gpsState, setGpsState] = useState('idle'); // 'detecting' | 'success' | 'failed' | 'idle'
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [listening, setListening] = useState(false);
  
  // Camera specific state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [hasCamera, setHasCamera] = useState(true);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  const recognitionRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const objectUrlsRef = useRef([]); // Track created object URLs for cleanup

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Automatically request GPS location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Check camera availability
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasVideo = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideo);
      }).catch(() => setHasCamera(true));
    }
  }, []);
  const detectLocation = () => {
    setGpsState('detecting');
    if (!navigator.geolocation) {
      setGpsState('failed');
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setGpsState('success');
        toast.success(`Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        // Reverse-geocode to mock ward and district if not set
        const distIndex = Math.floor((latitude + longitude) * 10) % DELHI_DISTRICTS.length;
        setForm(f => ({
          ...f,
          district: DELHI_DISTRICTS[distIndex],
          ward: `Ward ${Math.floor(latitude * 100) % 100 + 1}`
        }));
      },
      (err) => {
        setGpsState('failed');
        toast.error('Could not capture location. Please enter details manually.');
        console.warn(`Geolocation error (${err.code}): ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset inputs so same file can be re-selected after removal
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';

    // Validate type
    if (!file.type.startsWith('image/')) {
      setPhotoError('File too large or invalid format. Please upload an image under 5MB.');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File too large or invalid format. Please upload an image under 5MB.');
      return;
    }
    setPhotoError('');
    setPhotos(prev => {
      if (prev.length >= 3) return prev;
      return [...prev, file];
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to native camera input if WebRTC is unsupported
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setCameraError('Live camera not supported in this browser. Please use the gallery.');
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setShowCameraModal(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 50);
    } catch (err) {
      console.error("Camera access denied:", err);
      // Fallback to native camera input if permission denied or error
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setCameraError('Camera access denied. Please allow camera permission, or choose from gallery.');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setCapturedPhotoUrl(url);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const confirmPhoto = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Captured photo is too large.');
      } else {
        setPhotos(prev => {
          if (prev.length >= 3) return prev;
          return [...prev, file];
        });
        setPhotoError('');
      }
    }
    stopCamera();
  };

  const retakePhoto = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
  };

  const handleTakePhotoClick = () => {
    // Always attempt to use the live camera modal first
    startCamera();
  };

  // Voice input (Web Speech API)
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setListening(true);
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setForm(f => {
        const newDesc = f.description ? `${f.description.trim()} ${transcript}` : transcript;
        analyzeWithAI(newDesc);
        return { ...f, description: newDesc };
      });
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const analyzeWithAI = async (text) => {
    if (!text || text.length < 10) return;
    setAiLoading(true);
    try {
      const res = await aiAPI.categorize(text);
      setAiResult(res.data);
      // Auto-select category if AI returns a strong match
      if (res.data?.category) {
        const matchedType = COMPLAINT_TYPES.find(c => 
          c.label.toLowerCase().includes(res.data.category.toLowerCase()) || 
          c.category.toLowerCase().includes(res.data.category.toLowerCase())
        );
        if (matchedType) {
          set('category', matchedType.label);
        }
      }
    } catch { /* ignore */ } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category || !form.description.trim()) {
      toast.error('Please select a category and fill in the description');
      return;
    }

    const fd = new FormData();
    fd.append('category', form.category);
    fd.append('description', form.description);

    // Append all photos (up to 3)
    photos.forEach((file, idx) => {
      fd.append(idx === 0 ? 'photo' : `photo_${idx + 1}`, file);
      fd.append('photos', file);
    });

    const gpsCoordinates = location.latitude && location.longitude 
      ? { lat: location.latitude, lng: location.longitude }
      : null;
    
    if (gpsCoordinates) {
      fd.append('gpsCoordinates', JSON.stringify(gpsCoordinates));
      fd.append('latitude', location.latitude);
      fd.append('longitude', location.longitude);
    }

    // Add citizen details if present
    fd.append('citizenName', form.citizenName || '');
    fd.append('citizenPhone', form.citizenPhone || '');

    // Auto-generate title from first few words of description
    const words = form.description.trim().split(/\s+/);
    const generatedTitle = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
    fd.append('title', generatedTitle);
    
    fd.append('district', form.district || 'Central Delhi');
    fd.append('ward', form.ward || '');
    fd.append('address', form.address || '');
    fd.append('timestamp', new Date().toISOString());

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* AI Badge */}
      {aiResult && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in text-xs">
          <span className="font-semibold text-blue-800">🤖 AI Suggestion:</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{aiResult.category}</span>
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{aiResult.priority} Priority</span>
          <span className="text-blue-600">{aiResult.assignDepartment}</span>
          <span className="text-slate-500 ml-auto">{Math.round((aiResult.confidence || 0) * 100)}% confidence</span>
        </div>
      )}

      {/* Geolocation capture status */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-xs font-bold text-slate-700">GPS Location Detection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {gpsState === 'detecting' && (
                  <span className="text-blue-600 animate-pulse font-semibold">Detecting your location...</span>
                )}
                {gpsState === 'success' && (
                  <span className="text-green-700 font-mono font-semibold flex items-center gap-1">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} <span className="text-green-600 font-bold">✔</span>
                  </span>
                )}
                {gpsState === 'failed' && (
                  <button 
                    type="button" 
                    onClick={detectLocation}
                    className="text-red-600 hover:text-red-700 text-left font-bold hover:underline focus:outline-none"
                  >
                    Location access denied — tap to enable or enter manually
                  </button>
                )}
                {gpsState === 'idle' && (
                  <span className="text-amber-600">Location not captured</span>
                )}
              </p>
            </div>
          </div>
          <button type="button" onClick={detectLocation} disabled={gpsState === 'detecting'}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            {gpsState === 'detecting' ? '⌛' : '🔄'} Refresh GPS
          </button>
        </div>

        {/* Fallback Manual Address Input */}
        {gpsState === 'failed' && (
          <div className="animate-fade-in border-t border-slate-200 pt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Address Manually *</label>
            <input 
              className="input bg-white text-xs py-2" 
              placeholder="e.g. Block E, Connaught Place, New Delhi" 
              value={form.address} 
              onChange={e => set('address', e.target.value)} 
              required
            />
          </div>
        )}
      </div>

      {/* Category Picker */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Complaint Category *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {COMPLAINT_TYPES.map(type => (
            <button key={type.id} type="button"
              onClick={() => set('category', type.label)}
              className={`p-3 rounded-lg border text-left transition-all hover:border-blue-400 flex flex-col justify-between h-20
                ${form.category === type.label ? 'border-2 border-blue-900 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs font-semibold text-slate-700 leading-tight">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description & Voice Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
        <div className="relative">
          <textarea 
            className="input min-h-[140px] resize-none pr-12 pb-10" 
            placeholder="Describe your complaint in detail..."
            value={form.description} 
            onChange={e => set('description', e.target.value)}
            onBlur={() => form.description.trim().length > 10 && analyzeWithAI(form.description)}
            required 
          />
          <button 
            type="button" 
            onClick={listening ? stopVoice : startVoice}
            className={`absolute right-3 bottom-3 p-2.5 rounded-full transition-all duration-300 shadow-md ${
              listening 
                ? 'bg-red-600 text-white animate-pulse hover:bg-red-700 scale-110 shadow-red-500/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-blue-900 hover:text-white hover:scale-105'
            }`}
            title={listening ? 'Stop listening' : 'Voice input'}
          >
            {listening ? (
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
              </span>
            ) : (
              <span className="text-lg">🎙️</span>
            )}
          </button>
        </div>
        {listening && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1 font-semibold animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>Listening...</span>
          </div>
        )}
        {aiLoading && <p className="text-xs text-blue-600 mt-1 animate-pulse">🤖 Analyzing with AI...</p>}
      </div>

      {/* Photo Attachment */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Attach Photos
          <span className="ml-1.5 text-xs font-normal text-slate-400">(Optional · up to 3)</span>
        </label>

        {/* Camera Permission Error */}
        {cameraError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium mb-2">{cameraError}</p>
            <button 
              type="button" 
              onClick={() => { setCameraError(''); galleryInputRef.current?.click(); }}
              className="btn-secondary text-xs py-1.5 px-3 bg-white"
            >
              🖼️ Choose from Gallery instead
            </button>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
        />
        <input
          type="file"
          ref={galleryInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handlePhotoChange}
        />

        {/* Thumbnail row + add tile */}
        <div className="flex flex-wrap gap-3 items-start">

          {/* Existing photo thumbnails */}
          {photos.map((file, idx) => {
            const objUrl = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative group flex-shrink-0" style={{ width: 90, height: 90 }}>
                <img
                  src={objUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm"
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
                {/* File info on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded-b-xl truncate opacity-0 group-hover:opacity-100 transition-opacity leading-tight">
                  {file.name}
                </div>
              </div>
            );
          })}

          {/* Empty state / Add tiles — only shown when fewer than 3 photos */}
          {photos.length < 3 && (
            photos.length === 0 ? (
              <div className="w-full flex gap-2">
                {hasCamera && (
                  <button
                    type="button"
                    onClick={handleTakePhotoClick}
                    className="flex-1 flex flex-col items-center justify-center gap-2
                      border-2 border-dashed border-slate-300 rounded-xl bg-slate-50
                      hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 cursor-pointer min-h-[130px]"
                    aria-label="Take photo"
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-medium text-slate-600">Take Photo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center gap-2
                    border-2 border-dashed border-slate-300 rounded-xl bg-slate-50
                    hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 cursor-pointer min-h-[130px]"
                  aria-label="Choose from Gallery"
                >
                  <span className="text-3xl">🖼️</span>
                  <span className="text-sm font-medium text-slate-600">Choose from Gallery</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2 h-[90px]">
                {hasCamera && (
                  <button
                    type="button"
                    onClick={handleTakePhotoClick}
                    style={{ width: 90 }}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-1
                      border-2 border-dashed border-slate-300 rounded-xl bg-slate-50
                      hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                    aria-label="Take another photo"
                  >
                    <span className="text-2xl text-slate-400 leading-none">📷</span>
                    <span className="text-[10px] text-slate-500 font-medium">Take Photo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  style={{ width: 90 }}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-1
                    border-2 border-dashed border-slate-300 rounded-xl bg-slate-50
                    hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  aria-label="Choose from Gallery"
                >
                  <span className="text-2xl text-slate-400 leading-none">🖼️</span>
                  <span className="text-[10px] text-slate-500 font-medium">Gallery</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* File info strip — shown below thumbnails when photos are present */}
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5">
            {photos.map((file, idx) => (
              <span key={idx} className="text-[11px] text-slate-400">
                {file.name} · {formatFileSize(file.size)}
              </span>
            ))}
          </div>
        )}

        {/* Validation error */}
        {photoError && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <span>⚠</span> {photoError}
          </p>
        )}
      </div>

      {/* Citizen Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name (Optional)</label>
          <input className="input" placeholder="Full name" value={form.citizenName}
            onChange={e => set('citizenName', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (Optional - for WhatsApp updates)</label>
          <input className="input" placeholder="+91XXXXXXXXXX" value={form.citizenPhone}
            onChange={e => set('citizenPhone', e.target.value)} />
        </div>
      </div>

      <button type="submit" disabled={submitting || !form.category || !form.description.trim()}
        className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60 font-bold transition-all">
        {submitting ? '⏳ Submitting...' : '📤 Submit Complaint'}
      </button>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10">
            <span className="text-white font-bold text-lg drop-shadow-md">
              {capturedPhotoUrl ? 'Preview' : 'Take Photo'}
            </span>
            <button type="button" onClick={stopCamera} className="text-white text-3xl font-light hover:text-red-400 drop-shadow-md transition-colors">&times;</button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-zinc-900">
            {!capturedPhotoUrl ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={capturedPhotoUrl} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            )}
          </div>
          
          <div className="p-6 bg-black flex justify-center items-center h-32 pb-safe">
            {!capturedPhotoUrl ? (
              <button 
                type="button" 
                onClick={capturePhoto} 
                className="w-16 h-16 rounded-full border-4 border-white active:scale-90 transition-transform flex items-center justify-center bg-transparent"
                aria-label="Capture photo"
              >
                <div className="w-14 h-14 rounded-full bg-white opacity-90" />
              </button>
            ) : (
              <div className="flex gap-6 w-full max-w-sm px-4">
                <button 
                  type="button" 
                  onClick={retakePhoto}
                  className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                >
                  Retake
                </button>
                <button 
                  type="button" 
                  onClick={confirmPhoto}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors"
                >
                  Use Photo
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </form>
  );
}
