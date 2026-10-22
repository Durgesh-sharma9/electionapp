const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function executeFix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  const Contact = mongoose.model('Contact', new mongoose.Schema({}, { strict: false }));
  const contacts = await Contact.find({ reference: { $exists: true, $ne: '' } });

  console.log(`Found ${contacts.length} contacts to update.`);

  let updatedCount = 0;
  for (const c of contacts) {
    let oldName = (c.name || '').trim();
    let ref = (c.reference || '').trim();

    if (!ref) continue;

    // Clean nested parentheses if any
    let formattedRef = ref;
    if (formattedRef.includes('(uncertain)')) {
      formattedRef = formattedRef.replace('(uncertain)', 'uncertain').replace(/\s+/g, ' ').trim();
    }

    // New name: Name (Parent)
    const newName = `${oldName} (${formattedRef})`;

    await Contact.updateOne(
      { _id: c._id },
      {
        $set: {
          name: newName,
          reference: '' // clear reference so it doesn't show in REF column
        }
      }
    );

    console.log(`Updated #${updatedCount + 1}: "${oldName}" -> "${newName}" (reference cleared)`);
    updatedCount++;
  }

  console.log(`\nSuccessfully updated ${updatedCount} contacts in MongoDB Atlas!`);
  await mongoose.disconnect();
}

executeFix().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
