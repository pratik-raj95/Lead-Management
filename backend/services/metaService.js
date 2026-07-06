/**
 * Service to interact with the Facebook Graph API to retrieve Lead Gen details
 */
export async function fetchMetaLead(leadgenId) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn('[Meta API Warning] META_ACCESS_TOKEN is missing. Cannot fetch lead details.');
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${leadgenId}?fields=field_data,created_time&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Meta Graph API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    const fieldData = data.field_data || [];
    
    let phone = '';
    let name = '';

    // Search fields for name and phone number
    fieldData.forEach(field => {
      const fieldName = field.name.toLowerCase();
      if (fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('contact')) {
        phone = field.values?.[0] || '';
      } else if (fieldName.includes('name') || fieldName.includes('first') || fieldName.includes('full')) {
        name = field.values?.[0] || '';
      }
    });

    return { phone, name, raw: data };
  } catch (err) {
    console.error(`[Meta API Error] Graph API query failed for leadgen_id ${leadgenId}:`, err.message);
    return null;
  }
}
