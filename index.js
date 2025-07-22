const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'messages.json');
let messages = [];

function loadMessages() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      messages = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch {
      messages = [];
    }
  } else {
    messages = [];
  }
}
loadMessages();

// حذف الرسائل اللي بقالها أكتر من 6 ساعات
function cleanOldMessages() {
  const now = Date.now();
  const sixHours = 6 * 60 * 60 * 1000;
  const filtered = messages.filter(msg => {
    if (!msg.datetime) return false;
    const msgTime = new Date(msg.datetime).getTime();
    return (now - msgTime) < sixHours;
  });
  if (filtered.length !== messages.length) {
    messages = filtered;
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
  }
}
// كل 10 دقايق ينضف الرسائل القديمة
setInterval(cleanOldMessages, 10 * 60 * 1000);

// API: رجع كل الرسائل
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API: أضف رسالة جديدة
app.post('/api/messages', (req, res) => {
  const { sender, message, datetime } = req.body;
  const msg = { sender, message, datetime: datetime || new Date().toISOString() };
  messages.push(msg);
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
  res.json({ success: true, msg });
});

// API: حذف رسالة معينة (بالـindex في الأرج)
app.delete('/api/messages/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  if (!isNaN(idx) && idx >= 0 && idx < messages.length) {
    const removed = messages.splice(idx, 1)[0];
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
    res.json({ success: true, removed });
  } else {
    res.status(404).json({ success: false, error: "Message not found" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
