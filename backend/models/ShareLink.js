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
    localityFilter: {
      type: String,
      default: '',
    },
    contacts: [
      {
        serialNo: { type: Number, default: 0 },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        locality: { type: String, default: 'Mahima' },
        reference: { type: String, default: '' },
        category: { type: String, default: 'General' },
        notes: { type: String, default: '' },
        contacted: { type: Boolean, default: false },
        contactCount: { type: Number, default: 0 },
        called: { type: Boolean, default: false },
        calledAt: { type: Date, default: null },
        callCount: { type: Number, default: 0 },
        messaged: { type: Boolean, default: false },
        messagedAt: { type: Date, default: null },
        messageCount: { type: Number, default: 0 },
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
