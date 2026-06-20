const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Roads', 'Water Supply', 'Electricity', 'Sanitation', 'Public Safety', 'Health', 'Parks', 'Education', 'Other',
      'Garbage', 'Pothole', 'Sewer Problem', 'Street Light', 'Water Issue', 'Health Issue', 'Dangerous Condition', 'Environment Issue', 'Noise Complaint', 'Police Issue'
    ],
    default: 'Other'
  },
  subCategory: { type: String },
  status: {
    type: String,
    enum: ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened', 'Rejected'],
    default: 'Submitted'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  district: { type: String, default: 'Central Delhi' },
  ward: { type: String },
  address: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  photos: [{ type: String }],
  voiceNote: { type: String },
  grievanceId: { type: String },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  citizenPhone: { type: String },
  citizenName: { type: String },
  assignedDepartment: { type: String },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slaDeadline: { type: Date },
  slaBreached: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolutionProof: { type: String },
  resolutionNotes: { type: String },
  aiConfidenceScore: { type: Number },
  aiCategory: { type: String },
  aiPriority: { type: String },
  aiReason: { type: String },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedByName: String,
    changedAt: { type: Date, default: Date.now },
    notes: String
  }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    citizenName: String,
    commentText: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isHotspot: { type: Boolean, default: false },
  reporterCount: { type: Number, default: 1 },
  linkedReporters: [{
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    phone: String,
    grievanceId: String,
    submittedAt: { type: Date, default: Date.now },
    photo: String
  }],
  primaryGrievanceId: { type: String }
}, { timestamps: true });

// Auto-set SLA deadline based on priority & auto-generate title/grievanceId
complaintSchema.pre('save', function () {
  if (this.isModified('priority') || this.isNew) {
    const slaHours = { Critical: 4, High: 24, Medium: 72, Low: 168 };
    const hours = slaHours[this.priority] || 72;
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  if (this.isNew) {
    if (!this.title && this.description) {
      const words = this.description.trim().split(/\s+/);
      this.title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
    }
    if (!this.grievanceId) {
      this.grievanceId = 'GR-' + String(this._id).slice(-5).toUpperCase();
    }
  }
});

// Check SLA breach
complaintSchema.methods.checkSLABreach = function () {
  if (this.status !== 'Resolved' && this.slaDeadline && new Date() > this.slaDeadline) {
    this.slaBreached = true;
  }
  return this.slaBreached;
};

module.exports = mongoose.model('Complaint', complaintSchema);
