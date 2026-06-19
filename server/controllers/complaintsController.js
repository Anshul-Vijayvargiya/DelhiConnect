const Complaint = require('../models/Complaint');
const { categorizeComplaint } = require('../services/geminiService');
const { notifyStatus } = require('../services/twilioService');

const getPriorityAndSla = (category) => {
  const cat = String(category || 'Other').toLowerCase();
  
  if (cat.includes('health') || cat.includes('dangerous') || cat.includes('safety')) {
    return { priority: 'Critical', hours: 4 };
  }
  if (cat.includes('water') || cat.includes('sewer') || cat.includes('police')) {
    return { priority: 'High', hours: 24 };
  }
  if (cat.includes('pothole') || cat.includes('road') || cat.includes('light') || cat.includes('garbage') || cat.includes('waste')) {
    return { priority: 'Medium', hours: 72 };
  }
  return { priority: 'Low', hours: 168 }; // 7 days = 168 hours
};

const getZoneAndOfficer = (lat, lng, category) => {
  let zoneNum = 1;
  if (lat && lng) {
    zoneNum = (Math.floor((Number(lat) + Number(lng)) * 100) % 4) + 1;
  } else {
    zoneNum = Math.floor(Math.random() * 4) + 1;
  }

  let department = 'General Administration';
  const catLower = String(category || '').toLowerCase();
  if (catLower.includes('garbage') || catLower.includes('waste') || catLower.includes('sewer') || catLower.includes('sanitation')) {
    department = 'Sanitation';
  } else if (catLower.includes('pothole') || catLower.includes('road')) {
    department = 'Public Works Department (PWD)';
  } else if (catLower.includes('light') || catLower.includes('electricity')) {
    department = 'Electricity';
  } else if (catLower.includes('water')) {
    department = 'Water Supply';
  } else if (catLower.includes('police') || catLower.includes('safety') || catLower.includes('dangerous') || catLower.includes('noise')) {
    department = 'Police / Safety';
  } else if (catLower.includes('health')) {
    department = 'Health Dept';
  } else if (catLower.includes('environment') || catLower.includes('park')) {
    department = 'Parks & Gardens';
  }

  const ward = `Ward ${zoneNum * 10 + (Math.floor((Number(lat) || 28.6) * 1000) % 9 + 1)}`;
  const assignedDepartment = `Zone ${zoneNum} ${department} Officer`;
  return { ward, assignedDepartment };
};

// POST /api/complaints
const createComplaint = async (req, res) => {
  const { title, description, category, district, ward, address, latitude, longitude, gpsCoordinates, citizenId, timestamp, citizenPhone, citizenName } = req.body;

  // Auto-generate title internally if not provided
  let actualTitle = title;
  if (!actualTitle && description) {
    const words = description.trim().split(/\s+/);
    actualTitle = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
  }

  // Run AI categorization
  let aiData = {};
  try {
    aiData = await categorizeComplaint(`${actualTitle}. ${description}`);
  } catch (e) { /* skip */ }

  const chosenCategory = category || aiData.category || 'Other';
  const { priority, hours } = getPriorityAndSla(chosenCategory);
  const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

  // Extract coordinates
  let actualLat = latitude;
  let actualLng = longitude;
  if (!actualLat && !actualLng && gpsCoordinates) {
    try {
      const parsed = typeof gpsCoordinates === 'string' ? JSON.parse(gpsCoordinates) : gpsCoordinates;
      if (parsed && parsed.lat && parsed.lng) {
        actualLat = parsed.lat;
        actualLng = parsed.lng;
      }
    } catch (e) {
      console.error('Error parsing gpsCoordinates:', e);
    }
  }
  const coordinates = (actualLat && actualLng) ? { lat: Number(actualLat), lng: Number(actualLng) } : undefined;

  // Geo-routing
  const geoRouting = getZoneAndOfficer(actualLat, actualLng, chosenCategory);

  const actualCitizenId = citizenId || req.user?._id;
  const actualCreatedAt = timestamp ? new Date(timestamp) : new Date();

  const complaint = new Complaint({
    title: actualTitle,
    description,
    category: chosenCategory,
    subCategory: aiData.subCategory,
    priority: priority,
    district: district || 'Central Delhi',
    ward: ward || geoRouting.ward,
    address,
    coordinates,
    citizenId: actualCitizenId,
    citizenPhone: citizenPhone || req.user?.phone,
    citizenName: citizenName || req.user?.name,
    aiConfidenceScore: aiData.confidence,
    aiCategory: aiData.category,
    aiPriority: aiData.priority,
    aiReason: aiData.reason,
    assignedDepartment: geoRouting.assignedDepartment,
    slaDeadline,
    photos: req.files?.map(f => `/uploads/${f.filename}`) || [],
    status: 'Submitted',
    statusHistory: [{ status: 'Submitted', changedByName: citizenName || req.user?.name || 'Citizen', notes: 'Complaint submitted' }],
    createdAt: actualCreatedAt
  });

  await complaint.save();

  // Notify citizen
  if (complaint.citizenPhone) {
    await notifyStatus(complaint.citizenPhone, complaint._id, 'Submitted');
  }

  res.status(201).json(complaint);
};

