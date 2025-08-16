// Unified API helpers using /api proxy

function setCookie(name, value, days) {
  try {
    const expires = days ? `; Expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${expires}`;
  } catch {}
}

function deleteCookie(name) {
  try {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {}
}

export function setAuth(auth) {
  localStorage.setItem('auth', JSON.stringify(auth));
  if (auth?.token) {
    localStorage.setItem('auth_token', auth.token);
    // Also set cookies for backends reading from cookies (e.g., request.cookies['token'])
    setCookie('token', auth.token, 7);
    setCookie('authToken', auth.token, 7);
  }
}

export function clearAuth() {
  localStorage.removeItem('auth');
  localStorage.removeItem('auth_token');
  deleteCookie('token');
  deleteCookie('authToken');
}

function getCookie(name) {
  try {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='))
      ?.split('=')[1] || null;
  } catch {
    return null;
  }
}

function base64UrlDecode(input) {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const decoded = atob(padded);
    // decodeURIComponent trick for proper UTF-8
    const escaped = decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('');
    return decodeURIComponent(escaped);
  } catch {
    return '';
  }
}

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAuth() {
  // Prefer structured auth from localStorage
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Fallback to cookies if present (authToken or token)
  const cookieToken = getCookie('authToken') || getCookie('token');
  if (cookieToken) {
    const payload = decodeJwt(decodeURIComponent(cookieToken));
    const inferredRole = payload?.role || payload?.custom?.role || (Array.isArray(payload?.roles) && payload.roles.includes('SYS_ADMIN') ? 'admin' : undefined);
    const phone = payload?.phone;
    const fullName = payload?.full_name || payload?.name;
    return { token: decodeURIComponent(cookieToken), role: inferredRole, phone, fullName };
  }
  
  // Check for legacy auth storage
  const legacyToken = localStorage.getItem('auth_token');
  const legacyRole = localStorage.getItem('auth_role');
  if (legacyToken) {
    return { token: legacyToken, role: legacyRole, email: '', fullName: '' };
  }
  
  return null;
}

export function isAuthed() {
  const auth = getAuth();
  return !!auth && !!auth.token;
}

export function isAdmin() {
  const auth = getAuth();
  return !!auth && auth.role === 'admin' && !!auth.token;
}

function authHeader() {
  const auth = getAuth();
  if (!auth?.token) {
    return {};
  }
  // Send token in both common styles to maximize backend compatibility
  return {
    Authorization: `Bearer ${auth.token}`,
    'x-access-token': auth.token,
    // Some services accept Cookie header explicitly when fetch omits it in CORS
    // But since we are same-origin via Vite proxy, browser will send cookies automatically.
  };
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (res.status === 401) {
    clearAuth();
    const message = isJson && data?.error ? data.error : (data || 'Unauthorized');
    throw new Error(message);
  }
  if (res.status === 403) {
    const message = isJson && data?.error ? data.error : (data || 'Forbidden');
    throw new Error(message || 'Forbidden (admin only)');
  }
  if (!res.ok) {
    const message = isJson && data?.error ? data.error : (data || res.statusText);
    throw new Error(message || 'Request failed');
  }
  return data;
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  // Append token as query param too for backends that read request.args['token']
  const auth = getAuth();
  let url = `/api${path}`;
  if (auth?.token) {
    const hasQuery = url.includes('?');
    const sep = hasQuery ? '&' : '?';
    url = `${url}${sep}token=${encodeURIComponent(auth.token)}`;
  }
  
  // Handle FormData vs JSON
  const isFormData = body instanceof FormData;
  const requestHeaders = isFormData 
    ? { ...authHeader(), ...headers } // Don't set Content-Type for FormData
    : { 'Content-Type': 'application/json', ...authHeader(), ...headers };
  
  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });
  
  return handleResponse(res);
}

// Auth
export async function login({ phone, password }) {
  const data = await api('/login', { method: 'POST', body: { phone, password } });
  setAuth({ token: data.token, role: data.role, fullName: data.full_name, phone });
  return data;
}

export async function register({ full_name, phone, password, role = 'user' }) {
  return api('/register', { method: 'POST', body: { full_name, phone, password, role } });
}

export function logout() {
  clearAuth();
}

// Admin endpoints
export function countUsers() {
  return api('/users/count');
}

export function getAllUsers() {
  return api('/users');
}

export function updateUser(userId, fields) {
  return api(`/users/${userId}`, { method: 'PUT', body: fields });
}

export function deleteUser(userId) {
  return api(`/users/${userId}`, { method: 'DELETE' });
}

// Admin Dashboard and Analytics
export function getDashboardStats() {
  return api('/admin/dashboard');
}

export function getAdminUsers(page = 1, limit = 10) {
  return api(`/admin/users?page=${page}&limit=${limit}`);
}

export function suspendUser(userId) {
  return api(`/admin/users/${userId}/suspend`, { method: 'POST' });
}

export function unsuspendUser(userId) {
  return api(`/admin/users/${userId}/unsuspend`, { method: 'POST' });
}

export function getUserStats(userId) {
  return api(`/admin/users/${userId}/stats`);
}

export function getAnalytics() {
  return api('/admin/analytics');
}

export function exportReports() {
  return api('/admin/reports/export');
}

export function exportUsers() {
  return api('/admin/users/export');
}

export function exportAnalytics() {
  return api('/admin/analytics/export');
}

// Reports API functions
export function getTranslationsReport(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return api(`/admin/reports/translations?${queryString}`);
}

export function exportTranslationsReport(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return api(`/admin/reports/translations/export?${queryString}`);
}

export function getReportsSummary() {
  return api('/admin/reports/summary');
}


