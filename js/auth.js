/**
 * =========================================================================
 * APPLICATION AUTHENTICATION SECURITY LAYER
 * =========================================================================
 */
const Auth = {
  SESSION_KEY: 'peerstream_session',

  getCurrentUser() {
    const session = localStorage.getItem(this.SESSION_KEY);
    if (!session) {
      // Fallback placeholder mock configuration profile injection
      const defaultUser = {
        id: "user-99",
        name: "Alex",
        avatar: "A",
        subject: "Computer Science"
      };
      this.establishSession(defaultUser);
      return defaultUser;
    }
    return JSON.parse(session);
  },

  establishSession(userObject) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(userObject));
    AppEventHub.emit('auth:stateChange', { user: userObject });
  },

  terminateSession() {
    localStorage.removeItem(this.SESSION_KEY);
    AppEventHub.emit('auth:stateChange', { user: null });
    window.location.reload();
  },

  validateAuthenticationGuard() {
    const user = this.getCurrentUser();
    if (!user) {
      console.warn("Unauthorized access exception intercept. Routing context to landing shell.");
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
    document.querySelector('.user-name').textContent = escapeHtml(e.detail.user.name);
    document.querySelector('.user-avatar').textContent = escapeHtml(e.detail.user.avatarated || e.detail.user.name[0]);
  }
});
