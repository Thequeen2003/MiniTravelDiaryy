import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertEntrySchema } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { setupAuth } from './auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Auth middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Get all entries for a user
  app.get('/api/entries', async (req, res) => {
    try {
      // For simplicity, we'll assume the user ID is passed as a query parameter
      // In a real app, you'd get this from the authenticated session
      const userId = req.query.userId as string;
      
      console.log('Getting entries for userId:', userId);
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const entries = await storage.getEntriesByUserId(userId);
      console.log(`Found ${entries.length} entries for user ${userId}`);
      res.json(entries);
    } catch (error) {
      console.error('Error getting entries:', error);
      res.status(500).json({ message: 'Failed to fetch entries' });
    }
  });

  // Get a specific entry
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

  // Create a new entry
  app.post('/api/entries', async (req, res) => {
    try {
      console.log('Received entry creation request:', req.body);
      
      // Check if userId is provided
      if (!req.body.userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Validate request body
      const validationResult = insertEntrySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error('Validation error:', validationResult.error.errors);
        return res.status(400).json({ 
          message: 'Invalid entry data', 
          errors: validationResult.error.errors 
        });
      }
      
      // Use the validated data
      const entryData = validationResult.data;
      console.log('Validated entry data:', entryData);
      
      // Ensure we have a caption
      if (!entryData.caption && entryData.captionText) {
        entryData.caption = entryData.captionText;
      } else if (!entryData.caption) {
        entryData.caption = 'My travel moment';
      }

      console.log('Final entry data before storage:', {
        userId: entryData.userId,
        caption: entryData.caption,
        imageUrl: entryData.imageUrl,
        hasLocation: !!entryData.location,
        hasScreenInfo: !!entryData.screenInfo
      });
      
      // Create entry in storage
      const newEntry = await storage.createEntry(entryData);
      
      console.log('Entry created successfully:', newEntry);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error creating entry:', error);
      res.status(500).json({ message: 'Failed to create entry' });
    }
  });

  // Delete an entry
  app.delete('/api/entries/:id', async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: 'Invalid entry ID' });
      }
      
      // Check if entry exists
      const entry = await storage.getEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      // Delete entry
      await storage.deleteEntry(entryId);
      
      res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting entry:', error);
      res.status(500).json({ message: 'Failed to delete entry' });
    }
  });
  
  // Generate or update a share link for an entry
  app.post('/api/entries/:id/share', async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: 'Invalid entry ID' });
      }
      
      // Check if entry exists
      const entry = await storage.getEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      // Generate a unique shareId if not already shared
      const shareId = entry.shareId || uuidv4();
      
      // Update entry with sharing information
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
  
  // Stop sharing an entry
  app.post('/api/entries/:id/unshare', async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: 'Invalid entry ID' });
      }
      
      // Check if entry exists
      const entry = await storage.getEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      // Update entry to stop sharing
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
  
  // Get a shared entry by shareId (public access)
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

  const httpServer = createServer(app);

  return httpServer;
}
