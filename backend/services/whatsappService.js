/**
 * Service to interact with WhatsApp Business Cloud API to send outgoing messages
 */
export async function sendWhatsAppMessage(toPhone, messageBody) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsApp API Warning] WHATSAPP_PHONE_NUMBER_ID or META_ACCESS_TOKEN is missing.');
    return { success: false, error: 'WhatsApp Cloud API credentials not configured.' };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone.replace(/[^\d]/g, ''), // Strip non-numeric formatting characters
        type: 'text',
        text: { body: messageBody }
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    console.log(`[WhatsApp API] Dispatched outgoing message to ${toPhone}`);
    return { success: true, data };
  } catch (err) {
    console.error(`[WhatsApp API Error] Outgoing dispatch failed to ${toPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}
