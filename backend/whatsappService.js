const QRCode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const SESSION_DIR = path.join(__dirname, 'whatsapp_session');

let sock = null;
let currentQr = null;
let connectionStatus = 'Disconnected'; // 'Disconnected' | 'Connecting' | 'Awaiting Scan' | 'Connected'
let sessionInfo = {
  loggedIn: false,
  phone: '',
  accountName: 'Mahapura Election Outreach',
  instanceId: 'INST-MAHAPURA-01',
  accessToken: 'wa_sec_live_mahapura',
  status: 'Disconnected',
  connectedAt: null,
};

let isInitializing = false;

// Helper to read saved account details from creds.json if existing
const getSavedSessionDetails = () => {
  try {
    const credsPath = path.join(SESSION_DIR, 'creds.json');
    if (fs.existsSync(credsPath)) {
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      if (creds?.me?.id) {
        const rawPhone = creds.me.id.split(':')[0] || creds.me.id.split('@')[0];
        const cleanPhone = rawPhone.replace(/\D/g, '');
        return {
          phone: cleanPhone ? `+${cleanPhone}` : null,
          accountName: creds.me.name || creds.me.notify || 'WhatsApp Account',
          jid: creds.me.id,
          platform: creds.platform || 'WhatsApp Multi-Device',
        };
      }
    }
  } catch {}
  return null;
};

// Check if already paired on disk
const savedDetails = getSavedSessionDetails();
if (savedDetails && savedDetails.phone) {
  sessionInfo.loggedIn = true;
  sessionInfo.phone = savedDetails.phone;
  sessionInfo.accountName = savedDetails.accountName || sessionInfo.accountName;
  sessionInfo.jid = savedDetails.jid;
  sessionInfo.status = 'Connected';
}

/**
 * Initialize WhatsApp Baileys Socket
 */
const initWhatsApp = async (forceNew = false) => {
  if (sock && connectionStatus === 'Connected' && !forceNew) {
    return { status: connectionStatus, sessionInfo };
  }

  if (isInitializing && !forceNew) {
    return { status: connectionStatus, qr: currentQr, sessionInfo };
  }

  isInitializing = true;
  connectionStatus = 'Connecting';

  try {
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');

    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Mahapura Outreach Windows', 'Chrome', '124.0.0'],
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQr = await QRCode.toDataURL(qr, {
            margin: 2,
            width: 260,
            color: { dark: '#000000', light: '#ffffff' },
          });
          connectionStatus = 'Awaiting Scan';
          console.log('📡 [WhatsApp Service] New QR Code generated for mobile scanning');
        } catch (qrErr) {
          console.error('[WhatsApp QR Generation Error]:', qrErr);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        console.warn(`[WhatsApp Service] Connection closed. Code: ${statusCode || 'unknown'}. Logged out: ${isLoggedOut}`);

        if (isLoggedOut) {
          connectionStatus = 'Disconnected';
          currentQr = null;
          sessionInfo = {
            loggedIn: false,
            phone: '',
            accountName: 'Mahapura Election Outreach',
            instanceId: 'INST-MAHAPURA-01',
            accessToken: 'wa_sec_live_mahapura',
            status: 'Disconnected',
            connectedAt: null,
          };
          try {
            if (fs.existsSync(SESSION_DIR)) {
              fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            }
          } catch (e) {
            console.error('Failed to remove session dir:', e);
          }
        } else {
          // Reconnecting
          const saved = getSavedSessionDetails();
          if (saved && saved.phone) {
            sessionInfo.loggedIn = true;
            sessionInfo.phone = saved.phone;
            sessionInfo.accountName = saved.accountName || sessionInfo.accountName;
          }
          connectionStatus = 'Connecting';
          setTimeout(() => {
            isInitializing = false;
            initWhatsApp(true).catch(console.error);
          }, 3000);
        }
      } else if (connection === 'open') {
        connectionStatus = 'Connected';
        currentQr = null;

        const me = sock?.user || {};
        const rawUser = me.id || '';
        const phoneDigits = (rawUser.split(':')[0] || rawUser.split('@')[0] || '').replace(/\D/g, '');
        const saved = getSavedSessionDetails();
        const formattedPhone = phoneDigits ? `+${phoneDigits}` : (saved?.phone || '+91 Linked Device');
        const accountName = me.name || me.notify || saved?.accountName || 'WhatsApp Connected Account';

        sessionInfo = {
          loggedIn: true,
          phone: formattedPhone,
          accountName,
          jid: rawUser || saved?.jid || `${phoneDigits}@s.whatsapp.net`,
          platform: 'WhatsApp Multi-Device (Phone)',
          instanceId: sessionInfo.instanceId || `INST-MAHAPURA-${Math.floor(100000 + Math.random() * 900000)}`,
          accessToken: sessionInfo.accessToken || `wa_sec_live_${Math.random().toString(36).substring(2, 12)}`,
          status: 'Connected',
          connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        };

        console.log(`✅ [WhatsApp Service] WhatsApp Linked & Active: ${formattedPhone} (${accountName})`);
      }
    });

    isInitializing = false;
    return { status: connectionStatus, qr: currentQr, sessionInfo };
  } catch (error) {
    console.error('[WhatsApp Init Error]:', error);
    isInitializing = false;
    connectionStatus = 'Disconnected';
    return { status: 'Disconnected', error: error.message };
  }
};

