const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Contact = require('./models/Contact');

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

    const categoryStats = await Contact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const wardStats = await Contact.aggregate([
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        contactedCount,
        pendingCount,
        categoryStats,
        wardStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { search, category, ward, contacted, sort = 'createdAt', order = 'desc' } = req.query;

    const filter = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (ward && ward !== 'ALL') {
      filter.ward = ward;
    }

    if (contacted !== undefined && contacted !== 'ALL') {
      filter.contacted = contacted === 'true';
    }

    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      filter.$or = [
        { name: regex },
        { phone: regex },
        { ward: regex },
        { notes: regex },
      ];
    }

    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

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
    const { name, phone, ward, category, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Both name and phone number are required',
      });
    }

    const cleanedPhone = normalizePhone(phone);

    const contact = new Contact({
      name: name.trim(),
      phone: cleanedPhone,
      ward: ward?.trim() || 'Main List',
      category: category?.trim() || 'General',
      notes: notes?.trim() || '',
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
    const { contacts, defaultWard = 'Main List', defaultCategory = 'General' } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid array of contacts',
      });
    }

    const validDocs = [];
    const skipped = [];

    for (const item of contacts) {
      const name = item.name ? String(item.name).trim() : '';
      const rawPhone = item.phone ? String(item.phone).trim() : '';
      const phone = normalizePhone(rawPhone);

      if (!name || !phone || phone.length < 8) {
        skipped.push({ item, reason: 'Invalid name or phone number' });
        continue;
      }

      validDocs.push({
        name,
        phone,
        ward: item.ward?.trim() || defaultWard,
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

// PUT /api/contacts/:id (Update contact)
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, ward, category, notes, contacted } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = normalizePhone(phone);
    if (ward !== undefined) updateData.ward = ward.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (notes !== undefined) updateData.notes = notes.trim();
    if (contacted !== undefined) updateData.contacted = Boolean(contacted);

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

app.listen(PORT, () => {
  console.log(`🚀 Outreach Server running on port ${PORT}`);
});
