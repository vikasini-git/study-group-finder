/**
 * =========================================================================
 * 1. GLOBAL CORE ARCHITECTURE & STATE
 * =========================================================================
 */
let activeChatGroupId = null;
let currentChatListener = null;
let socket = null;

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
 * 2. SOCKET.IO INITIALIZATION
 * =========================================================================
 */
function initSocket() {
  socket = io('http://127.0.0.1:5000');

  socket.on('connect', () => {
    console.log('Connected to Socket.io server');
  });

  socket.on('newMessage', (msg) => {
    if (msg.groupId === activeChatGroupId) {
      appendSingleMessage(msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
}

/**
 * =========================================================================
 * 3. APPLICATION SECTIONS INITIALIZERS
 * =========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  initSocket();
  initGlobalModalListeners();
  initDashboard();
  initNotes();
  initChatPanel();
  renderAISuggestions();
});

function initGlobalModalListeners() {
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
      // Notes handling logic
    });
  }
}

function initChatPanel() {
  const sendBtn = document.getElementById('sendMsgBtn');
  const msgInput = document.getElementById('msgInput');
  const chatClose = document.getElementById('chatClose');

  if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);

  if (msgInput) {
    msgInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (chatClose) chatClose.addEventListener('click', closeChatPanel);
}

/**
 * =========================================================================
 * 4. CHAT INTERACTION ENGINE (Socket.io)
 * =========================================================================
 */
function openChat(groupId) {
  activeChatGroupId = groupId;

  Storage.getGroupById(groupId).then(group => {
    if (!group) return;

    document.getElementById('chatGroupName').textContent = group.name;
    document.getElementById('chatGroupSubject').textContent = group.subject;
    document.getElementById('chatMemberCount').textContent = group.members
      ? group.members.length + ' members'
      : '';

    // Join Socket.io room
    if (socket) socket.emit('joinGroup', groupId);

    renderChatMessages(groupId);
    openModal('chatModal');
  });
}

function closeChatPanel() {
  activeChatGroupId = null;
  closeModal('chatModal');
}

function sendChatMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !activeChatGroupId) return;

  const text = input.value.trim();
  if (!text) return;

  const user = Auth.getCurrentUser();

  // Send via Socket.io for real-time
  if (socket) {
    socket.emit('sendMessage', {
      groupId: activeChatGroupId,
      studentId: user.id,
      content: text
    });
  }

  input.value = '';
}

async function renderChatMessages(groupId) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const messages = await Storage.getMessages(groupId);

  if (!messages || messages.length === 0) {
    container.innerHTML = `<div class="chat-empty">No messages yet. Start the conversation!</div>`;
    return;
  }

  container.innerHTML = messages.map(m => {
    const user = Auth.getCurrentUser();
    const isMine = m.student_id === user.id;
    return `
      <div class="message ${isMine ? 'mine' : 'theirs'}">
        <div class="msg-bubble">
          <div class="msg-text">${escapeHtml(m.content)}</div>
          <div class="msg-time">${formatTime(m.sent_at)}</div>
        </div>
      </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function appendSingleMessage(message) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const emptyState = container.querySelector('.chat-empty');
  if (emptyState) emptyState.remove();

  const user = Auth.getCurrentUser();
  const isMine = message.studentId === user.id;

  const messageHTML = `
    <div class="message ${isMine ? 'mine' : 'theirs'}">
      <div class="msg-bubble">
        <div class="msg-text">${escapeHtml(message.content)}</div>
        <div class="msg-time">${formatTime(Date.now())}</div>
      </div>
    </div>`;

  container.insertAdjacentHTML('beforeend', messageHTML);
  container.scrollTop = container.scrollHeight;
}

/**
 * =========================================================================
 * 5. AI SUGGESTIONS
 * =========================================================================
 */
async function renderAISuggestions() {
  const container = document.getElementById('aiSuggestionsContainer');
  if (!container) return;

  const user = Auth.getCurrentUser();
  if (!user) return;

  try {
    const res = await fetch('http://127.0.0.1:5000/api/groups/match', {
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
    });
    const matches = await res.json();

    if (!matches || matches.length === 0) {
      container.innerHTML = `<div class="ai-suggestion-card"><p>No matches found yet. Join more groups!</p></div>`;
      return;
    }

    container.innerHTML = matches.slice(0, 3).map(g => `
      <div class="ai-suggestion-card">
        <h4>${escapeHtml(g.name)}</h4>
        <p>Subject: ${escapeHtml(g.subject)}</p>
        <p>Match Score: ${g.matchScore} skill gaps filled</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('AI match error:', err);
  }
}

/**
 * =========================================================================
 * 6. UTILITIES
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
