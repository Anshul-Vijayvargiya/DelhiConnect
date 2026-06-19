const Complaint = require('../models/Complaint');
const { generatePDFReport } = require('../services/pdfService');

const generateReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  const filter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [total, resolved, pending, slaBreached] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.countDocuments({ ...filter, status: 'Resolved' }),
    Complaint.countDocuments({ ...filter, status: 'Pending' }),
    Complaint.countDocuments({ ...filter, slaBreached: true }),
  ]);

  const resolvedDocs = await Complaint.find({ ...filter, status: 'Resolved', resolvedAt: { $exists: true } }).select('createdAt resolvedAt');
  const avgResolutionHours = resolvedDocs.length > 0
    ? resolvedDocs.reduce((a, c) => a + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000, 0) / resolvedDocs.length
    : 0;

  const [categories, departments, breaches, districts] = await Promise.all([
    Complaint.aggregate([{ $match: filter }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$assignedDepartment', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } }, pending: { $sum: { $cond: [{ $ne: ['$status', 'Resolved'] }, 1, 0] } }, breached: { $sum: { $cond: ['$slaBreached', 1, 0] } } } },
      { $sort: { total: -1 } }
    ]),
    Complaint.find({ ...filter, slaBreached: true }).select('title district priority assignedDepartment').limit(50),
    Complaint.aggregate([{ $match: filter }, { $group: { _id: '$district', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);

  const reportData = {
    overview: { total, resolved, pending, slaBreached, avgResolutionHours },
    categories,
    departments,
    breaches,
    districts,
    dateRange: {
      from: startDate || 'All time',
      to: endDate || new Date().toLocaleDateString('en-IN')
    }
  };

  generatePDFReport(reportData, res);
};

module.exports = { generateReport };
