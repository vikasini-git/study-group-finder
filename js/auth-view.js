/**
 * =========================================================================
 * AUTHENTICATION VIEW GATEWAY CONTROLLER
 * =========================================================================
 */
const AuthViewController = {
  init() {
    this.bindFlipAnimations();
    this.bindFormSubmissions();
  },

  bindFlipAnimations() {
    const flipper = document.getElementById('authFlipper');
    const toSignup = document.getElementById('toSignupBtn');
    const toLogin = document.getElementById('toLoginBtn');

    if (toSignup && flipper) {
      toSignup.addEventListener('click', () => flipper.classList.add('flipped'));
    }
    if (toLogin && flipper) {
      toLogin.addEventListener('click', () => flipper.classList.remove('flipped'));
    }
  },

  bindFormSubmissions() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));
  },

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginError');

    errorBox.style.display = 'none';

    if (!email || !password) {
      this.showError(errorBox, "All password and identity fields are strictly required.");
      return;
    }

    // Access local user registries stored within our storage utility
    const users = JSON.parse(localStorage.getItem('user_registry')) || {};
    const matchedUser = Object.values(users).find(u => u.email === email);

    // In a full system, verify password hashes. Here we simulate validation criteria:
    if (!matchedUser || password.length < 4) {
      this.showError(errorBox, "Invalid credentials or account mismatch exception.");
      return;
    }

    // Initialize session state tracking
    Auth.establishSession({
      id: matchedUser.id,
      name: matchedUser.name,
      avatar: matchedUser.avatar || matchedUser.name[0].toUpperCase(),
      subject: matchedUser.subject || "Computer Science"
    });

    window.location.href = 'index.html';
  },

  handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const subject = document.getElementById('signupSubject').value;
    const password = document.getElementById('signupPassword').value;
    const errorBox = document.getElementById('signupError');

    errorBox.style.display = 'none';

    if (!name || !email || !subject || !password) {
      this.showError(errorBox, "Complete all registration fields to construct profile container.");
      return;
    }

    if (password.length < 6) {
      this.showError(errorBox, "Security protocol error: Password must encompass at least 6 characters.");
      return;
    }

    const users = JSON.parse(localStorage.getItem('user_registry')) || {};
    const emailExists = Object.values(users).some(u => u.email === email);

    if (emailExists) {
      this.showError(errorBox, "This institutional email address is already bound to an active registry.");
      return;
    }

    // Generate unique ID schema safely
    const newUserId = 'user-' + Date.now();
    users[newUserId] = {
      id: newUserId,
      name,
      email,
      subject,
      avatar: name[0].toUpperCase()
    };
    
    // Persist registration update 
    localStorage.setItem('user_registry', JSON.stringify(users));

    // Sign in automatically
    Auth.establishSession({
      id: newUserId,
      name,
      avatar: name[0].toUpperCase(),
      subject: subject
    });

    window.location.href = 'index.html';
  },

  showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }
};

document.addEventListener('DOMContentLoaded', () => AuthViewController.init());