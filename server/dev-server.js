// Development server that works without vite.ts
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { scrypt, randomBytes, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const createMemoryStore = require('memorystore');

// Setup Express
const app = express();
const httpServer = createServer(app);

// Setup middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Create in-memory session store
const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000  // prune expired entries every 24h
});

// Configure session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Helper functions for password handling
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// In-memory storage for users and entries
class MemStorage {
  constructor() {
    this.entries = new Map();
    this.users = new Map();
    this.currentEntryId = 1;
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(userData) {
    const id = randomBytes(16).toString('hex');
    const user = {
      id,
      ...userData,
      password: await hashPassword(userData.password)
    };
    this.users.set(id, user);
    return user;
  }

  async getEntriesByUserId(userId) {
    return Array.from(this.entries.values()).filter(entry => entry.userId === userId);
  }

  async getEntry(id) {
    return this.entries.get(id);
  }

  async getEntryByShareId(shareId) {
    return Array.from(this.entries.values()).find(entry => entry.shareId === shareId && entry.isShared);
  }

  async updateEntrySharing(id, isShared, shareId) {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = {
      ...entry,
      isShared,
      shareId: isShared ? (shareId || randomBytes(16).toString('hex')) : null
    };
    
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async createEntry(entryData) {
    const id = this.currentEntryId++;
    const newEntry = {
      id,
      ...entryData,
      createdAt: new Date().toISOString(),
      isShared: false,
      shareId: null
    };
    this.entries.set(id, newEntry);
    return newEntry;
  }

  async deleteEntry(id) {
    this.entries.delete(id);
  }
}

const storage = new MemStorage();

// Setup passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Auth routes
app.post('/api/register', async (req, res, next) => {
  try {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = await storage.createUser({
      ...req.body,
      password: req.body.password
    });

    req.login(user, (err) => {
      if (err) return next(err);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.status(200).json(userWithoutPassword);
});

app.post('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Diary entry routes
app.get('/api/entries', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const entries = await storage.getEntriesByUserId(userId);
    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ message: 'Failed to fetch entries' });
  }
});

app.get('/api/entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    if (isNaN(entryId)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const entry = await storage.getEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error getting entry:', error);
    res.status(500).json({ message: 'Failed to fetch entry' });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const newEntry = await storage.createEntry(req.body);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ message: 'Failed to create entry' });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    if (isNaN(entryId)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const entry = await storage.getEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    await storage.deleteEntry(entryId);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Failed to delete entry' });
  }
});

// Share functionality
app.post('/api/entries/:id/share', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    if (isNaN(entryId)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const entry = await storage.getEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    const shareId = entry.shareId || randomBytes(16).toString('hex');
    
    const updatedEntry = await storage.updateEntrySharing(entryId, true, shareId);
    
    if (!updatedEntry) {
      return res.status(500).json({ message: 'Failed to update entry' });
    }
    
    res.status(200).json({ 
      message: 'Entry shared successfully',
      shareId: updatedEntry.shareId,
      shareUrl: `/shared/${updatedEntry.shareId}`
    });
  } catch (error) {
    console.error('Error sharing entry:', error);
    res.status(500).json({ message: 'Failed to share entry' });
  }
});

app.post('/api/entries/:id/unshare', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    if (isNaN(entryId)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const entry = await storage.getEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    const updatedEntry = await storage.updateEntrySharing(entryId, false);
    
    if (!updatedEntry) {
      return res.status(500).json({ message: 'Failed to update entry' });
    }
    
    res.status(200).json({ 
      message: 'Entry is no longer shared'
    });
  } catch (error) {
    console.error('Error unsharing entry:', error);
    res.status(500).json({ message: 'Failed to stop sharing entry' });
  }
});

app.get('/api/shared/:shareId', async (req, res) => {
  try {
    const shareId = req.params.shareId;
    
    if (!shareId) {
      return res.status(400).json({ message: 'Share ID is required' });
    }
    
    const entry = await storage.getEntryByShareId(shareId);
    
    if (!entry || !entry.isShared) {
      return res.status(404).json({ message: 'Shared entry not found or no longer shared' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error getting shared entry:', error);
    res.status(500).json({ message: 'Failed to fetch shared entry' });
  }
});

// For development, proxy to Vite dev server
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Dev server is running on http://localhost:${port}`);
  console.log('API routes are available, but this server does not serve the frontend');
  console.log('Run "npm run dev" in a separate terminal for the frontend');
});

module.exports = app;