require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Locality = mongoose.model('Locality', new mongoose.Schema({}, { strict: false }));
  const Contact = mongoose.model('Contact', new mongoose.Schema({}, { strict: false }));
  
  const locRes = await Locality.updateMany({ name: 'Mahima' }, { $set: { ward: '' } });
  const contactRes = await Contact.updateMany({ ward: 'Ward 1' }, { $set: { ward: '' } });
  
  console.log(`Reset Mahima locality (${locRes.modifiedCount}) and contacts (${contactRes.modifiedCount}) ward to unassigned.`);
  await mongoose.disconnect();
}

run().catch(console.error);
