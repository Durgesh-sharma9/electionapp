const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Contact = mongoose.model('Contact', new mongoose.Schema({}, { strict: false }));
  const allContacts = await Contact.find({}, { name: 1, reference: 1, locality: 1, phone: 1 }).lean();
  const withRef = allContacts.filter(c => c.reference && c.reference.trim() !== '');
  console.log(`Total contacts: ${allContacts.length}`);
  console.log(`Contacts with reference: ${withRef.length}`);
  console.log(JSON.stringify(withRef, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
