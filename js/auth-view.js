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

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginError');

    errorBox.style.display = 'none';

    if (!email || !password) {
      this.showError(errorBox, "All fields are required.");
      return;
    }

    try {
      await Auth.login(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      this.showError(errorBox, err.message);
    }
  },

  async handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorBox = document.getElementById('signupError');

    errorBox.style.display = 'none';

    if (!name || !email || !password) {
      this.showError(errorBox, "All fields are required.");
      return;
    }

    if (password.length < 6) {
      this.showError(errorBox, "Password must be at least 6 characters.");
      return;
    }

    try {
      await Auth.register(name, email, password);
      window.location.href = 'index.html';
    } catch (err) {
      this.showError(errorBox, err.message);
    }
  },

  showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }
};

document.addEventListener('DOMContentLoaded', () => AuthViewController.init());
