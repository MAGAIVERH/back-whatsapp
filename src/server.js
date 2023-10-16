/*
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 4000;

const users = [];

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const userIndex = users.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      const removedUser = users.splice(userIndex, 1)[0];
      io.emit('message', {
        name: removedUser.name,
        message: 'saiu do chat',
      });
      io.emit('users', users);
    }
  });

  socket.on('join', (name) => {
    const user = { id: socket.id, name, color: getRandomColor() };
    users.push(user);
    io.emit('message', { name: name, message: 'entrou no chat' });
    io.emit('users', users);
  });


  socket.on('message', (message) => {
    io.emit('message', message);
  });
});

server.listen(port, () => console.log(`Servidor rodando na porta ${port}`));


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  module.exports = { getRandomColor };

*/const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 4000;

const users = [];
const privateChats = {};

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);

    const userIndex = users.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      const removedUser = users.splice(userIndex, 1)[0];
      io.emit('message', {
        name: removedUser.name,
        message: 'saiu do chat',
      });
      io.emit('users', users);
    }
  });

  socket.on('join', (name) => {
    console.log('Cliente se juntou:', name);

    const user = { id: socket.id, name, color: getRandomColor() };
    users.push(user);
    io.emit('message', { name: name, message: 'entrou no chat' });
    io.emit('users', users);
  });

  socket.on('message', (message) => {
    console.log('Mensagem recebida:', message);

    if (message.recipient && privateChats[message.recipient]) {
      privateChats[message.recipient].forEach((userSocketId) => {
        io.to(userSocketId).emit('message', message);
      });
    } else {
      io.emit('message', message);
    }
  });

  socket.on('start private chat', (recipient) => {
    console.log(`Iniciando chat privado entre ${socket.id} e ${recipient}`);

    if (!privateChats[recipient]) {
      privateChats[recipient] = [socket.id];
      if (!privateChats[socket.id]) {
        privateChats[socket.id] = [recipient];
      } else {
        privateChats[socket.id].push(recipient);
      }
    }
  });

  socket.on('back to group chat', () => {
    console.log(`Voltando ao chat em grupo: ${socket.id}`);

    if (privateChats[socket.id]) {
      privateChats[socket.id].forEach((recipient) => {
        const recipientSocket = io.sockets.sockets[recipient];
        if (recipientSocket) {
          recipientSocket.leave(socket.id);
        }
      });
      delete privateChats[socket.id];
    }
  });
});

server.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = { getRandomColor };
