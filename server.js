const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const VULNERABLE_MODE = false; 

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE users (id TEXT, email TEXT, password TEXT, displayName TEXT, bio TEXT, locked INTEGER)`);
  db.run(`CREATE TABLE events (id TEXT, title TEXT, artist TEXT, genre TEXT, startsAt TEXT, priceCents INTEGER, currency TEXT, soldOut INTEGER, data TEXT)`);
  db.run(`CREATE TABLE tickets (id TEXT, userId TEXT, eventId TEXT, quantity INTEGER, tier TEXT, purchasedAt TEXT, totalCents INTEGER, currency TEXT, status TEXT, qrPayload TEXT)`);
  
  db.run(`INSERT INTO users VALUES ('usr_demo', 'demo@frontrow.com', 'password123', 'Demo User', 'Music lover', 0)`);
  db.run(`INSERT INTO users VALUES ('usr_other', 'victim@frontrow.com', 'password123', 'Victim User', 'Hacker target', 0)`);
  db.run(`INSERT INTO users VALUES ('usr_qa', 'qa@frontrow.com', 'qa123', 'QA Tester', 'Security nerd', 0)`);

  const events = [
    { id: 'evt_001', title: 'Midnight Howl Live', artist: 'Midnight Howl', genre: 'Indie Rock', startsAt: '2027-06-12T20:00:00.000Z', priceCents: 4500, currency: 'USD', soldOut: 0 },
    { id: 'evt_002', title: 'Aurora Symphony', artist: 'Aurora Symphony', genre: 'Classical', startsAt: '2027-07-04T19:30:00.000Z', priceCents: 8500, currency: 'GBP', soldOut: 0 }
  ];
  events.forEach(e => {
    db.run(`INSERT INTO events (id, title, artist, genre, startsAt, priceCents, currency, soldOut, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [e.id, e.title, e.artist, e.genre, e.startsAt, e.priceCents, e.currency, e.soldOut, JSON.stringify(e)]);
  });

  db.run(`INSERT INTO tickets VALUES ('tkt_001', 'usr_demo', 'evt_001', 2, 'General Admission', '2026-04-01T12:00:00.000Z', 9000, 'USD', 'active', 'FR-tkt_001-evt_001-2')`);
  db.run(`INSERT INTO tickets VALUES ('tkt_999', 'usr_other', 'evt_002', 1, 'VIP', '2026-05-01T12:00:00.000Z', 14500, 'GBP', 'active', 'FR-tkt_999-evt_002-1')`);
});

// --- AUTH ---
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  let query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  if (!VULNERABLE_MODE) query = `SELECT * FROM users WHERE email = ? AND password = ?`;

  db.get(query, VULNERABLE_MODE ? [] : [email, password], (err, user) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json({ code: 'invalid_credentials', message: 'Email or password is incorrect.' });
    const token = `mock_${user.id}_1`;
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, bio: user.bio } });
  });
});

// --- EVENTS ---
app.get('/events', (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  db.all(`SELECT * FROM events WHERE title LIKE ?`, [q], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ items: rows.map(r => JSON.parse(r.data)), total: rows.length });
  });
});

// --- TICKETS ---
app.get('/tickets', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Sign in required' });
  
  // FIXED: Correctly extract userId from token
  const userId = token.replace('mock_', '').split('_').slice(0, -1).join('_');

  db.all(`SELECT * FROM tickets WHERE userId = ?`, [userId], (err, rows) => {
    res.json(rows);
  });
});

