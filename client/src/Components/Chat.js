import React, { useEffect, useState } from 'react';
import User from './User';
import MessagePanel from './MessagePanel';
import socket from '../socket';
import '../styles/Chat.css'

const Chat = () => {
    console.log("SDADAS", socket.connected);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);

    const initReactiveProperties = (user) => {
        user.hasNewMessages = false;
    };

    useEffect(() => {
        const handleConnect = () => {
            const updatedUsers = users.map((user) => {
                if (user.self) {
                    return {
                        ...user,
                        connected: true
                    }
                }
                return user;
            });
            setUsers(updatedUsers);
        };

        const handleDisconnect = () => {
            const updatedUsers = users.map((user) => {
                if (user.self) {
                    return {
                        ...user,
                        connected: false
                    }
                }
                return user;
            });
            setUsers(updatedUsers);
        };

        const handleUsers = (receivedUsers) => {
            let updatedUsers = [];
            receivedUsers.forEach((user) => {
                if (selectedUser && user.userId == selectedUser.userId) {

                    setSelectedUser(prevSelectedUser => ({
                        ...prevSelectedUser,
                        connected: user.connected
                    }))
                }
                let updatedExistingUser = users.find(existingUser => existingUser.userId == user.userId);
                user.self = user.userId === socket.userId;
                if (updatedExistingUser) {
                    updatedUsers.push({
                        ...updatedExistingUser,
                        connected: user.connected
                    })
                } else {
                    initReactiveProperties(user);
                    updatedUsers.push(user);
                }
            });

            const sortedUsers = updatedUsers.sort((a, b) => {
                if (a.self) return -1;
                if (b.self) return 1;
                if (a.userName < b.userName) return -1;
                return a.userName > b.userName ? 1 : 0;
            });

            setUsers(sortedUsers);
        };

        const handleUserConnected = (user) => {
            let found = false;
            const updatedUserList = users.map(userFromCurrentUserList => {
                if (userFromCurrentUserList.userId == user.userId) {
                    found = true;
                    return {
                        ...userFromCurrentUserList,
                        connected: true
                    }
                }
                return {
                    ...userFromCurrentUserList
                }
            })
            if (found) {
                setUsers(updatedUserList)
            } else {
                initReactiveProperties(user);
                setUsers((prevUsers) => [...prevUsers, user]);
            }
        };

        const handleUserDisconnected = (id) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) => {
                    if (user.userId === id) {
                        user.connected = false;
                    }
                    return user;
                })
            );
        };

        const handlePrivateMessage = ({ content, from, to }) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) => {
                    if (user.userId === from) {
                        user.messages.push({
                            content,
                            fromSelf: false,
                            to,
                        });

                        if (user !== selectedUser) {
                            user.hasNewMessages = true;
                        }
                    }
                    return user;
                })
            );
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('users', handleUsers);
        socket.on('user connected', handleUserConnected);
        socket.on('user disconnected', handleUserDisconnected);
        socket.on('private message', handlePrivateMessage);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('users', handleUsers);
            socket.off('user connected', handleUserConnected);
            socket.off('user disconnected', handleUserDisconnected);
            socket.off('private message', handlePrivateMessage);
        };
    }, [selectedUser, users]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        user.hasNewMessages = false;
    };

    useEffect(() => {
        socket.connect();
    }, [])

    console.log(users);

    const handleMessage = (content) => {
        if (selectedUser) {
            socket.emit('private message', {
                content,
                to: selectedUser.userId
            });

            setUsers((prevUsers) => {
                const updatedUsers = [...prevUsers];
                const userIndex = updatedUsers.findIndex((user) => user.userId === selectedUser.userId);

                if (userIndex !== -1) {
                    updatedUsers[userIndex].messages.push({
                        content,
                        fromSelf: true
                    });
                }

                return updatedUsers;
            });
        }
    };

    console.log("selectedUser", selectedUser)

    return (
        <>{users?.length ? <div>
            <div className="left-panel">
                {users.map((user) => (
                    <User
                        key={user.userId}
                        user={user}
                        selected={selectedUser === user}
                        onSelect={() => handleSelectUser(user)}
                    />
                ))}
            </div>
            {selectedUser && (
                <MessagePanel user={selectedUser} onMessage={handleMessage} className="right-panel" />
            )}
        </div> : <p>Loading...</p>}
            <button style={{ marginLeft: "260px" }} onClick={() => { socket.emit("discon", {}) }}>Disconnect</button>
            <button style={{ marginLeft: "260px" }} onClick={() => { socket.connect() }}>Connect</button>
        </>
    );
};

export default Chat;
