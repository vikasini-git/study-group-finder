/**
 * =========================================================================
 * APPLICATION AUTHENTICATION SECURITY LAYER
 * =========================================================================
 */
const Auth = {
  SESSION_KEY: 'peerstream_session',

  getCurrentUser() {
    const session = localStorage.getItem(this.SESSION_KEY);
    if (!session) return null;
    return JSON.parse(session);
  },

  async login(email, password) {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    this.establishSession({
      id: data.student.id,
      name: data.student.name,
      email: data.student.email,
      token: data.token,
      avatar: data.student.name[0].toUpperCase()
    });
    return data;
  },

  async register(name, email, password) {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    this.establishSession({
      id: data.student.id,
      name: data.student.name,
      email: data.student.email,
      token: data.token,
      avatar: data.student.name[0].toUpperCase()
    });
    return data;
  },

  establishSession(userObject) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(userObject));
    AppEventHub.emit('auth:stateChange', { user: userObject });
  },

  terminateSession() {
    localStorage.removeItem(this.SESSION_KEY);
    AppEventHub.emit('auth:stateChange', { user: null });
    window.location.href = 'login.html';
  },

  getToken() {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  },

  validateAuthenticationGuard() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Update layout metadata if login shifts
AppEventHub.on('auth:stateChange', (e) => {
  const profileContainer = document.querySelector('.user-profile-summary');
  if (!profileContainer) return;
  if (e.detail.user) {
    const nameEl = document.querySelector('.user-name');
    const avatarEl = document.querySelector('.user-avatar');
    if (nameEl) nameEl.textContent = escapeHtml(e.detail.user.name);
    if (avatarEl) avatarEl.textContent = escapeHtml(e.detail.user.avatar);
  }
});
