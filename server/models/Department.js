const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  headOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  districts: [String],
  categories: [String],
  contactEmail: String,
  contactPhone: String,
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
