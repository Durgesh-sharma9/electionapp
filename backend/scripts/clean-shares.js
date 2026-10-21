const mongoose = require('mongoose');
require('dotenv').config();
const ShareLink = require('../models/ShareLink');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await ShareLink.countDocuments();
    console.log(`Found ${count} share links.`);
    const result = await ShareLink.deleteMany({});
    console.log(`Deleted ${result.deletedCount} share links successfully.`);
  } catch (err) {
    console.error('Error cleaning share links:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

clean();
