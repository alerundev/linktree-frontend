const BASE = process.env.REACT_APP_API_URL || '';

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

// Admin API - token을 직접 인자로 받음 (sessionStorage에서 관리)
export async function fetchAdminStats(token) {
  const res = await fetch(`${BASE}/api/admin/stats`, {
    headers: { 'x-admin-token': token },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchVisitors(token, limit = 50) {
  const res = await fetch(`${BASE}/api/admin/visitors?limit=${limit}`, {
    headers: { 'x-admin-token': token },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchClicks(token, limit = 50) {
  const res = await fetch(`${BASE}/api/admin/clicks?limit=${limit}`, {
    headers: { 'x-admin-token': token },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}