/**
 * Get current QR or connection state
 */
const getWhatsAppStatus = async () => {
  const saved = getSavedSessionDetails();
  if (saved && saved.phone) {
    sessionInfo.loggedIn = true;
    sessionInfo.phone = saved.phone;
    sessionInfo.accountName = saved.accountName || sessionInfo.accountName;
    sessionInfo.jid = saved.jid || sessionInfo.jid;
    sessionInfo.status = 'Connected';
  } else if (!sock) {
    sessionInfo.loggedIn = false;
    sessionInfo.phone = '';
    sessionInfo.status = 'Disconnected';
    connectionStatus = 'Disconnected';
  }

  if (!sock && sessionInfo.loggedIn) {
    initWhatsApp().catch(() => {});
  }

  const isActuallyConnected = Boolean(
    sessionInfo.loggedIn && (connectionStatus === 'Connected' || Boolean(saved?.phone))
  );

  return {
    status: isActuallyConnected ? 'Connected' : connectionStatus,
    qr: currentQr,
    session: sessionInfo,
    active: isActuallyConnected,
  };
};

/**
 * Format Indian Phone Numbers (e.g. 9829012345 -> 919829012345)
 */
const formatIndianPhoneNumber = (phone) => {
  let cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  return cleanPhone;
};

/**
 * Send real WhatsApp message via linked socket
 */
const sendLiveWhatsAppMessage = async ({ to, message }) => {
  if (!to || !message) {
    return {
      success: false,
      error: 'Recipient phone number and message text are required.',
    };
  }

  // Ensure socket is alive
  if (!sock || connectionStatus !== 'Connected') {
    const credsPath = path.join(SESSION_DIR, 'creds.json');
    if (fs.existsSync(credsPath)) {
      console.log('🔄 Reconnecting WhatsApp socket for message send...');
      await initWhatsApp();
      for (let i = 0; i < 10; i++) {
        if (sock && connectionStatus === 'Connected') break;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  if (!sock) {
    return {
      success: false,
      error: 'WhatsApp device is not ready. Please scan QR code to link your phone first.',
    };
  }

  const cleanPhone = formatIndianPhoneNumber(to);
  const jid = `${cleanPhone}@s.whatsapp.net`;

  try {
    const result = await sock.sendMessage(jid, { text: message });
    console.log(`📤 [WhatsApp Dispatched] To: ${cleanPhone}, MsgID: ${result?.key?.id}`);
    return {
      success: true,
      messageId: result?.key?.id,
      recipient: `+${cleanPhone}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ [WhatsApp Send Error to ${cleanPhone}]:`, error);
    return {
      success: false,
      error: error.message || 'Failed to dispatch WhatsApp message.',
    };
  }
};

/**
 * Disconnect & reset WhatsApp session
 */
const logoutWhatsApp = async () => {
  try {
    if (sock) {
      await sock.logout().catch(() => {});
      sock.end();
      sock = null;
    }
    if (fs.existsSync(SESSION_DIR)) {
      fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    }
    connectionStatus = 'Disconnected';
    currentQr = null;
    sessionInfo = {
      loggedIn: false,
      phone: '',
      accountName: '',
      jid: '',
      platform: '',
      instanceId: 'INST-MAHAPURA-01',
      accessToken: 'wa_sec_live_mahapura',
      status: 'Disconnected',
      connectedAt: null,
    };
    return { success: true, message: 'WhatsApp session disconnected successfully.' };
  } catch (error) {
    console.error('Error logging out WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

// Initialize immediately if session files exist
if (fs.existsSync(path.join(SESSION_DIR, 'creds.json'))) {
  initWhatsApp().catch(console.error);
}

module.exports = {
  initWhatsApp,
  getWhatsAppStatus,
  sendLiveWhatsAppMessage,
  logoutWhatsApp,
};
