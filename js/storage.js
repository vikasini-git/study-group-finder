/**
 * =========================================================================
 * PEERSTREAM CORE REPOSITORIES & MUTATORS
 * =========================================================================
 */
const Storage = {

  getGroups() {
    return fetch('http://127.0.0.1:5000/api/groups', {
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
    }).then(res => res.json());
  },

  getGroupById(id) {
    return fetch('http://127.0.0.1:5000/api/groups/' + id, {
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
    }).then(res => res.json());
  },

  getMessages(groupId) {
    return fetch('http://127.0.0.1:5000/api/messages/' + groupId, {
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
    }).then(res => res.json());
  },

  getUserById(userId) {
    return fetch('http://127.0.0.1:5000/api/students/' + userId, {
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
    }).then(res => res.json());
  },

  saveMessage(groupId, text) {
    if (!text.trim()) return null;
    return fetch('http://127.0.0.1:5000/api/messages/' + groupId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Auth.getToken()
      },
      body: JSON.stringify({ content: text.trim() })
    }).then(res => res.json());
  },

  createGroup(name, subject) {
    return fetch('http://127.0.0.1:5000/api/groups/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Auth.getToken()
      },
      body: JSON.stringify({ name, subject, mode: 'ONLINE' })
    }).then(res => res.json()).then(newGroup => {
      AppEventHub.emit('groups:mutated', { newGroup });
      return newGroup;
    });
  }
};
