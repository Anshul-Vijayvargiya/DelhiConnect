const Complaint = require('../models/Complaint');

// GET /api/analytics/overview
const getOverview = async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  const filter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [total, pending, assigned, inProgress, resolved, closed, reopened, rejected, slaBreached] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.countDocuments({ ...filter, status: { $in: ['Pending', 'Submitted'] } }),
    Complaint.countDocuments({ ...filter, status: 'Assigned' }),
    Complaint.countDocuments({ ...filter, status: 'In Progress' }),
    Complaint.countDocuments({ ...filter, status: 'Resolved' }),
    Complaint.countDocuments({ ...filter, status: 'Closed' }),
    Complaint.countDocuments({ ...filter, status: 'Reopened' }),
    Complaint.countDocuments({ ...filter, status: 'Rejected' }),
    Complaint.countDocuments({ ...filter, slaBreached: true }),
  ]);

  // Overdue count: past SLA deadline and not Resolved, Closed, or Rejected
  const overdueCount = await Complaint.countDocuments({
    ...filter,
    status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
    slaDeadline: { $lt: new Date() }
  });

  const activeHotspots = await Complaint.countDocuments({
    ...filter,
    isHotspot: true,
    status: { $nin: ['Resolved', 'Closed', 'Rejected'] }
  });

  const totalFeedback = closed + reopened;
  const satisfactionRate = totalFeedback > 0 ? Math.round((closed / totalFeedback) * 100) : 0;

  // Average resolution time in hours (including Resolved and Closed)
  const resolvedComplaints = await Complaint.find({ ...filter, status: { $in: ['Resolved', 'Closed'] }, resolvedAt: { $exists: true } })
    .select('createdAt resolvedAt');
  const avgHours = resolvedComplaints.length > 0
    ? resolvedComplaints.reduce((acc, c) => acc + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000, 0) / resolvedComplaints.length
    : 0;

  res.json({
    total,
    pending,
    assigned,
    inProgress,
    resolved,
    closed,
    reopened,
    rejected,
    slaBreached,
    overdueCount,
    satisfactionRate,
    avgResolutionHours: avgHours,
    activeHotspots
  });
};

// GET /api/analytics/heatmap
const getHeatmap = async (req, res) => {
  const points = await Complaint.find({ 'coordinates.lat': { $exists: true } })
    .select('coordinates status priority category isHotspot reporterCount');
  res.json(points.map(p => {
    let baseWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 }[p.priority] || 1;
    // Hotspots get exponentially more weight to stand out on the heatmap
    let weight = p.isHotspot ? Math.max(6, baseWeight + p.reporterCount * 2) : baseWeight;
    
    return {
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      weight: weight,
      status: p.status,
      category: p.category,
      isHotspot: p.isHotspot,
      reporterCount: p.reporterCount
    };
  }));
};

// GET /api/analytics/department
const getDepartmentStats = async (req, res) => {
  const stats = await Complaint.aggregate([
    { $group: {
      _id: '$assignedDepartment',
      total: { $sum: 1 },
      resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
      pending: { $sum: { $cond: [{ $in: ['$status', ['Pending', 'Submitted', 'Assigned', 'Reopened']] }, 1, 0] } },
      inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
      breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
    }},
    { $sort: { total: -1 } }
  ]);
  res.json(stats);
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
  const { period = 'daily', days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const groupBy = period === 'monthly'
    ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
    : period === 'weekly'
    ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
    : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

  const trends = await Complaint.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: {
      _id: groupBy,
      count: { $sum: 1 },
      resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.json(trends);
};

// GET /api/analytics/categories
const getCategoryBreakdown = async (req, res) => {
  const cats = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.json(cats);
};

// GET /api/analytics/districts
const getDistrictStats = async (req, res) => {
  const stats = await Complaint.aggregate([
    { $group: { _id: '$district', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } } } },
    { $sort: { count: -1 } }
  ]);
  res.json(stats);
};

module.exports = { getOverview, getHeatmap, getDepartmentStats, getTrends, getCategoryBreakdown, getDistrictStats };
