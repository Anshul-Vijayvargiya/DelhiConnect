const twilio = require('twilio');

let client = null;

function getClient() {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    !process.env.TWILIO_ACCOUNT_SID.includes('your_')) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

const MESSAGES = {
  submitted: (id) => `🏛️ *Delhi CM Helpline*\nYour complaint #${id} has been received. We'll keep you updated on its progress.`,
  assigned: (id, dept) => `🏛️ *Delhi CM Helpline*\nYour complaint #${id} is being reviewed by the *${dept}* department.`,
  inProgress: (id) => `🏛️ *Delhi CM Helpline*\nWork has started on your complaint #${id}. Our team is actively working on it.`,
  resolved: (id) => `🏛️ *Delhi CM Helpline*\nYour complaint #${id} has been *resolved* ✅\n\nAre you satisfied with the resolution? Reply *YES* or *NO*.`,
  rejected: (id, reason) => `🏛️ *Delhi CM Helpline*\nYour complaint #${id} could not be processed. Reason: ${reason || 'Duplicate or out of jurisdiction'}. For assistance, call 1076.`
};

async function sendWhatsApp(to, message) {
  const twilioClient = getClient();

  if (!twilioClient) {
    console.log(`[MOCK WhatsApp] To: ${to}\nMessage: ${message}`);
    return { success: true, mock: true };
  }

  try {
    const msg = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:${to}`,
      body: message
    });
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('Twilio Error:', err.message);
    return { success: false, error: err.message };
  }
}

async function notifyStatus(phone, complaintId, status, extra = {}) {
  if (!phone) return;
  const shortId = String(complaintId).slice(-6).toUpperCase();
  let message;

  switch (status) {
    case 'Pending': message = MESSAGES.submitted(shortId); break;
    case 'Assigned': message = MESSAGES.assigned(shortId, extra.department || 'Concerned'); break;
    case 'In Progress': message = MESSAGES.inProgress(shortId); break;
    case 'Resolved': message = MESSAGES.resolved(shortId); break;
    case 'Rejected': message = MESSAGES.rejected(shortId, extra.reason); break;
    default: return;
  }

  return sendWhatsApp(phone, message);
}

module.exports = { sendWhatsApp, notifyStatus, MESSAGES };
