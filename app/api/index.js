import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { supabase } from '../server/supabase.js';

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_secret_password';

app.use(cors());
app.use(bodyParser.json());

// API: Submit Survey
app.post('/api/submit', async (req, res) => {
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { adminPassword, ...formData } = req.body;

  // Allow admin bypass
  const isAdmin = adminPassword === ADMIN_PASSWORD;

  if (!isAdmin) {
    // Check if IP address already responded
    const { data: existing, error: checkError } = await supabase
      .from('responses')
      .select('id')
      .eq('ip_address', ip_address)
      .single();

    if (existing) {
      return res.status(403).json({ success: false, message: 'IP address already responded' });
    }
  }

  const { data, error } = await supabase
    .from('responses')
    .insert([
      { 
        ...formData, 
        ip_address,
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
      ? responses.reduce((acc, curr) => acc + (Number(curr.faro_rating) || 0), 0) / responses.length 
      : 0,
    osCount: {
      android: responses.filter(r => r.smartphone_os === 'android').length,
      ios: responses.filter(r => r.smartphone_os === 'ios').length,
    }
  };

  res.json({
    success: true,
    responses,
    stats
  });
});

export default app;
