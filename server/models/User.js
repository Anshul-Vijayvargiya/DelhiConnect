const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String },
  email: { type: String, trim: true, lowercase: true },
  passwordHash: { type: String },
  role: {
    type: String,
    enum: ['citizen', 'officer', 'admin'],
    default: 'citizen'
  },
  district: { type: String },
  department: { type: String },
  firebaseUid: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function () {
  if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

module.exports = mongoose.model('User', userSchema);
