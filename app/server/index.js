import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { supabase } from './supabase.js';

const app = express();
const port = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_secret_password';

app.use(cors());
app.use(bodyParser.json());

// API: Submit Survey
app.post('/api/submit', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Check if IP already responded
  const { data: existing, error: checkError } = await supabase
    .from('responses')
    .select('id')
    .eq('ip', ip)
    .single();

  if (existing) {
    return res.status(403).json({ success: false, message: 'IP already responded' });
  }

  const { data, error } = await supabase
    .from('responses')
    .insert([
      { 
        ...req.body, 
        ip,
        timestamp: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ success: false, message: 'Database error' });
  }

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
app.get('/api/admin/data', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ success: false });
  }

  const { data: responses, error } = await supabase
    .from('responses')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return res.status(500).json({ success: false, message: 'Database error' });
  }

  // Calculate statistics
  const stats = {
    avgFaroRating: responses.length > 0 
      ? responses.reduce((acc, curr) => acc + (Number(curr.q2) || 0), 0) / responses.length 
      : 0,
    osCount: {
      android: responses.filter(r => r.q6 === 'android').length,
      ios: responses.filter(r => r.q6 === 'ios').length,
    }
  };

  res.json({
    success: true,
    responses,
    stats
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
