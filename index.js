const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const { Telegraf } = require("telegraf");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;
app.use(cors());
// Initialize SQLite database
const db = new sqlite3.Database(":memory:");

// Create a table to store data
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT)"
  );
});

// Initialize Telegraf bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Start the bot polling for updates
bot.launch();

// Configure Express to parse JSON body
app.use(bodyParser.json());

// Endpoint to receive phone number and name
app.post("/addUser", (req, res) => {
  const { name, phone } = req.body;

  // Insert the received data into the database
  db.run(
    "INSERT INTO users (name, phone) VALUES (?, ?)",
    [name, phone],
    (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(201).json({ message: "User added successfully" });
    }
  );
  bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, `${name} ${phone}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
