const BASE = process.env.REACT_APP_API_URL || '';
const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN || '';

export async function trackPageView() {
  try {
    await fetch(`${BASE}/api/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_) {}
}

export async function trackClick(linkId, linkTitle) {
  try {
    await fetch(`${BASE}/api/track/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, linkTitle }),
    });
  } catch (_) {}
}

export async function fetchAdminStats() {
  const res = await fetch(`${BASE}/api/admin/stats`, {
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchVisitors(limit = 50) {
  const res = await fetch(`${BASE}/api/admin/visitors?limit=${limit}`, {
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchClicks(limit = 50) {
  const res = await fetch(`${BASE}/api/admin/clicks?limit=${limit}`, {
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}
