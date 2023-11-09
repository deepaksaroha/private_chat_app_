import { io } from 'socket.io-client';

const socket = io(
    'http://localhost:3001',
    { autoConnect: false }
);

socket.on("connect_error", (err) => {
    console.log("some error :", err);
    location.reload();
    localStorage.removeItem("sessionId");
})

socket.onAny((event, ...args) => {
    console.log("fdssdasdasdadad");
    console.log(event, args);
});

export default socket;
