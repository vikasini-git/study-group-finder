/**
 * =========================================================================
 * PEERSTREAM CORE REPOSITORIES & MUTATORS
 * =========================================================================
 */
const Storage = {
  // Initialization hook to inject system defaults if local space is clean
  init() {
    if (!localStorage.getItem('study_groups')) {
      const defaultGroups = [
        { id: "g1", name: "Algorithms Core", subject: "Computer Science", members: ["user-99", "user-02", "user-03"] },
        { id: "g2", name: "Embedded Circuits", subject: "Electrical Engineering", members: ["user-99", "user-05"] },
        { id: "g3", name: "Financial Analytics", subject: "Business & Commerce", members: ["user-02", "user-05"] }
      ];
      localStorage.setItem('study_groups', JSON.stringify(defaultGroups));
    }
    
    if (!localStorage.getItem('user_registry')) {
      const defaultUsers = {
        "user-99": { id: "user-99", name: "Alex", avatar: "A", email: "alex@vardhaman.org" },
        "user-02": { id: "user-02", name: "Sam", avatar: "S", email: "sam@peerstream.dev" },
        "user-03": { id: "user-03", name: "Rahul", avatar: "R", email: "rahul@eng.edu" },
        "user-05": { id: "user-05", name: "Taylor", avatar: "T", email: "taylor@cloud.com" }
      };
      localStorage.setItem('user_registry', JSON.stringify(defaultUsers));
    }
  },

  getGroups() {
    this.init();
    return JSON.parse(localStorage.getItem('study_groups'));
  },

  getGroupById(id) {
    return this.getGroups().find(g => g.id === id) || null;
  },

  getMessages(groupId) {
    const stored = localStorage.getItem(`chat_msg_${groupId}`);
    return stored ? JSON.parse(stored) : [];
  },

  getUserById(userId) {
    this.init();
    const registry = JSON.parse(localStorage.getItem('user_registry'));
    return registry[userId] || { id: userId, name: "External Peer", avatar: "?" };
  },

  saveMessage(groupId, text) {
    const activeUser = Auth.getCurrentUser();
    if (!activeUser || !text.trim()) return null;

    const messages = this.getMessages(groupId);
    const newMessage = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'msg-' + Date.now(),
      userId: activeUser.id,
      text: text.trim(),
      time: Date.now()
    };

    messages.push(newMessage);
    localStorage.setItem(`chat_msg_${groupId}`, JSON.stringify(messages));

    // Notify event stream instantly
    AppEventHub.emit('chat:updated', { groupId, message: newMessage });
    return newMessage;
  },

  createGroup(name, subject) {
    const activeUser = Auth.getCurrentUser();
    if (!activeUser || !name.trim() || !subject.trim()) return null;

    const groups = this.getGroups();
    const newGroup = {
      id: 'g-' + Date.now(),
      name: name.trim(),
      subject: subject.trim(),
      members: [activeUser.id]
    };

    groups.push(newGroup);
    localStorage.setItem('study_groups', JSON.stringify(groups));

    // Notify ecosystem grid to update card interfaces dynamically
    AppEventHub.emit('groups:mutated', { newGroup });
    return newGroup;
  }
};

// Auto boot core dataset references
Storage.init();