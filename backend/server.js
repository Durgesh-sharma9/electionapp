const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Contact = require('./models/Contact');
const Template = require('./models/Template');
const ShareLink = require('./models/ShareLink');
const Locality = require('./models/Locality');
const Ward = require('./models/Ward');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to normalize phone numbers (strip non-digits, take last 10 digits if 11-12 digits with 91 or 0)
const normalizePhone = (phoneStr) => {
  if (!phoneStr) return '';
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
};

// Database connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas (election database)');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const contactedCount = await Contact.countDocuments({ contacted: true });
    const pendingCount = total - contactedCount;
    const sureCount = await Contact.countDocuments({ isSureVoter: true });

    // Category breakdown
    const categoryStats = await Contact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Ward-wise aggregation
    const wardStats = await Contact.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$ward', 'Unassigned'] },
          total: { $sum: 1 },
          sureCount: { $sum: { $cond: [{ $eq: ['$isSureVoter', true] }, 1, 0] } },
          contactedCount: { $sum: { $cond: [{ $eq: ['$contacted', true] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Locality-wise aggregation
    const localityStats = await Contact.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$locality', 'Unassigned'] },
          ward: { $first: '$ward' },
          total: { $sum: 1 },
          sureCount: { $sum: { $cond: [{ $eq: ['$isSureVoter', true] }, 1, 0] } },
          contactedCount: { $sum: { $cond: [{ $eq: ['$contacted', true] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        contactedCount,
        pendingCount,
        sureCount,
        categoryStats,
        wardStats,
        localityStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { search, category, ward, locality, reference, contacted, isSureVoter, sort = 'createdAt', order = 'desc' } = req.query;

    const filter = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (ward && ward !== 'ALL') {
      filter.ward = ward;
    }

    if (locality && locality !== 'ALL') {
      filter.locality = locality;
    }

    if (reference && reference !== 'ALL') {
      filter.reference = reference;
    }

    if (contacted !== undefined && contacted !== 'ALL') {
      filter.contacted = contacted === 'true';
    }

    if (isSureVoter !== undefined && isSureVoter !== 'ALL') {
      filter.isSureVoter = isSureVoter === 'true';
    }

    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      filter.$or = [
        { name: regex },
        { phone: regex },
        { ward: regex },
        { locality: regex },
        { reference: regex },
        { notes: regex },
      ];
    }

    const sortObj = {};
    if (sort === 'createdAt' && order === 'desc') {
      // Default to ascending serialNo first if available, otherwise createdAt
      sortObj.serialNo = 1;
      sortObj.createdAt = 1;
    } else {
      sortObj[sort] = order === 'asc' ? 1 : -1;
    }

    const contacts = await Contact.find(filter).sort(sortObj).lean();

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contacts (Single contact)
app.post('/api/contacts', async (req, res) => {
  try {
    const { serialNo, name, phone, ward, locality, reference, category, notes, isSureVoter } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Both name and phone number are required',
      });
    }

    const cleanedPhone = normalizePhone(phone);

    const contact = new Contact({
      serialNo: Number(serialNo) || 0,
      name: name.trim(),
      phone: cleanedPhone,
      ward: ward?.trim() || '',
      locality: locality?.trim() || '',
      reference: reference?.trim() || '',
      category: category?.trim() || 'General',
      notes: notes?.trim() || '',
      isSureVoter: Boolean(isSureVoter),
    });

    const saved = await contact.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contacts/bulk (Bulk contacts list import)
app.post('/api/contacts/bulk', async (req, res) => {
  try {
    const { contacts, defaultCategory = 'General' } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid array of contacts',
      });
    }

    const validDocs = [];
    const skipped = [];

    for (let i = 0; i < contacts.length; i++) {
      const item = contacts[i];
      const name = item.name ? String(item.name).trim() : '';
      const rawPhone = item.phone ? String(item.phone).trim() : '';
      const phone = normalizePhone(rawPhone);

      if (!name || !phone || phone.length < 8) {
        skipped.push({ item, reason: 'Invalid name or phone number' });
        continue;
      }

      validDocs.push({
        serialNo: item.serialNo ? Number(item.serialNo) : i + 1,
        name,
        phone,
        ward: item.ward?.trim() || '',
        locality: item.locality?.trim() || '',
        reference: item.reference?.trim() || '',
        category: item.category?.trim() || defaultCategory,
        notes: item.notes?.trim() || '',
        contacted: false,
        contactCount: 0,
      });
    }

    if (validDocs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid contacts to insert',
        skipped,
      });
    }

    const inserted = await Contact.insertMany(validDocs, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${inserted.length} contacts added successfully!`,
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      skipped,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/contacts/:id/contacted (Toggle or record outreach)
app.patch('/api/contacts/:id/contacted', async (req, res) => {
  try {
    const { id } = req.params;
    const { contacted } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    if (contacted !== undefined) {
      contact.contacted = Boolean(contacted);
    } else {
      contact.contacted = true;
    }

    if (contact.contacted) {
      contact.contactCount = (contact.contactCount || 0) + 1;
      contact.lastContactedAt = new Date();
    }

    await contact.save();
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/contacts/:id/sure (Toggle Sure Voter status)
app.patch('/api/contacts/:id/sure', async (req, res) => {
  try {
    const { id } = req.params;
    const { isSureVoter } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    if (isSureVoter !== undefined) {
      contact.isSureVoter = Boolean(isSureVoter);
    } else {
      contact.isSureVoter = !contact.isSureVoter;
    }

    await contact.save();
    res.json({
      success: true,
      message: contact.isSureVoter ? 'Marked as Sure Voter ⭐' : 'Unmarked Sure Voter',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/contacts/:id (Update contact)
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, ward, locality, reference, category, notes, contacted, isSureVoter } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = normalizePhone(phone);
    if (ward !== undefined) updateData.ward = ward.trim();
    if (locality !== undefined) updateData.locality = locality.trim();
    if (reference !== undefined) updateData.reference = reference.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (notes !== undefined) updateData.notes = notes.trim();
    if (contacted !== undefined) updateData.contacted = Boolean(contacted);
    if (isSureVoter !== undefined) updateData.isSureVoter = Boolean(isSureVoter);

    const updated = await Contact.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/contacts/:id
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/contacts (Bulk delete)
app.delete('/api/contacts', async (req, res) => {
  try {
    const { ids } = req.body;
    if (Array.isArray(ids) && ids.length > 0) {
      const result = await Contact.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `${result.deletedCount} contacts deleted` });
    }
    res.status(400).json({ success: false, error: 'IDs array required' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// TEMPLATES CRUD API
// ==========================================
const defaultTemplatesSeed = [
  {
    title: 'Greeting & Connect',
    icon: '👋',
    category: 'General',
    text: 'Hello {name}, I hope you are having a wonderful day! Reaching out to connect and stay in touch. Please let us know if you need any assistance.',
    isDefault: true,
  },
  {
    title: 'Important Update',
    icon: '📢',
    category: 'Announcement',
    text: 'Dear {name}, here is an important update regarding our upcoming community discussion. Your presence and feedback would be greatly appreciated.',
    isDefault: false,
  },
  {
    title: 'Meeting Invitation',
    icon: '🤝',
    category: 'Meeting',
    text: 'Namaste {name}, you are cordially invited to our group meeting this weekend. Please confirm your availability whenever convenient.',
    isDefault: false,
  },
  {
    title: 'Quick Follow-up',
    icon: '⏰',
    category: 'Follow-up',
    text: 'Hi {name}, following up on our previous conversation. Please feel free to reply or call back whenever you have a moment. Thank you!',
    isDefault: false,
  },
];

// GET /api/templates
app.get('/api/templates', async (req, res) => {
  try {
    let templates = await Template.find().sort({ isDefault: -1, createdAt: 1 }).lean();
    if (templates.length === 0) {
      await Template.insertMany(defaultTemplatesSeed);
      templates = await Template.find().sort({ isDefault: -1, createdAt: 1 }).lean();
    }
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/templates
app.post('/api/templates', async (req, res) => {
  try {
    const { title, text, icon, category, isDefault } = req.body;
    if (!title || !text) {
      return res.status(400).json({
        success: false,
        error: 'Both template title and text are required',
      });
    }

    if (isDefault) {
      await Template.updateMany({}, { isDefault: false });
    }

    const newTemplate = new Template({
      title: title.trim(),
      text: text.trim(),
      icon: icon?.trim() || '💬',
      category: category?.trim() || 'General',
      isDefault: Boolean(isDefault),
    });

    const saved = await newTemplate.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/templates/:id
app.put('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, icon, category, isDefault } = req.body;

    if (isDefault) {
      await Template.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (text) updateData.text = text.trim();
    if (icon) updateData.icon = icon.trim();
    if (category) updateData.category = category.trim();
    if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault);

    const updated = await Template.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/templates/:id
app.delete('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Template.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==============================================================
// WARD MASTER CRUD API
// ==============================================================
const defaultWardsSeed = [
  { name: 'Ward 1', description: 'Ward 1' },
  { name: 'Ward 2', description: 'Ward 2' },
  { name: 'Ward 3', description: 'Ward 3' },
  { name: 'Ward 4', description: 'Ward 4' },
];

app.get('/api/wards', async (req, res) => {
  try {
    let wards = await Ward.find().sort({ name: 1 }).lean();
    if (wards.length === 0) {
      await Ward.insertMany(defaultWardsSeed);
      wards = await Ward.find().sort({ name: 1 }).lean();
    }

    const contactCounts = await Contact.aggregate([
      { $match: { ward: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$ward',
          count: { $sum: 1 },
          sureCount: { $sum: { $cond: [{ $eq: ['$isSureVoter', true] }, 1, 0] } },
        },
      },
    ]);
    const localityCounts = await Locality.aggregate([
      { $match: { ward: { $exists: true, $ne: '' } } },
      { $group: { _id: '$ward', count: { $sum: 1 } } },
    ]);

    const cMap = {};
    contactCounts.forEach((c) => { cMap[c._id] = c; });
    const lMap = {};
    localityCounts.forEach((l) => { lMap[l._id] = l.count; });

    const enriched = wards.map((w) => ({
      ...w,
      contactCount: cMap[w.name]?.count || 0,
      sureCount: cMap[w.name]?.sureCount || 0,
      localityCount: lMap[w.name] || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/wards', async (req, res) => {
  try {
    const { name, description, targetVoters } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Ward name is required' });
    }
    const trimmed = name.trim();
    const existing = await Ward.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Ward already exists' });
    }
    const ward = new Ward({
      name: trimmed,
      description: description?.trim() || '',
      targetVoters: targetVoters ? Number(targetVoters) : 0,
    });
    const saved = await ward.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/wards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, targetVoters } = req.body;
    const ward = await Ward.findById(id);
    if (!ward) return res.status(404).json({ success: false, error: 'Ward not found' });
    const oldName = ward.name;
    const newName = name?.trim() || oldName;

    ward.name = newName;
    ward.description = description !== undefined ? description.trim() : ward.description;
    ward.targetVoters = targetVoters !== undefined ? Number(targetVoters) : ward.targetVoters;
    await ward.save();

    if (oldName !== newName) {
      await Locality.updateMany({ ward: oldName }, { ward: newName });
      await Contact.updateMany({ ward: oldName }, { ward: newName });
    }

    res.json({ success: true, data: ward });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/wards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Ward.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Ward not found' });
    res.json({ success: true, message: 'Ward deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==============================================================
// LOCALITY MASTER CRUD API
// ==============================================================
const defaultLocalitiesSeed = [
  { name: 'Mahima', ward: 'Ward 1', color: '#ea580c', description: 'Mahima' },
];

// GET /api/localities (List all localities with contact counts)
app.get('/api/localities', async (req, res) => {
  try {
    let localities = await Locality.find().sort({ name: 1 }).lean();
    if (localities.length === 0) {
      await Locality.insertMany(defaultLocalitiesSeed);
      localities = await Locality.find().sort({ name: 1 }).lean();
    }

    // Aggregate counts of contacts per locality
    const counts = await Contact.aggregate([
      { $match: { locality: { $exists: true, $ne: '' } } },
      { $group: { _id: '$locality', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const totalAssigned = await Contact.countDocuments({ locality: { $exists: true, $ne: '' } });
    const totalUnassigned = await Contact.countDocuments({
      $or: [{ locality: { $exists: false } }, { locality: '' }],
    });

    const enriched = localities.map((loc) => ({
      ...loc,
      contactCount: countMap[loc.name] || 0,
    }));

    res.json({
      success: true,
      data: enriched,
      meta: {
        totalLocalities: localities.length,
        totalAssigned,
        totalUnassigned,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/localities (Create new locality)
app.post('/api/localities', async (req, res) => {
  try {
    const { name, ward, description, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Locality name is required' });
    }

    const trimmedName = name.trim();
    const existing = await Locality.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Locality with this name already exists' });
    }

    const newLocality = new Locality({
      name: trimmedName,
      ward: ward?.trim() || '',
      description: description?.trim() || '',
      color: color || '#0284c7',
    });

    const saved = await newLocality.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/localities/:id (Update locality)
app.put('/api/localities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ward, description, color } = req.body;

    const loc = await Locality.findById(id);
    if (!loc) {
      return res.status(404).json({ success: false, error: 'Locality not found' });
    }

    const oldName = loc.name;
    if (name && name.trim()) {
      const trimmedName = name.trim();
      if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
        const dup = await Locality.findOne({
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        });
        if (dup) {
          return res.status(400).json({ success: false, error: 'Another locality already has this name' });
        }
        loc.name = trimmedName;
        // Cascade rename on contacts
        await Contact.updateMany({ locality: oldName }, { locality: trimmedName });
      }
    }

    if (ward !== undefined) loc.ward = ward.trim();
    if (description !== undefined) loc.description = description.trim();
    if (color !== undefined) loc.color = color;

    const updated = await loc.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/localities/:id (Delete locality)
app.delete('/api/localities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const loc = await Locality.findById(id);
    if (!loc) {
      return res.status(404).json({ success: false, error: 'Locality not found' });
    }

    const locName = loc.name;
    await Locality.findByIdAndDelete(id);

    // Unassign deleted locality from contacts
    await Contact.updateMany({ locality: locName }, { locality: '' });

    res.json({ success: true, message: `Locality '${locName}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/references (List distinct reference names for autocomplete & filtering)
app.get('/api/references', async (req, res) => {
  try {
    const refs = await Contact.distinct('reference', { reference: { $exists: true, $ne: '' } });
    res.json({ success: true, data: refs.filter(Boolean).sort() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==============================================================
// WHATSAPP LIVE BAILEYS ENDPOINTS (QR LOGIN & DIRECT SEND)
// ==============================================================
const whatsappService = require('./whatsappService');

// GET /api/whatsapp/status
app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const data = await whatsappService.getWhatsAppStatus();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/whatsapp/start-session
app.post('/api/whatsapp/start-session', async (req, res) => {
  try {
    const data = await whatsappService.initWhatsApp(true);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/whatsapp/send
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message, contactId } = req.body;
    const result = await whatsappService.sendLiveWhatsAppMessage({ to, message });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Auto-mark contact as contacted in MongoDB if contactId or phone provided
    if (contactId) {
      await Contact.findByIdAndUpdate(contactId, {
        contacted: true,
        lastContactedDate: new Date(),
        $inc: { contactCount: 1 },
      });
    } else if (to) {
      const clean10 = normalizePhone(to);
      if (clean10) {
        await Contact.findOneAndUpdate(
          { phone: clean10 },
          { contacted: true, lastContactedDate: new Date(), $inc: { contactCount: 1 } }
        );
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/whatsapp/logout
app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    const result = await whatsappService.logoutWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==============================================================
// PUBLIC SHAREABLE OUTREACH LINKS API
// ==============================================================

// POST /api/shares (Generate a new shareable list link)
app.post('/api/shares', async (req, res) => {
  try {
    const { title, messageTemplate, contacts, countLimit, localityFilter } = req.body;

    let selectedContacts = Array.isArray(contacts) ? contacts : [];

    // Filter by locality if specified
    if (localityFilter && localityFilter.trim() && localityFilter !== 'ALL') {
      selectedContacts = selectedContacts.filter(
        (c) => (c.locality || 'Mahima').toLowerCase() === localityFilter.trim().toLowerCase()
      );
    }

    // If countLimit is specified and smaller than length, slice it
    if (countLimit && Number(countLimit) > 0 && Number(countLimit) < selectedContacts.length) {
      selectedContacts = selectedContacts.slice(0, Number(countLimit));
    }

    if (selectedContacts.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one contact is required to generate share link' });
    }

    const shareId = 'sh_' + crypto.randomBytes(4).toString('hex');

    const shareDoc = new ShareLink({
      shareId,
      title: title?.trim() || 'Outreach Contact List',
      messageTemplate: messageTemplate || 'Hello {name}, reaching out to connect with you.',
      localityFilter: localityFilter || '',
      contacts: selectedContacts.map((c, i) => ({
        serialNo: c.serialNo || i + 1,
        name: c.name,
        phone: normalizePhone(c.phone),
        locality: c.locality || 'Mahima',
        reference: c.reference || '',
        category: c.category || 'General',
        notes: c.notes || '',
        contacted: Boolean(c.contacted),
        contactCount: c.contactCount || 0,
        called: Boolean(c.called),
        calledAt: c.calledAt || null,
        callCount: c.callCount || 0,
        messaged: Boolean(c.messaged),
        messagedAt: c.messagedAt || null,
        messageCount: c.messageCount || 0,
      })),
      totalCount: selectedContacts.length,
    });

    const saved = await shareDoc.save();

    res.status(201).json({
      success: true,
      shareId: saved.shareId,
      totalCount: saved.totalCount,
      title: saved.title,
      messageTemplate: saved.messageTemplate,
      localityFilter: saved.localityFilter,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shares (List all generated share links with analytics)
app.get('/api/shares', async (req, res) => {
  try {
    const list = await ShareLink.find().sort({ createdAt: -1 }).lean();

    const formatted = list.map((item) => {
      const contacts = item.contacts || [];
      const total = contacts.length;
      const called = contacts.filter((c) => c.called).length;
      const messaged = contacts.filter((c) => c.messaged).length;
      const both = contacts.filter((c) => c.called && c.messaged).length;
      const contacted = contacts.filter((c) => c.contacted || c.called || c.messaged).length;
      const untouched = total - contacted;
      const percent = total > 0 ? Math.round((contacted / total) * 100) : 0;

      return {
        shareId: item.shareId,
        title: item.title,
        messageTemplate: item.messageTemplate,
        localityFilter: item.localityFilter || 'All Localities',
        totalCount: total,
        calledCount: called,
        messagedCount: messaged,
        bothCount: both,
        untouchedCount: untouched > 0 ? untouched : 0,
        percentComplete: percent,
        createdAt: item.createdAt,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shares/:shareId (Fetch public shared list)
app.get('/api/shares/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const shareDoc = await ShareLink.findOne({ shareId }).lean();

    if (!shareDoc) {
      return res.status(404).json({ success: false, error: 'Share link not found or expired' });
    }

    res.json({
      success: true,
      data: shareDoc,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shares/:shareId/analytics (Fetch detailed analytics for a share link)
app.get('/api/shares/:shareId/analytics', async (req, res) => {
  try {
    const { shareId } = req.params;
    const shareDoc = await ShareLink.findOne({ shareId }).lean();

    if (!shareDoc) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    const contacts = shareDoc.contacts || [];
    const total = contacts.length;
    const called = contacts.filter((c) => c.called).length;
    const messaged = contacts.filter((c) => c.messaged).length;
    const both = contacts.filter((c) => c.called && c.messaged).length;
    const contacted = contacts.filter((c) => c.contacted || c.called || c.messaged).length;
    const untouched = total - contacted;
    const percent = total > 0 ? Math.round((contacted / total) * 100) : 0;

    // Locality breakdown
    const localityMap = {};
    contacts.forEach((c) => {
      const loc = c.locality || 'Mahima';
      if (!localityMap[loc]) {
        localityMap[loc] = { total: 0, called: 0, messaged: 0, untouched: 0 };
      }
      localityMap[loc].total += 1;
      if (c.called) localityMap[loc].called += 1;
      if (c.messaged) localityMap[loc].messaged += 1;
      if (!c.called && !c.messaged && !c.contacted) localityMap[loc].untouched += 1;
    });

    res.json({
      success: true,
      shareId: shareDoc.shareId,
      title: shareDoc.title,
      createdAt: shareDoc.createdAt,
      localityFilter: shareDoc.localityFilter,
      summary: {
        total,
        called,
        messaged,
        both,
        untouched: untouched > 0 ? untouched : 0,
        percentComplete: percent,
      },
      localityBreakdown: localityMap,
      contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/shares/:shareId/contact/:phone/action (Record Call or WhatsApp message or status toggle)
app.post('/api/shares/:shareId/contact/:phone/action', async (req, res) => {
  try {
    const { shareId, phone } = req.params;
    const { action } = req.body; // 'call' | 'message' | 'toggle'
    const cleanPhone = normalizePhone(phone);

    const shareDoc = await ShareLink.findOne({ shareId });
    if (!shareDoc) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    const targetContact = shareDoc.contacts.find((c) => c.phone === cleanPhone);
    if (!targetContact) {
      return res.status(404).json({ success: false, error: 'Contact not found in share link' });
    }

    const now = new Date();
    if (action === 'call') {
      targetContact.called = true;
      targetContact.calledAt = now;
      targetContact.callCount = (targetContact.callCount || 0) + 1;
      targetContact.contacted = true;
    } else if (action === 'message') {
      targetContact.messaged = true;
      targetContact.messagedAt = now;
      targetContact.messageCount = (targetContact.messageCount || 0) + 1;
      targetContact.contacted = true;
    } else if (action === 'toggle') {
      targetContact.contacted = !targetContact.contacted;
    }

    await shareDoc.save();

    // Sync to master MongoDB Contact directory as well
    await Contact.findOneAndUpdate(
      { phone: cleanPhone },
      {
        contacted: true,
        lastContactedDate: now,
        $inc: { contactCount: 1 },
      }
    );

    res.json({
      success: true,
      contact: targetContact,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/shares/:shareId (Delete a share link)
app.delete('/api/shares/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const deleted = await ShareLink.findOneAndDelete({ shareId });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }
    res.json({ success: true, message: 'Share link deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/shares/:shareId/contact/:phone/toggle (Backwards compatibility)
app.patch('/api/shares/:shareId/contact/:phone/toggle', async (req, res) => {
  try {
    const { shareId, phone } = req.params;
    const cleanPhone = normalizePhone(phone);

    const shareDoc = await ShareLink.findOne({ shareId });
    if (!shareDoc) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    const targetContact = shareDoc.contacts.find((c) => c.phone === cleanPhone);
    if (targetContact) {
      targetContact.contacted = !targetContact.contacted;
      if (targetContact.contacted) {
        targetContact.contactCount = (targetContact.contactCount || 0) + 1;
      }
      await shareDoc.save();

      await Contact.findOneAndUpdate(
        { phone: cleanPhone },
        { contacted: targetContact.contacted, $inc: { contactCount: targetContact.contacted ? 1 : 0 } }
      );
    }

    res.json({ success: true, contacted: targetContact?.contacted, contact: targetContact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SERVE PRODUCTION FRONTEND (SPA)
// Checks multiple paths so it works whether deployed in monorepo or flat folder
// ============================================================================
const possibleDistPaths = [
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, './dist'),
  path.join(__dirname, './public'),
  path.join(__dirname, '../dist'),
];

for (const distPath of possibleDistPaths) {
  if (fs.existsSync(distPath)) {
    console.log(`📦 Serving production frontend build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        return res.sendFile(indexFile);
      }
      next();
    });
    break;
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Outreach Server running on port ${PORT}`);
});

