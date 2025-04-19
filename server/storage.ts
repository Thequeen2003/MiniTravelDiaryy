import { DiaryEntry, InsertDiaryEntry } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getEntriesByUserId(userId: string): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  getEntryByShareId(shareId: string): Promise<DiaryEntry | undefined>;
  createEntry(entry: Omit<InsertDiaryEntry, "id">): Promise<DiaryEntry>;
  deleteEntry(id: number): Promise<void>;
  updateEntrySharing(id: number, isShared: boolean, shareId?: string): Promise<DiaryEntry | undefined>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, DiaryEntry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async getEntriesByUserId(userId: string): Promise<DiaryEntry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    return this.entries.get(id);
  }
  
  async getEntryByShareId(shareId: string): Promise<DiaryEntry | undefined> {
    return Array.from(this.entries.values()).find(entry => entry.shareId === shareId && entry.isShared);
  }
  
  async updateEntrySharing(id: number, isShared: boolean, shareId?: string): Promise<DiaryEntry | undefined> {
    const entry = this.entries.get(id);
    
    if (!entry) {
      return undefined;
    }
    
    const updatedEntry = {
      ...entry,
      isShared,
      shareId: shareId || entry.shareId
    };
    
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async createEntry(entryData: Omit<InsertDiaryEntry, "id" | "createdAt">): Promise<DiaryEntry> {
    console.log('Storage: Creating new entry with data:', {
      userId: entryData.userId,
      caption: entryData.caption,
      hasImage: !!entryData.imageUrl,
      hasLocation: !!entryData.location
    });
    
    try {
      const id = this.currentId++;
      const now = new Date();
      const timestamp = now.toISOString();
      
      // Prepare location data with proper typing
      let locationData = null;
      if (entryData.location && 
          typeof entryData.location === 'object' && 
          'lat' in entryData.location && 
          'lng' in entryData.location) {
        locationData = {
          lat: Number(entryData.location.lat),
          lng: Number(entryData.location.lng)
        };
      }
      
      // Prepare screen info with proper typing
      const screenInfo = {
        width: entryData.screenInfo?.width || 0,
        height: entryData.screenInfo?.height || 0,
        orientation: entryData.screenInfo?.orientation || 'unknown'
      };
      
      const newEntry: DiaryEntry = {
        id,
        userId: entryData.userId,
        caption: entryData.caption || 'My travel memory',
        imageUrl: entryData.imageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        location: locationData,
        screenInfo: screenInfo,
        createdAt: timestamp,
        shareId: null,
        isShared: false,
      };
      
      console.log('Storage: Entry created with ID:', id);
      this.entries.set(id, newEntry);
      return newEntry;
    } catch (error) {
      console.error('Storage: Error creating entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: number): Promise<void> {
    this.entries.delete(id);
  }
}

export const storage = new MemStorage();
