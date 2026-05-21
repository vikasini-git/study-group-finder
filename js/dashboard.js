/**
 * =========================================================================
 * DESKTOP INTERFACE RENDER ENGINE
 * =========================================================================
 */
const DashboardEngine = {
  init() {
    this.renderGroupList();
    this.bindStaticActions();

    // Intercept storage updates to perform clean updates
    AppEventHub.on('groups:mutated', () => {
      this.renderGroupList();
    });
  },

  bindStaticActions() {
    const createBtn = document.getElementById('createNewGroupBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const name = prompt("Enter Study Group Name:");
        const subject = prompt("Enter Academic Subject Area:");
        if (name && subject) {
          Storage.createGroup(name, subject);
        }
      });
    }
  },

  renderGroupList() {
    const container = document.querySelector('.groups-list');
    if (!container) return;

    const activeUser = Auth.getCurrentUser();
    if (!activeUser) {
      container.innerHTML = `<div class="state-notice">Please sign in to view your clusters.</div>`;
      return;
    }

    const groups = Storage.getGroups().filter(g => g.members.includes(activeUser.id));

    if (groups.length === 0) {
      container.innerHTML = `<div class="state-notice">You haven't joined any clusters yet. Click "+ Create Group" to begin.</div>`;
      return;
    }

    container.innerHTML = groups.map(group => {
      const badgeClass = group.subject.toLowerCase().includes('computer') ? 'badge-cs' : 'badge-ee';
      return `
        <div class="group-card-action" data-group-id="${group.id}">
          <div class="card-header-block">
            <span class="badge ${badgeClass}">${escapeHtml(group.subject)}</span>
            <h4>${escapeHtml(group.name)}</h4>
          </div>
          <p class="card-description">Collaborative review channel for handling core modules, formulas, and mock test checks.</p>
          <div class="card-footer-meta">
            <span class="member-indicator">${group.members.length} Active Members</span>
            <span class="action-link">Open Room &rarr;</span>
          </div>
        </div>
      `;
    }).join('');

    // Wire up listeners to new cards
    container.querySelectorAll('.group-card-action').forEach(card => {
      card.addEventListener('click', () => {
        const groupId = card.getAttribute('data-group-id');
        if (typeof openChat === 'function') openChat(groupId);
      });
    });
  }
};

// Mount runtime execution
document.addEventListener('DOMContentLoaded', () => DashboardEngine.init());