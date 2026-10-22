const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixSerials() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  const Contact = mongoose.model('Contact', new mongoose.Schema({}, { strict: false }));
  
  // Find contacts where serialNo is 0 or null or undefined
  const zeroSerials = await Contact.find({
    $or: [{ serialNo: 0 }, { serialNo: null }, { serialNo: { $exists: false } }]
  }).sort({ createdAt: 1 });

  console.log(`Contacts with serialNo 0 or missing: ${zeroSerials.length}`);
  zeroSerials.forEach(c => console.log(`- ${c.name} (${c.phone}) - serialNo: ${c.serialNo}`));

  // Find max existing serialNo > 0
  const maxContact = await Contact.findOne({ serialNo: { $gt: 0 } }).sort({ serialNo: -1 });
  let nextSerial = (maxContact?.serialNo || 0) + 1;
  console.log(`Highest existing serialNo is: ${maxContact?.serialNo || 0}. Next will start at: ${nextSerial}`);

  for (const c of zeroSerials) {
    await Contact.updateOne({ _id: c._id }, { $set: { serialNo: nextSerial } });
    console.log(`Assigned #${nextSerial} to "${c.name}"`);
    nextSerial++;
  }

  console.log('All contacts now have valid serial numbers!');
  await mongoose.disconnect();
}

fixSerials().catch(console.error);
