require('dotenv').config()
const { Socket } = require('engine.io');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let user1choice;
let user2choice;
let switcher;
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
//стартира сървъра на порт 3000
server.listen(process.env.PORT || 3001 , function () {
  console.log('Server is ready and listening on 3000');
});
const users = [];
io.on('connection', (socket) => {
  socket.emit("hello", socket.id);
  let newID = socket.id;
  //при появата на 3-ти играч функцията премахва първия
  // и премества втория на първото място за да има място за новия играч
  function cleaner() {
    if (users.length < 2) {
      users.push(newID)
    } else {
      users.shift() && users.push(newID);
    }
    switcher = true;
  } cleaner()
  let user1 = users[0];
  let user2 = users[1];
  if (socket.id == users[0]) {
    socket.emit("potrebitel", users[0]);
  } else {
    socket.emit("potrebitel", users[1]);
  };
  socket.join("room1");
  io.in("room1").emit("same room check", "in the same room");
  if (switcher == true) {
    user1choice = "";
    user2choice = "";
    socket.on("match", (id, choice) => {
      if (id == users[0]) {
        user1choice = choice;
      };
      if (id == users[1]) {
        user2choice = choice;
        choice = null;
      };
      if (user1choice !== "" && user2choice !== "") {
        checker(user1choice, user2choice)
      } else {
      }
    });
  }//логиката проверяваща кой печели и кой губи
  function checker(user1choice, user2choice) {
    if (user1choice == "rock" && user2choice == "rock") {
      io.in("room1").emit("draw", "draw");
    } else if (user1choice == "rock" && user2choice == "paper") {
      io.in("room1").emit("tester1", users[0], users[1]);
    } else if (user1choice == "rock" && user2choice == "scissors") {
      io.in("room1").emit("tester1", users[1], users[0]);
    } else if (user1choice == "paper" && user2choice == "rock") {
      io.in("room1").emit("tester1", users[1], users[0]);
    } else if (user1choice == "paper" && user2choice == "paper") {
      io.in("room1").emit("draw", "draw");
    } else if (user1choice == "paper" && user2choice == "scissors") {
      io.in("room1").emit("tester1", users[0], users[1]);
    } else if (user1choice == "scissors" && user2choice == "rock") {
      io.in("room1").emit("tester1", users[0], users[1]);
    } else if (user1choice == "scissors" && user2choice == "paper") {
      io.in("room1").emit("tester1", users[1], users[0]);
    } else if (user1choice == "scissors" && user2choice == "scissors") {
      io.in("room1").emit("draw", "draw");
    }
  }
});
