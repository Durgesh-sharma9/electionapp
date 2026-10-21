const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Template text is required'],
      trim: true,
    },
    icon: {
      type: String,
      default: '💬',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Template', templateSchema);
