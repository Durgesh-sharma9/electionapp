const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    serialNo: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    secondaryPhone: {
      type: String,
      default: '',
      trim: true,
    },
    ward: {
      type: String,
      default: '',
      trim: true,
    },
    locality: {
      type: String,
      default: '',
      trim: true,
    },
    reference: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Symbol Sent'],
      default: 'Pending',
      trim: true,
    },
    contacted: {
      type: Boolean,
      default: false,
    },
    isSureVoter: {
      type: Boolean,
      default: false,
    },
    voterCount: {
      type: Number,
      default: 1,
      min: 1,
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
