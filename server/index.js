const http = require("http");
const httpServer = http.createServer();
const io = require("socket.io");
const { InMemorySessionStore } = require("./inmemorystore");
const { v4 } = require('uuid');
const { MessageStore } = require("./messagestore");

const sessionStore = new InMemorySessionStore();
const messageStore = new MessageStore();

const socketServer = io(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

socketServer.use((socket, next) => {
  const sessionId = socket.handshake.auth.sessionId;
  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userId = session.userId;
      socket.userName = session.userName;
      return next();
    }
  }

  const userName = socket.handshake.auth.userName;
  if (!userName) {
    return next(new Error("invalid username"));
  }
  socket.sessionId = v4();
  socket.userId = v4();
  socket.userName = userName;
  next();
});

socketServer.on("connection", (socket) => {
  console.log("connection event");
  //save session
  sessionStore.saveSession(socket.sessionId, {
    userId: socket.userId,
    userName: socket.userName,
    connected: true
  })
  //sending session info to user
  socket.emit("session", {
    sessionId: socket.sessionId,
    userId: socket.userId
  })

  //join each socket connection from one user to same
  socket.join(socket.userId);

  //messages for user
  const messagePerUser = new Map();
  messageStore.getAllMessagesForUser(socket.userId)
  .forEach(message => {
    const { from, to } = message;
    const otherUser = socket.userId === from ? to : from;
    if(messagePerUser.get(otherUser)){
      messagePerUser.get(otherUser).push(message);
    }else{
      messagePerUser.set(otherUser, [message]);
    }
  })

  // fetch existing users
  const users = [];
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userId: session.userId,
      userName: session.userName,
      connected: session.connected,
      messages: messagePerUser.get(session.userId) || []
    })
  })
  console.log(users);
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userId: socket.userId,
    userName: socket.userName,
    connected: true,
    messages: []
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    const message = {
      content,
      from: socket.userId,
      to,
    }
    socket.to(to).to(socket.userId).emit("private message", message);
    messageStore.saveMessage(message);
    console.log(messageStore);
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await socketServer.in(socket.userId).allSockets();
    
    console.log("disconnect event");
    const isDisconnected = matchingSockets.size == 0;
    if (isDisconnected) {
      //emit a 'user disconnected' event indicating that user with this id does not have any active sessions
      socket.broadcast.emit("user disconnected", socket.userId);
      sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        userName: socket.userName,
        connected: false
      })
    }
  });

  socket.on("discon", async () => {
    console.log("sokcet : :: ", socket);
    socket.disconnect();
    const matchingSockets = await socketServer.in(socket.userId).allSockets();
    
    console.log("disconnect event", matchingSockets);
    const isDisconnected = matchingSockets.size == 0;
    if (isDisconnected) {
      //emit a 'user disconnected' event indicating that user with this id does not have any active sessions
      socket.broadcast.emit("user disconnected", socket.userId);
      sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        userName: socket.userName,
        connected: false
      })
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);