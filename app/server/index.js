import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { JSONFilePreset } from 'lowdb/node';
import CryptoJS from 'crypto-js';

const app = express();
const port = 3001;
const ADMIN_PASSWORD = 'admin_secret_password'; // Change this in production
const ENCRYPTION_KEY = 'my-secret-key'; // Used to encrypt stored data

app.use(cors());
app.use(bodyParser.json());

// Initialize lowdb
const defaultData = { responses: [], ips: [] };
const db = await JSONFilePreset('db.json', defaultData);

// Encryption Helpers
const encrypt = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// API: Submit Survey
app.post('/api/submit', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // IP Restriction
  if (db.data.ips.includes(ip)) {
    return res.status(403).json({ success: false, message: 'IP already responded' });
  }

  const responseData = {
    ...req.body,
    ip,
    timestamp: new Date().toISOString()
  };

  // Encrypt the sensitive data
  const encryptedResponse = encrypt(responseData);

  db.data.responses.push(encryptedResponse);
  db.data.ips.push(ip);
  await db.write();

  res.json({ success: true });
});

// API: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// API: Get Admin Data
app.get('/api/admin/data', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ success: false });
  }

  // Decrypt responses for the admin
  const decryptedResponses = db.data.responses.map(res => decrypt(res));

  // Calculate statistics
  const stats = {
    avgFaroRating: decryptedResponses.length > 0 
      ? decryptedResponses.reduce((acc, curr) => acc + curr.q2, 0) / decryptedResponses.length 
      : 0,
    osCount: {
      android: decryptedResponses.filter(r => r.q6 === 'android').length,
      ios: decryptedResponses.filter(r => r.q6 === 'ios').length,
    }
  };

  res.json({
    success: true,
    responses: decryptedResponses,
    stats
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
