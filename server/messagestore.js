class MessageStore {
    constructor() {
        // super();
        this.messages = [];
    }

    saveMessage(message) {
        this.messages.push(message);
    }

    getAllMessagesForUser(userId) {
        return this.messages.filter(message => message.to == userId);
    }
}

module.exports = {
    MessageStore
}