// GET /api/complaints
const getComplaints = async (req, res) => {
  const { status, district, department, category, priority, page = 1, limit = 20, search, startDate, endDate, public, lat, lng, radius } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (district) filter.district = district;
  if (department) filter.assignedDepartment = department;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Geographic proximity filter (within X km radius using bounding box approximation)
  if (lat && lng && radius) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radKm = Number(radius);
    const latDelta = radKm / 111;
    const lngDelta = radKm / (111 * Math.cos(latNum * Math.PI / 180));
    filter['coordinates.lat'] = { $gte: latNum - latDelta, $lte: latNum + latDelta };
    filter['coordinates.lng'] = { $gte: lngNum - lngDelta, $lte: lngNum + lngDelta };
  }

  // Role-based filter
  // If user is a citizen, only show their own complaints unless public=true is passed
  if (req.user?.role === 'citizen' && public !== 'true') {
    filter.citizenId = req.user._id;
  }
  if (req.user?.role === 'officer') {
    filter.assignedOfficerId = req.user._id;
  }

  const total = await Complaint.countDocuments(filter);
  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('citizenId', 'name phone')
    .populate('assignedOfficerId', 'name email');

  // Update SLA breach status
  const now = new Date();
  const updated = complaints.map(c => {
    const obj = c.toObject();
    if (obj.status !== 'Resolved' && obj.slaDeadline && now > new Date(obj.slaDeadline)) {
      obj.slaBreached = true;
    }
    return obj;
  });

  res.json({ data: updated, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name phone email')
    .populate('assignedOfficerId', 'name email department');

  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json(complaint);
};

// PATCH /api/complaints/:id/status
const updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (status === 'Resolved') {
    return res.status(400).json({ message: 'Resolution photo proof is required to resolve a complaint.' });
  }

  complaint.status = status;

  complaint.statusHistory.push({
    status,
    changedBy: req.user?._id,
    changedByName: req.user?.name || 'Officer',
    notes
  });

  await complaint.save();

  // Notify citizen
  if (complaint.citizenPhone) {
    await notifyStatus(complaint.citizenPhone, complaint._id, status, {
      department: complaint.assignedDepartment
    });
  }

  res.json(complaint);
};

// PATCH /api/complaints/:id/assign
const assignComplaint = async (req, res) => {
  const { assignedDepartment, assignedOfficerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  complaint.assignedDepartment = assignedDepartment;
  complaint.assignedOfficerId = assignedOfficerId;
  complaint.status = 'Assigned';
  complaint.statusHistory.push({
    status: 'Assigned',
    changedBy: req.user?._id,
    changedByName: req.user?.name || 'Admin',
    notes: `Assigned to ${assignedDepartment}`
  });

  await complaint.save();

  if (complaint.citizenPhone) {
    await notifyStatus(complaint.citizenPhone, complaint._id, 'Assigned', { department: assignedDepartment });
  }

  res.json(complaint);
};

// POST /api/complaints/:id/resolve
const resolveComplaint = async (req, res) => {
  const { resolutionNotes } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Resolution photo proof is required.' });
  }

  complaint.status = 'Resolved';
  complaint.resolvedAt = new Date();
  complaint.resolutionNotes = resolutionNotes;
  complaint.resolutionProof = `/uploads/${req.files[0].filename}`;

  complaint.statusHistory.push({
    status: 'Resolved',
    changedBy: req.user?._id,
    changedByName: req.user?.name || 'Officer',
    notes: resolutionNotes || 'Complaint resolved'
  });

  await complaint.save();

  if (complaint.citizenPhone) {
    await notifyStatus(complaint.citizenPhone, complaint._id, 'Resolved');
  }

  res.json(complaint);
};

// POST /api/complaints/:id/feedback
const submitFeedback = async (req, res) => {
  const { satisfied } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (satisfied) {
    complaint.status = 'Closed';
    complaint.statusHistory.push({
      status: 'Closed',
      changedBy: req.user?._id,
      changedByName: req.user?.name || 'Citizen',
      notes: 'Citizen confirmed satisfaction. Complaint closed.'
    });
  } else {
    // Escalate priority
    const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];
    const currentIdx = priorityOrder.indexOf(complaint.priority);
    const newPriority = currentIdx < priorityOrder.length - 1 ? priorityOrder[currentIdx + 1] : 'Critical';
    
    complaint.status = 'Reopened';
    complaint.priority = newPriority;

    // Recalculate SLA based on new priority
    const slaHours = { Critical: 4, High: 24, Medium: 72, Low: 168 };
    const hours = slaHours[newPriority] || 72;
    complaint.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

    complaint.statusHistory.push({
      status: 'Reopened',
      changedBy: req.user?._id,
      changedByName: req.user?.name || 'Citizen',
      notes: `Citizen not satisfied. Reopened & escalated priority to ${newPriority}.`
    });
  }

  await complaint.save();
  res.json(complaint);
};

// POST /api/complaints/:id/vote
const toggleVote = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const userId = req.user._id;
    // Check if already voted
    const index = complaint.upvotes.indexOf(userId);
    if (index > -1) {
      // Remove vote
      complaint.upvotes.splice(index, 1);
    } else {
      // Add vote
      complaint.upvotes.push(userId);
    }

    await complaint.save();
    res.json({
      upvotes: complaint.upvotes,
      upvoteCount: complaint.upvotes.length,
      hasUpvoted: complaint.upvotes.includes(userId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/complaints/:id/comment
const addComment = async (req, res) => {
  try {
    const { commentText } = req.body;
    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const comment = {
      citizenId: req.user._id,
      citizenName: req.user.name || 'Citizen',
      commentText: commentText.trim(),
      createdAt: new Date()
    };

    complaint.comments.push(comment);
    await complaint.save();

    res.status(201).json(complaint.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  resolveComplaint,
  submitFeedback,
  toggleVote,
  addComment
};
