const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(express.json());

// MongoDB Atlas connection
const uri = "mongodb+srv://evanovichz88:osama123@vf-cash-db.yihegkk.mongodb.net/?retryWrites=true&w=majority&appName=vf-cash-db";
const client = new MongoClient(uri);
const dbName = "vf-cash-db";
let messagesCollection;

async function connectDb() {
  await client.connect();
  const db = client.db(dbName);
  messagesCollection = db.collection("messages");
  console.log("✅ Connected to MongoDB Atlas!");
}
connectDb();

// 🟢 جلب كل الرسائل
app.get('/api/messages', async (req, res) => {
  try {
    const all = await messagesCollection.find({}).toArray();
    res.json(all);
  } catch (e) {
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 إضافة رسالة جديدة
app.post('/api/messages', async (req, res) => {
  try {
    const { sender, message, datetime } = req.body;
    const doc = { sender, message, datetime };
    await messagesCollection.insertOne(doc);
    res.json({ success: true, msg: doc });
  } catch (e) {
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 حذف رسالة معينة بالـ id
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: "Message not found" });
    }
  } catch (e) {
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 حذف تلقائي للرسائل الأقدم من 6 ساعات (كل ساعة)
setInterval(async () => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  await messagesCollection.deleteMany({
    datetime: { $lt: sixHoursAgo.toISOString() }
  });
  console.log("تم حذف الرسائل الأقدم من 6 ساعات تلقائيًا.");
}, 60 * 60 * 1000); // كل ساعة

// ======== تشغيل السيرفر ========
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
});
