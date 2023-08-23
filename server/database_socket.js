require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const { log } = require("console");

app.use(cors());

const server = http.createServer(app);
// database

const uri = process.env.MONGODB_URI;

async function search(latitude, longitude) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("users");
    const users = database.collection("infos");

    const cursor = users.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      },
    });
    const result = await cursor.toArray();

    return result;
  } finally {
    await client.close();
  }
}

async function save(id, latitude, longitude, topItems) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    if (typeof id !== "string") {
      id = String(id);
    }

    const database = client.db("users");
    const users = database.collection("infos");
    const existingUser = await users.findOne({ id: id });
    if (existingUser) {
      await users.updateOne(
        { id: id },
        {
          $set: {
            "location.coordinates": [
              parseFloat(longitude),
              parseFloat(latitude),
            ],
            topItems: topItems,
          },
        }
      );
      return;
    }
    await users.insertOne({
      id: id,
      topItems: topItems,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });
  } finally {
    await client.close();
  }
}

app.use(express.json());

app.get("/search", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "Please provide latitude and longitude as query parameters",
    });
  }
  try {
    const result = await search(parseFloat(latitude), parseFloat(longitude));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/save", async (req, res) => {
  const { id, latitude, longitude, topItems } = req.body;
  if (!id || !latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields in body" });
  }
  try {
    await save(id, latitude, longitude, topItems);
    res.json({ message: "User info saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// socket.io

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// userID: socketID
const activeSockets = {};
// sortedUserIDPair: [{message: message, sender: userID}, ...]
const chatHistories = {};

io.on("connection", (socket) => {
  const userID = socket.handshake.auth.userID;
  activeSockets[userID] = socket.id;

  io.emit("sendActiveUsers", activeSockets);

  socket.on("requestChatHistory", (otherUser) => {
    const sortedUsernames = [otherUser, userID].sort();
    const chatHistoryKey = sortedUsernames[0] + sortedUsernames[1];
    if (chatHistoryKey in chatHistories) {
      socket.emit("deliverChatHistory", chatHistories[chatHistoryKey]);
    } else {
      socket.emit("deliverChatHistory", []);
    }
  });

  socket.on("sendMessage", (data) => {
    const message = data.message;
    const otherUser = data.user;
    const timeStamp = new Date();

    socket.broadcast.to(activeSockets[otherUser]).emit("deliverMessage", {
      message: data.message,
      sender: userID,
      timeStamp: timeStamp.toISOString(),
    });

    const sortedUsernames = [otherUser, userID].sort();
    const chatHistoryKey = sortedUsernames[0] + sortedUsernames[1];

    if (chatHistoryKey in chatHistories) {
      chatHistories[chatHistoryKey].push({
        message: message,
        sender: userID,
        timeStamp: timeStamp.toISOString(),
      });
    } else {
      chatHistories[chatHistoryKey] = [
        {
          message: message,
          sender: userID,
          timeStamp: timeStamp.toISOString(),
        },
      ];
    }
    console.log(chatHistories);
  });

  socket.on("disconnect", () => {
    delete activeSockets[userID];
    io.emit("sendActiveUsers", activeSockets);
  });
});

server.listen(3001, () => console.log("Listening on 3001"));
