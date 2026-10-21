const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'नाम आवश्यक है (Name is required)'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'मोबाइल नंबर आवश्यक है (Phone number is required)'],
      trim: true,
    },
    ward: {
      type: String,
      default: 'महापुरा (Mahapura)',
      trim: true,
    },
    category: {
      type: String,
      default: 'समर्थक (Supporter)',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    contacted: {
      type: Boolean,
      default: false,
    },
    contactCount: {
      type: Number,
      default: 0,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search
contactSchema.index({ name: 'text', phone: 'text', ward: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
