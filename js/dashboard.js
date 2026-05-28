/**
 * =========================================================================
 * DESKTOP INTERFACE RENDER ENGINE
 * =========================================================================
 */
const DashboardEngine = {
  init() {
    this.renderGroupList();
    this.bindStaticActions();
    AppEventHub.on('groups:mutated', () => {
      this.renderGroupList();
    });
  },

  bindStaticActions() {
    const createBtn = document.getElementById('createNewGroupBtn');
    if (createBtn) {
      createBtn.addEventListener('click', async () => {
        const name = prompt("Enter Study Group Name:");
        const subject = prompt("Enter Academic Subject Area:");
        if (name && subject) {
          await Storage.createGroup(name, subject);
        }
      });
    }
  },

  async renderGroupList() {
    const container = document.querySelector('.groups-list');
    if (!container) return;

    const activeUser = Auth.getCurrentUser();
    if (!activeUser) {
      container.innerHTML = `<div class="state-notice">Please sign in to view your groups.</div>`;
      return;
    }

    try {
      const groups = await Storage.getGroups();

      if (!groups || groups.length === 0) {
        container.innerHTML = `<div class="state-notice">You haven't joined any groups yet. Click "+ Create Group" to begin.</div>`;
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
            <p class="card-description">Collaborative review channel for core modules and mock tests.</p>
            <div class="card-footer-meta">
              <span class="action-link">Open Room &rarr;</span>
            </div>
          </div>`;
      }).join('');

      container.querySelectorAll('.group-card-action').forEach(card => {
        card.addEventListener('click', () => {
          const groupId = card.getAttribute('data-group-id');
          if (typeof openChat === 'function') openChat(groupId);
        });
      });

    } catch (err) {
      console.error('Error loading groups:', err);
      container.innerHTML = `<div class="state-notice">Error loading groups. Make sure backend is running!</div>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => DashboardEngine.init());
