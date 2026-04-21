require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// ✅ CORS esplicito + logging
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const DB_PATH = path.join(__dirname, 'users.json');
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');

// ✅ SMTP con fallback console se le credenziali mancano
const transporter = process.env.SMTP_PASS && process.env.SMTP_PASS !== 're_tuo_api_key_qui'
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : {
      sendMail: async (mailOptions) => {
        console.log('📧 [DEV MODE - Email simulata]');
        console.log('📩 A:', mailOptions.to);
        console.log('📝 Subject:', mailOptions.subject);
        console.log('🔗 Link di attivazione:', mailOptions.html?.match(/href="([^"]+)"/)?.[1] || 'N/A');
        return { messageId: 'mock-' + Date.now() };
      }
    };

const getUsers = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const saveUsers = (users) => fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');

// 📥 REGISTRAZIONE
app.post('/api/auth/register', async (req, res) => {
  console.log('📥 Ricevuta richiesta register:', req.body);
  try {
    const { email, name, password } = req.body;
    
    // Validazione
    if (!email?.includes('@')) {
      console.warn('⚠️ Email non valida:', email);
      return res.status(400).json({ error: 'Email non valida' });
    }
    if (!password || password.length < 8) {
      console.warn('⚠️ Password troppo corta');
      return res.status(400).json({ error: 'Password minima 8 caratteri' });
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      console.warn('⚠️ Email già registrata:', email);
      return res.status(409).json({ error: 'Email già registrata' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user = { 
      id: crypto.randomUUID(), 
      email, 
      name, 
      status: 'unverified', 
      token, 
      createdAt: new Date().toISOString() 
    };
    users.push(user);
    saveUsers(users);
    console.log('✅ Utente salvato (non verificato):', user.id);

    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Invio email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'GeoAnalytics <noreply@localhost>',
      to: email,
      subject: '✅ Attiva il tuo account GeoAnalytics Pro',
      html: `
        <div style="font-family: system-ui, sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; max-width: 500px;">
          <h2 style="margin: 0 0 16px;">Benvenuto in GeoAnalytics Pro</h2>
          <p>Clicca sul pulsante per attivare l'account:</p>
          <a href="${link}" style="background: #38bdf8; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; margin: 16px 0;">Attiva Account</a>
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Link valido per 24 ore. Se non hai richiesto la registrazione, ignora questa email.</p>
          <p style="font-size: 11px; color: #64748b;">${link}</p>
        </div>`
    });
    
    console.log('📧 Email inviata a:', email);
    res.json({ success: true, message: 'Email di verifica inviata' });
    
  } catch (err) {
    console.error('❌ Errore registro:', err.message, err.stack);
    res.status(500).json({ error: 'Errore server: ' + err.message });
  }
});

// ✅ VERIFICA
app.post('/api/auth/verify', (req, res) => {
  console.log('🔍 Verifica richiesta:', req.body);
  const { token, email } = req.body;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email && u.token === token && u.status === 'unverified');
  
  if (idx === -1) {
    console.warn('⚠️ Token/email non validi');
    return res.status(400).json({ error: 'Token non valido o scaduto' });
  }

  users[idx].status = 'active';
  delete users[idx].token;
  saveUsers(users);
  console.log('✅ Utente attivato:', email);
  res.json({ success: true, message: 'Account attivato con successo' });
});

// 🔄 REINVIO
app.post('/api/auth/resend', async (req, res) => {
  console.log('🔄 Reinvio richiesto per:', req.body.email);
  const { email } = req.body;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.status === 'unverified');
  
  if (!user) {
    console.warn('⚠️ Utente non trovato o già attivo:', email);
    return res.status(404).json({ error: 'Utente non trovato o già attivo' });
  }

  user.token = crypto.randomBytes(32).toString('hex');
  saveUsers(users);

  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${user.token}&email=${encodeURIComponent(email)}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GeoAnalytics <noreply@localhost>',
    to: email,
    subject: '🔄 Reinvio: Attiva GeoAnalytics Pro',
    html: `<p>Il tuo nuovo link di attivazione: <a href="${link}">Attiva Account</a></p><p><small>${link}</small></p>`
  });
  
  console.log('📧 Email di reinvio inviata a:', email);
  res.json({ success: true, message: 'Email reinviata' });
});

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend attivo su http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} occupata. Esegui: "npx kill-port ${PORT}"`);
  } else {
    console.error('❌ Errore server:', err.message);
  }
  process.exit(1);
});
