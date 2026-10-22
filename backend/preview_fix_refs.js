const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function preview() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Contact = mongoose.model('Contact', new mongoose.Schema({}, { strict: false }));
  const contacts = await Contact.find({ reference: { $exists: true, $ne: '' } }).lean();

  console.log(`Found ${contacts.length} contacts with reference to update:\n`);
  contacts.forEach((c, i) => {
    const oldName = c.name;
    const ref = c.reference;
    const newName = `${oldName.trim()} (${ref.trim()})`;
    console.log(`${i + 1}. [${c.locality || 'No Loc'}] "${oldName}" + Ref: "${ref}" => New Name: "${newName}"`);
  });

  await mongoose.disconnect();
}

preview().catch(console.error);
