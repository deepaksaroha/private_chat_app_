import React, { useState } from 'react';
import StatusIcon from './StatusIcon';
import '../styles/MessagePanel.css';

const MessagePanel = ({ user, onMessage, className }) => {
    const [input, setInput] = useState('');

    const displaySender = (message, index) => {
        return index === 0 || user.messages[index - 1].fromSelf !== message.fromSelf;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input) {
            onMessage(input);
            setInput('');
        }
    };

    const isValid = input.length > 0;

    return (
        <div className={className}>
            <div className="header">
                <StatusIcon connected={user.connected} /> {user.userName}
            </div>

            <ul className="messages">
                {user.messages.map((message, index) => (
                    <li key={index} className="message">
                        {displaySender(message, index) && (
                            <div className="sender">
                                {message.fromSelf ? '(yourself)' : user.userName}
                            </div>
                        )}
                        {message.content}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className="form">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Your message..."
                    className="input"
                />
                <button type="submit" disabled={!isValid} className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default MessagePanel;
