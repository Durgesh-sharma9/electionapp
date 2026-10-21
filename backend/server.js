const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Contact = require('./models/Contact');
const Template = require('./models/Template');
const ShareLink = require('./models/ShareLink');
const crypto = require('crypto');

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

    res.json({
      success: true,
      data: {
        total,
        contactedCount,
        pendingCount,
        categoryStats,
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
    const { serialNo, name, phone, ward, category, notes } = req.body;

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
    const { title, messageTemplate, contacts, countLimit } = req.body;

    let selectedContacts = Array.isArray(contacts) ? contacts : [];

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
      contacts: selectedContacts.map((c, i) => ({
        serialNo: c.serialNo || i + 1,
        name: c.name,
        phone: normalizePhone(c.phone),
        category: c.category || 'General',
        notes: c.notes || '',
        contacted: Boolean(c.contacted),
        contactCount: c.contactCount || 0,
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
      createdAt: saved.createdAt,
    });
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

// PATCH /api/shares/:shareId/contact/:phone/toggle (Mark as contacted in shared list)
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

      // Also update master Contact document in MongoDB!
      await Contact.findOneAndUpdate(
        { phone: cleanPhone },
        { contacted: targetContact.contacted, $inc: { contactCount: targetContact.contacted ? 1 : 0 } }
      );
    }

    res.json({ success: true, contacted: targetContact?.contacted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Outreach Server running on port ${PORT}`);
});

