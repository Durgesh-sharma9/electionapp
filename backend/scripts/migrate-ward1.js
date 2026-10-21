const mongoose = require('mongoose');
require('dotenv').config();
const Contact = require('../models/Contact');
const Locality = require('../models/Locality');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Locality.updateMany({ name: 'Mahima' }, { ward: 'Ward 1' });
    const res = await Contact.updateMany(
      { locality: 'Mahima', $or: [{ ward: '' }, { ward: { $exists: false } }] },
      { ward: 'Ward 1' }
    );
    console.log(`Updated ${res.modifiedCount} contacts to Ward 1.`);
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
