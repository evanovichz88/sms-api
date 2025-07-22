const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const DATA_FILE = 'messages.json';
let messages = [];
if (fs.existsSync(DATA_FILE)) {
  messages = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { sender, message, datetime } = req.body;
  const msg = {
    sender: sender || '',
    message: message || '',
    datetime: datetime || new Date().toISOString(),
  };
  messages.push(msg);
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
  res.json({ success: true, msg });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
