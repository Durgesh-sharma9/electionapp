const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Outreach Contact List',
      trim: true,
    },
    messageTemplate: {
      type: String,
      default: 'Hello {name}, reaching out from our outreach team. Please let us know if you need any assistance!',
    },
    contacts: [
      {
        serialNo: { type: Number, default: 0 },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        category: { type: String, default: 'General' },
        notes: { type: String, default: '' },
        contacted: { type: Boolean, default: false },
        contactCount: { type: Number, default: 0 },
      },
    ],
    totalCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShareLink', shareLinkSchema);
