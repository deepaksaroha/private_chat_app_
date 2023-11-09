import React from 'react';
import StatusIcon from './StatusIcon';
import '../styles/User.css';

const User = ({ user, selected, onSelect }) => {
  const status = user.connected ? 'online' : 'offline';

  return (
    <div className={`user ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="description">
        <div className="name">
          {user.userName} {user.self ? ' (yourself)' : ''}
        </div>
        <div className="status">
          <StatusIcon connected={user.connected} /> {status}
        </div>
      </div>
      {user.hasNewMessages && <div className="new-messages">!</div>}
    </div>
  );
};

export default User;
