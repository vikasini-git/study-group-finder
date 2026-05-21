/**
 * =========================================================================
 * 1. GLOBAL CORE ARCHITECTURE & STATE
 * =========================================================================
 */
const currentUser = {
  id: "user-99",
  name: "Alex",
  avatar: "A",
  subject: "Computer Science" // Fallback affinity for AI recommendations
};

let activeChatGroupId = null;
let currentChatListener = null;

/**
 * Global App Event Hub (Standard DOM Custom Events)
 * Replaces old setInterval loops with instantaneous reactive updates.
 */
const AppEventHub = {
  emit(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { 
      detail,
      bubbles: true,
      cancelable: true 
    });
    window.dispatchEvent(event);
  },
  on(eventName, callback) {
    window.addEventListener(eventName, callback);
  },
  off(eventName, callback) {
    window.removeEventListener(eventName, callback);
  }
};

/**
 * =========================================================================
 * 2. DATA LAYER (MOCK ENHANCED STORAGE UTILITY)
 * =========================================================================
 */
const Storage = {
  getGroupById(id) {
    const groups = this.getGroups();
    return groups.find(g => g.id === id) || null;
  },

  getGroups() {
    const defaultGroups = [
      { id: "g1", name: "Algorithms Core", subject: "Computer Science", members: ["user-99", "user-02"] },
      { id: "g2", name: "Embedded Circuits", subject: "Electrical Engineering", members: ["user-05"] }
    ];
    const stored = localStorage.getItem('study_groups');
    return stored ? JSON.parse(stored) : defaultGroups;
  },

  getMessages(groupId) {
    const stored = localStorage.getItem(`chat_msg_${groupId}`);
    return stored ? JSON.parse(stored) : [];
  },

  getUserById(userId) {
    const users = {
      "user-99": { id: "user-99", name: "Alex", avatar: "A" },
      "user-02": { id: "user-02", name: "Sam", avatar: "S" },
      "user-05": { id: "user-05", name: "Taylor", avatar: "T" }
    };
    return users[userId] || { id: userId, name: "Student", avatar: "?" };
  },

  saveMessage(groupId, text) {
    if (!text.trim()) return null;
    const messages = this.getMessages(groupId);
    const newMessage = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'msg-' + Date.now(),
      userId: currentUser.id,
      text: text,
      time: Date.now()
    };
    
    messages.push(newMessage);
    localStorage.setItem(`chat_msg_${groupId}`, JSON.stringify(messages));
    
    // Broadcast creation to instantly update views across the engine
    AppEventHub.emit('chat:updated', { groupId, message: newMessage });
    return newMessage;
  }
};

/**
 * =========================================================================
 * 3. APPLICATION SECTIONS INITIALIZERS
 * =========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  initGlobalModalListeners();
  initDashboard();
  initNotes();
  initChatPanel();
  
  // Render base visual states on start
  renderAISuggestions();
});

function initGlobalModalListeners() {
  // Catch general user escape key commands to ensure background memory teardowns trigger
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeChatGroupId) {
      closeChatPanel();
    }
  });
}

function initDashboard() {
  const groupCards = document.querySelectorAll('.group-card-action');
  groupCards.forEach(card => {
    card.addEventListener('click', () => {
      const groupId = card.getAttribute('data-group-id');
      if (groupId) openChat(groupId);
    });
  });
}

function initNotes() {
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      // Custom application notes handling logic here
    });
  }
}

function initChatPanel() {
  const sendBtn = document.getElementById('sendMsgBtn');
  const msgInput = document.getElementById('msgInput');
  const chatClose = document.getElementById('chatClose');

  if (sendBtn) {
    sendBtn.addEventListener('click', sendChatMessage);
  }
  
  if (msgInput) {
    msgInput.addEventListener('keydown', e => { 
      if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        sendChatMessage(); 
      }
    });
  }
  
  if (chatClose) {
    chatClose.addEventListener('click', closeChatPanel);
  }
}

/**
 * =========================================================================
 * 4. CHAT INTERACTION ENGINE
 * =========================================================================
 */