app.post('/tickets/purchase', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Sign in required' });
  
  // FIXED: Correctly extract userId from token
  const userId = token.replace('mock_', '').split('_').slice(0, -1).join('_'); 
  const { eventId, quantity, tierId } = req.body;

  db.get(`SELECT * FROM events WHERE id = ?`, [eventId], (err, event) => {
    if (err || !event) return res.status(404).json({ message: 'Event not found' });
    
    const eventData = JSON.parse(event.data);
    let unitPrice = event.priceCents;
    let tierLabel = 'General Admission';
    
    if (eventData.tiers && eventData.tiers.length > 0) {
      const selectedTier = tierId ? eventData.tiers.find(t => t.id === tierId) : eventData.tiers[0];
      if (selectedTier) {
         unitPrice = selectedTier.priceCents;
         tierLabel = selectedTier.label;
      }
    }

    const id = `tkt_${Math.floor(Math.random() * 10000)}`;
    const totalCents = unitPrice * quantity;
    const purchasedAt = new Date().toISOString();
    const qrPayload = `FR-${id}-${eventId}-${quantity}`;

    db.run(`INSERT INTO tickets (id, userId, eventId, quantity, tier, purchasedAt, totalCents, currency, status, qrPayload) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [id, userId, eventId, quantity, tierLabel, purchasedAt, totalCents, event.currency, 'active', qrPayload], 
            (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id, userId, eventId, quantity, tier: tierLabel, purchasedAt, totalCents, currency: event.currency, status: 'active', qrPayload });
    });
  });
});

app.get('/tickets/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Sign in required' });
  
  // FIXED: Correctly extract userId from token
  const userId = token.replace('mock_', '').split('_').slice(0, -1).join('_');
  const ticketId = req.params.id;

  let query = `SELECT * FROM tickets WHERE id = ?`;
  let params = [ticketId];

  if (!VULNERABLE_MODE) {
    query += ` AND userId = ?`;
    params.push(userId);
  }

  db.get(query, params, (err, ticket) => {
    if (!ticket) return res.status(404).json({ code: 'not_found', message: 'Ticket not found' });
    res.json(ticket);
  });
});

// CANCEL TICKET
app.post('/tickets/:id/cancel', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Sign in required' });
  
  // FIXED: Correctly extract userId from token
  const userId = token.replace('mock_', '').split('_').slice(0, -1).join('_');
  const ticketId = req.params.id;

  db.get(`SELECT * FROM tickets WHERE id = ?`, [ticketId], (err, ticket) => {
    if (!ticket) return res.status(404).json({ code: 'not_found', message: 'Ticket not found.' });
    
    if (!VULNERABLE_MODE && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (ticket.status !== 'active') {
      return res.status(409).json({ code: 'invalid_state', message: 'Only active tickets can be cancelled.' });
    }

    db.run(`UPDATE tickets SET status = 'refund_pending' WHERE id = ?`, [ticketId], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      ticket.status = 'refund_pending';
      res.json(ticket);
    });
  });
});

// TRANSFER TICKET
app.post('/tickets/:id/transfer', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Sign in required' });
  
  // FIXED: Correctly extract userId from token
  const userId = token.replace('mock_', '').split('_').slice(0, -1).join('_');
  const ticketId = req.params.id;
  const { recipientEmail } = req.body;

  db.get(`SELECT * FROM tickets WHERE id = ?`, [ticketId], (err, ticket) => {
    if (!ticket) return res.status(404).json({ code: 'not_found', message: 'Ticket not found.' });
    if (ticket.status !== 'active') return res.status(409).json({ code: 'invalid_state', message: 'Only active tickets can be transferred.' });

    db.get(`SELECT * FROM users WHERE email = ?`, [recipientEmail], (err, recipient) => {
      if (!recipient) return res.status(404).json({ code: 'recipient_not_found', message: 'No user with that email.' });
      
      db.run(`UPDATE tickets SET userId = ? WHERE id = ?`, [recipient.id, ticketId], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        ticket.userId = recipient.id;
        res.json(ticket);
      });
    });
  });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FrontRow Backend running on http://localhost:${PORT}`);
});

 // --- AUTH ---
app.post('/auth/login', (req, res) => {

  const { email, password } = req.body || {};

  // 1. Required field validation
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.trim() === '' ||
    password.trim() === ''
  ) {
    return res.status(400).json({
      code: 'invalid_input',
      message: 'Email and password are required.'
    });
  }

  // 2. Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 3. Email length validation
  if (normalizedEmail.length > 254) {
    return res.status(400).json({
      code: 'invalid_email',
      message: 'Email address is too long.'
    });
  }

  // 4. Password length validation
  if (password.length > 128) {
    return res.status(400).json({
      code: 'invalid_password',
      message: 'Password is too long.'
    });
  }

  // 5. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      code: 'invalid_email',
      message: 'Please enter a valid email address.'
    });
  }

  // 6. Parameterized SQL query (SQL Injection protection)
  const query = `
    SELECT * FROM users
    WHERE email = ? AND password = ?
  `;

  db.get(query, [normalizedEmail, password], (err, user) => {

    if (err) {
      return res.status(500).json({
        message: 'Internal server error.'
      });
    }

    if (!user) {
      return res.status(401).json({
        code: 'invalid_credentials',
        message: 'Email or password is incorrect.'
      });
    }

    // 7. Generate login token
    const token = `mock_${user.id}_1`;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio
      }
    });
  });
});
