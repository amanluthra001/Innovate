// Import necessary modules
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Firebase initialization
const serviceAccount = require('./serviceAccountKey.json'); // Adjust path if necessary
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/u/0/project/aman-4633b/database/aman-4633b-default-rtdb/data"
});
const db = admin.firestore();

// Serve static HTML frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Add new item route
app.post('/addItem', async (req, res) => {
  const { itemName, category, purchaseDate } = req.body;
  try {
    const newItem = await db.collection('items').add({
      itemName,
      category,
      purchaseDate,
      usageDuration: 0
    });
    res.status(201).json({ id: newItem.id, message: 'Item added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding item' });
  }
});

// Retrieve all items route
app.get('/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching items' });
  }
});

// Environmental impact calculation
app.get('/impact/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const itemDoc = await db.collection('items').doc(itemId).get();
    const itemData = itemDoc.data();
    const impactScore = itemData.usageDuration * 0.5; // Sample calculation
    res.status(200).json({ impactScore });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating impact' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