function openChat(groupId) {
  activeChatGroupId = groupId;
  const group = Storage.getGroupById(groupId);
  if (!group) return;

  // Build out static framework fields
  document.getElementById('chatGroupName').textContent = group.name;
  document.getElementById('chatGroupSubject').textContent = group.subject;
  document.getElementById('chatMemberCount').textContent = `${group.members.length} members`;

  // Render historically available records on load
  renderChatMessages(groupId);
  openModal('chatModal');

  // Clear existing dynamic listeners to maintain clean pipeline memory bounds
  if (currentChatListener) {
    AppEventHub.off('chat:updated', currentChatListener);
  }

  // Define situational action response matching target group updates
  currentChatListener = (event) => {
    if (event.detail.groupId === groupId) {
      appendSingleMessage(event.detail.message);
    }
  };

  // Bind listener to custom app stream event
  AppEventHub.on('chat:updated', currentChatListener);
}

function closeChatPanel() {
  if (currentChatListener) {
    AppEventHub.off('chat:updated', currentChatListener);
    currentChatListener = null;
  }
  activeChatGroupId = null;
  closeModal('chatModal');
}

function sendChatMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !activeChatGroupId) return;

  const text = input.value.trim();
  if (!text) return;

  Storage.saveMessage(activeChatGroupId, text);
  input.value = '';
}

function renderChatMessages(groupId) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  const messages = Storage.getMessages(groupId);

  if (messages.length === 0) {
    container.innerHTML = `<div class="chat-empty">No messages yet. Start the conversation!</div>`;
    return;
  }
  
  container.innerHTML = messages.map(m => {
    const user = Storage.getUserById(m.userId);
    const isMine = m.userId === currentUser.id;
    return `
      <div class="message ${isMine ? 'mine' : 'theirs'}">
        ${!isMine ? `<div class="msg-avatar" style="background:${avatarColor(user?.avatar || '?')}">${user?.avatar || '?'}</div>` : ''}
        <div class="msg-bubble">
          ${!isMine ? `<div class="msg-sender">${user?.name || 'Unknown'}</div>` : ''}
          <div class="msg-text">${escapeHtml(m.text)}</div>
          <div class="msg-time">${formatTime(m.time)}</div>
        </div>
      </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function appendSingleMessage(message) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  // Clear empty state text block if present
  const emptyState = container.querySelector('.chat-empty');
  if (emptyState) emptyState.remove();

  const isMine = message.userId === currentUser.id;
  const user = Storage.getUserById(message.userId);

  const messageHTML = `
    <div class="message ${isMine ? 'mine' : 'theirs'}">
      ${!isMine ? `<div class="msg-avatar" style="background:${avatarColor(user?.avatar || '?')}">${user?.avatar || '?'}</div>` : ''}
      <div class="msg-bubble">
        ${!isMine ? `<div class="msg-sender">${user?.name || 'Unknown'}</div>` : ''}
        <div class="msg-text">${escapeHtml(message.text)}</div>
        <div class="msg-time">${formatTime(message.time)}</div>
      </div>
    </div>`;

  container.insertAdjacentHTML('beforeend', messageHTML);
  container.scrollTop = container.scrollHeight;
}

/**
 * =========================================================================
 * 5. AUXILIARY VIEW DISPLAY COMPONENT BUILDERS
 * =========================================================================
 */
function renderAISuggestions() {
  const container = document.getElementById('aiSuggestionsContainer');
  if (!container) return;

  const groups = Storage.getGroups();
  const affinitySubject = groups.length > 0 ? groups[0].subject : currentUser.subject;

  container.innerHTML = `
    <div class="ai-suggestion-card">
      <h4>Recommended Strategy for ${escapeHtml(affinitySubject)}</h4>
      <p>Based on your active review clusters, dedicating 25 minutes to spaced-repetition modules today will maximize retention curves before upcoming midterms.</p>
    </div>`;
}

/**
 * =========================================================================
 * 6. SECURITY UTILITIES & NATIVE UI PARSERS
 * =========================================================================
 */
function openModal(id) {
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block'; 
  }
}

function closeModal(id) {
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('active');
    target.style.display = 'none';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function avatarColor(char) {
  const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const code = char.charCodeAt(0) || 0;
  return colors[code % colors.length];
}