const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CAPSULE_FILE = 'capsules.json';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Load existing capsules or empty array
let capsules = [];
if (fs.existsSync(CAPSULE_FILE)) {
  capsules = JSON.parse(fs.readFileSync(CAPSULE_FILE));
}

// Save capsules
function saveCapsules() {
  fs.writeFileSync(CAPSULE_FILE, JSON.stringify(capsules, null, 2));
}

// Create capsule
app.post('/create', (req, res) => {
  const { message, unlockDate } = req.body;
  if (!message || !unlockDate) return res.send('Please provide message and date!');
  const capsule = {
    message,
    unlockDate: new Date(unlockDate),
    unlocked: false
  };
  capsules.push(capsule);
  saveCapsules();
  res.send('🎉 Capsule created! <a href="/">Go Back</a>');
});

// Get unlocked capsules
app.get('/unlocked', (req, res) => {
  const now = new Date();
  const unlockedCapsules = capsules.filter(c => new Date(c.unlockDate) <= now);
  res.json(unlockedCapsules);
});

// Check every minute to unlock capsules
setInterval(() => {
  const now = new Date();
  let updated = false;
  capsules.forEach(c => {
    if (!c.unlocked && new Date(c.unlockDate) <= now) {
      c.unlocked = true;
      updated = true;
    }
  });
  if (updated) saveCapsules();
}, 60000);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
