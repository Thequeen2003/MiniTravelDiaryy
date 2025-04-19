import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import session from 'express-session';
import passport from 'passport';
import { storage } from './storage.js';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// For Vercel deployments, we need to use ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Setup middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
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

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

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
      password: req.body.password, // Password hashing is handled in storage.js
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json(req.user);
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
  res.json(req.user);
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
    
    const shareId = entry.shareId || crypto.randomUUID();
    
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Only start the server if not being imported
if (import.meta.url === import.meta.main) {
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For Vercel serverless function
export default app;