const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Locality name is required'],
      unique: true,
      trim: true,
    },
    ward: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#0284c7',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Locality', localitySchema);
